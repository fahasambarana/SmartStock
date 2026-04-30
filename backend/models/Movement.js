const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movement = sequelize.define('Movement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM('Entrée', 'Sortie', 'Transfert'),
    allowNull: false,
  },
  ProductId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantityBefore: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantityAfter: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantityMoved: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sourceZoneId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  destinationZoneId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: false // Désactiver les timestamps auto pour éviter les constraints
});

module.exports = Movement;

