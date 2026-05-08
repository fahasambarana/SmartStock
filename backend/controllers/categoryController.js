const { Category, Product } = require('../models/associations');
const sequelize = require('../config/database');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ 
        model: Product,
        where: { UserId: null },
        required: false
      }]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, description, products } = req.body;
    const category = await Category.create({ name, description }, { transaction: t });

    if (products && products.length > 0) {
      await Promise.all(products.map(async (p) => {
        await Product.findOrCreate({
          where: { name: p.name, UserId: null },
          defaults: { CategoryId: category.id, unit: p.unit || null, ZoneId: null },
          transaction: t
        });
      }));
    }

    await t.commit();
    res.status(201).json(category);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Product, where: { UserId: null }, required: false }]
    });
    if (!category) return res.status(404).json({ message: 'Catégorie non trouvée' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, description, products } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Catégorie non trouvée' });

    await category.update({ name, description }, { transaction: t });

    // Unlink old templates
    await Product.update({ CategoryId: null }, { where: { CategoryId: category.id, UserId: null }, transaction: t });

    if (products && products.length > 0) {
      await Promise.all(products.map(async (p) => {
        const [product, created] = await Product.findOrCreate({
          where: { name: p.name, UserId: null },
          defaults: { CategoryId: category.id, unit: p.unit || null, ZoneId: null },
          transaction: t
        });
        if (!created) {
          await product.update({ CategoryId: category.id, unit: p.unit || product.unit }, { transaction: t });
        }
      }));
    }

    await t.commit();
    res.json(category);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Catégorie non trouvée' });
    await category.destroy();
    res.json({ message: 'Catégorie supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
