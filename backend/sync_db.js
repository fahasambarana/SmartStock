const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('./config/database');
const { Product, Zone } = require('./models/associations');

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
