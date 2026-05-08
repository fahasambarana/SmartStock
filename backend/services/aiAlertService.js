exports.analyzeProductRisk = async (product) => {
  // Simple risk analysis logic
  let riskScore = 0;
  let alertLevel = 'low';
  let recommendation = 'Tout va bien.';
  let priority = 'low';

  if (product.quantity <= 0) {
    riskScore = 100;
    alertLevel = 'critical';
    recommendation = `Rupture de stock imminente pour ${product.name}. Réapprovisionnez immédiatement.`;
    priority = 'high';
  } else if (product.quantity <= 10) {
    riskScore = 75;
    alertLevel = 'high';
    recommendation = `Stock faible pour ${product.name}. Pensez à commander bientôt.`;
    priority = 'medium';
  } else if (product.quantity <= 20) {
    riskScore = 40;
    alertLevel = 'medium';
    recommendation = `Niveau de stock modéré pour ${product.name}.`;
    priority = 'low';
  }

  return {
    riskScore,
    alertLevel,
    recommendation,
    priority,
    estimatedDaysLeft: product.quantity / 2 // Mock estimation
  };
};