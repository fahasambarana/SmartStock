// controllers/aiAlertController.js
const aiAlertService = require("../services/aiAlertService");
const { Product, Zone, Movement } = require("../models/associations");
const { Sequelize } = require("sequelize");

// Obtenir toutes les alertes IA pour les produits
exports.getProductAlerts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Zone, attributes: ['name'] }]
    });
    
    const alerts = [];
    const LOW_STOCK_THRESHOLD = 10; // Seuil de base
    
    for (const product of products) {
      let needsAlert = false;
      let alertReason = "";
      
      // 1. Vérification simple de stock bas
      if (product.quantity <= LOW_STOCK_THRESHOLD) {
        needsAlert = true;
        alertReason = `Stock très bas (${product.quantity} unités restantes)`;
      }
      
      // 2. Vérification de la date d'expiration (produits alimentaires)
      if (product.category === "Food" && product.expirationDate) {
        const daysUntilExpiry = Math.ceil(
          (new Date(product.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          needsAlert = true;
          alertReason = `Expire dans ${daysUntilExpiry} jours`;
        } else if (daysUntilExpiry <= 0) {
          needsAlert = true;
          alertReason = `PRODUIT EXPIRÉ !`;
        }
      }
      
      // 3. Analyse IA avancée si besoin
      if (needsAlert) {
        const aiAnalysis = await aiAlertService.analyzeProductRisk(product);
        alerts.push({
          productId: product.id,
          productName: product.name,
          currentStock: product.quantity,
          riskScore: aiAnalysis.riskScore,
          alertLevel: aiAnalysis.alertLevel,
          recommendation: aiAnalysis.recommendation,
          priority: aiAnalysis.priority,
          reason: alertReason,
          estimatedDaysLeft: aiAnalysis.estimatedDaysLeft,
          zone: product.Zone?.name || "Non assigné"
        });
      }
    }
    
    // Trier par priorité (1 = plus urgent)
    alerts.sort((a, b) => (a.priority || 5) - (b.priority || 5));
    
    res.json({
      success: true,
      total: alerts.length,
      alerts
    });
  } catch (error) {
    console.error("Erreur getProductAlerts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtenir les alertes de capacité des zones
exports.getZoneAlerts = async (req, res) => {
  try {
    const zones = await Zone.findAll();
    const alerts = [];
    
    for (const zone of zones) {
      const capacityPercent = (zone.capacite_actuelle / zone.capacite_max) * 100;
      
      if (capacityPercent > 80) {
        const aiAnalysis = await aiAlertService.analyzeZoneCapacity(zone);
        alerts.push({
          zoneId: zone.id,
          zoneName: zone.name,
          capacityUsed: zone.capacite_actuelle,
          capacityMax: zone.capacite_max,
          capacityPercent: capacityPercent.toFixed(1),
          alertLevel: aiAnalysis.alertLevel,
          recommendation: aiAnalysis.recommendation
        });
      }
    }
    
    res.json({ success: true, alerts });
  } catch (error) {
    console.error("Erreur getZoneAlerts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Vérifier les anomalies dans les mouvements
exports.getAnomalies = async (req, res) => {
  try {
    const anomalies = await aiAlertService.detectAnomalies(req.query.zoneId);
    res.json({ success: true, anomalies });
  } catch (error) {
    console.error("Erreur getAnomalies:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Dashboard complet des alertes IA
exports.getDashboardAlerts = async (req, res) => {
  try {
    const [productAlerts, zoneAlerts, anomalies] = await Promise.all([
      (async () => {
        const products = await Product.findAll();
        const alerts = [];
        for (const product of products) {
          if (product.quantity <= 15 || 
              (product.expirationDate && new Date(product.expirationDate) - new Date() < 7 * 24 * 60 * 60 * 1000)) {
            const analysis = await aiAlertService.analyzeProductRisk(product);
            alerts.push(analysis);
          }
        }
        return alerts;
      })(),
      (async () => {
        const zones = await Zone.findAll();
        const alerts = [];
        for (const zone of zones) {
          if ((zone.capacite_actuelle / zone.capacite_max) > 0.8) {
            alerts.push(await aiAlertService.analyzeZoneCapacity(zone));
          }
        }
        return alerts;
      })(),
      aiAlertService.detectAnomalies()
    ]);
    
    res.json({
      success: true,
      summary: {
        totalAlerts: productAlerts.length + zoneAlerts.length,
        criticalAlerts: productAlerts.filter(a => a.alertLevel === "critical").length,
        anomaliesFound: anomalies.length
      },
      productAlerts: productAlerts.slice(0, 10),
      zoneAlerts,
      anomalies: anomalies.slice(0, 5)
    });
  } catch (error) {
    console.error("Erreur getDashboardAlerts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};