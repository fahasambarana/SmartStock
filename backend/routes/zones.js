const express = require('express');
const { 
  createZone, 
  getAllZones, 
  getZoneById, 
  updateZone, 
  deleteZone 
} = require('../controllers/zoneController');

const router = express.Router();

// Routes for Zones
router.post('/', createZone);
router.get('/', getAllZones);
router.get('/:id', getZoneById);
router.put('/:id', updateZone);
router.delete('/:id', deleteZone);

module.exports = router;
