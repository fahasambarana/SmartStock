const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('./config/database');
const Product = require('./models/Product');
const Zone = require('./models/Zone');

// DB Relations
Zone.hasMany(Product, { foreignKey: 'ZoneId' });
Product.belongsTo(Zone, { foreignKey: 'ZoneId' });

async function syncDB() {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ alter: true });
    console.log('Sync complete.');
  } catch(error) {
    console.error('Error syncing:', error);
  } finally {
    process.exit();
  }
}

syncDB();
