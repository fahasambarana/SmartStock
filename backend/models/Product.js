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
  unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  CategoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'id',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
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
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }
  },
  expirationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  volume_unitaire: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Product;
