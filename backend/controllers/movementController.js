const { Movement, Product, Zone } = require('../models/associations');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Récupérer tous les mouvements
exports.getAllMovements = async (req, res) => {
  try {
    const movements = await Movement.findAll({
      order: [['movementDate', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: movements.length,
      data: movements
    });
  } catch (error) {
    console.error('Erreur getAllMovements:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Récupérer les mouvements par type
exports.getMovementsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['in', 'out', 'transfer'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type de mouvement invalide'
      });
    }
    
    const movements = await Movement.findAll({
      where: { type },
      order: [['movementDate', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: movements.length,
      data: movements
    });
  } catch (error) {
    console.error('Erreur getMovementsByType:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Récupérer les statistiques
exports.getMovementStats = async (req, res) => {
  try {
    const stats = await Movement.findAll({
      attributes: [
        'type',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalQuantity']
      ],
      group: ['type']
    });
    
    const totalMovements = await Movement.count();
    
    res.status(200).json({
      success: true,
      total: totalMovements,
      stats
    });
  } catch (error) {
    console.error('Erreur getMovementStats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Récupérer un mouvement par ID
exports.getMovementById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const movement = await Movement.findByPk(id);
    
    if (!movement) {
      return res.status(404).json({
        success: false,
        error: 'Mouvement non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: movement
    });
  } catch (error) {
    console.error('Erreur getMovementById:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Créer un mouvement (entrée)
exports.createInMovement = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { productId, quantity, destinationZoneId, reason, notes } = req.body;
    const userId = req.user.id;
    const userName = req.user.username;
    
    // Vérifier si le produit existe
    const product = await Product.findByPk(productId, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }
    
    // Récupérer le nom de la zone
    let destinationZoneName = 'Entrepôt Principal';
    if (destinationZoneId) {
      const zone = await Zone.findByPk(destinationZoneId, { transaction });
      if (zone) {
        destinationZoneName = zone.name;
      }
    }
    
    // Mettre à jour le stock du produit
    product.quantity = product.quantity + quantity;
    await product.save({ transaction });
    
    // Créer le mouvement
    const movement = await Movement.create({
      productId,
      productName: product.name,
      quantity,
      type: 'in',
      sourceZoneId: null,
      sourceZoneName: null,
      destinationZoneId: destinationZoneId || null,
      destinationZoneName,
      reason: reason || 'Entrée de stock',
      reference: `IN-${Date.now()}`,
      userId,
      userName,
      status: 'completed',
      notes: notes || null,
      movementDate: new Date()
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'Entrée de stock enregistrée avec succès',
      data: movement
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur createInMovement:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Créer un mouvement (sortie)
exports.createOutMovement = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { productId, quantity, sourceZoneId, reason, notes } = req.body;
    const userId = req.user.id;
    const userName = req.user.username;
    
    // Vérifier si le produit existe
    const product = await Product.findByPk(productId, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }
    
    // Vérifier si le stock est suffisant
    if (product.quantity < quantity) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: `Stock insuffisant. Stock actuel: ${product.quantity}`
      });
    }
    
    // Récupérer le nom de la zone
    let sourceZoneName = 'Stock Principal';
    if (sourceZoneId) {
      const zone = await Zone.findByPk(sourceZoneId, { transaction });
      if (zone) {
        sourceZoneName = zone.name;
      }
    }
    
    // Mettre à jour le stock
    product.quantity = product.quantity - quantity;
    await product.save({ transaction });
    
    // Créer le mouvement
    const movement = await Movement.create({
      productId,
      productName: product.name,
      quantity,
      type: 'out',
      sourceZoneId: sourceZoneId || null,
      sourceZoneName,
      destinationZoneId: null,
      destinationZoneName: null,
      reason: reason || 'Sortie de stock',
      reference: `OUT-${Date.now()}`,
      userId,
      userName,
      status: 'completed',
      notes: notes || null,
      movementDate: new Date()
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'Sortie de stock enregistrée avec succès',
      data: movement
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur createOutMovement:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Créer un mouvement (transfert)
exports.createTransferMovement = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { productId, quantity, sourceZoneId, destinationZoneId, reason, notes } = req.body;
    const userId = req.user.id;
    const userName = req.user.username;
    
    // Vérifier si le produit existe
    const product = await Product.findByPk(productId, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }
    
    // Vérifier les zones
    const sourceZone = await Zone.findByPk(sourceZoneId, { transaction });
    if (!sourceZone) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Zone source non trouvée'
      });
    }
    
    const destinationZone = await Zone.findByPk(destinationZoneId, { transaction });
    if (!destinationZone) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Zone de destination non trouvée'
      });
    }
    
    // Créer le mouvement
    const movement = await Movement.create({
      productId,
      productName: product.name,
      quantity,
      type: 'transfer',
      sourceZoneId,
      sourceZoneName: sourceZone.name,
      destinationZoneId,
      destinationZoneName: destinationZone.name,
      reason: reason || `Transfert de ${sourceZone.name} vers ${destinationZone.name}`,
      reference: `TRF-${Date.now()}`,
      userId,
      userName,
      status: 'completed',
      notes: notes || null,
      movementDate: new Date()
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'Transfert de stock enregistré avec succès',
      data: movement
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur createTransferMovement:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Annuler un mouvement
exports.cancelMovement = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const movement = await Movement.findByPk(id, { transaction });
    if (!movement) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Mouvement non trouvé'
      });
    }
    
    if (movement.status === 'cancelled') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Ce mouvement est déjà annulé'
      });
    }
    
    // Inverser l'effet sur le stock
    const product = await Product.findByPk(movement.productId, { transaction });
    if (product) {
      if (movement.type === 'in') {
        product.quantity = product.quantity - movement.quantity;
      } else if (movement.type === 'out') {
        product.quantity = product.quantity + movement.quantity;
      }
      await product.save({ transaction });
    }
    
    movement.status = 'cancelled';
    await movement.save({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Mouvement annulé avec succès',
      data: movement
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur cancelMovement:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};