const express = require('express');
const {
  createMovement,
  getAllMovements,
  getProductMovements,
  getZoneMovements,
  getMovementById
} = require('../controllers/movementController');

const router = express.Router();

router.post('/', createMovement);
router.get('/', getAllMovements);
router.get('/product/:productId', getProductMovements);
router.get('/zone/:zoneId', getZoneMovements);
router.get('/:id', getMovementById);

module.exports = router;
