// routes/inventoryCalendarRoutes.js
const express = require('express');
const router = express.Router();
const inventoryCalendarController = require('../controllers/inventoryCalendarController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent authentification
router.use(protect);

// Routes d'inventaire automatique
router.get('/run', authorize('admin', 'manager'), inventoryCalendarController.runInventory);
router.get('/preview', authorize('admin', 'manager'), inventoryCalendarController.getInventoryPreview);
router.get('/history', authorize('admin', 'manager'), inventoryCalendarController.getInventoryHistory);

module.exports = router;