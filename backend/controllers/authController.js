const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    console.log('Tentative d\'inscription:', { username, email, role });
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Utiliser 'utilisateur' comme valeur par défaut (pas 'user')
    const user = await User.create({ 
      username, 
      email, 
      password: hashedPassword, 
      role: role || 'utilisateur'  // ← CORRIGÉ : correspond à l'ENUM
    });
    
    res.status(201).json({ message: 'Inscription réussie' });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    
    // Gérer les erreurs spécifiques de Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Email ou nom d\'utilisateur déjà existant' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    
    res.status(500).json({ error: 'Échec de l\'inscription. Veuillez réessayer.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    res.json({ token, role: user.role });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ error: error.message });
  }
};