const sequelize = require('./config/database');
const Product = require('./models/Product');
const Zone = require('./models/Zone');

async function seedData() {
  try {
    // Sync database
    await sequelize.sync({ alter: true });

    console.log('Initialisation des données de test...');

    // Check if zones already exist
    const existingZones = await Zone.count();
    if (existingZones === 0) {
      const zones = await Zone.bulkCreate([
        {
          name: 'Zone A',
          description: 'Zone principale de stockage',
          location: 'Entrepôt 1 - Niveau 1',
          capacite_max: 1000,
          capacite_actuelle: 0,
          type: 'Entrepôt',
          unite_capacite: 'Unités',
          capacite_type: 1000
        },
        {
          name: 'Zone B',
          description: 'Zone frigorifique',
          location: 'Entrepôt 1 - Chambre froide',
          capacite_max: 500,
          capacite_actuelle: 0,
          type: 'Frigorifique',
          unite_capacite: 'Unités',
          capacite_type: 500
        },
        {
          name: 'Zone C',
          description: 'Zone temporaire',
          location: 'Quai de déchargement',
          capacite_max: 800,
          capacite_actuelle: 0,
          type: 'Temporaire',
          unite_capacite: 'Unités',
          capacite_type: 800
        },
        {
          name: 'Zone D',
          description: 'Zone par volume',
          location: 'Entrepôt 2',
          capacite_max: 5000,
          capacite_actuelle: 0,
          type: 'Volume',
          unite_capacite: 'Volume',
          capacite_type: 5000
        },
        {
          name: 'Zone Retour',
          description: 'Zone pour les retours et dommages',
          location: 'Entrepôt 1 - Niveau 2',
          capacite_max: 300,
          capacite_actuelle: 0,
          type: 'Spéciale',
          unite_capacite: 'Unités',
          capacite_type: 300
        }
      ]);
      console.log(`✓ ${zones.length} zones créées`);
    } else {
      console.log(`✓ ${existingZones} zones existantes`);
    }

    // Check if products already exist
    const existingProducts = await Product.count();
    if (existingProducts === 0) {
      const zones = await Zone.findAll();
      const products = await Product.bulkCreate([
        {
          name: 'Riz blanc',
          category: 'Alimentaire',
          price: 1.50,
          quantity: 0,
          ZoneId: zones[0]?.id || 1,
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          volume_unitaire: 0.5
        },
        {
          name: 'Farine de blé',
          category: 'Alimentaire',
          price: 0.80,
          quantity: 0,
          ZoneId: zones[0]?.id || 1,
          expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          volume_unitaire: 0.3
        },
        {
          name: 'Lait en poudre',
          category: 'Alimentaire',
          price: 2.50,
          quantity: 0,
          ZoneId: zones[1]?.id || 2,
          expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          volume_unitaire: 0.2
        },
        {
          name: 'Savon liquide',
          category: 'Cosmetics',
          price: 3.00,
          quantity: 0,
          ZoneId: zones[0]?.id || 1,
          expirationDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
          volume_unitaire: 0.5
        },
        {
          name: 'Lampe LED',
          category: 'Electronics',
          price: 15.99,
          quantity: 0,
          ZoneId: zones[2]?.id || 3,
          expirationDate: null,
          volume_unitaire: 0.1
        }
      ]);
      console.log(`✓ ${products.length} produits créés`);
    } else {
      console.log(`✓ ${existingProducts} produits existants`);
    }

    console.log('\n✅ Données de base initialisées avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedData();
