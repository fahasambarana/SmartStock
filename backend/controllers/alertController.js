const Product = require('../models/Product');
const Zone = require('../models/Zone');
const Movement = require('../models/Movement');

const LOW_STOCK_THRESHOLD = 10;
const WARNING_OCCUPATION_RATE = 85;
const CRITICAL_OCCUPATION_RATE = 95;
const WARNING_EXPIRY_DAYS = 30;
const CRITICAL_EXPIRY_DAYS = 7;

const toStartOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

exports.getAlerts = async (req, res) => {
  try {
    const [products, zones, movements] = await Promise.all([
      Product.findAll({ order: [['updatedAt', 'DESC']] }),
      Zone.findAll({ order: [['updatedAt', 'DESC']] }),
      Movement.findAll({ order: [['createdAt', 'DESC']], limit: 5 }),
    ]);

    const today = toStartOfDay(new Date());
    const alerts = [];

    products.forEach((product) => {
      const quantity = Number(product.quantity || 0);

      if (quantity === 0) {
        alerts.push({
          id: `stock-critical-${product.id}`,
          type: 'critical',
          title: 'Rupture de stock',
          message: `${product.name} est en rupture de stock.`,
          source: 'product',
          createdAt: product.updatedAt || product.createdAt || new Date(),
        });
        return;
      }

      if (quantity <= LOW_STOCK_THRESHOLD) {
        alerts.push({
          id: `stock-warning-${product.id}`,
          type: 'warning',
          title: 'Stock faible',
          message: `${product.name} est presque en rupture (${quantity} unités restantes).`,
          source: 'product',
          createdAt: product.updatedAt || product.createdAt || new Date(),
        });
      }
    });

    products.forEach((product) => {
      if (!product.expirationDate) return;

      const expirationDate = new Date(product.expirationDate);
      const diffMs = toStartOfDay(expirationDate).getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 0 || diffDays > WARNING_EXPIRY_DAYS) {
        return;
      }

      alerts.push({
        id: `expiry-${product.id}`,
        type: diffDays <= CRITICAL_EXPIRY_DAYS ? 'critical' : 'warning',
        title: 'Expiration proche',
        message: `${product.name} expire dans ${diffDays} jour${diffDays > 1 ? 's' : ''}.`,
        source: 'product',
        createdAt: product.updatedAt || product.createdAt || new Date(),
      });
    });

    zones.forEach((zone) => {
      const max = Number(zone.capacite_max || 0);
      const current = Number(zone.capacite_actuelle || 0);

      if (max <= 0) return;

      const occupationRate = Math.round((current / max) * 100);
      if (occupationRate < WARNING_OCCUPATION_RATE) return;

      alerts.push({
        id: `zone-${zone.id}`,
        type: occupationRate >= CRITICAL_OCCUPATION_RATE ? 'critical' : 'warning',
        title: 'Capacité zone',
        message: `${zone.name} est occupée à ${occupationRate}% de sa capacité.`,
        source: 'zone',
        createdAt: zone.updatedAt || zone.createdAt || new Date(),
      });
    });

    movements.forEach((movement) => {
      alerts.push({
        id: `movement-${movement.id}`,
        type: 'info',
        title: `Mouvement ${movement.type}`,
        message: `${movement.type} de ${movement.quantityMoved} unité${movement.quantityMoved > 1 ? 's' : ''} enregistrée.`,
        source: 'movement',
        createdAt: movement.createdAt || new Date(),
      });
    });

    const severity = { critical: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => {
      const severityDiff = severity[a.type] - severity[b.type];
      if (severityDiff !== 0) return severityDiff;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts', error: error.message });
  }
};
