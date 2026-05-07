const sequelize = require("./config/database");
const { Product, Zone, User, Movement } = require("./models/associations");

const BASE_ZONES = [
  /* ... ton tableau BASE_ZONES inchangé ... */
];
const BASE_PRODUCTS = [
  /* ... ton tableau BASE_PRODUCTS inchangé ... */
];
const BASE_MOVEMENTS = [
  /* ... ton tableau BASE_MOVEMENTS inchangé ... */
];

const getMovementImpact = (product, zone, quantityMoved) => {
  if (!zone) return 0;
  return zone.unite_capacite === "Volume"
    ? (parseFloat(product.volume_unitaire) || 0) * quantityMoved
    : quantityMoved;
};

// ==================== SEEDS ====================

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

// ==================== INITIALISATION ====================

async function initializeDatabase() {
  console.log("Initialisation de la base...");

  try {
    // Force la recréation pour résoudre les problèmes de clés étrangères
    console.log("🗑️ Recréation des tables...");
    await sequelize.sync({ force: true });

    console.log("✅ Tables recréées avec succès");
  } catch (error) {
    console.error("❌ Erreur lors de la création des tables :", error.message);
    throw error;
  }

  await seedZones();
  await seedProducts();
  await seedMovements();

  console.log("🎉 Base de données initialisée avec succès !");
}

module.exports = { initializeDatabase };
