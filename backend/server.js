const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

// Import des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const zoneRoutes = require('./routes/zones');
const productRoutes = require('./routes/products');

// Import des modèles
const Product = require('./models/Product');
const Zone = require('./models/Zone');
const User = require('./models/User');

// Configuration des relations
Zone.hasMany(Product, { foreignKey: 'ZoneId' });
Product.belongsTo(Zone, { foreignKey: 'ZoneId' });

// Chargement des variables d'environnement
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);      // ← AJOUTÉ : Gestion des utilisateurs
app.use('/api/zones', zoneRoutes);
app.use('/api/products', productRoutes);

// Route de test (optionnelle)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'API fonctionnelle',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route non trouvée' 
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ 
    success: false,
    error: 'Erreur interne du serveur' 
  });
});

const PORT = process.env.PORT || 5000;

// Synchronisation de la base de données
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Base de données synchronisée avec succès');
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📋 Routes disponibles:`);
      console.log(`   - POST   /api/auth/register`);
      console.log(`   - POST   /api/auth/login`);
      console.log(`   - GET    /api/users`);
      console.log(`   - POST   /api/users`);
      console.log(`   - PUT    /api/users/:id`);
      console.log(`   - DELETE /api/users/:id`);
      console.log(`   - GET    /api/zones`);
      console.log(`   - GET    /api/products`);
    });
  })
  .catch(err => {
    console.error('❌ Impossible de se connecter à la base de données:', err);
    process.exit(1);
  });