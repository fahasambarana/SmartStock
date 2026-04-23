const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Erreur getAllUsers:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération des utilisateurs' 
    });
  }
};

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt']
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Utilisateur non trouvé' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur getUserById:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération de l\'utilisateur' 
    });
  }
};

// Créer un nouvel utilisateur
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Validation des champs requis
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Veuillez fournir tous les champs requis (username, email, password)' 
      });
    }
    
    // Vérifier si l'email existe déjà
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false,
        error: 'Cet email est déjà utilisé' 
      });
    }
    
    // Vérifier si le nom d'utilisateur existe déjà
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ 
        success: false,
        error: 'Ce nom d\'utilisateur est déjà pris' 
      });
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'utilisateur'
    });
    
    // Retourner l'utilisateur sans le mot de passe
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Erreur createUser:', error);
    
    // Gérer les erreurs de validation Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        success: false,
        error: error.errors.map(e => e.message).join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la création de l\'utilisateur' 
    });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Utilisateur non trouvé' 
      });
    }
    
    // Vérifier si le nouvel email n'est pas déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ 
          success: false,
          error: 'Cet email est déjà utilisé par un autre compte' 
        });
      }
    }
    
    // Vérifier si le nouveau nom d'utilisateur n'est pas déjà pris
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({ 
          success: false,
          error: 'Ce nom d\'utilisateur est déjà pris' 
        });
      }
    }
    
    // Mettre à jour les champs
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Erreur updateUser:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la mise à jour de l\'utilisateur' 
    });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Utilisateur non trouvé' 
      });
    }
    
    // Empêcher la suppression du dernier administrateur (optionnel mais recommandé)
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (user.role === 'admin' && adminCount === 1) {
      return res.status(400).json({ 
        success: false,
        error: 'Impossible de supprimer le dernier administrateur' 
      });
    }
    
    await user.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la suppression de l\'utilisateur' 
    });
  }
};