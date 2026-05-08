// services/aiAlertService.js
const { Product, Zone, Movement } = require("../models/associations");
const { Sequelize } = require("sequelize");

class AIAlertService {
  
  /**
   * Analyse le risque d'un produit
   */
  async analyzeProductRisk(product) {
    let riskScore = 0;
    let alertLevel = 'low';
    let recommendation = 'Tout va bien.';
    let priority = 5; // 1 = le plus urgent
    
    // Analyse du stock
    if (product.quantity <= 0) {
      riskScore = 100;
      alertLevel = 'critical';
      recommendation = `Rupture de stock pour ${product.name}. Réapprovisionnez immédiatement.`;
      priority = 1;
    } else if (product.quantity <= 5) {
      riskScore = 90;
      alertLevel = 'critical';
      recommendation = `Stock critique pour ${product.name} (${product.quantity} unités). Commandez en urgence.`;
      priority = 1;
    } else if (product.quantity <= 10) {
      riskScore = 75;
      alertLevel = 'high';
      recommendation = `Stock très bas pour ${product.name} (${product.quantity} unités). Pensez à commander.`;
      priority = 2;
    } else if (product.quantity <= 20) {
      riskScore = 50;
      alertLevel = 'medium';
      recommendation = `Stock modéré pour ${product.name} (${product.quantity} unités). Surveiller.`;
      priority = 3;
    } else if (product.quantity <= 50) {
      riskScore = 25;
      alertLevel = 'low';
      recommendation = `Stock acceptable pour ${product.name}.`;
      priority = 4;
    }
    
    // Analyse de la date d'expiration
    if (product.expirationDate) {
      const daysUntilExpiry = Math.ceil(
        (new Date(product.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilExpiry <= 0) {
        riskScore = Math.max(riskScore, 100);
        alertLevel = 'critical';
        recommendation = `⚠️ ALERTE: ${product.name} est EXPIRÉ depuis ${Math.abs(daysUntilExpiry)} jours. Retirer immédiatement.`;
        priority = Math.min(priority, 1);
      } else if (daysUntilExpiry <= 3) {
        riskScore = Math.max(riskScore, 90);
        alertLevel = 'critical';
        recommendation = `⚠️ ${product.name} expire dans ${daysUntilExpiry} jours. Priorité de vente absolue.`;
        priority = Math.min(priority, 1);
      } else if (daysUntilExpiry <= 7) {
        riskScore = Math.max(riskScore, 70);
        alertLevel = 'high';
        recommendation = `${product.name} expire dans ${daysUntilExpiry} jours. Pensez à le promouvoir.`;
        priority = Math.min(priority, 2);
      } else if (daysUntilExpiry <= 15) {
        riskScore = Math.max(riskScore, 40);
        alertLevel = 'medium';
        recommendation = `${product.name} expire dans ${daysUntilExpiry} jours. À surveiller.`;
        priority = Math.min(priority, 3);
      }
    }
    
    // Estimer les jours restants (basé sur les mouvements récents)
    const estimatedDaysLeft = await this.estimateDaysLeft(product.id, product.quantity);
    
    return {
      productId: product.id,
      productName: product.name,
      currentStock: product.quantity,
      riskScore,
      alertLevel,
      recommendation,
      priority,
      estimatedDaysLeft,
      reason: this.getAlertReason(riskScore, product)
    };
  }
  
  /**
   * Estime le nombre de jours restants basé sur la consommation
   */
  async estimateDaysLeft(productId, currentStock) {
    try {
      // Récupérer les mouvements des 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const movements = await Movement.findAll({
        where: {
          productId: productId,
          type: 'out',
          movementDate: {
            [Sequelize.Op.gte]: thirtyDaysAgo
          }
        },
        attributes: ['quantityMoved']
      });
      
      const totalOut = movements.reduce((sum, m) => sum + m.quantityMoved, 0);
      const avgDailyConsumption = totalOut / 30;
      
      if (avgDailyConsumption > 0) {
        return currentStock / avgDailyConsumption;
      }
      return currentStock > 0 ? 999 : 0;
    } catch (error) {
      console.error("Erreur estimateDaysLeft:", error);
      return currentStock / 2; // Valeur par défaut
    }
  }
  
  /**
   * Analyse la capacité d'une zone
   */
  async analyzeZoneCapacity(zone) {
    const capacityPercent = (zone.capacite_actuelle / zone.capacite_max) * 100;
    let alertLevel = 'low';
    let recommendation = '';
    
    if (capacityPercent >= 90) {
      alertLevel = 'critical';
      recommendation = `URGENT: Zone ${zone.name} à ${capacityPercent.toFixed(1)}% de capacité. Nécessite une expansion immédiate ou un réorganisation.`;
    } else if (capacityPercent >= 75) {
      alertLevel = 'high';
      recommendation = `Zone ${zone.name} approche de saturation (${capacityPercent.toFixed(1)}%). Planifier une réorganisation.`;
    } else if (capacityPercent >= 60) {
      alertLevel = 'medium';
      recommendation = `Zone ${zone.name} à ${capacityPercent.toFixed(1)}% de capacité. À surveiller.`;
    } else {
      recommendation = `Zone ${zone.name} OK (${capacityPercent.toFixed(1)}% utilisé).`;
    }
    
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      capacityUsed: zone.capacite_actuelle,
      capacityMax: zone.capacite_max,
      capacityPercent: capacityPercent.toFixed(1),
      alertLevel,
      recommendation
    };
  }
  
  /**
   * Détecte des anomalies dans les mouvements
   */
  async detectAnomalies(zoneId = null) {
    const anomalies = [];
    
    const whereClause = {};
    if (zoneId) whereClause.zoneId = zoneId;
    
    // Détecter les mouvements suspects (quantité négative, etc.)
    const movements = await Movement.findAll({
      where: whereClause,
      order: [['movementDate', 'DESC']],
      limit: 100
    });
    
    // Grouper par produit pour trouver des patterns suspects
    const productMovements = {};
    for (const movement of movements) {
      if (!productMovements[movement.productId]) {
        productMovements[movement.productId] = [];
      }
      productMovements[movement.productId].push(movement);
    }
    
    // Analyser chaque produit
    for (const [productId, productMovs] of Object.entries(productMovements)) {
      // Détecter trop de mouvements en peu de temps
      if (productMovs.length > 20) {
        anomalies.push({
          productId: parseInt(productId),
          type: 'high_frequency',
          message: `Nombre anormal de mouvements (${productMovs.length}) pour ce produit`,
          severity: 'medium'
        });
      }
      
      // Détecter des mouvements incohérents
      let lastQuantity = null;
      for (const movement of productMovs) {
        if (lastQuantity !== null && Math.abs(movement.quantityBefore - lastQuantity) > 100) {
          anomalies.push({
            productId: parseInt(productId),
            type: 'inconsistent_quantity',
            message: `Saut de quantité suspect détecté: ${lastQuantity} → ${movement.quantityBefore}`,
            severity: 'high'
          });
        }
        lastQuantity = movement.quantityAfter;
      }
    }
    
    return anomalies;
  }
  
  getAlertReason(riskScore, product) {
    if (product.quantity <= 0) return 'Rupture de stock';
    if (product.quantity <= 5) return 'Stock critique';
    if (product.quantity <= 10) return 'Stock très bas';
    if (product.expirationDate && new Date(product.expirationDate) - new Date() < 0) return 'Produit expiré';
    if (product.expirationDate && new Date(product.expirationDate) - new Date() < 7 * 24 * 60 * 60 * 1000) return 'Expiration proche';
    return 'Stock faible';
  }
}

module.exports = new AIAlertService();