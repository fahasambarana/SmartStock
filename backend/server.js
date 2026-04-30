const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const zoneRoutes = require('./routes/zones');
const productRoutes = require('./routes/products');
const movementRoutes = require('./routes/movementRoutes');
const aiAlertRoutes = require('./routes/aiAlerts');
const dashboardRoutes = require('./routes/dashboardRoutes');
const chatRoutes = require('./routes/chatRoutes');

const Product = require('./models/Product');
const Zone = require('./models/Zone');
const User = require('./models/User');
// Ne pas importer Movement ici pour éviter la création automatique

// DB Relations
Zone.hasMany(Product, { foreignKey: 'ZoneId' });
Product.belongsTo(Zone, { foreignKey: 'ZoneId' });

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/products', productRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/ai-alerts', aiAlertRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5000;

// Synchronisation sans le modèle Movement
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Base de données synchronisée');
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📋 Routes disponibles:`);
      console.log(`   - POST   /api/auth/register`);
      console.log(`   - POST   /api/auth/login`);
      console.log(`   - GET    /api/users`);
      console.log(`   - GET    /api/movements`);
      console.log(`   - POST   /api/movements/in`);
      console.log(`   - POST   /api/movements/out`);
      console.log(`   - POST   /api/movements/transfer`);
    });
  })
  .catch(err => {
    console.error('❌ Erreur de connexion:', err);
  });