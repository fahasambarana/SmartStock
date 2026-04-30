// controllers/dashboardController.js
const { Product, Zone, Movement } = require("../models/associations");
const { Sequelize } = require("sequelize");
const aiAlertService = require("../services/aiAlertService");

// Obtenir les KPIs du dashboard
exports.getKPIs = async (req, res) => {
  try {
    const totalProducts = await Product.count();
    
    const lowStockProducts = await Product.count({
      where: {
        quantity: { [Sequelize.Op.lte]: 10 }
      }
    });
    
    const perishableProducts = await Product.count({
      where: {
        category: 'Food',
        expirationDate: {
          [Sequelize.Op.not]: null,
          [Sequelize.Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    });
    
    const zones = await Zone.findAll();
    let totalCapacityPercent = 0;
    zones.forEach(zone => {
      if (zone.capacite_max > 0) {
        totalCapacityPercent += (zone.capacite_actuelle / zone.capacite_max) * 100;
      }
    });
    const avgOccupation = zones.length > 0 ? (totalCapacityPercent / zones.length).toFixed(0) : 0;
    
    // Alertes actives
    const activeAlerts = await this.getActiveAlertsCount();
    
    res.json({
      success: true,
      kpis: {
        totalProducts,
        lowStock: lowStockProducts,
        perishable: perishableProducts,
        occupation: `${avgOccupation}%`,
        activeAlerts
      }
    });
  } catch (error) {
    console.error("Erreur getKPIs:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Données pour le graphique des mouvements (12 derniers mois)
exports.getMovementChartData = async (req, res) => {
  try {
    const months = [];
    const inData = [];
    const outData = [];
    
    // Derniers 6 mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('fr-FR', { month: 'short' });
      months.push(monthName);
      
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const inMovements = await Movement.sum('quantity', {
        where: {
          type: 'in',
          movementDate: { [Sequelize.Op.between]: [startDate, endDate] }
        }
      }) || 0;
      
      const outMovements = await Movement.sum('quantity', {
        where: {
          type: 'out',
          movementDate: { [Sequelize.Op.between]: [startDate, endDate] }
        }
      }) || 0;
      
      inData.push(inMovements);
      outData.push(outMovements);
    }
    
    res.json({
      success: true,
      chartData: {
        labels: months,
        datasets: [
          { label: 'Entrées', data: inData, backgroundColor: '#3b82f6' },
          { label: 'Sorties', data: outData, backgroundColor: '#f43f5e' }
        ]
      }
    });
  } catch (error) {
    console.error("Erreur getMovementChartData:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Données pour le graphique des zones
exports.getZoneChartData = async (req, res) => {
  try {
    const zones = await Zone.findAll();
    
    const labels = zones.map(z => z.name);
    const data = zones.map(z => {
      if (z.capacite_max > 0) {
        return (z.capacite_actuelle / z.capacite_max) * 100;
      }
      return 0;
    });
    
    const colors = ['#f43f5e', '#3b82f6', '#fbbf24', '#10b981', '#8b5cf6', '#ec4899'];
    
    res.json({
      success: true,
      chartData: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, zones.length),
          borderWidth: 0
        }]
      }
    });
  } catch (error) {
    console.error("Erreur getZoneChartData:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Récupérer les alertes récentes (avec IA)
exports.getRecentAlerts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Zone, attributes: ['name'] }],
      limit: 20
    });
    
    const alerts = [];
    
    for (const product of products) {
      const analysis = await aiAlertService.analyzeProductRisk(product);
      
      if (analysis.riskScore > 50) {
        alerts.push({
          id: product.id,
          productName: product.name,
          zone: product.Zone?.name || 'Non assigné',
          riskScore: analysis.riskScore,
          alertLevel: analysis.alertLevel,
          message: analysis.recommendation,
          currentStock: product.quantity,
          estimatedDaysLeft: Math.floor(analysis.estimatedDaysLeft),
          priority: analysis.priority,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Trier par priorité et limiter à 5
    alerts.sort((a, b) => a.priority - b.priority);
    
    res.json({
      success: true,
      alerts: alerts.slice(0, 5)
    });
  } catch (error) {
    console.error("Erreur getRecentAlerts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Dashboard complet
exports.getFullDashboard = async (req, res) => {
  try {
    const [kpis, movementChart, zoneChart, recentAlerts] = await Promise.all([
      (async () => {
        const totalProducts = await Product.count();
        const lowStock = await Product.count({ where: { quantity: { [Sequelize.Op.lte]: 10 } } });
        const perishable = await Product.count({
          where: {
            category: 'Food',
            expirationDate: { [Sequelize.Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
          }
        });
        const zones = await Zone.findAll();
        let totalPercent = 0;
        zones.forEach(z => { if (z.capacite_max > 0) totalPercent += (z.capacite_actuelle / z.capacite_max) * 100; });
        const avgOcc = zones.length > 0 ? totalPercent / zones.length : 0;
        return { totalProducts, lowStock, perishable, occupation: `${avgOcc.toFixed(0)}%` };
      })(),
      
      (async () => {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
        const inData = [], outData = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const start = new Date(date.getFullYear(), date.getMonth(), 1);
          const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          const inSum = await Movement.sum('quantity', { where: { type: 'in', movementDate: { [Sequelize.Op.between]: [start, end] } } }) || 0;
          const outSum = await Movement.sum('quantity', { where: { type: 'out', movementDate: { [Sequelize.Op.between]: [start, end] } } }) || 0;
          inData.push(inSum);
          outData.push(outSum);
        }
        return { labels: months, in: inData, out: outData };
      })(),
      
      (async () => {
        const zones = await Zone.findAll();
        return {
          labels: zones.map(z => z.name),
          data: zones.map(z => z.capacite_max > 0 ? (z.capacite_actuelle / z.capacite_max) * 100 : 0)
        };
      })(),
      
      (async () => {
        const products = await Product.findAll({ include: [{ model: Zone }], limit: 20 });
        const alerts = [];
        for (const product of products) {
          if (product.quantity <= 15 || (product.expirationDate && new Date(product.expirationDate) - new Date() < 7 * 24 * 60 * 60 * 1000)) {
            const analysis = await aiAlertService.analyzeProductRisk(product);
            alerts.push({
              id: product.id,
              productName: product.name,
              message: analysis.recommendation,
              priority: analysis.priority
            });
          }
        }
        alerts.sort((a, b) => a.priority - b.priority);
        return alerts.slice(0, 5);
      })()
    ]);
    
    res.json({
      success: true,
      dashboard: {
        kpis,
        movementChart: {
          labels: movementChart.labels,
          datasets: [
            { label: 'Entrées', data: movementChart.in, backgroundColor: '#3b82f6' },
            { label: 'Sorties', data: movementChart.out, backgroundColor: '#f43f5e' }
          ]
        },
        zoneChart: {
          labels: zoneChart.labels,
          datasets: [{
            data: zoneChart.data,
            backgroundColor: ['#f43f5e', '#3b82f6', '#fbbf24', '#10b981', '#8b5cf6', '#ec4899']
          }]
        },
        recentAlerts
      }
    });
    
  } catch (error) {
    console.error("Erreur getFullDashboard:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper pour compter les alertes actives
exports.getActiveAlertsCount = async () => {
  try {
    const products = await Product.findAll();
    let count = 0;
    for (const product of products) {
      if (product.quantity <= 10) count++;
      if (product.category === 'Food' && product.expirationDate) {
        const daysUntilExpiry = Math.ceil((new Date(product.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) count++;
      }
    }
    return count;
  } catch (error) {
    return 0;
  }
};