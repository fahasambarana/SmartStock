const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movement = sequelize.define('Movement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',  // Nom exact de la table dans MySQL
      key: 'id'
    }
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  type: {
    type: DataTypes.ENUM('in', 'out', 'transfer'),
    allowNull: false,
  },
  sourceZoneId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Zones',  // Nom exact de la table dans MySQL
      key: 'id'
    }
  },
  sourceZoneName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  destinationZoneId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Zones',  // Nom exact de la table dans MySQL
      key: 'id'
    }
  },
  destinationZoneName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',  // ← IMPORTANT: utilisez 'users' en minuscule
      key: 'id'
    }
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'completed',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  movementDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'movements',
  timestamps: true,
});

module.exports = Movement;