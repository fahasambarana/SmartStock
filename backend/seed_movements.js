const sequelize = require('./config/database');
const Product = require('./models/Product');
const Zone = require('./models/Zone');
const User = require('./models/User');
const Movement = require('./models/Movement');

async function seedMovements() {
  try {
    // Sync database
    await sequelize.sync({ alter: true });

    console.log('Initialisation des mouvements de stock...');

    // Find existing products and zones
    const products = await Product.findAll({ limit: 5 });
    const zones = await Zone.findAll({ limit: 5 });
    const user = await User.findOne();

    if (products.length === 0) {
      console.log('Aucun produit existant. Veuillez créer des produits d\'abord.');
      process.exit(0);
    }

    if (zones.length === 0) {
      console.log('Aucune zone existante. Veuillez créer des zones d\'abord.');
      process.exit(0);
    }

    // Check if movements already exist
    const existingMovements = await Movement.count();
    if (existingMovements > 0) {
      console.log(`${existingMovements} mouvements existent déjà. Arret.`);
      process.exit(0);
    }

    // Create sample movements with historical data
    const sampleMovements = [
      // Entrées de stock
      {
        type: 'Entrée',
        ProductId: products[0].id,
        quantityBefore: 0,
        quantityAfter: 100,
        quantityMoved: 100,
        sourceZoneId: null,
        destinationZoneId: zones[0].id,
        reason: 'Approvisionnement initial',
        UserId: user?.id || null,
        notes: 'Stock initial reçu du fournisseur',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      {
        type: 'Entrée',
        ProductId: products[1].id,
        quantityBefore: 0,
        quantityAfter: 50,
        quantityMoved: 50,
        sourceZoneId: null,
        destinationZoneId: zones[1].id,
        reason: 'Reapprovisionnnement',
        UserId: user?.id || null,
        notes: 'Nouvel achat',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) // 25 days ago
      },
      // Sortie de stock
      {
        type: 'Sortie',
        ProductId: products[0].id,
        quantityBefore: 100,
        quantityAfter: 80,
        quantityMoved: 20,
        sourceZoneId: zones[0].id,
        destinationZoneId: null,
        reason: 'Vente',
        UserId: user?.id || null,
        notes: 'Vente client #001',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'Sortie',
        ProductId: products[1].id,
        quantityBefore: 50,
        quantityAfter: 45,
        quantityMoved: 5,
        sourceZoneId: zones[1].id,
        destinationZoneId: null,
        reason: 'Échantillon',
        UserId: user?.id || null,
        notes: 'Échantillon gratuit pour client potentiel',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      // Transfert
      {
        type: 'Transfert',
        ProductId: products[0].id,
        quantityBefore: 80,
        quantityAfter: 80,
        quantityMoved: 30,
        sourceZoneId: zones[0].id,
        destinationZoneId: zones[1].id,
        reason: 'Réorganisation stock',
        UserId: user?.id || null,
        notes: 'Transfert pour équilibrer les charges',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'Transfert',
        ProductId: products[2]?.id || products[0].id,
        quantityBefore: products[2]?.quantity || 80,
        quantityAfter: products[2]?.quantity || 80,
        quantityMoved: 15,
        sourceZoneId: zones[1].id,
        destinationZoneId: zones[0].id,
        reason: 'Retour stock',
        UserId: user?.id || null,
        notes: 'Retour après inventaire',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      // Entrée récente
      {
        type: 'Entrée',
        ProductId: products[2]?.id || products[1].id,
        quantityBefore: products[2]?.quantity || 45,
        quantityAfter: (products[2]?.quantity || 45) + 30,
        quantityMoved: 30,
        sourceZoneId: null,
        destinationZoneId: zones[2]?.id || zones[0].id,
        reason: 'Reapprovisionnnement',
        UserId: user?.id || null,
        notes: 'Arrivée fournisseur',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    // Create movements
    const createdMovements = await Movement.bulkCreate(sampleMovements);
    console.log(`✓ ${createdMovements.length} mouvements de stock créés avec succès!`);

    // Display summary
    console.log('\nRésumé des mouvements créés:');
    console.log(`  - Entrées: ${sampleMovements.filter(m => m.type === 'Entrée').length}`);
    console.log(`  - Sorties: ${sampleMovements.filter(m => m.type === 'Sortie').length}`);
    console.log(`  - Transferts: ${sampleMovements.filter(m => m.type === 'Transfert').length}`);

  } catch (error) {
    console.error('Erreur lors de la création des mouvements:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedMovements();
