// routes/aiAlerts.js
const express = require('express');
const router = express.Router();
const aiAlertController = require('../controllers/aiAlertController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent authentification
router.use(protect);

// Routes d'alertes IA
router.get('/products', aiAlertController.getProductAlerts);
router.get('/zones', aiAlertController.getZoneAlerts);
router.get('/anomalies', aiAlertController.getAnomalies);
router.get('/dashboard', aiAlertController.getDashboardAlerts);

module.exports = router;