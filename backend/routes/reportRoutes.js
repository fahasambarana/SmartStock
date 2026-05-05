// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent authentification
router.use(protect);

// Routes accessibles à Admin et Manager
router.use(authorize('admin', 'manager'));

// Routes d'export PDF
router.get('/inventory/pdf', reportController.generateInventoryPDF);
router.get('/movements/pdf', reportController.generateMovementsPDF);
router.get('/alerts/pdf', reportController.generateAlertsPDF);

// Routes d'aperçu (sans PDF)
router.get('/inventory/preview', reportController.getInventoryPreview);
router.get('/movements/preview', reportController.getMovementsPreview);
router.get('/alerts/preview', reportController.getAlertsPreview);

module.exports = router;