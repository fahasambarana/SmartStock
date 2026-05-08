const Zone = require('../models/Zone');
const ZoneType = require('../models/ZoneType');

const zoneAttributesWithoutTypeModel = Object.keys(Zone.rawAttributes).filter(
  (attribute) => attribute !== 'ZoneTypeId'
);

const isZoneTypeSchemaError = (error) => {
  const message = error?.parent?.sqlMessage || error?.message || '';
  return (
    message.includes('ZoneTypeId') ||
    message.includes('zone_types')
  );
};

const findZoneWithOptionalType = async (id) => {
  try {
    return await Zone.findByPk(id, {
      include: [{ model: ZoneType, as: 'ZoneType' }]
    });
  } catch (error) {
    if (!isZoneTypeSchemaError(error)) throw error;

    return Zone.findByPk(id, {
      attributes: zoneAttributesWithoutTypeModel
    });
  }
};

// Create a new zone
exports.createZone = async (req, res) => {
  try {
    const { name, description, location, type, unite_capacite, capacite_max, capacite_type, ZoneTypeId } = req.body;

    const zonePayload = {
      name,
      description,
      location,
      type,
      unite_capacite: unite_capacite || 'Unités',
      capacite_max: parseFloat(capacite_max) || 0,
      capacite_type: parseFloat(capacite_type) || 0,
      ZoneTypeId: ZoneTypeId ? parseInt(ZoneTypeId) : null
    };

    let zone;
    try {
      zone = await Zone.create(zonePayload);
    } catch (error) {
      if (!isZoneTypeSchemaError(error)) throw error;
      const { ZoneTypeId: _ZoneTypeId, ...legacyZonePayload } = zonePayload;
      zone = await Zone.create(legacyZonePayload);
    }

    const zoneWithType = await findZoneWithOptionalType(zone.id);

    res.status(201).json(zoneWithType);
  } catch (error) {
    res.status(500).json({ message: 'Error creating zone', error: error.message });
  }
};

// Get all zones
exports.getAllZones = async (req, res) => {
  try {
    let zones;
    try {
      zones = await Zone.findAll({
        include: [{ model: ZoneType, as: 'ZoneType' }],
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      if (!isZoneTypeSchemaError(error)) throw error;
      zones = await Zone.findAll({
        attributes: zoneAttributesWithoutTypeModel,
        order: [['createdAt', 'DESC']]
      });
    }
    res.json(zones);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching zones', error: error.message });
  }
};

// Get a single zone by ID
exports.getZoneById = async (req, res) => {
  try {
    const zone = await findZoneWithOptionalType(req.params.id);
    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }
    res.json(zone);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching zone', error: error.message });
  }
};

// Update a zone
exports.updateZone = async (req, res) => {
  try {
    const { name, description, location, unite_capacite, capacite_max, capacite_type, type, ZoneTypeId } = req.body;
    let zone;
    try {
      zone = await Zone.findByPk(req.params.id);
    } catch (error) {
      if (!isZoneTypeSchemaError(error)) throw error;
      zone = await Zone.findByPk(req.params.id, {
        attributes: zoneAttributesWithoutTypeModel
      });
    }
    
    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    // Check if updating name and if it conflicts with another zone
    if (name && name !== zone.name) {
      const existingZone = await Zone.findOne({ where: { name } });
      if (existingZone) {
        return res.status(400).json({ message: 'Zone with this name already exists' });
      }
    }

    zone.name = name || zone.name;
    zone.description = description !== undefined ? description : zone.description;
    zone.location = location !== undefined ? location : zone.location;
    zone.unite_capacite = unite_capacite || zone.unite_capacite;
    zone.capacite_max = capacite_max !== undefined ? parseFloat(capacite_max) : zone.capacite_max;
    zone.capacite_type = capacite_type !== undefined ? parseFloat(capacite_type) : zone.capacite_type;
    zone.type = type !== undefined ? type : zone.type;
    if (Object.prototype.hasOwnProperty.call(zone.dataValues, 'ZoneTypeId')) {
      zone.ZoneTypeId = ZoneTypeId ? parseInt(ZoneTypeId) : null;
    }

    try {
      await zone.save();
    } catch (error) {
      if (!isZoneTypeSchemaError(error)) throw error;
      zone.changed('ZoneTypeId', false);
      await zone.save();
    }

    const updatedZone = await findZoneWithOptionalType(zone.id);

    res.json(updatedZone);
  } catch (error) {
    res.status(500).json({ message: 'Error updating zone', error: error.message });
  }
};

// Delete a zone
exports.deleteZone = async (req, res) => {
  try {
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    await zone.destroy();
    res.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting zone', error: error.message });
  }
};
