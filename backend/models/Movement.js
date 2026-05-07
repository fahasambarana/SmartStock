const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Movement = sequelize.define(
  "Movement",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "productId",
    },

    sourceZoneId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "sourceZoneId",
    },

    destinationZoneId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "destinationZoneId",
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "userId",
    },

    // Champs dénormalisés pour historique
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sourceZoneName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    destinationZoneName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("Entrée", "Sortie", "Transfert"),
      allowNull: false,
    },

    quantityMoved: {
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

    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "completed", "cancelled"),
      defaultValue: "completed",
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    movementDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "movements",
    freezeTableName: true,
    timestamps: true,
    underscored: false,
    indexes: [
      { fields: ["productId"] },
      { fields: ["userId"] },
      { fields: ["sourceZoneId"] },
      { fields: ["destinationZoneId"] },
      { fields: ["type"] },
      { fields: ["movementDate"] },
    ],
  },
);

module.exports = Movement;
