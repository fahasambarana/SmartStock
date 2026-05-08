const { Product, Zone } = require('../models/associations');
const aiAlertService = require('../services/aiAlertService');

exports.getAlerts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Zone, attributes: ['name'] }]
    });

    const alerts = [];
    for (const product of products) {
      const analysis = await aiAlertService.analyzeProductRisk(product);
      if (analysis.riskScore > 50) {
        alerts.push({
          id: product.id,
          productName: product.name,
          message: analysis.recommendation,
          priority: analysis.priority,
          riskScore: analysis.riskScore
        });
      }
    }

    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
