const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('./config/database');
const Product = require('./models/Product');
const Zone = require('./models/Zone');

// DB Relations
Zone.hasMany(Product, { foreignKey: 'ZoneId' });
Product.belongsTo(Zone, { foreignKey: 'ZoneId' });

async function syncProduct() {
  try {
    console.log('Syncing Product table...');
    await Product.sync({ alter: true });
    console.log('Sync complete.');
  } catch(error) {
    console.error('Error syncing:', error);
  } finally {
    process.exit();
  }
}

syncProduct();
