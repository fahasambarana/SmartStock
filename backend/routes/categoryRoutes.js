const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', authorize('admin'), categoryController.createCategory);
router.put('/:id', authorize('admin'), categoryController.updateCategory);
router.delete('/:id', authorize('admin'), categoryController.deleteCategory);

module.exports = router;
