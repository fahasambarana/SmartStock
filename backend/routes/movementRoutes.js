const express = require('express');
const router = express.Router();
const movementController = require('../controllers/movementController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes de statistiques (disponibles pour tous les utilisateurs authentifiés)
router.get('/stats', movementController.getMovementStats);
router.get('/type/:type', movementController.getMovementsByType);

// Routes CRUD principales
router.get('/', movementController.getAllMovements);
router.get('/:id', movementController.getMovementById);

// Routes de création (selon le type)
router.post('/in', movementController.createInMovement);
router.post('/out', movementController.createOutMovement);
router.post('/transfer', movementController.createTransferMovement);

// Route d'annulation (admin et manager seulement)
router.put('/:id/cancel', authorize('admin', 'manager'), movementController.cancelMovement);

module.exports = router;