const Movement = require('../models/Movement');
const Product = require('../models/Product');
const Zone = require('../models/Zone');
const { Op } = require('sequelize');

// Create a movement (Entrée, Sortie, or Transfert)
exports.createMovement = async (req, res) => {
  try {
    const { type, ProductId, quantityMoved, sourceZoneId, destinationZoneId, reason, UserId, notes } = req.body;

    const product = await Product.findByPk(ProductId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const quantityBefore = product.quantity;
    let quantityAfter = quantityBefore;

    // Validation and processing based on type
    if (type === 'Entrée') {
      // Stock entry
      if (!destinationZoneId) {
        return res.status(400).json({ message: 'Zone de destination requise pour une entrée' });
      }

      const destZone = await Zone.findByPk(destinationZoneId);
      if (!destZone) {
        return res.status(404).json({ message: 'Zone de destination non trouvée' });
      }

      // Check capacity
      const impact = destZone.unite_capacite === 'Volume' 
        ? (parseFloat(product.volume_unitaire) || 0) * parseInt(quantityMoved)
        : parseInt(quantityMoved);

      if ((parseFloat(destZone.capacite_actuelle) || 0) + impact > parseFloat(destZone.capacite_max)) {
        return res.status(400).json({ message: `Action Impossible : Saturation de l'espace [${destZone.name}]` });
      }

      // Update product quantity and zone
      quantityAfter = quantityBefore + parseInt(quantityMoved);
      product.quantity = quantityAfter;
      product.ZoneId = destinationZoneId;
      destZone.capacite_actuelle = (parseFloat(destZone.capacite_actuelle) || 0) + impact;
      await destZone.save();

    } else if (type === 'Sortie') {
      // Stock exit
      if (!sourceZoneId) {
        return res.status(400).json({ message: 'Zone source requise pour une sortie' });
      }

      if (quantityBefore < parseInt(quantityMoved)) {
        return res.status(400).json({ message: 'Quantité insuffisante pour la sortie' });
      }

      const srcZone = await Zone.findByPk(sourceZoneId);
      if (!srcZone) {
        return res.status(404).json({ message: 'Zone source non trouvée' });
      }

      // Update product quantity and zone
      quantityAfter = quantityBefore - parseInt(quantityMoved);
      product.quantity = quantityAfter;
      
      const impact = srcZone.unite_capacite === 'Volume' 
        ? (parseFloat(product.volume_unitaire) || 0) * parseInt(quantityMoved)
        : parseInt(quantityMoved);

      srcZone.capacite_actuelle = Math.max(0, (parseFloat(srcZone.capacite_actuelle) || 0) - impact);
      await srcZone.save();

    } else if (type === 'Transfert') {
      // Stock transfer
      if (!sourceZoneId || !destinationZoneId) {
        return res.status(400).json({ message: 'Zone source et destination requises pour un transfert' });
      }

      if (quantityBefore < parseInt(quantityMoved)) {
        return res.status(400).json({ message: 'Quantité insuffisante pour le transfert' });
      }

      const srcZone = await Zone.findByPk(sourceZoneId);
      const destZone = await Zone.findByPk(destinationZoneId);

      if (!srcZone || !destZone) {
        return res.status(404).json({ message: 'Zone source ou destination non trouvée' });
      }

      // Calculate impacts
      const srcImpact = srcZone.unite_capacite === 'Volume' 
        ? (parseFloat(product.volume_unitaire) || 0) * parseInt(quantityMoved)
        : parseInt(quantityMoved);

      const destImpact = destZone.unite_capacite === 'Volume' 
        ? (parseFloat(product.volume_unitaire) || 0) * parseInt(quantityMoved)
        : parseInt(quantityMoved);

      // Check destination capacity
      if ((parseFloat(destZone.capacite_actuelle) || 0) + destImpact > parseFloat(destZone.capacite_max)) {
        return res.status(400).json({ message: `Action Impossible : Saturation de l'espace [${destZone.name}]` });
      }

      // Update zones and product
      srcZone.capacite_actuelle = Math.max(0, (parseFloat(srcZone.capacite_actuelle) || 0) - srcImpact);
      destZone.capacite_actuelle = (parseFloat(destZone.capacite_actuelle) || 0) + destImpact;
      
      product.ZoneId = destinationZoneId;
      quantityAfter = quantityBefore; // Quantity doesn't change for transfers, just zones

      await srcZone.save();
      await destZone.save();
    }

    // Save product changes
    await product.save();

    // Create movement record
    const movement = await Movement.create({
      type,
      ProductId,
      quantityBefore,
      quantityAfter,
      quantityMoved: parseInt(quantityMoved),
      sourceZoneId: sourceZoneId || null,
      destinationZoneId: destinationZoneId || null,
      reason,
      UserId,
      notes
    });

    // Fetch full movement with associations
    const fullMovement = await Movement.findByPk(movement.id, {
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'category', 'price']
        },
        {
          model: Zone,
          as: 'sourceZone',
          attributes: ['id', 'name', 'location']
        },
        {
          model: Zone,
          as: 'destinationZone',
          attributes: ['id', 'name', 'location']
        }
      ]
    });

    return res.status(201).json(fullMovement);

  } catch (error) {
    res.status(500).json({ message: 'Erreur création mouvement', error: error.message });
  }
};

// Get all movements
exports.getAllMovements = async (req, res) => {
  try {
    const movements = await Movement.findAll({
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'category', 'price']
        },
        {
          model: Zone,
          as: 'sourceZone',
          attributes: ['id', 'name', 'location']
        },
        {
          model: Zone,
          as: 'destinationZone',
          attributes: ['id', 'name', 'location']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération mouvements', error: error.message });
  }
};

// Get movements for a specific product
exports.getProductMovements = async (req, res) => {
  try {
    const movements = await Movement.findAll({
      where: { ProductId: req.params.productId },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'category']
        },
        {
          model: Zone,
          as: 'sourceZone',
          attributes: ['id', 'name', 'location']
        },
        {
          model: Zone,
          as: 'destinationZone',
          attributes: ['id', 'name', 'location']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération mouvements produit', error: error.message });
  }
};

// Get movements for a specific zone
exports.getZoneMovements = async (req, res) => {
  try {
    const movements = await Movement.findAll({
      where: {
        [Op.or]: [
          { sourceZoneId: req.params.zoneId },
          { destinationZoneId: req.params.zoneId }
        ]
      },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'category']
        },
        {
          model: Zone,
          as: 'sourceZone',
          attributes: ['id', 'name', 'location']
        },
        {
          model: Zone,
          as: 'destinationZone',
          attributes: ['id', 'name', 'location']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération mouvements zone', error: error.message });
  }
};

// Get movement by ID
exports.getMovementById = async (req, res) => {
  try {
    const movement = await Movement.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'category', 'price']
        },
        {
          model: Zone,
          as: 'sourceZone',
          attributes: ['id', 'name', 'location']
        },
        {
          model: Zone,
          as: 'destinationZone',
          attributes: ['id', 'name', 'location']
        }
      ]
    });

    if (!movement) {
      return res.status(404).json({ message: 'Mouvement non trouvé' });
    }

    res.json(movement);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération mouvement', error: error.message });
  }
};
