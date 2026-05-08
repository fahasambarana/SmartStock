const { Product, Zone, Category, User } = require('./models/associations');
const { Sequelize } = require('sequelize');

async function test() {
  try {
    const products = await Product.findAll({
      include: [
        { model: Zone, attributes: ['name'] },
        { model: Category, attributes: ['name'] },
        { model: User, as: 'manager', attributes: ['username'] }
      ]
    });
    console.log('Success:', products.length);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

test();
