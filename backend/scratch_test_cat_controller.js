const { getAllCategories } = require('./controllers/categoryController');

async function test() {
  const req = {};
  const res = {
    json: (data) => console.log('JSON:', JSON.stringify(data, null, 2)),
    status: (code) => {
      console.log('STATUS:', code);
      return res;
    }
  };
  
  try {
    await getAllCategories(req, res);
  } catch (err) {
    console.error('CATCH:', err);
  } finally {
    process.exit();
  }
}

test();
