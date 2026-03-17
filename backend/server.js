const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

const Product = require('./models/Product');
const Zone = require('./models/Zone');

// DB Relations
Zone.hasMany(Product, { foreignKey: 'ZoneId' });
Product.belongsTo(Zone, { foreignKey: 'ZoneId' });

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/zones', require('./routes/zones'));
app.use('/api/products', require('./routes/products'));

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});