const { Product, Zone, Movement, Category, User } = require("../models/associations");
const { Sequelize } = require("sequelize");
const aiAlertService = require("../services/aiAlertService");

const DEFAULT_KPIS = {
  totalProducts: 0,
  totalZones: 0,
  totalMovements: 0,
  totalManagers: 0,
  totalCategories: 0,
  lowStock: 0,
  occupation: "0%",
};

const DEFAULT_MOVEMENT_CHART = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
  in: [0, 0, 0, 0, 0, 0],
  out: [0, 0, 0, 0, 0, 0],
};

const DEFAULT_ZONE_CHART = {
  labels: [],
  data: [],
  details: [],
};

const safeDashboardSection = async (label, fallback, task) => {
  try {
    return await task();
  } catch (error) {
    console.error(`Erreur section dashboard ${label}:`, error.message);
    return fallback;
  }
};

const safeDashboardValue = async (label, fallback, task) => {
  try {
    const value = await task();
    return value ?? fallback;
  } catch (error) {
    console.error(`Erreur valeur dashboard ${label}:`, error.message);
    return fallback;
  }
};

const getRole = (user) => user?.role?.toLowerCase?.() || '';

const getProductScope = (user) => (
  getRole(user) === 'manager' ? { UserId: user.id } : {}
);

const getMovementScope = (user) => (
  getRole(user) === 'manager' ? { userId: user.id } : {}
);

const getManagerZoneIds = async (user) => {
  if (getRole(user) !== 'manager') return null;

  const [ownedZones, productZones] = await Promise.all([
    Zone.findAll({
      where: { UserId: user.id },
      attributes: ['id'],
      raw: true,
    }),
    Product.findAll({
      where: {
        UserId: user.id,
        ZoneId: { [Sequelize.Op.ne]: null },
      },
      attributes: ['ZoneId'],
      raw: true,
    }),
  ]);

  return [
    ...new Set([
      ...ownedZones.map((zone) => zone.id),
      ...productZones.map((product) => product.ZoneId).filter(Boolean),
    ]),
  ];
};

const getScopedZones = async (user) => {
  const zoneIds = await getManagerZoneIds(user);
  if (zoneIds === null) return Zone.findAll({ order: [['createdAt', 'DESC']] });
  if (zoneIds.length === 0) return [];

  return Zone.findAll({
    where: { id: { [Sequelize.Op.in]: zoneIds } },
    order: [['createdAt', 'DESC']],
  });
};

const getZoneProductSummary = async (zone, user) => {
  const productWhere = {
    ZoneId: zone.id,
    ...getProductScope(user),
  };

  const [productCount, totalQuantity, products] = await Promise.all([
    Product.count({ where: productWhere }),
    Product.sum('quantity', { where: productWhere }),
    Product.findAll({
      where: productWhere,
      attributes: ['quantity', 'volume_unitaire'],
      raw: true,
    }),
  ]);
  const unit = zone.unite_capacite || 'Unités';
  const capacityUsed = products.reduce((sum, product) => {
    const quantity = Number(product.quantity) || 0;
    if (unit === 'Volume') {
      return sum + quantity * (Number(product.volume_unitaire) || 0);
    }
    return sum + quantity;
  }, 0);

  return {
    productCount,
    totalQuantity: Number(totalQuantity) || 0,
    capacityUsed,
  };
};

const buildDashboard = async (user) => {
  const productScope = getProductScope(user);
  const movementScope = getMovementScope(user);
  const isManager = getRole(user) === 'manager';

  const [kpis, movementChart, zoneChart, recentAlerts] = await Promise.all([
      safeDashboardSection('kpis', DEFAULT_KPIS, async () => {
        const [
          scopedProducts,
          allProducts,
          totalMovements,
          totalManagers,
          totalCategories,
          scopedLowStock,
          allLowStock,
          zones
        ] = await Promise.all([
          safeDashboardValue('produits manager', 0, () => Product.count({ where: productScope })),
          safeDashboardValue('produits total', 0, () => Product.count()),
          safeDashboardValue('mouvements total', 0, () => Movement.count({ where: movementScope })),
          safeDashboardValue('managers total', 0, () => User.count({ where: { role: { [Sequelize.Op.in]: ['manager', 'Manager'] } } })),
          safeDashboardValue('categories total', 0, () => Category.count()),
          safeDashboardValue('stock faible manager', 0, () => Product.count({
            where: {
              ...productScope,
              quantity: { [Sequelize.Op.lte]: 10 }
            }
          })),
          safeDashboardValue('stock faible total', 0, () => Product.count({
            where: { quantity: { [Sequelize.Op.lte]: 10 } }
          })),
          safeDashboardValue('zones occupation', [], () => getScopedZones(user))
        ]);

        const totalProducts = isManager ? scopedProducts : allProducts;
        const lowStock = isManager ? scopedLowStock : allLowStock;
        const totalZones = zones.length;
        const zoneUsages = await Promise.all(zones.map((zone) => getZoneProductSummary(zone, user)));
        let totalPercent = 0;
        zones.forEach((zone, index) => {
          const max = Number(zone.capacite_max) || 0;
          if (max > 0) totalPercent += (zoneUsages[index].capacityUsed / max) * 100;
        });
        const avgOcc = zones.length > 0 ? totalPercent / zones.length : 0;
        return {
          totalProducts,
          totalZones,
          totalMovements,
          totalManagers,
          totalCategories,
          lowStock,
          occupation: `${avgOcc.toFixed(0)}%`
        };
      }),

      safeDashboardSection('mouvements', DEFAULT_MOVEMENT_CHART, async () => {
        const months = [];
        const inData = [], outData = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          months.push(date.toLocaleString('fr-FR', { month: 'short' }));
          const start = new Date(date.getFullYear(), date.getMonth(), 1);
          const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          const inSum = await Movement.sum('quantityMoved', {
            where: {
              ...movementScope,
              type: 'Entrée',
              movementDate: { [Sequelize.Op.between]: [start, end] }
            }
          }) || 0;

          const outSum = await Movement.sum('quantityMoved', {
            where: {
              ...movementScope,
              type: 'Sortie',
              movementDate: { [Sequelize.Op.between]: [start, end] }
            }
          }) || 0;

          inData.push(inSum);
          outData.push(outSum);
        }
        return { labels: months, in: inData, out: outData };
      }),

      safeDashboardSection('zones', DEFAULT_ZONE_CHART, async () => {
        const zones = await getScopedZones(user);
        const details = await Promise.all(zones.map(async (zone) => {
          const max = Number(zone.capacite_max) || 0;
          const productSummary = await getZoneProductSummary(zone, user);
          const current = productSummary.capacityUsed;
          const occupation = max > 0 ? Math.round((current / max) * 100) : 0;

          return {
            id: zone.id,
            name: zone.name,
            type: zone.type || 'Standard',
            location: zone.location || 'Non renseigné',
            current,
            max,
            unit: zone.unite_capacite || 'Unités',
            occupation,
            productCount: productSummary.productCount,
            totalQuantity: productSummary.totalQuantity,
            managerId: zone.UserId || null,
          };
        }));

        return {
          labels: details.map(z => z.name),
          data: details.map(z => z.occupation),
          details
        };
      }),

      safeDashboardSection('alertes', [], async () => {
        const products = await Product.findAll({
          where: productScope,
          include: [{ model: Zone }],
          limit: 20,
          order: [['quantity', 'ASC']]
        });
        const alerts = [];
        for (const product of products) {
          if (product.quantity <= 15) {
            const analysis = await aiAlertService.analyzeProductRisk(product);
            alerts.push({
              id: product.id,
              productName: product.name,
              message: analysis.recommendation,
              currentStock: product.quantity,
              zone: product.Zone?.name || 'Non assigné',
              riskScore: analysis.riskScore,
              priority: analysis.priority
            });
          }
        }
        alerts.sort((a, b) => b.riskScore - a.riskScore);
        return alerts.slice(0, 3);
      })
    ]);

  return {
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
      }],
      details: zoneChart.details
    },
    recentAlerts,
    updatedAt: new Date().toISOString()
  };
};

exports.getFullDashboard = async (req, res) => {
  try {
    const dashboard = await buildDashboard(req.user);

    res.json({
      success: true,
      dashboard
    });

  } catch (error) {
    console.error("Erreur Dashboard:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getKPIs = async (req, res) => {
  try {
    const dashboard = await buildDashboard(req.user);
    res.json({ success: true, kpis: dashboard.kpis });
  } catch (error) {
    console.error("Erreur KPIs:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMovementChartData = async (req, res) => {
  try {
    const dashboard = await buildDashboard(req.user);
    res.json({ success: true, movementChart: dashboard.movementChart });
  } catch (error) {
    console.error("Erreur movement chart:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getZoneChartData = async (req, res) => {
  try {
    const dashboard = await buildDashboard(req.user);
    res.json({ success: true, zoneChart: dashboard.zoneChart });
  } catch (error) {
    console.error("Erreur zone chart:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRecentAlerts = async (req, res) => {
  try {
    const dashboard = await buildDashboard(req.user);
    res.json({ success: true, recentAlerts: dashboard.recentAlerts });
  } catch (error) {
    console.error("Erreur recent alerts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
