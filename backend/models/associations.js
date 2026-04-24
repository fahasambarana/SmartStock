const User = require('./User');
const Product = require('./Product');
const Zone = require('./Zone');
const Movement = require('./Movement');

// Associations des produits
Zone.hasMany(Product, { foreignKey: 'ZoneId' });
Product.belongsTo(Zone, { foreignKey: 'ZoneId' });

// Associations des mouvements
Movement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Movement.belongsTo(Zone, { foreignKey: 'sourceZoneId', as: 'sourceZone' });
Movement.belongsTo(Zone, { foreignKey: 'destinationZoneId', as: 'destinationZone' });
Movement.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Un produit peut avoir plusieurs mouvements
Product.hasMany(Movement, { foreignKey: 'productId', as: 'movements' });

// Une zone peut être source ou destination de mouvements
Zone.hasMany(Movement, { foreignKey: 'sourceZoneId', as: 'outgoingMovements' });
Zone.hasMany(Movement, { foreignKey: 'destinationZoneId', as: 'incomingMovements' });

// Un utilisateur peut faire plusieurs mouvements
User.hasMany(Movement, { foreignKey: 'userId', as: 'movements' });

module.exports = { User, Product, Zone, Movement };