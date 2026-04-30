const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protéger les routes (vérifier le token)
exports.protect = async (req, res, next) => {
  let token;
  
  // Vérifier si le token est dans le header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Non autorisé - Token manquant' 
    });
  }
  
  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer l'utilisateur
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email', 'role']
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Utilisateur non trouvé' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur auth:', error);
    return res.status(401).json({ 
      success: false,
      error: 'Non autorisé - Token invalide' 
    });
  }
};

// Autoriser certains rôles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: `Rôle "${req.user.role}" non autorisé à accéder à cette ressource` 
      });
    }
    next();
  };
};