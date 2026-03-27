const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Zone = sequelize.define('Zone', {
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
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  capacite_max: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  capacite_actuelle: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  unite_capacite: {
    type: DataTypes.ENUM('Volume', 'Unités', 'Poids', 'Surface'),
    allowNull: false,
    defaultValue: 'Unités',
  },
  capacite_type: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
});

module.exports = Zone;