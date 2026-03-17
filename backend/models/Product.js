const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('Food', 'Electronics', 'Cosmetics', 'Other'),
    allowNull: false,
    defaultValue: 'Other',
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  ZoneId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Zones',
      key: 'id',
    }
  },
  expirationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
});

module.exports = Product;
