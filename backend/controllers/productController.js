const { Product, Zone, Category, User, Movement } = require('../models/associations');
const { Op } = require('sequelize');

const AUTO_ENTRY_REASON = 'Création du produit';

const getProductCapacityImpact = (zone, productData) => {
  const quantity = parseInt(productData.quantity) || 0;
  if (zone.unite_capacite === 'Volume') {
    return quantity * (parseFloat(productData.volume_unitaire) || 0);
  }
  return quantity;
};

const getZoneUsedCapacity = async (zone, excludeProductId = null) => {
  const where = { ZoneId: zone.id };
  if (excludeProductId) {
    where.id = { [Op.ne]: excludeProductId };
  }

  const products = await Product.findAll({
    where,
    attributes: ['quantity', 'volume_unitaire'],
    raw: true,
  });

  return products.reduce((total, product) => (
    total + getProductCapacityImpact(zone, product)
  ), 0);
};

const validateZoneCapacity = async ({ ZoneId, quantity, volume_unitaire, excludeProductId = null }) => {
  if (!ZoneId) return null;

  const zone = await Zone.findByPk(ZoneId);
  if (!zone) {
    const error = new Error('Zone non trouvée');
    error.statusCode = 404;
    throw error;
  }

  const usedCapacity = await getZoneUsedCapacity(zone, excludeProductId);
  const productImpact = getProductCapacityImpact(zone, { quantity, volume_unitaire });
  const maxCapacity = parseFloat(zone.capacite_max) || 0;

  if (maxCapacity > 0 && usedCapacity + productImpact > maxCapacity) {
    const remaining = Math.max(0, maxCapacity - usedCapacity);
    const error = new Error(
      `Capacité insuffisante pour la zone "${zone.name}". Capacité restante: ${remaining} ${zone.unite_capacite}.`
    );
    error.statusCode = 400;
    throw error;
  }

  return zone;
};

const refreshZoneCapacity = async (zoneId) => {
  if (!zoneId) return;

  const zone = await Zone.findByPk(zoneId);
  if (!zone) return;

  zone.capacite_actuelle = await getZoneUsedCapacity(zone);
  await zone.save();
};

const createInitialEntryMovement = async (product, user) => {
  const quantity = parseInt(product.quantity) || 0;

  const destinationZone = product.ZoneId ? await Zone.findByPk(product.ZoneId) : null;

  await Movement.create({
    type: 'Entrée',
    productId: product.id,
    productName: product.name,
    sourceZoneId: null,
    sourceZoneName: null,
    destinationZoneId: destinationZone?.id || null,
    destinationZoneName: destinationZone?.name || null,
    userId: user.id,
    userName: user.username || 'Système',
    quantityBefore: 0,
    quantityAfter: quantity,
    quantityMoved: quantity,
    reason: AUTO_ENTRY_REASON,
    notes: 'Entrée générée automatiquement à la création du stock',
  });
};

exports.getAllProducts = async (req, res) => {
  try {
    const { CategoryId, UserId } = req.query;
    const where = {};
    
    // If not admin, only see own products
    if (req.user.role === 'manager') {
      where.UserId = req.user.id;
    } else if (req.user.role === 'admin') {
      if (UserId && UserId !== '') {
        where.UserId = UserId;
      } else {
        // Admins see all manager products by default
        where.UserId = { [Op.ne]: null };
      }
    }

    if (CategoryId && CategoryId !== '') {
      where.CategoryId = CategoryId;
    }

    const products = await Product.findAll({
      where,
      include: [
        { model: Zone, attributes: ['name'] },
        { model: Category, attributes: ['name'] },
        { model: User, as: 'manager', attributes: ['username'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Erreur getAllProducts:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, CategoryId, quantity, price, ZoneId, expirationDate, volume_unitaire } = req.body;
    
    // Validate if template exists
    const template = await Product.findOne({
      where: { 
        name, 
        CategoryId, 
        UserId: null 
      }
    });

    if (!template && req.user.role !== 'admin') {
      return res.status(400).json({ message: "Ce produit n'est pas autorisé dans cette catégorie." });
    }

    await validateZoneCapacity({ ZoneId, quantity, volume_unitaire });

    const product = await Product.create({
      name,
      CategoryId,
      UserId: req.user.id,
      quantity: parseInt(quantity) || 0,
      price: parseFloat(price) || 0,
      ZoneId: ZoneId || null,
      expirationDate: expirationDate || null,
      volume_unitaire: parseFloat(volume_unitaire) || 0,
      unit: template?.unit || null
    });

    await createInitialEntryMovement(product, req.user);
    await refreshZoneCapacity(product.ZoneId);

    res.status(201).json(product);
  } catch (error) {
    console.error('Erreur createProduct:', error);
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Zone },
        { model: Category },
        { model: User, as: 'manager', attributes: ['username'] }
      ]
    });
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    // Check ownership
    if (req.user.role === 'manager' && product.UserId !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const nextZoneId = Object.prototype.hasOwnProperty.call(req.body, 'ZoneId') ? req.body.ZoneId : product.ZoneId;
    const nextQuantity = Object.prototype.hasOwnProperty.call(req.body, 'quantity') ? req.body.quantity : product.quantity;
    const nextVolume = Object.prototype.hasOwnProperty.call(req.body, 'volume_unitaire') ? req.body.volume_unitaire : product.volume_unitaire;
    const previousZoneId = product.ZoneId;

    await validateZoneCapacity({
      ZoneId: nextZoneId,
      quantity: nextQuantity,
      volume_unitaire: nextVolume,
      excludeProductId: product.id,
    });

    await product.update(req.body);
    await refreshZoneCapacity(previousZoneId);
    await refreshZoneCapacity(product.ZoneId);
    res.json(product);
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    if (req.user.role === 'manager' && product.UserId !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const previousZoneId = product.ZoneId;

    await Movement.destroy({
      where: {
        productId: product.id,
        type: 'Entrée',
      }
    });

    await product.destroy();
    await refreshZoneCapacity(previousZoneId);
    res.json({ message: 'Produit supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
