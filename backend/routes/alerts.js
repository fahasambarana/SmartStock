const express = require('express');
const { getAlerts } = require('../controllers/alertController');
const { getFullDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getAlerts);
router.get('/dashboard/full', getFullDashboard);

module.exports = router;
