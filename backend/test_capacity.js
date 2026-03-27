const dotenv = require('dotenv');
dotenv.config();
const Product = require('./models/Product');
const Zone = require('./models/Zone');
const sequelize = require('./config/database');

// DB Relations
Zone.hasMany(Product, { foreignKey: 'ZoneId' });
Product.belongsTo(Zone, { foreignKey: 'ZoneId' });

async function runTest() {
  try {
    await sequelize.sync();

    // 1. Create a zone with limited capacity (Units)
    const zoneUnits = await Zone.create({
      name: 'Test Zone Units',
      unite_capacite: 'Unités',
      capacite_max: 10,
      capacite_actuelle: 0
    });
    console.log('Created Zone Units:', zoneUnits.name);

    // 2. Add product within capacity
    const p1 = await Product.create({
      name: 'Product 1',
      quantity: 4,
      ZoneId: zoneUnits.id,
      price: 10,
      category: 'Other'
    });
    zoneUnits.capacite_actuelle += 4;
    await zoneUnits.save();
    console.log('Added p1, current capacity:', zoneUnits.capacite_actuelle);

    // 3. Try to add product exceeding capacity (simulating controller logic)
    const incomingQty = 7;
    if (zoneUnits.capacite_actuelle + incomingQty > zoneUnits.capacite_max) {
      console.log('Validation SUCCESS: Capacity exceeded as expected');
    } else {
      console.log('Validation FAILURE: Capacity NOT exceeded but should have been');
    }

    // 4. Create a zone with volume capacity
    const zoneVolume = await Zone.create({
      name: 'Test Zone Volume',
      unite_capacite: 'Volume',
      capacite_max: 100,
      capacite_actuelle: 0
    });
    console.log('Created Zone Volume:', zoneVolume.name);

    // 5. Add product with volume
    const volUnitaire = 10;
    const qty = 5;
    const impact = volUnitaire * qty; // 50
    if (zoneVolume.capacite_actuelle + impact <= zoneVolume.capacite_max) {
      const p2 = await Product.create({
        name: 'Product 2',
        quantity: qty,
        volume_unitaire: volUnitaire,
        ZoneId: zoneVolume.id,
        price: 20,
        category: 'Other'
      });
      zoneVolume.capacite_actuelle += impact;
      await zoneVolume.save();
      console.log('Added p2, current capacity:', zoneVolume.capacite_actuelle);
    }

    // Cleanup
    await Product.destroy({ where: { ZoneId: [zoneUnits.id, zoneVolume.id] } });
    await Zone.destroy({ where: { id: [zoneUnits.id, zoneVolume.id] } });
    console.log('Test completed and cleaned up.');

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    process.exit();
  }
}

runTest();
