const Product = require('../models/Product');
const Zone = require('../models/Zone');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, quantity, ZoneId, expirationDate } = req.body;
    
    // Convert empty string expirationDate to null for DB compliance
    const validExpiration = expirationDate ? expirationDate : null;

    const product = await Product.create({ 
      name, 
      category, 
      price, 
      quantity, 
      ZoneId: ZoneId || null, 
      expirationDate: validExpiration 
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Zone, attributes: ['id', 'name', 'location'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Zone, attributes: ['id', 'name', 'location'] }
      ]
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, price, quantity, ZoneId, expirationDate } = req.body;
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name !== undefined ? name : product.name;
    product.category = category !== undefined ? category : product.category;
    product.price = price !== undefined ? price : product.price;
    product.quantity = quantity !== undefined ? quantity : product.quantity;
    product.ZoneId = ZoneId !== undefined ? (ZoneId || null) : product.ZoneId;
    product.expirationDate = expirationDate !== undefined ? (expirationDate || null) : product.expirationDate;

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};
