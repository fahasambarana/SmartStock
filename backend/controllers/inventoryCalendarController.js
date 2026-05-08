// controllers/inventoryCalendarController.js
const autoInventoryService = require("../services/autoInventoryService");

// Lancer un inventaire automatique
exports.runInventory = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const inventory = await autoInventoryService.runAutoInventory(period);
    
    res.json({
      success: true,
      message: `Inventaire ${period} généré avec succès`,
      data: inventory
    });
  } catch (error) {
    console.error("Erreur runInventory:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtenir l'aperçu de l'inventaire (sans sauvegarde)
exports.getInventoryPreview = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const inventory = await autoInventoryService.runAutoInventory(period);
    
    // Vérifier que les propriétés existent avec des valeurs par défaut
    const expiredProductsList = inventory.expiredProducts || [];
    const expiringSoonProductsList = inventory.expiringSoonProducts || [];
    const anomaliesList = inventory.anomalies || [];
    const recommendationsList = inventory.recommendations || [];
    
    // Formater pour l'affichage
    const preview = {
      generatedAt: inventory.generatedAt || new Date(),
      period: inventory.period || period,
      summary: {
        totalProducts: inventory.summary?.totalProducts || 0,
        totalValue: inventory.summary?.totalValue || 0,
        anomaliesCount: inventory.summary?.anomaliesCount || 0,
        criticalAnomalies: inventory.summary?.criticalAnomalies || 0,
        accuracyRate: inventory.summary?.accuracyRate || 100,
        healthScore: inventory.summary?.healthScore || 100,
        expiringProducts: inventory.summary?.expiringProducts || 0,
        expiredProducts: inventory.summary?.expiredProducts || 0
      },
      anomalies: anomaliesList.slice(0, 10),
      recommendations: recommendationsList,
      topAnomalies: anomaliesList.slice(0, 5).map(a => ({
        productName: a.productName,
        difference: a.difference,
        severity: a.severity,
        recommendation: a.recommendation
      })),
      expiredCount: expiredProductsList.length,
      expiringCount: expiringSoonProductsList.length
    };
    
    res.json({ success: true, data: preview });
  } catch (error) {
    console.error("Erreur getInventoryPreview:", error);
    // Afficher plus de détails sur l'erreur
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Obtenir l'historique des inventaires
exports.getInventoryHistory = async (req, res) => {
  try {
    res.json({ success: true, history: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};