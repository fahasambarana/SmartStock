const Movement = require("../models/Movement");
const Product = require("../models/Product");
const Zone = require("../models/Zone");
const { Op } = require("sequelize");

const MOVEMENT_TYPE_MAP = {
  in: "Entrée",
  out: "Sortie",
  transfer: "Transfert",
};

const getRole = (user) => user?.role?.toLowerCase?.() || "";

const getMovementScope = (user, extraWhere = {}) => ({
  ...extraWhere,
  ...(getRole(user) === "manager" ? { userId: user.id } : {}),
});

// Create a movement (Entrée, Sortie, or Transfert)
exports.createMovement = async (req, res) => {
  try {
    const {
      type,
      ProductId: rawProductId,
      productId: fallbackProductId,
      quantityMoved: rawQuantityMoved,
      quantity,
      sourceZoneId,
      destinationZoneId,
      reason,
      UserId,
      notes,
    } = req.body;

    const productId = rawProductId || fallbackProductId;
    const actualQuantityMoved = parseInt(rawQuantityMoved ?? quantity) || 0;
    const userId = req.user?.id || UserId;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    if (getRole(req.user) === "manager" && product.UserId !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const quantityBefore = product.quantity;
    let quantityAfter = quantityBefore;

    // Validation and processing based on type
    if (type === "Entrée") {
      // Stock entry
      if (!destinationZoneId) {
        return res
          .status(400)
          .json({ message: "Zone de destination requise pour une entrée" });
      }

      const destZone = await Zone.findByPk(destinationZoneId);
      if (!destZone) {
        return res
          .status(404)
          .json({ message: "Zone de destination non trouvée" });
      }

      // Check capacity
      const impact =
        destZone.unite_capacite === "Volume"
          ? (parseFloat(product.volume_unitaire) || 0) * actualQuantityMoved
          : actualQuantityMoved;

      if (
        (parseFloat(destZone.capacite_actuelle) || 0) + impact >
        parseFloat(destZone.capacite_max)
      ) {
        return res.status(400).json({
          message: `Action Impossible : Saturation de l'espace [${destZone.name}]`,
        });
      }

      // Update product quantity and zone
      quantityAfter = quantityBefore + actualQuantityMoved;
      product.quantity = quantityAfter;
      product.ZoneId = destinationZoneId;
      destZone.capacite_actuelle =
        (parseFloat(destZone.capacite_actuelle) || 0) + impact;
      await destZone.save();
    } else if (type === "Sortie") {
      // Stock exit
      if (!sourceZoneId) {
        return res
          .status(400)
          .json({ message: "Zone source requise pour une sortie" });
      }

      if (quantityBefore < actualQuantityMoved) {
        return res
          .status(400)
          .json({ message: "Quantité insuffisante pour la sortie" });
      }

      const srcZone = await Zone.findByPk(sourceZoneId);
      if (!srcZone) {
        return res.status(404).json({ message: "Zone source non trouvée" });
      }

      // Update product quantity and zone
      quantityAfter = quantityBefore - actualQuantityMoved;
      product.quantity = quantityAfter;

      const impact =
        srcZone.unite_capacite === "Volume"
          ? (parseFloat(product.volume_unitaire) || 0) * actualQuantityMoved
          : actualQuantityMoved;

      srcZone.capacite_actuelle = Math.max(
        0,
        (parseFloat(srcZone.capacite_actuelle) || 0) - impact,
      );
      await srcZone.save();
    } else if (type === "Transfert") {
      // Stock transfer
      if (!sourceZoneId || !destinationZoneId) {
        return res.status(400).json({
          message: "Zone source et destination requises pour un transfert",
        });
      }

      if (quantityBefore < actualQuantityMoved) {
        return res
          .status(400)
          .json({ message: "Quantité insuffisante pour le transfert" });
      }

      const srcZone = await Zone.findByPk(sourceZoneId);
      const destZone = await Zone.findByPk(destinationZoneId);

      if (!srcZone || !destZone) {
        return res
          .status(404)
          .json({ message: "Zone source ou destination non trouvée" });
      }

      // Calculate impacts
      const srcImpact =
        srcZone.unite_capacite === "Volume"
          ? (parseFloat(product.volume_unitaire) || 0) * actualQuantityMoved
          : actualQuantityMoved;

      const destImpact =
        destZone.unite_capacite === "Volume"
          ? (parseFloat(product.volume_unitaire) || 0) * actualQuantityMoved
          : actualQuantityMoved;

      // Check destination capacity
      if (
        (parseFloat(destZone.capacite_actuelle) || 0) + destImpact >
        parseFloat(destZone.capacite_max)
      ) {
        return res.status(400).json({
          message: `Action Impossible : Saturation de l'espace [${destZone.name}]`,
        });
      }

      // Update zones and product
      srcZone.capacite_actuelle = Math.max(
        0,
        (parseFloat(srcZone.capacite_actuelle) || 0) - srcImpact,
      );
      destZone.capacite_actuelle =
        (parseFloat(destZone.capacite_actuelle) || 0) + destImpact;

      product.ZoneId = destinationZoneId;
      quantityAfter = quantityBefore; // Quantity doesn't change for transfers, just zones

      await srcZone.save();
      await destZone.save();
    }

    // Save product changes
    await product.save();

    const sourceZone = sourceZoneId ? await Zone.findByPk(sourceZoneId) : null;
    const destinationZone = destinationZoneId ? await Zone.findByPk(destinationZoneId) : null;
    const userName = req.user?.username || "Système";

    // Create movement record
    const movement = await Movement.create({
      type,
      productId,
      productName: product.name,
      sourceZoneId: sourceZoneId || null,
      sourceZoneName: sourceZone?.name || null,
      destinationZoneId: destinationZoneId || null,
      destinationZoneName: destinationZone?.name || null,
      userId,
      userName,
      quantityBefore,
      quantityAfter,
      quantityMoved: actualQuantityMoved,
      reason,
      notes,
    });

    // Fetch full movement with associations
    const fullMovement = await Movement.findByPk(movement.id, {
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "CategoryId"],
        },
        {
          model: Zone,
          as: "sourceZone",
          attributes: ["id", "name", "location"],
        },
        {
          model: Zone,
          as: "destinationZone",
          attributes: ["id", "name", "location"],
        },
      ],
    });

    return res.status(201).json({ success: true, movement: fullMovement });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur création mouvement", error: error.message });
  }
};

exports.createInMovement = async (req, res) => {
  req.body.type = MOVEMENT_TYPE_MAP.in;
  req.body.ProductId = req.body.productId || req.body.ProductId;
  req.body.quantityMoved = req.body.quantity ?? req.body.quantityMoved;
  return exports.createMovement(req, res);
};

exports.createOutMovement = async (req, res) => {
  req.body.type = MOVEMENT_TYPE_MAP.out;
  req.body.ProductId = req.body.productId || req.body.ProductId;
  req.body.quantityMoved = req.body.quantity ?? req.body.quantityMoved;
  return exports.createMovement(req, res);
};

exports.createTransferMovement = async (req, res) => {
  req.body.type = MOVEMENT_TYPE_MAP.transfer;
  req.body.ProductId = req.body.productId || req.body.ProductId;
  req.body.quantityMoved = req.body.quantity ?? req.body.quantityMoved;
  return exports.createMovement(req, res);
};

exports.getMovementsByType = async (req, res) => {
  try {
    const movementType = MOVEMENT_TYPE_MAP[req.params.type];
    if (!movementType) {
      return res.status(400).json({ message: "Type de mouvement invalide" });
    }

    const movements = await Movement.findAll({
      where: getMovementScope(req.user, { type: movementType }),
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "CategoryId"],
        },
        {
          model: Zone,
          as: "sourceZone",
          attributes: ["id", "name", "location"],
        },
        {
          model: Zone,
          as: "destinationZone",
          attributes: ["id", "name", "location"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ data: movements });
  } catch (error) {
    res.status(500).json({
      message: "Erreur récupération mouvements par type",
      error: error.message,
    });
  }
};

exports.getMovementStats = async (req, res) => {
  try {
    const total = await Movement.count({ where: getMovementScope(req.user) });
    const totalIn = await Movement.count({ where: getMovementScope(req.user, { type: MOVEMENT_TYPE_MAP.in }) });
    const totalOut = await Movement.count({ where: getMovementScope(req.user, { type: MOVEMENT_TYPE_MAP.out }) });
    const totalTransfer = await Movement.count({ where: getMovementScope(req.user, { type: MOVEMENT_TYPE_MAP.transfer }) });

    res.json({
      total,
      stats: {
        in: totalIn,
        out: totalOut,
        transfer: totalTransfer,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur récupération statistiques des mouvements",
      error: error.message,
    });
  }
};

exports.cancelMovement = async (req, res) => {
  try {
    const movement = await Movement.findByPk(req.params.id);
    if (!movement) {
      return res.status(404).json({ message: "Mouvement non trouvé" });
    }

    movement.status = "cancelled";
    await movement.save();

    res.json({ success: true, message: "Mouvement annulé", movement });
  } catch (error) {
    res.status(500).json({
      message: "Erreur annulation mouvement",
      error: error.message,
    });
  }
};

// Get all movements
exports.getAllMovements = async (req, res) => {
  try {
    const movements = await Movement.findAll({
      where: getMovementScope(req.user),
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "CategoryId"],
        },
        {
          model: Zone,
          as: "sourceZone",
          attributes: ["id", "name", "location"],
        },
        {
          model: Zone,
          as: "destinationZone",
          attributes: ["id", "name", "location"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(movements);
  } catch (error) {
    res.status(500).json({
      message: "Erreur récupération mouvements",
      error: error.message,
    });
  }
};

// Get movements for a specific product
exports.getProductMovements = async (req, res) => {
  try {
    const movements = await Movement.findAll({
      where: getMovementScope(req.user, { productId: req.params.productId }),
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "CategoryId"],
        },
        {
          model: Zone,
          as: "sourceZone",
          attributes: ["id", "name", "location"],
        },
        {
          model: Zone,
          as: "destinationZone",
          attributes: ["id", "name", "location"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(movements);
  } catch (error) {
    res.status(500).json({
      message: "Erreur récupération mouvements produit",
      error: error.message,
    });
  }
};

// Get movements for a specific zone
exports.getZoneMovements = async (req, res) => {
  try {
    const movements = await Movement.findAll({
      where: getMovementScope(req.user, {
        [Op.or]: [
          { sourceZoneId: req.params.zoneId },
          { destinationZoneId: req.params.zoneId },
        ],
      }),
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "CategoryId"],
        },
        {
          model: Zone,
          as: "sourceZone",
          attributes: ["id", "name", "location"],
        },
        {
          model: Zone,
          as: "destinationZone",
          attributes: ["id", "name", "location"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(movements);
  } catch (error) {
    res.status(500).json({
      message: "Erreur récupération mouvements zone",
      error: error.message,
    });
  }
};

// Get movement by ID
exports.getMovementById = async (req, res) => {
  try {
    const movement = await Movement.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "CategoryId"],
        },
        {
          model: Zone,
          as: "sourceZone",
          attributes: ["id", "name", "location"],
        },
        {
          model: Zone,
          as: "destinationZone",
          attributes: ["id", "name", "location"],
        },
      ],
    });

    if (!movement) {
      return res.status(404).json({ message: "Mouvement non trouvé" });
    }
    if (getRole(req.user) === "manager" && movement.userId !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    res.json(movement);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur récupération mouvement", error: error.message });
  }
};
