const { Category, Product } = require('./models/associations');

async function test() {
  try {
    const categories = await Category.findAll({
      include: [{ 
        model: Product,
        where: { UserId: null },
        required: false
      }]
    });
    console.log('Success:', categories.length);
    if (categories.length > 0) {
      console.log('Products in first category:', categories[0].Products?.length);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

test();
