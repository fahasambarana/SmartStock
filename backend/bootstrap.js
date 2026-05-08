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
  { name: 'Zone A', description: 'Zone principale', location: 'Entrepôt 1', capacite_max: 1000, capacite_actuelle: 0, type: 'standard', unite_capacite: 'Unités' },
  { name: 'Zone B', description: 'Zone secondaire', location: 'Entrepôt 1', capacite_max: 500, capacite_actuelle: 0, type: 'standard', unite_capacite: 'Unités' },
  { name: 'Zone C', description: 'Zone froide', location: 'Entrepôt 2', capacite_max: 300, capacite_actuelle: 0, type: 'froide', unite_capacite: 'Volume' },
];

const BASE_CATEGORIES = [
  { name: 'Aliments', description: 'Produits alimentaires' },
  { name: 'Électronique', description: 'Produits électroniques' },
  { name: 'Vêtements', description: 'Vêtements et accessoires' },
];

const BASE_PRODUCTS = [
  { name: 'Pommes', category: 'Aliments', price: 2.5, quantity: 100, zoneName: 'Zone A', expirationDate: '2024-12-31', volume_unitaire: 0.1, unit: 'kg' },
  { name: 'Ordinateur', category: 'Électronique', price: 999, quantity: 10, zoneName: 'Zone B', expirationDate: null, volume_unitaire: 0.5, unit: 'pièce' },
  { name: 'T-shirt', category: 'Vêtements', price: 15, quantity: 200, zoneName: 'Zone A', expirationDate: null, volume_unitaire: 0.05, unit: 'pièce' },
];

const BASE_MOVEMENTS = [
  // Tes mouvements ici
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

async function seedCategories() {
  const existing = await Category.count();
  if (existing > 0) {
    console.log(`✓ ${existing} categories existantes`);
    return;
  }
  await Category.bulkCreate(BASE_CATEGORIES);
  console.log(`✓ ${BASE_CATEGORIES.length} categories créées`);
}

async function seedProducts() {
  const existing = await Product.count();
  if (existing > 0) {
    console.log(`✓ ${existing} produits existants`);
    return;
  }

  // Récupérer les zones et catégories
  const zones = await Zone.findAll();
  const categories = await Category.findAll();
  
  const zoneMap = new Map(zones.map((z) => [z.name, z]));
  const categoryMap = new Map(categories.map((c) => [c.name, c]));

  const productsToCreate = BASE_PRODUCTS.map((p) => {
    const category = categoryMap.get(p.category);
    if (!category) {
      console.warn(`⚠️ Catégorie "${p.category}" non trouvée pour le produit ${p.name}`);
    }
    
    return {
      name: p.name,
      unit: p.unit || 'pièce', // Ajout de l'unité
      price: p.price,
      quantity: p.quantity,
      CategoryId: category?.id || null, // Utiliser CategoryId au lieu de category
      ZoneId: zoneMap.get(p.zoneName)?.id || null,
      expirationDate: p.expirationDate,
      volume_unitaire: p.volume_unitaire,
      // UserId sera null pour l'instant
    };
  });

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

  // Ajoutez vos mouvements ici
  console.log(`✓ Mouvements créés`);
}

// ==================== INITIALISATION ====================

async function initializeDatabase() {
  console.log("Initialisation de la base...");

  try {
    // Utiliser alter: true pour synchroniser automatiquement
    await sequelize.sync({ alter: true });
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

  // Attention : l'ordre est important !
  await seedZoneTypes();  // 1. D'abord les types de zones
  await seedZones();      // 2. Ensuite les zones
  await seedCategories(); // 3. Ensuite les catégories
  await seedProducts();   // 4. Ensuite les produits (dépend des zones et catégories)
  await seedMovements();  // 5. Enfin les mouvements

  console.log("🎉 Base de données initialisée avec succès !");
}

module.exports = { initializeDatabase };