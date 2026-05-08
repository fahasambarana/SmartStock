const { getAllProducts } = require('./controllers/productController');
const { User } = require('./models/associations');

async function test() {
  const req = {
    query: {},
    user: { id: 1, role: 'admin' }
  };
  const res = {
    json: (data) => console.log('JSON:', JSON.stringify(data, null, 2)),
    status: (code) => {
      console.log('STATUS:', code);
      return res;
    }
  };
  
  try {
    await getAllProducts(req, res);
  } catch (err) {
    console.error('CATCH:', err);
  } finally {
    process.exit();
  }
}

test();
