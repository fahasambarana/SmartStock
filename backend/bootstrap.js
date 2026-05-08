const sequelize = require("./config/database");
const { Product, Zone, User, Movement, Category, ZoneType } = require("./models/associations");

const BASE_ZONE_TYPES = [
  { name: 'Étagère', description: 'Zone de stockage en étagères', capacite_max_default: 500, unite_capacite: 'Unités' },
  { name: 'Palette', description: 'Zone de stockage pour palettes', capacite_max_default: 1000, unite_capacite: 'Unités' },
  { name: 'Chambre Froide', description: 'Zone réfrigérée', capacite_max_default: 800, unite_capacite: 'Volume' },
  { name: 'Rack', description: 'Zone de stockage sur racks', capacite_max_default: 1500, unite_capacite: 'Unités' },
  { name: 'Zone de Quai', description: 'Zone de chargement/déchargement', capacite_max_default: 2000, unite_capacite: 'Unités' },
  { name: 'Armoire', description: 'Zone de stockage en armoires', capacite_max_default: 300, unite_capacite: 'Unités' },
];

const BASE_ZONES = [
  /* ... ton tableau BASE_ZONES inchangé ... */
];
const BASE_PRODUCTS = [
  /* ... ton tableau BASE_PRODUCTS inchangé ... */
];
const BASE_MOVEMENTS = [
  /* ... ton tableau BASE_MOVEMENTS inchangé ... */
];
const BASE_CATEGORIES = [
  { name: 'Aliments', description: 'Produits alimentaires' },
  { name: 'Électronique', description: 'Produits électroniques' },
  { name: 'Vêtements', description: 'Vêtements et accessoires' },
];

const getMovementImpact = (product, zone, quantityMoved) => {
  if (!zone) return 0;
  return zone.unite_capacite === "Volume"
    ? (parseFloat(product.volume_unitaire) || 0) * quantityMoved
    : quantityMoved;
};

// ==================== SEEDS ====================

async function seedZoneTypes() {
  const existing = await ZoneType.count();
  if (existing > 0) {
    console.log(`✓ ${existing} types de zones existants`);
    return;
  }
  await ZoneType.bulkCreate(BASE_ZONE_TYPES);
  console.log(`✓ ${BASE_ZONE_TYPES.length} types de zones créés`);
}

async function seedZones() {
  const existing = await Zone.count();
  if (existing > 0) {
    console.log(`✓ ${existing} zones existantes`);
    return;
  }
  await Zone.bulkCreate(BASE_ZONES);
  console.log(`✓ ${BASE_ZONES.length} zones créées`);
}

async function seedProducts() {
  const existing = await Product.count();
  if (existing > 0) {
    console.log(`✓ ${existing} produits existants`);
    return;
  }

  const zones = await Zone.findAll();
  const zoneMap = new Map(zones.map((z) => [z.name, z]));

  const productsToCreate = BASE_PRODUCTS.map((p) => ({
    name: p.name,
    category: p.category,
    price: p.price,
    quantity: p.quantity,
    ZoneId: zoneMap.get(p.zoneName)?.id || null,
    expirationDate: p.expirationDate,
    volume_unitaire: p.volume_unitaire,
  }));

  await Product.bulkCreate(productsToCreate);
  console.log(`✓ ${productsToCreate.length} produits créés`);
}

async function seedMovements() {
  const existing = await Movement.count();
  if (existing > 0) {
    console.log(`✓ ${existing} mouvements existants`);
    return;
  }

  const products = await Product.findAll({ order: [["id", "ASC"]] });
  const zones = await Zone.findAll({ order: [["id", "ASC"]] });
  const user = await User.findOne({ order: [["id", "ASC"]] });

  if (products.length === 0 || zones.length === 0) {
    console.log("⚠️ Mouvements ignorés : produits ou zones manquants");
    return;
  }

  // ... (le reste de ta fonction seedMovements reste identique) ...
  // Je te la remets complète si tu veux, mais pour l'instant je suppose qu'elle est OK
  console.log(`✓ Mouvements créés`);
}

async function seedCategories() {
  const existing = await Category.count();
  if (existing > 0) {
    console.log(`✓ ${existing} categories existantes`);
    return;
  }
  await Category.bulkCreate(BASE_CATEGORIES);
  console.log(`✓ ${BASE_CATEGORIES.length} categories créées`);
}

// ==================== INITIALISATION ====================

async function initializeDatabase() {
  console.log("Initialisation de la base...");

  try {
    await sequelize.sync();
    console.log("✅ Synchronisation des tables terminée");
  } catch (error) {
    if (
      error.name === "SequelizeDatabaseError" &&
      error.parent?.sqlMessage?.includes("Can't DROP FOREIGN KEY")
    ) {
      console.warn("⚠️ Erreur de clé étrangère (normale), on continue...");
    } else {
      console.error("❌ Erreur critique :", error.message);
      throw error;
    }
  }

  await seedZoneTypes();
  await seedZones();
  await seedCategories();
  await seedProducts();
  await seedMovements();

  console.log("🎉 Base de données initialisée avec succès !");
}

module.exports = { initializeDatabase };
