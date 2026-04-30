// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent authentification
router.use(protect);

// Routes Chat
router.post('/send', chatController.sendMessage);
router.get('/history', chatController.getHistory);
router.get('/suggestions', chatController.getSuggestions);

module.exports = router;