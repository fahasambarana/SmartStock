const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'users_username_unique',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'users_email_unique',
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'fournisseur', 'utilisateur', 'manager'),
    defaultValue: 'utilisateur',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['username'], name: 'users_username_unique' },
    { unique: true, fields: ['email'], name: 'users_email_unique' },
  ],
});

module.exports = User;