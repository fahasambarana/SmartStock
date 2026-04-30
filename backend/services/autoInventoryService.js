// services/autoInventoryService.js
const { Product, Zone, Movement } = require("../models/associations");
const { Sequelize } = require("sequelize");

class AutoInventoryService {

  /**
   * Exécute un inventaire automatique basé sur les mouvements
   */
  async runAutoInventory(period = 'month') {
    console.log(`🤖 Lancement inventaire auto - ${new Date().toLocaleString()}`);
    
    const startDate = this.getPeriodStartDate(period);
    
    // 1. Récupérer tous les produits
    const products = await Product.findAll({
      include: [{ model: Zone, attributes: ['name'] }]
    });
    
    const inventoryItems = [];
    let totalValue = 0;
    let anomalies = [];
    
    for (const product of products) {
      // Calculer le stock théorique basé sur TOUS les mouvements
      const theoreticalStock = await this.calculateTheoreticalStock(product.id);
      const difference = product.quantity - theoreticalStock;
      const isAnomaly = Math.abs(difference) > 0;
      const productValue = product.price * product.quantity;
      totalValue += productValue;
      
      // Vérifier la date d'expiration
      let expirationStatus = null;
      if (product.category === 'Food' && product.expirationDate) {
        const daysUntilExpiry = Math.ceil((new Date(product.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
        expirationStatus = {
          date: product.expirationDate,
          daysLeft: daysUntilExpiry,
          isExpired: daysUntilExpiry < 0,
          isExpiringSoon: daysUntilExpiry >= 0 && daysUntilExpiry <= 7
        };
      }
      
      const inventoryItem = {
        productId: product.id,
        productName: product.name,
        category: product.category,
        zone: product.Zone?.name || 'Non assigné',
        currentStock: product.quantity,
        theoreticalStock: theoreticalStock,
        difference: difference,
        differencePercent: theoreticalStock > 0 ? ((Math.abs(difference) / theoreticalStock) * 100).toFixed(1) : 0,
        isAnomaly: isAnomaly,
        value: productValue,
        price: product.price,
        expirationStatus: expirationStatus,
        lastMovementDate: await this.getLastMovementDate(product.id)
      };
      
      inventoryItems.push(inventoryItem);
      
      if (isAnomaly) {
        anomalies.push({
          ...inventoryItem,
          severity: this.getAnomalySeverity(Math.abs(difference), product.quantity),
          recommendation: this.getAnomalyRecommendation(product, difference)
        });
      }
    }
    
    // 2. Analyser les produits périmés
    const expiredProducts = inventoryItems.filter(p => 
      p.expirationStatus?.isExpired === true
    );
    
    const expiringSoonProducts = inventoryItems.filter(p => 
      p.expirationStatus?.isExpiringSoon === true && !p.expirationStatus?.isExpired
    );
    
    // 3. Trier les anomalies par sévérité
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    
    // 4. Calculer les statistiques
    const accuracyRate = inventoryItems.length > 0 
      ? ((inventoryItems.length - anomalies.length) / inventoryItems.length * 100).toFixed(1)
      : 100;
    
    // 5. Générer les recommandations IA
    const recommendations = this.generateRecommendations({
      anomaliesCount: anomalies.length,
      criticalAnomalies: anomalies.filter(a => a.severity === 'critical').length,
      expiredCount: expiredProducts.length,
      expiringCount: expiringSoonProducts.length,
      lowStockCount: inventoryItems.filter(p => p.currentStock <= 10 && p.currentStock > 0).length,
      totalProducts: inventoryItems.length,
      totalValue: totalValue
    });
    
    return {
      id: `INV-${Date.now()}`,
      generatedAt: new Date(),
      period: period,
      periodStart: startDate,
      periodEnd: new Date(),
      summary: {
        totalProducts: inventoryItems.length,
        totalValue: totalValue,
        anomaliesCount: anomalies.length,
        criticalAnomalies: anomalies.filter(a => a.severity === 'critical').length,
        expiredProducts: expiredProducts.length,
        expiringProducts: expiringSoonProducts.length,
        lowStockProducts: inventoryItems.filter(p => p.currentStock <= 10 && p.currentStock > 0).length,
        zeroStockProducts: inventoryItems.filter(p => p.currentStock === 0).length,
        accuracyRate: accuracyRate,
        healthScore: this.calculateHealthScore(anomalies, expiredProducts, inventoryItems)
      },
      inventory: inventoryItems,
      anomalies: anomalies,
      expiredProducts: expiredProducts,
      expiringSoonProducts: expiringSoonProducts,
      recommendations: recommendations
    };
  }
  
  /**
   * Calcule le stock théorique basé sur l'historique COMPLET des mouvements
   */
  async calculateTheoreticalStock(productId) {
    const movements = await Movement.findAll({
      where: { productId: productId },
      attributes: ['type', 'quantity']
    });
    
    let calculatedStock = 0;
    for (const movement of movements) {
      if (movement.type === 'in') {
        calculatedStock += movement.quantity;
      } else if (movement.type === 'out') {
        calculatedStock -= movement.quantity;
      }
    }
    return Math.max(0, calculatedStock);
  }
  
  /**
   * Détermine la sévérité d'une anomalie
   */
  getAnomalySeverity(difference, currentStock) {
    if (difference > 10 || (currentStock > 0 && Math.abs(difference) > currentStock * 0.2)) {
      return 'critical';
    }
    if (difference > 5 || (currentStock > 0 && Math.abs(difference) > currentStock * 0.1)) {
      return 'high';
    }
    if (difference > 2) {
      return 'medium';
    }
    return 'low';
  }
  
  /**
   * Génère une recommandation pour une anomalie
   */
  getAnomalyRecommendation(product, difference) {
    if (difference > 0) {
      return `📦 Stock excédentaire de ${difference} unité(s). Vérifier les entrées en doublon.`;
    } else if (difference < 0) {
      return `⚠️ Manque ${Math.abs(difference)} unité(s). Vérifier les sorties non enregistrées.`;
    }
    return "✅ Stock conforme";
  }
  
  /**
   * Calcule le score de santé (0-100)
   */
  calculateHealthScore(anomalies, expiredProducts, inventoryItems) {
    let score = 100;
    
    // Pénalité pour anomalies critiques
    score -= anomalies.filter(a => a.severity === 'critical').length * 10;
    score -= anomalies.filter(a => a.severity === 'high').length * 5;
    
    // Pénalité pour produits expirés
    score -= expiredProducts.length * 15;
    
    // Pénalité pour stock bas
    const lowStockCount = inventoryItems.filter(p => p.currentStock <= 5).length;
    score -= lowStockCount * 3;
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Génère des recommandations globales IA
   */
  generateRecommendations(stats) {
    const recommendations = [];
    
    if (stats.criticalAnomalies > 0) {
      recommendations.push({
        type: "critical_anomaly",
        message: `🔴 ${stats.criticalAnomalies} anomalie(s) critique(s) détectée(s). Vérification immédiate requise.`,
        priority: "critical",
        action: "Vérifier les mouvements récents et corriger les écarts"
      });
    }
    
    if (stats.expiredCount > 0) {
      recommendations.push({
        type: "expired_products",
        message: `❌ ${stats.expiredCount} produit(s) expiré(s) à retirer du stock.`,
        priority: "high",
        action: "Retirer immédiatement et passer les pertes en comptabilité"
      });
    }
    
    if (stats.expiringCount > 0) {
      recommendations.push({
        type: "expiring_soon",
        message: `📅 ${stats.expiringCount} produit(s) vont expirer sous 7 jours.`,
        priority: "high",
        action: "Placer en tête de gondole et proposer une promotion"
      });
    }
    
    if (stats.lowStockCount > 0) {
      recommendations.push({
        type: "low_stock",
        message: `📦 ${stats.lowStockCount} produit(s) en stock bas (<10 unités).`,
        priority: "medium",
        action: "Planifier réapprovisionnement sous 48h"
      });
    }
    
    if (stats.anomaliesCount > stats.criticalAnomalies) {
      recommendations.push({
        type: "general_anomaly",
        message: `⚠️ ${stats.anomaliesCount - stats.criticalAnomalies} anomalie(s) mineure(s) détectée(s).`,
        priority: "low",
        action: "Vérifier lors du prochain inventaire programmé"
      });
    }
    
    if (stats.accuracyRate < 90) {
      recommendations.push({
        type: "accuracy",
        message: `📊 Taux de précision: ${stats.accuracyRate}%. Amélioration possible.`,
        priority: "medium",
        action: "Former le personnel à la saisie des mouvements"
      });
    }
    
    return recommendations;
  }
  
  getPeriodStartDate(period) {
    const now = new Date();
    switch(period) {
      case 'week': return new Date(now.setDate(now.getDate() - 7));
      case 'month': return new Date(now.setMonth(now.getMonth() - 1));
      case 'quarter': return new Date(now.setMonth(now.getMonth() - 3));
      case 'year': return new Date(now.setFullYear(now.getFullYear() - 1));
      default: return new Date(now.setMonth(now.getMonth() - 1));
    }
  }
  
  async getLastMovementDate(productId) {
    const lastMovement = await Movement.findOne({
      where: { productId: productId },
      order: [['movementDate', 'DESC']]
    });
    return lastMovement ? lastMovement.movementDate : null;
  }
}

module.exports = new AutoInventoryService();