const User = require('./User');
const Product = require('./Product');
const Zone = require('./Zone');
const Movement = require('./Movement');
const Category = require('./Category');
const ZoneType = require('./ZoneType');

// Associations des types de zones
ZoneType.hasMany(Zone, { foreignKey: 'ZoneTypeId', as: 'zones' });
Zone.belongsTo(ZoneType, { foreignKey: 'ZoneTypeId', as: 'ZoneType' });

// Associations des produits
Zone.hasMany(Product, { foreignKey: 'ZoneId' });
Product.belongsTo(Zone, { foreignKey: 'ZoneId' });

Category.hasMany(Product, { foreignKey: 'CategoryId' });
Product.belongsTo(Category, { foreignKey: 'CategoryId' });

User.hasMany(Product, { foreignKey: 'UserId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'UserId', as: 'manager' });

User.hasMany(Zone, { foreignKey: 'UserId', as: 'zones' });
Zone.belongsTo(User, { foreignKey: 'UserId', as: 'manager' });

// Associations des mouvements
Movement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Movement.belongsTo(Zone, { foreignKey: 'sourceZoneId', as: 'sourceZone' });
Movement.belongsTo(Zone, { foreignKey: 'destinationZoneId', as: 'destinationZone' });
Movement.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(Movement, { foreignKey: 'productId', as: 'movements' });
Zone.hasMany(Movement, { foreignKey: 'sourceZoneId', as: 'outgoingMovements' });
Zone.hasMany(Movement, { foreignKey: 'destinationZoneId', as: 'incomingMovements' });
User.hasMany(Movement, { foreignKey: 'userId', as: 'movements' });

module.exports = { User, Product, Zone, Movement, Category, ZoneType };
