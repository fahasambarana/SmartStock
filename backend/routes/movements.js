const express = require('express');
const {
  createMovement,
  createInMovement,
  createOutMovement,
  createTransferMovement,
  getAllMovements,
  getProductMovements,
  getZoneMovements,
  getMovementsByType,
  getMovementStats,
  getMovementById,
  cancelMovement,
} = require('../controllers/movementController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getMovementStats);
router.get('/type/:type', getMovementsByType);
router.get('/product/:productId', getProductMovements);
router.get('/zone/:zoneId', getZoneMovements);
router.get('/', getAllMovements);
router.get('/:id', getMovementById);

router.post('/', createMovement);
router.post('/in', createInMovement);
router.post('/out', createOutMovement);
router.post('/transfer', createTransferMovement);

router.put('/:id/cancel', authorize('admin', 'manager'), cancelMovement);

module.exports = router;
