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
    
    // Formater pour l'affichage
    const preview = {
      generatedAt: inventory.generatedAt,
      period: inventory.period,
      summary: inventory.summary,
      anomalies: inventory.anomalies.slice(0, 10),
      recommendations: inventory.recommendations,
      topAnomalies: inventory.anomalies.slice(0, 5).map(a => ({
        productName: a.productName,
        difference: a.difference,
        severity: a.severity,
        recommendation: a.recommendation
      })),
      expiredCount: inventory.expiredProducts.length,
      expiringCount: inventory.expiringSoonProducts.length
    };
    
    res.json({ success: true, data: preview });
  } catch (error) {
    console.error("Erreur getInventoryPreview:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtenir l'historique des inventaires (si vous stockez)
// À implémenter si vous voulez sauvegarder les inventaires en BDD
exports.getInventoryHistory = async (req, res) => {
  try {
    // À implémenter avec un modèle InventoryHistory
    res.json({ success: true, history: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};