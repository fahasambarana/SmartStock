const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const zoneTypeController = require('../controllers/zoneTypeController');

const router = express.Router();

router.use(protect);

router.get('/', zoneTypeController.getAllZoneTypes);

router.post('/', authorize('admin'), zoneTypeController.createZoneType);
router.put('/:id', authorize('admin'), zoneTypeController.updateZoneType);
router.delete('/:id', authorize('admin'), zoneTypeController.deleteZoneType);

module.exports = router;
