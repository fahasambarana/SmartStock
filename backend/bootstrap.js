const sequelize = require("./config/database");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { Product, Zone, User, Movement, Category, ZoneType } = require("./models/associations");

const BASE_USERS = [
  {
    username: "admin",
    email: "admin@example.com",
    password: "Admin123!",
    role: "admin",
    status: "approved",
  },
  {
    username: "manager",
    email: "manager@example.com",
    password: "Manager123!",
    role: "manager",
    status: "approved",
  },
  {
    username: "manager_aliments",
    email: "manager.aliments@example.com",
    password: "Manager123!",
    role: "manager",
    status: "approved",
  },
  {
    username: "manager_electronique",
    email: "manager.electronique@example.com",
    password: "Manager123!",
    role: "manager",
    status: "approved",
  },
];

const BASE_ZONE_TYPES = [
  { name: 'Étagère', description: 'Zone de stockage en étagères', capacite_max_default: 500, unite_capacite: 'Unités' },
  { name: 'Palette', description: 'Zone de stockage pour palettes', capacite_max_default: 1000, unite_capacite: 'Unités' },
  { name: 'Chambre Froide', description: 'Zone réfrigérée', capacite_max_default: 800, unite_capacite: 'Volume' },
  { name: 'Rack', description: 'Zone de stockage sur racks', capacite_max_default: 1500, unite_capacite: 'Unités' },
  { name: 'Zone de Quai', description: 'Zone de chargement/déchargement', capacite_max_default: 2000, unite_capacite: 'Unités' },
  { name: 'Armoire', description: 'Zone de stockage en armoires', capacite_max_default: 300, unite_capacite: 'Unités' },
];

const BASE_ZONES = [
  { name: 'Zone A', description: ' eefef Zone principale', location: 'Entrepôt 1', capacite_max: 1000, capacite_actuelle: 0, type: 'standard', unite_capacite: 'Unités' },
  { name: 'Zone B', description: 'Zone secondaire', location: 'Entrepôt 1', capacite_max: 500, capacite_actuelle: 0, type: 'standard', unite_capacite: 'Unités' },
  { name: 'Zone C', description: 'Zone froide', location: 'Entrepôt 2', capacite_max: 300, capacite_actuelle: 0, type: 'froide', unite_capacite: 'Volume' },
];

const MANAGER_ZONES = [
  { name: 'Zone Manager A', description: 'Zone de stockage du manager', location: 'Entrepôt Manager', capacite_max: 700, capacite_actuelle: 0, type: 'standard', unite_capacite: 'Unités' },
  { name: 'Zone Manager Froide', description: 'Zone froide du manager', location: 'Entrepôt Manager', capacite_max: 250, capacite_actuelle: 0, type: 'froide', unite_capacite: 'Volume' },
  { name: 'Zone Manager Aliments', description: 'Zone dédiée au manager aliments', location: 'Entrepôt Manager Aliments', capacite_max: 900, capacite_actuelle: 0, type: 'standard', unite_capacite: 'Unités' },
  { name: 'Zone Manager Electronique', description: 'Zone dédiée au manager électronique', location: 'Entrepôt Manager Electronique', capacite_max: 450, capacite_actuelle: 0, type: 'standard', unite_capacite: 'Unités' },
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

const MANAGER_PRODUCTS = [
  { managerUsername: 'manager', name: 'Riz local', category: 'Aliments', price: 1.8, quantity: 80, zoneName: 'Zone Manager A', expirationDate: '2026-12-31', volume_unitaire: 0.2, unit: 'kg' },
  { managerUsername: 'manager', name: 'Yaourt nature', category: 'Aliments', price: 0.9, quantity: 45, zoneName: 'Zone Manager Froide', expirationDate: '2026-06-30', volume_unitaire: 0.05, unit: 'pièce' },
  { managerUsername: 'manager_aliments', name: 'Farine de manioc', category: 'Aliments', price: 1.2, quantity: 120, zoneName: 'Zone Manager Aliments', expirationDate: '2026-11-30', volume_unitaire: 0.12, unit: 'kg' },
  { managerUsername: 'manager_aliments', name: 'Huile de cuisson', category: 'Aliments', price: 4.5, quantity: 60, zoneName: 'Zone Manager Aliments', expirationDate: '2027-01-15', volume_unitaire: 0.08, unit: 'litre' },
  { managerUsername: 'manager_electronique', name: 'Casque audio', category: 'Électronique', price: 35, quantity: 12, zoneName: 'Zone Manager Electronique', expirationDate: null, volume_unitaire: 0.15, unit: 'pièce' },
  { managerUsername: 'manager_electronique', name: 'Clavier USB', category: 'Électronique', price: 18, quantity: 30, zoneName: 'Zone Manager Electronique', expirationDate: null, volume_unitaire: 0.1, unit: 'pièce' },
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

async function seedUsers() {
  let created = 0;
  let updated = 0;

  for (const userSeed of BASE_USERS) {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: userSeed.email },
          { username: userSeed.username },
        ],
      },
    });

    if (existingUser) {
      const updates = {};
      if (existingUser.role !== userSeed.role) updates.role = userSeed.role;
      if (existingUser.status !== userSeed.status) updates.status = userSeed.status;

      if (Object.keys(updates).length > 0) {
        await existingUser.update(updates);
        updated += 1;
      }
      continue;
    }

    const hashedPassword = await bcrypt.hash(userSeed.password, 10);
    await User.create({
      username: userSeed.username,
      email: userSeed.email,
      password: hashedPassword,
      role: userSeed.role,
      status: userSeed.status,
    });
    created += 1;
  }

  console.log(`✓ Utilisateurs seedés : ${created} créés, ${updated} mis à jour`);
}

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
  let created = 0;

  for (const zoneSeed of [...BASE_ZONES, ...MANAGER_ZONES]) {
    const [, wasCreated] = await Zone.findOrCreate({
      where: { name: zoneSeed.name },
      defaults: zoneSeed,
    });
    if (wasCreated) created += 1;
  }

  const existing = await Zone.count();
  console.log(`✓ Zones seedées : ${created} créées, ${existing} existantes au total`);
}

async function seedCategories() {
  let created = 0;

  for (const categorySeed of BASE_CATEGORIES) {
    const [, wasCreated] = await Category.findOrCreate({
      where: { name: categorySeed.name },
      defaults: categorySeed,
    });
    if (wasCreated) created += 1;
  }

  const existing = await Category.count();
  console.log(`✓ Catégories seedées : ${created} créées, ${existing} existantes au total`);
}

async function seedProducts() {
  // Récupérer les zones et catégories
  const zones = await Zone.findAll();
  const categories = await Category.findAll();
  const managers = await User.findAll({ where: { role: 'manager', status: 'approved' } });
  
  const zoneMap = new Map(zones.map((z) => [z.name, z]));
  const categoryMap = new Map(categories.map((c) => [c.name, c]));
  const managerMap = new Map(managers.map((m) => [m.username, m]));

  const buildProductPayload = (p, userId = null) => {
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
      UserId: userId,
    };
  };

  let created = 0;

  for (const productSeed of BASE_PRODUCTS) {
    const payload = buildProductPayload(productSeed);
    const [, wasCreated] = await Product.findOrCreate({
      where: {
        name: productSeed.name,
        CategoryId: payload.CategoryId,
        UserId: null,
      },
      defaults: payload,
    });
    if (wasCreated) created += 1;
  }

  for (const productSeed of MANAGER_PRODUCTS) {
    const manager = managerMap.get(productSeed.managerUsername);
    if (!manager) {
      console.warn(`⚠️ Manager "${productSeed.managerUsername}" introuvable pour le produit ${productSeed.name}`);
      continue;
    }

    const payload = buildProductPayload(productSeed, manager.id);
    const [, wasCreated] = await Product.findOrCreate({
      where: {
        name: productSeed.name,
        UserId: manager.id,
      },
      defaults: payload,
    });
    if (wasCreated) created += 1;
  }

  const existing = await Product.count();
  console.log(`✓ Produits seedés : ${created} créés, ${existing} existants au total`);
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
  await seedUsers();      // 2. Ensuite les utilisateurs admin et manager
  await seedZones();      // 3. Ensuite les zones
  await seedCategories(); // 4. Ensuite les catégories
  await seedProducts();   // 5. Ensuite les produits (dépend des users, zones et catégories)
  await seedMovements();  // 6. Enfin les mouvements

  console.log("🎉 Base de données initialisée avec succès !");
}

module.exports = { initializeDatabase };
