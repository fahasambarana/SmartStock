const { ZoneType } = require('../models/associations');

exports.getAllZoneTypes = async (req, res) => {
  try {
    const zoneTypes = await ZoneType.findAll({
      order: [['name', 'ASC']],
    });
    res.json(zoneTypes);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur récupération types de zones',
      error: error.message,
    });
  }
};

exports.createZoneType = async (req, res) => {
  try {
    const { name, description, capacite_max_default, unite_capacite } = req.body;

    if (!name || capacite_max_default === undefined) {
      return res.status(400).json({
        message: 'Le nom et la capacité max par défaut sont requis',
      });
    }

    const zoneType = await ZoneType.create({
      name,
      description: description || null,
      capacite_max_default: parseFloat(capacite_max_default),
      unite_capacite: unite_capacite || 'Unités',
    });

    res.status(201).json(zoneType);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur création type de zone',
      error: error.message,
    });
  }
};

exports.updateZoneType = async (req, res) => {
  try {
    const zoneType = await ZoneType.findByPk(req.params.id);
    if (!zoneType) {
      return res.status(404).json({ message: 'Type de zone non trouvé' });
    }

    const { name, description, capacite_max_default, unite_capacite } = req.body;
    await zoneType.update({
      name: name || zoneType.name,
      description: description ?? zoneType.description,
      capacite_max_default: capacite_max_default ?? zoneType.capacite_max_default,
      unite_capacite: unite_capacite || zoneType.unite_capacite,
    });

    res.json(zoneType);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur mise à jour type de zone',
      error: error.message,
    });
  }
};

exports.deleteZoneType = async (req, res) => {
  try {
    const zoneType = await ZoneType.findByPk(req.params.id);
    if (!zoneType) {
      return res.status(404).json({ message: 'Type de zone non trouvé' });
    }

    await zoneType.destroy();
    res.json({ message: 'Type de zone supprimé' });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur suppression type de zone',
      error: error.message,
    });
  }
};
