// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent authentification
router.use(protect);

// Routes Dashboard
router.get('/kpis', dashboardController.getKPIs);
router.get('/movement-chart', dashboardController.getMovementChartData);
router.get('/zone-chart', dashboardController.getZoneChartData);
router.get('/recent-alerts', dashboardController.getRecentAlerts);
router.get('/full', dashboardController.getFullDashboard);

module.exports = router;