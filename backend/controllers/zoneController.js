const Zone = require('../models/Zone');

// Create a new zone
exports.createZone = async (req, res) => {
  try {
    const { name, description, location } = req.body;
    
    // Check if zone with same name exists
    const existingZone = await Zone.findOne({ where: { name } });
    if (existingZone) {
      return res.status(400).json({ message: 'Zone with this name already exists' });
    }

    const zone = await Zone.create({ name, description, location });
    res.status(201).json(zone);
  } catch (error) {
    res.status(500).json({ message: 'Error creating zone', error: error.message });
  }
};

// Get all zones
exports.getAllZones = async (req, res) => {
  try {
    const zones = await Zone.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(zones);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching zones', error: error.message });
  }
};

// Get a single zone by ID
exports.getZoneById = async (req, res) => {
  try {
    const zone = await Zone.findByPk(req.params.id);
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
    const { name, description, location } = req.body;
    const zone = await Zone.findByPk(req.params.id);
    
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

    await zone.save();
    res.json(zone);
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
