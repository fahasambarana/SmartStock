// controllers/chatController.js
const chatAIService = require("../services/chatAIService");

// Envoyer un message au chat IA
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id;
    const userName = req.user?.username;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: "Veuillez entrer un message" 
      });
    }
    
    const response = await chatAIService.askQuestion(message, userId, userName);
    
    res.json({
      success: true,
      response: response.response,
      source: response.source
    });
    
  } catch (error) {
    console.error("Erreur sendMessage:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erreur lors du traitement de votre message" 
    });
  }
};

// Obtenir l'historique des conversations (si implémenté)
exports.getHistory = async (req, res) => {
  try {
    // Implémenter si vous logguez les conversations
    res.json({ 
      success: true, 
      history: [] 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Suggestions rapides
exports.getSuggestions = async (req, res) => {
  const suggestions = [
    "Quels sont les produits en stock bas ?",
    "Montre-moi les dernières entrées",
    "Quelles zones sont saturées ?",
    "Aide-moi à comprendre le stock",
    "Produits qui expirent bientôt"
  ];
  
  res.json({ success: true, suggestions });
};