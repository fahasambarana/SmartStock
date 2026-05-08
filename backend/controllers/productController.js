const { Product, Zone, Category, User } = require('../models/associations');
const { Op } = require('sequelize');

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

    res.status(201).json(product);
  } catch (error) {
    console.error('Erreur createProduct:', error);
    res.status(400).json({ message: error.message });
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

    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    if (req.user.role === 'manager' && product.UserId !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await product.destroy();
    res.json({ message: 'Produit supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
