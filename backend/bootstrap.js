const sequelize = require('./config/database');
const Product = require('./models/Product');
const Zone = require('./models/Zone');
const User = require('./models/User');
const Movement = require('./models/Movement');

const BASE_ZONES = [
  {
    name: 'Zone A',
    description: 'Zone principale de stockage',
    location: 'Entrepôt 1 - Niveau 1',
    capacite_max: 1000,
    capacite_actuelle: 0,
    type: 'Entrepôt',
    unite_capacite: 'Unités',
    capacite_type: 1000,
  },
  {
    name: 'Zone B',
    description: 'Zone frigorifique',
    location: 'Entrepôt 1 - Chambre froide',
    capacite_max: 500,
    capacite_actuelle: 0,
    type: 'Frigorifique',
    unite_capacite: 'Unités',
    capacite_type: 500,
  },
  {
    name: 'Zone C',
    description: 'Zone temporaire',
    location: 'Quai de déchargement',
    capacite_max: 800,
    capacite_actuelle: 0,
    type: 'Temporaire',
    unite_capacite: 'Unités',
    capacite_type: 800,
  },
  {
    name: 'Zone D',
    description: 'Zone par volume',
    location: 'Entrepôt 2',
    capacite_max: 5000,
    capacite_actuelle: 0,
    type: 'Volume',
    unite_capacite: 'Volume',
    capacite_type: 5000,
  },
  {
    name: 'Zone Retour',
    description: 'Zone pour les retours et dommages',
    location: 'Entrepôt 1 - Niveau 2',
    capacite_max: 300,
    capacite_actuelle: 0,
    type: 'Spéciale',
    unite_capacite: 'Unités',
    capacite_type: 300,
  },
];

const BASE_PRODUCTS = [
  {
    name: 'Riz blanc',
    category: 'Alimentaire',
    price: 1.5,
    quantity: 0,
    zoneName: 'Zone A',
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    volume_unitaire: 0.5,
  },
  {
    name: 'Farine de blé',
    category: 'Alimentaire',
    price: 0.8,
    quantity: 0,
    zoneName: 'Zone A',
    expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    volume_unitaire: 0.3,
  },
  {
    name: 'Lait en poudre',
    category: 'Alimentaire',
    price: 2.5,
    quantity: 0,
    zoneName: 'Zone B',
    expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    volume_unitaire: 0.2,
  },
  {
    name: 'Savon liquide',
    category: 'Cosmetics',
    price: 3,
    quantity: 0,
    zoneName: 'Zone A',
    expirationDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
    volume_unitaire: 0.5,
  },
  {
    name: 'Lampe LED',
    category: 'Electronics',
    price: 15.99,
    quantity: 0,
    zoneName: 'Zone C',
    expirationDate: null,
    volume_unitaire: 0.1,
  },
];

const BASE_MOVEMENTS = [
  {
    type: 'Entrée',
    productName: 'Riz blanc',
    quantityMoved: 100,
    sourceZoneName: null,
    destinationZoneName: 'Zone A',
    reason: 'Approvisionnement initial',
    notes: 'Stock initial reçu du fournisseur',
    daysAgo: 30,
  },
  {
    type: 'Entrée',
    productName: 'Farine de blé',
    quantityMoved: 50,
    sourceZoneName: null,
    destinationZoneName: 'Zone B',
    reason: 'Reapprovisionnnement',
    notes: 'Nouvel achat',
    daysAgo: 25,
  },
  {
    type: 'Sortie',
    productName: 'Riz blanc',
    quantityMoved: 20,
    sourceZoneName: 'Zone A',
    destinationZoneName: null,
    reason: 'Vente',
    notes: 'Vente client #001',
    daysAgo: 20,
  },
  {
    type: 'Sortie',
    productName: 'Farine de blé',
    quantityMoved: 5,
    sourceZoneName: 'Zone B',
    destinationZoneName: null,
    reason: 'Échantillon',
    notes: 'Échantillon gratuit pour client potentiel',
    daysAgo: 15,
  },
  {
    type: 'Transfert',
    productName: 'Riz blanc',
    quantityMoved: 30,
    sourceZoneName: 'Zone A',
    destinationZoneName: 'Zone B',
    reason: 'Réorganisation stock',
    notes: 'Transfert pour équilibrer les charges',
    daysAgo: 10,
  },
  {
    type: 'Transfert',
    productName: 'Lait en poudre',
    quantityMoved: 15,
    sourceZoneName: 'Zone B',
    destinationZoneName: 'Zone A',
    reason: 'Retour stock',
    notes: 'Retour après inventaire',
    daysAgo: 5,
  },
  {
    type: 'Entrée',
    productName: 'Lait en poudre',
    quantityMoved: 30,
    sourceZoneName: null,
    destinationZoneName: 'Zone C',
    reason: 'Reapprovisionnnement',
    notes: 'Arrivée fournisseur',
    daysAgo: 2,
  },
];

const getMovementImpact = (product, zone, quantityMoved) => {
  if (!zone) return 0;

  return zone.unite_capacite === 'Volume'
    ? (parseFloat(product.volume_unitaire) || 0) * quantityMoved
    : quantityMoved;
};

async function seedZones() {
  const existingZones = await Zone.count();
  if (existingZones > 0) {
    console.log(`✓ ${existingZones} zones existantes`);
    return;
  }

  await Zone.bulkCreate(BASE_ZONES);
  console.log(`✓ ${BASE_ZONES.length} zones créées`);
}

async function seedProducts() {
  const existingProducts = await Product.count();
  if (existingProducts > 0) {
    console.log(`✓ ${existingProducts} produits existants`);
    return;
  }

  const zones = await Zone.findAll();
  const zoneByName = new Map(zones.map((zone) => [zone.name, zone]));

  const productsToCreate = BASE_PRODUCTS.map((product) => ({
    name: product.name,
    category: product.category,
    price: product.price,
    quantity: product.quantity,
    ZoneId: zoneByName.get(product.zoneName)?.id || null,
    expirationDate: product.expirationDate,
    volume_unitaire: product.volume_unitaire,
  }));

  await Product.bulkCreate(productsToCreate);
  console.log(`✓ ${productsToCreate.length} produits créés`);
}

async function seedMovements() {
  const existingMovements = await Movement.count();
  if (existingMovements > 0) {
    console.log(`✓ ${existingMovements} mouvements existants`);
    return;
  }

  const products = await Product.findAll({ order: [['id', 'ASC']] });
  const zones = await Zone.findAll({ order: [['id', 'ASC']] });
  const user = await User.findOne({ order: [['id', 'ASC']] });

  if (products.length === 0 || zones.length === 0) {
    console.log('! Initialisation des mouvements ignorée: produits ou zones manquants');
    return;
  }

  const productByName = new Map(products.map((product) => [product.name, product]));
  const zoneByName = new Map(zones.map((zone) => [zone.name, zone]));

  const zoneLoads = new Map(zones.map((zone) => [zone.id, 0]));
  for (const zone of zones) {
    zone.capacite_actuelle = 0;
    await zone.save();
  }

  for (const product of products) {
    product.quantity = 0;
    await product.save();
  }

  const movementsToCreate = [];

  for (const entry of BASE_MOVEMENTS) {
    const product = productByName.get(entry.productName);
    const sourceZone = entry.sourceZoneName ? zoneByName.get(entry.sourceZoneName) : null;
    const destinationZone = entry.destinationZoneName ? zoneByName.get(entry.destinationZoneName) : null;

    if (!product) {
      continue;
    }

    const quantityBefore = product.quantity;
    let quantityAfter = quantityBefore;

    if (entry.type === 'Entrée') {
      quantityAfter = quantityBefore + entry.quantityMoved;
      if (destinationZone) {
        const impact = getMovementImpact(product, destinationZone, entry.quantityMoved);
        zoneLoads.set(destinationZone.id, (zoneLoads.get(destinationZone.id) || 0) + impact);
        product.ZoneId = destinationZone.id;
      }
    }

    if (entry.type === 'Sortie') {
      quantityAfter = Math.max(0, quantityBefore - entry.quantityMoved);
      if (sourceZone) {
        const impact = getMovementImpact(product, sourceZone, entry.quantityMoved);
        zoneLoads.set(sourceZone.id, Math.max(0, (zoneLoads.get(sourceZone.id) || 0) - impact));
      }
    }

    if (entry.type === 'Transfert') {
      quantityAfter = quantityBefore;
      if (sourceZone) {
        const sourceImpact = getMovementImpact(product, sourceZone, entry.quantityMoved);
        zoneLoads.set(sourceZone.id, Math.max(0, (zoneLoads.get(sourceZone.id) || 0) - sourceImpact));
      }
      if (destinationZone) {
        const destinationImpact = getMovementImpact(product, destinationZone, entry.quantityMoved);
        zoneLoads.set(destinationZone.id, (zoneLoads.get(destinationZone.id) || 0) + destinationImpact);
        product.ZoneId = destinationZone.id;
      }
    }

    product.quantity = quantityAfter;
    await product.save();

    movementsToCreate.push({
      type: entry.type,
      ProductId: product.id,
      quantityBefore,
      quantityAfter,
      quantityMoved: entry.quantityMoved,
      sourceZoneId: sourceZone?.id || null,
      destinationZoneId: destinationZone?.id || null,
      reason: entry.reason,
      UserId: user?.id || null,
      notes: entry.notes,
      createdAt: new Date(Date.now() - entry.daysAgo * 24 * 60 * 60 * 1000),
    });
  }

  for (const zone of zones) {
    zone.capacite_actuelle = zoneLoads.get(zone.id) || 0;
    await zone.save();
  }

  await Movement.bulkCreate(movementsToCreate);
  console.log(`✓ ${movementsToCreate.length} mouvements créés`);
}

async function initializeDatabase() {
  console.log('Initialisation de la base...');
  await sequelize.sync({ alter: true });
  await seedZones();
  await seedProducts();
  await seedMovements();
  console.log('✅ Base prête');
}

module.exports = {
  initializeDatabase,
};
