// services/aiAlertService.js - Version avec IA pour jours estimés
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Product, Zone, Movement } = require("../models/associations");
const { Sequelize } = require("sequelize");

class AIAlertService {
  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Utiliser gemini-pro qui est stable
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  /**
   * Calcule les jours estimés avec plusieurs méthodes
   */
  async calculateEstimatedDays(product, historicalSales) {
    // Méthode 1: Calcul simple (fallback)
    const simpleDaysLeft = product.quantity / Math.max(historicalSales.avgDaily, 0.1);
    
    // Méthode 2: Calcul avec tendance (moyenne pondérée)
    let weightedDaysLeft = simpleDaysLeft;
    if (historicalSales.last7Days > 0) {
      // Les 7 derniers jours ont plus de poids
      const recentRate = historicalSales.last7Days / 7;
      weightedDaysLeft = product.quantity / Math.max(recentRate, 0.1);
    }
    
    // Méthode 3: Utiliser l'IA pour une prévision intelligente
    try {
      const aiPrediction = await this.getAIPrediction(product, historicalSales);
      return {
        simple: Math.floor(simpleDaysLeft),
        weighted: Math.floor(weightedDaysLeft),
        ai: aiPrediction.daysLeft,
        confidence: aiPrediction.confidence,
        recommendation: aiPrediction.recommendation
      };
    } catch (error) {
      console.log("IA non disponible, utilisation calcul standard");
      return {
        simple: Math.floor(simpleDaysLeft),
        weighted: Math.floor(weightedDaysLeft),
        ai: null,
        confidence: 'medium',
        recommendation: this.getBasicRecommendation(product, simpleDaysLeft)
      };
    }
  }

  /**
   * Prédiction IA avancée
   */
  async getAIPrediction(product, historicalSales) {
    const prompt = `
      Prédiction de stock pour produit:
      
      PRODUIT: ${product.name}
      CATÉGORIE: ${product.category}
      STOCK ACTUEL: ${product.quantity}
      
      HISTORIQUE VENTES (30 jours):
      - Moyenne journalière: ${historicalSales.avgDaily.toFixed(1)}
      - Total 30 jours: ${historicalSales.total30Days}
      - Total 7 derniers jours: ${historicalSales.last7Days}
      
      FACTEURS:
      - Saisonnalité: ${this.getSeasonality()}
      - Tendance: ${historicalSales.trend}
      
      Calcule:
      1. daysLeft: nombre de jours avant rupture (entier)
      2. confidence: "high", "medium", "low"
      3. recommendation: action recommandée
      
      Réponds UNIQUEMENT en JSON:
      {"daysLeft": 15, "confidence": "high", "recommendation": "Stock suffisant pour 2 semaines"}
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(text);
  }

  getSeasonality() {
    const month = new Date().getMonth();
    if (month >= 10 || month <= 1) return "Période de fêtes - Demande élevée";
    if (month >= 5 && month <= 7) return "Été - Demande variable";
    return "Période normale";
  }

  getBasicRecommendation(product, daysLeft) {
    if (daysLeft <= 3) return "⚠️ URGENT: Réapprovisionner immédiatement";
    if (daysLeft <= 7) return "🔔 Planifier réapprovisionnement cette semaine";
    if (daysLeft <= 14) return "📊 Surveiller la consommation";
    return "✅ Stock confortable, contrôle périodique suffit";
  }

  /**
   * Analyse complète du produit avec calcul intelligent des jours
   */
  async analyzeProductRisk(product, dailySales = null) {
    try {
      // Récupérer l'historique des ventes
      const historicalSales = await this.getHistoricalSales(product.id);
      
      // Calculer les jours estimés
      const estimatedDays = await this.calculateEstimatedDays(product, historicalSales);
      
      // Déterminer le risque
      let riskScore = 0;
      let alertLevel = "low";
      let priority = 4;
      
      // Utiliser le meilleur estimé (IA si disponible, sinon weighted)
      const bestEstimate = estimatedDays.ai || estimatedDays.weighted;
      
      // Logique de risque basée sur les jours estimés
      if (bestEstimate <= 2) {
        riskScore = 95;
        alertLevel = "critical";
        priority = 1;
      } else if (bestEstimate <= 5) {
        riskScore = 85;
        alertLevel = "critical";
        priority = 1;
      } else if (bestEstimate <= 7) {
        riskScore = 75;
        alertLevel = "high";
        priority = 2;
      } else if (bestEstimate <= 14) {
        riskScore = 60;
        alertLevel = "medium";
        priority = 3;
      } else if (bestEstimate <= 30) {
        riskScore = 40;
        alertLevel = "low";
        priority = 4;
      } else {
        riskScore = 20;
        alertLevel = "low";
        priority = 5;
      }
      
      // Ajustement pour stock physique
      if (product.quantity <= 5) {
        riskScore = Math.max(riskScore, 95);
        alertLevel = "critical";
        priority = 1;
      } else if (product.quantity <= 10) {
        riskScore = Math.max(riskScore, 80);
        if (alertLevel !== "critical") alertLevel = "high";
        priority = Math.min(priority, 2);
      }
      
      // Ajustement pour produits périssables
      let daysUntilExpiry = null;
      if (product.category === "Food" && product.expirationDate) {
        const expiryDate = new Date(product.expirationDate);
        const today = new Date();
        daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
          riskScore = Math.max(riskScore, 90);
          alertLevel = "critical";
          priority = 1;
        } else if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          riskScore = Math.max(riskScore, 75);
          if (alertLevel !== "critical") alertLevel = "high";
          priority = Math.min(priority, 2);
        }
      }
      
      // Générer la recommandation finale
      let recommendation = estimatedDays.recommendation || this.getDetailedRecommendation(
        product, bestEstimate, daysUntilExpiry, riskScore
      );
      
      return {
        riskScore,
        alertLevel,
        recommendation,
        priority,
        productId: product.id,
        productName: product.name,
        currentStock: product.quantity,
        estimatedDaysLeft: bestEstimate,
        estimatedDaysSimple: estimatedDays.simple,
        estimatedDaysWeighted: estimatedDays.weighted,
        estimatedDaysAI: estimatedDays.ai,
        confidence: estimatedDays.confidence,
        dailySales: historicalSales.avgDaily,
        daysUntilExpiry
      };
      
    } catch (error) {
      console.error("Erreur analyse IA:", error);
      return this.getFallbackAnalysis(product);
    }
  }

  /**
   * Récupère l'historique des ventes pour un produit
   */
  async getHistoricalSales(productId) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const movements = await Movement.findAll({
        where: {
          productId: productId,
          type: 'out',
          movementDate: {
            [Sequelize.Op.gte]: thirtyDaysAgo
          }
        },
        attributes: ['quantity', 'movementDate']
      });
      
      let total30Days = 0;
      let total7Days = 0;
      
      movements.forEach(m => {
        total30Days += m.quantity;
        if (new Date(m.movementDate) >= sevenDaysAgo) {
          total7Days += m.quantity;
        }
      });
      
      const avgDaily = total30Days / 30;
      const avgLast7Days = total7Days / 7;
      
      // Calculer la tendance
      let trend = 'stable';
      if (avgLast7Days > avgDaily * 1.2) trend = 'up';
      else if (avgLast7Days < avgDaily * 0.8) trend = 'down';
      
      return {
        total30Days,
        total7Days,
        avgDaily,
        avgLast7Days,
        trend
      };
    } catch (error) {
      return {
        total30Days: 0,
        total7Days: 0,
        avgDaily: 0.1,
        avgLast7Days: 0.1,
        trend: 'stable'
      };
    }
  }

  /**
   * Recommandation détaillée
   */
  getDetailedRecommendation(product, daysLeft, daysUntilExpiry, riskScore) {
    if (daysUntilExpiry && daysUntilExpiry <= 3) {
      return `⚠️ ACTION URGENTE ! ${product.name} expire dans ${daysUntilExpiry} jours. Rotation prioritaire ou promotion immédiate.`;
    }
    
    if (daysUntilExpiry && daysUntilExpiry <= 7) {
      return `📅 ${product.name} expire dans ${daysUntilExpiry} jours. Placer en tête de gondole et proposer une réduction.`;
    }
    
    if (daysLeft <= 3) {
      return `🚨 RUPTURE IMMINENTE ! Commander ${Math.ceil(product.quantity * 2)} unités en express.`;
    }
    
    if (daysLeft <= 7) {
      return `📦 Stock critique. Commander ${Math.ceil(product.quantity * 1.5)} unités pour tenir 2 semaines.`;
    }
    
    if (daysLeft <= 14) {
      return `📊 Stock modéré. Programmer réapprovisionnement dans ${Math.floor(daysLeft - 7)} jours.`;
    }
    
    if (daysLeft <= 30) {
      return `✅ Stock confortable. Prochain contrôle dans 15 jours.`;
    }
    
    return `📈 Stock excédentaire. Envisager une promotion pour fluidifier la rotation.`;
  }

  getFallbackAnalysis(product) {
    const daysLeft = product.quantity / Math.max(10, 0.1);
    return {
      riskScore: daysLeft < 3 ? 90 : daysLeft < 7 ? 60 : 30,
      alertLevel: daysLeft < 3 ? "critical" : daysLeft < 7 ? "high" : "low",
      recommendation: daysLeft < 3 ? "RÉAPPROVISIONNEMENT URGENT" : "Stock suffisant, suivi normal",
      priority: daysLeft < 3 ? 1 : daysLeft < 7 ? 2 : 4,
      productId: product.id,
      productName: product.name,
      currentStock: product.quantity,
      estimatedDaysLeft: Math.floor(daysLeft),
      estimatedDaysSimple: Math.floor(daysLeft),
      estimatedDaysWeighted: Math.floor(daysLeft),
      estimatedDaysAI: null,
      confidence: 'low',
      dailySales: 10,
      daysUntilExpiry: null
    };
  }

  async analyzeZoneCapacity(zone) {
    const capacityPercent = (zone.capacite_actuelle / zone.capacite_max) * 100;
    
    if (capacityPercent > 90) {
      return { 
        alertLevel: "critical", 
        recommendation: "🚨 Zone saturée ! Expansion immédiate nécessaire.",
        capacityPercent: capacityPercent.toFixed(1)
      };
    } else if (capacityPercent > 75) {
      return { 
        alertLevel: "warning", 
        recommendation: `⚠️ ${zone.name} à ${capacityPercent.toFixed(1)}% - Optimiser l'espace.`,
        capacityPercent: capacityPercent.toFixed(1)
      };
    } else if (capacityPercent > 60) {
      return { 
        alertLevel: "info", 
        recommendation: `ℹ️ ${zone.name}: ${capacityPercent.toFixed(1)}% - Surveillance normale.`,
        capacityPercent: capacityPercent.toFixed(1)
      };
    }
    return { 
      alertLevel: "ok", 
      recommendation: "✅ Capacité suffisante.",
      capacityPercent: capacityPercent.toFixed(1)
    };
  }

  async detectAnomalies(zoneId = null) {
    const whereClause = {};
    if (zoneId) whereClause.sourceZoneId = zoneId;
    
    const movements = await Movement.findAll({
      where: whereClause,
      limit: 100,
      order: [['movementDate', 'DESC']]
    });
    
    const anomalies = [];
    
    for (const movement of movements) {
      let isAnomaly = false;
      let reason = "";
      
      // Détection d'anomalies basée sur des seuils intelligents
      if (movement.quantity > 500) {
        isAnomaly = true;
        reason = `📊 Quantité anormalement élevée (${movement.quantity} unités)`;
      } else if (movement.type === 'out' && movement.quantity > 200) {
        isAnomaly = true;
        reason = `📤 Sortie massive (${movement.quantity} unités) - Vérifier la commande`;
      } else if (movement.type === 'in' && movement.quantity > 300) {
        isAnomaly = true;
        reason = `📥 Entrée massive (${movement.quantity} unités) - Vérifier la réception`;
      } else if (!movement.reason && movement.quantity > 50) {
        isAnomaly = true;
        reason = `❓ Mouvement important (${movement.quantity} unités) sans motif spécifié`;
      }
      
      if (isAnomaly) {
        anomalies.push({
          movementId: movement.id,
          productName: movement.productName,
          quantity: movement.quantity,
          type: movement.type,
          date: movement.movementDate,
          anomalyReason: reason,
          action: this.getAnomalyAction(movement.type, movement.quantity)
        });
      }
    }
    
    return anomalies;
  }

  getAnomalyAction(type, quantity) {
    if (type === 'out') {
      return `🔍 Vérifier la commande de ${quantity} unités et ajuster le stock si nécessaire`;
    }
    return `✅ Confirmer la réception de ${quantity} unités et mettre à jour l'inventaire`;
  }
}

module.exports = new AIAlertService();