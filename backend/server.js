const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./bootstrap');

const Product = require('./models/Product');
const Zone = require('./models/Zone');
const User = require('./models/User');
const Movement = require('./models/Movement');

// DB Relations
Zone.hasMany(Product, { foreignKey: 'ZoneId' });
Product.belongsTo(Zone, { foreignKey: 'ZoneId' });

Movement.belongsTo(Product, { foreignKey: 'ProductId' });
Product.hasMany(Movement, { foreignKey: 'ProductId' });

Movement.belongsTo(Zone, { foreignKey: 'sourceZoneId', as: 'sourceZone' });
Movement.belongsTo(Zone, { foreignKey: 'destinationZoneId', as: 'destinationZone' });
Zone.hasMany(Movement, { foreignKey: 'sourceZoneId', as: 'movementsOut' });
Zone.hasMany(Movement, { foreignKey: 'destinationZoneId', as: 'movementsIn' });

Movement.belongsTo(User, { foreignKey: 'UserId' });
User.hasMany(Movement, { foreignKey: 'UserId' });

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/zones', require('./routes/zones'));
app.use('/api/products', require('./routes/products'));
app.use('/api/movements', require('./routes/movements'));
app.use('/api/alerts', require('./routes/alerts'));

const PORT = process.env.PORT || 5000;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });
