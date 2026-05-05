// server.js - Version corrigée
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
const reportRoutes = require('./routes/reportRoutes');
const inventoryCalendarRoutes = require('./routes/inventoryCalendarRoutes');

const Product = require('./models/Product');
const Zone = require('./models/Zone');
const User = require('./models/User');

// DB Relations
Zone.hasMany(Product, { foreignKey: 'ZoneId' });
Product.belongsTo(Zone, { foreignKey: 'ZoneId' });

dotenv.config();

const app = express();

// ✅ CONFIGURATION CORS COMPLÈTE
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Disposition']
}));

// ✅ Support explicite pour OPTIONS preflight
app.options('*', cors());

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
app.use('/api/reports', reportRoutes);
app.use('/api/inventory-calendar', inventoryCalendarRoutes);

// ✅ Route de test CORS
app.get('/api/test-cors', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

const PORT = process.env.PORT || 5000;

// Synchronisation
sequelize.sync()
  .then(() => {
    console.log('✅ Base de données synchronisée');
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📋 Routes disponibles:`);
      console.log(`   - POST   /api/auth/register`);
      console.log(`   - POST   /api/auth/login`);
      console.log(`   - GET    /api/users`);
      console.log(`   - GET    /api/movements`);
      console.log(`   - GET    /api/reports/inventory/pdf`);
    });
  })
  .catch(err => {
    console.error('❌ Erreur de connexion:', err);
  });