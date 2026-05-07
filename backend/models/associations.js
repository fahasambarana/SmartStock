const User = require("./User");
const Product = require("./Product");
const Zone = require("./Zone");
const Movement = require("./Movement");

// ======================
// Associations
// ======================

// === Zone <-> Product ===
Zone.hasMany(Product, {
  foreignKey: "ZoneId",
  as: "products",
});

Product.belongsTo(Zone, {
  foreignKey: "ZoneId",
  as: "zone",
});

// === Movement Associations ===

// Movement appartient à un Produit
Movement.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
  onDelete: "CASCADE", // Si un produit est supprimé, ses mouvements aussi
  onUpdate: "CASCADE",
});

// Movement appartient à une Zone Source
Movement.belongsTo(Zone, {
  foreignKey: "sourceZoneId",
  as: "sourceZone",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

// Movement appartient à une Zone Destination
Movement.belongsTo(Zone, {
  foreignKey: "destinationZoneId",
  as: "destinationZone",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

// Movement appartient à un Utilisateur
Movement.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// === Relations inverses ===

// Un produit a plusieurs mouvements
Product.hasMany(Movement, {
  foreignKey: "productId",
  as: "movements",
});

// Une zone a plusieurs mouvements sortants (source)
Zone.hasMany(Movement, {
  foreignKey: "sourceZoneId",
  as: "outgoingMovements",
});

// Une zone a plusieurs mouvements entrants (destination)
Zone.hasMany(Movement, {
  foreignKey: "destinationZoneId",
  as: "incomingMovements",
});

// Un utilisateur a plusieurs mouvements
User.hasMany(Movement, {
  foreignKey: "userId",
  as: "movements",
});

module.exports = { User, Product, Zone, Movement };
