const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
  createProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');

const router = express.Router();

router.use(protect);

router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
