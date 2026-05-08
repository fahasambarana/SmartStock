const express = require('express');
const { 
  createZone, 
  getAllZones, 
  getZoneById, 
  updateZone, 
  deleteZone 
} = require('../controllers/zoneController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes for Zones
router.use(protect);

router.post('/', authorize('manager'), createZone);
router.get('/', authorize('admin', 'manager', 'utilisateur'), getAllZones);
router.get('/:id', authorize('admin', 'manager', 'utilisateur'), getZoneById);
router.put('/:id', authorize('manager'), updateZone);
router.delete('/:id', authorize('manager'), deleteZone);

module.exports = router;
