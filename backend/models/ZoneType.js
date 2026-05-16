const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ZoneType = sequelize.define('ZoneType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  capacite_max_default: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  unite_capacite: {
    type: DataTypes.ENUM('Volume', 'Unités', 'Pièces', 'Kg', 'Poids', 'Surface'),
    allowNull: false,
    defaultValue: 'Unités',
  },
}, {
  tableName: 'zone_types',
  timestamps: true,
});

module.exports = ZoneType;
