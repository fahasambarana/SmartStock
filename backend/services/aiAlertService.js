// services/aiAlertService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Product, Zone, Movement } = require("../models/associations");
const { Sequelize } = require("sequelize");

class AIAlertService {
  constructor() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // ✅ CORRECTION : Utiliser "gemini-pro"
  this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
}

  /**
   * Teste la connexion API et liste les modèles disponibles
   */
  async testConnection() {
    try {
      const result = await this.model.generateContent("Test connection");
      console.log("✅ Connexion API Gemini réussie");
      return { success: true };
    } catch (error) {
      console.error("❌ Erreur connexion API:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyse un produit avec fallback intelligent
   */
  async analyzeProductRisk(product, dailySales = null) {
    try {
      // Calcul des ventes moyennes
      let avgDailySales = dailySales;
      if (!avgDailySales) {
        const movements = await Movement.findAll({
          where: {
            productId: product.id,
            type: 'out',
            movementDate: {
              [Sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        });
        const totalOut = movements.reduce((sum, m) => sum + m.quantity, 0);
        avgDailySales = totalOut / 30;
      }

      // Calcul simple des jours restants
      const daysLeft = product.quantity / Math.max(avgDailySales, 0.1);
      
      // Détermination du seuil d'alerte
      let riskScore = 0;
      let alertLevel = "low";
      let recommendation = "";
      let priority = 4;

      if (product.quantity <= 5) {
        riskScore = 95;
        alertLevel = "critical";
        recommendation = "STOCK CRITIQUE ! Réapprovisionnement immédiat requis.";
        priority = 1;
      } else if (product.quantity <= 10) {
        riskScore = 80;
        alertLevel = "high";
        recommendation = "Stock très bas. Planifier réapprovisionnement sous 2 jours.";
        priority = 2;
      } else if (product.quantity <= 20) {
        riskScore = 60;
        alertLevel = "medium";
        recommendation = "Stock modéré. Surveiller les ventes cette semaine.";
        priority = 3;
      } else if (daysLeft < 7) {
        riskScore = 70;
        alertLevel = "high";
        recommendation = `Stock pour ${Math.floor(daysLeft)} jours seulement. Réapprovisionner bientôt.`;
        priority = 2;
      } else if (daysLeft < 14) {
        riskScore = 45;
        alertLevel = "medium";
        recommendation = `Stock pour ${Math.floor(daysLeft)} jours. Planifier réapprovisionnement.`;
        priority = 3;
      } else {
        riskScore = 20;
        alertLevel = "low";
        recommendation = "Stock confortable. Vérification périodique suffit.";
        priority = 5;
      }

      // Vérification date d'expiration pour produits alimentaires
      let daysUntilExpiry = null;
      if (product.category === "Food" && product.expirationDate) {
        const expiryDate = new Date(product.expirationDate);
        const today = new Date();
        daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
          riskScore = Math.max(riskScore, 90);
          alertLevel = "critical";
          recommendation = `⚠️ PRODUIT PÉRISSABLE : Expire dans ${daysUntilExpiry} jours !`;
          priority = 1;
        } else if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          riskScore = Math.max(riskScore, 75);
          alertLevel = "high";
          recommendation = `Attention : Expire dans ${daysUntilExpiry} jours. Rotation prioritaire.`;
          priority = 2;
        } else if (daysUntilExpiry < 0) {
          riskScore = 100;
          alertLevel = "critical";
          recommendation = "❌ PRODUIT EXPIRÉ ! Retirer immédiatement du stock.";
          priority = 1;
        }
      }

      return {
        riskScore,
        alertLevel,
        recommendation,
        priority,
        productId: product.id,
        productName: product.name,
        currentStock: product.quantity,
        dailySales: avgDailySales,
        estimatedDaysLeft: daysLeft,
        daysUntilExpiry
      };
      
    } catch (error) {
      console.error("Erreur analyse IA:", error);
      // Fallback ultra-simple
      return this.getFallbackAnalysis(product);
    }
  }

  /**
   * Analyse IA avec appel réel (optionnel - à utiliser si préféré)
   */
  async analyzeWithRealAI(product, avgDailySales) {
    const prompt = `
      Analyse ce produit pour la gestion de stock. Réponds UNIQUEMENT en JSON valide SANS markdown.

      PRODUIT:
      - Nom: ${product.name}
      - Catégorie: ${product.category}
      - Stock: ${product.quantity}
      - Ventes/jour: ${avgDailySales.toFixed(1)}
      - Expiration: ${product.expirationDate || 'N/A'}

      Réponds EXACTEMENT ce format JSON (sans autres caractères):
      {"riskScore": 85, "alertLevel": "high", "recommendation": "Action", "priority": 2}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Nettoyage plus robuste
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const analysis = JSON.parse(text);
      
      return {
        riskScore: analysis.riskScore || 50,
        alertLevel: analysis.alertLevel || "medium",
        recommendation: analysis.recommendation || "Vérifier le stock",
        priority: analysis.priority || 3
      };
    } catch (error) {
      console.log("Fallback à l'analyse locale");
      return null;
    }
  }

  getFallbackAnalysis(product) {
    const daysLeft = product.quantity / 10; // Estimation simple
    return {
      riskScore: daysLeft < 3 ? 90 : daysLeft < 7 ? 60 : 30,
      alertLevel: daysLeft < 3 ? "critical" : daysLeft < 7 ? "high" : "low",
      recommendation: daysLeft < 3 ? "RÉAPPROVISIONNEMENT URGENT" : "Stock suffisant, suivi normal",
      priority: daysLeft < 3 ? 1 : daysLeft < 7 ? 2 : 4,
      productId: product.id,
      productName: product.name,
      currentStock: product.quantity,
      dailySales: 10,
      estimatedDaysLeft: daysLeft,
      daysUntilExpiry: null
    };
  }

  async analyzeZoneCapacity(zone) {
    const capacityPercent = (zone.capacite_actuelle / zone.capacite_max) * 100;
    
    if (capacityPercent > 90) {
      return { alertLevel: "critical", recommendation: "Zone presque saturée. Expansion ou réorganisation nécessaire immédiatement." };
    } else if (capacityPercent > 75) {
      return { alertLevel: "warning", recommendation: `Attention: ${capacityPercent.toFixed(1)}% de capacité utilisée. Optimiser l'espace.` };
    } else if (capacityPercent > 60) {
      return { alertLevel: "info", recommendation: `Capacité: ${capacityPercent.toFixed(1)}% - Surveillance normale.` };
    }
    return { alertLevel: "ok", recommendation: "Capacité suffisante." };
  }

  async detectAnomalies(zoneId = null) {
    const whereClause = {};
    if (zoneId) whereClause.sourceZoneId = zoneId;
    
    const movements = await Movement.findAll({
      where: whereClause,
      limit: 50,
      order: [['movementDate', 'DESC']]
    });
    
    const anomalies = [];
    
    for (const movement of movements) {
      // Détection simple d'anomalies sans API
      let isAnomaly = false;
      let reason = "";
      
      if (movement.quantity > 1000) {
        isAnomaly = true;
        reason = "Quantité anormalement élevée";
      } else if (movement.type === 'out' && movement.quantity > 500) {
        isAnomaly = true;
        reason = "Sortie massive détectée";
      } else if (!movement.reason && movement.quantity > 100) {
        isAnomaly = true;
        reason = "Mouvement important sans raison spécifiée";
      }
      
      if (isAnomaly) {
        anomalies.push({
          movementId: movement.id,
          productName: movement.productName,
          quantity: movement.quantity,
          type: movement.type,
          date: movement.movementDate,
          anomalyReason: reason
        });
      }
    }
    
    return anomalies;
  }
}

module.exports = new AIAlertService();