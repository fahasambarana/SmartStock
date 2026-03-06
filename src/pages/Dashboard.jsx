import Card from '../components/Card';
import { FiPackage, FiAlertTriangle, FiCalendar, FiTrendingUp } from 'react-icons/fi';

const Dashboard = () => {
  const kpiData = [
    { title: 'Total Produits', value: '1,234', icon: FiPackage, color: 'blue' },
    { title: 'Stock Faible', value: '23', icon: FiAlertTriangle, color: 'red' },
    { title: 'Produits Périmés', value: '12', icon: FiCalendar, color: 'yellow' },
    { title: 'Occupation Zone %', value: '85%', icon: FiTrendingUp, color: 'green' },
  ];

  const recentAlerts = [
    { id: 1, message: 'Le produit X est en rupture de stock', type: 'warning' },
    { id: 2, message: 'La zone A est à 95% de capacité', type: 'critical' },
    { id: 3, message: 'Le produit Y expire dans 3 jours', type: 'info' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de Bord</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, index) => (
          <Card key={index} title={kpi.title} value={kpi.value} iconComponent={kpi.icon} color={kpi.color} />
        ))}
      </div>

      {/* Charts Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Entrée vs Sortie de Stock</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-500">Espace réservé pour le graphique</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Occupation des Zones</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-500">Espace réservé pour le graphique</span>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertes Récentes</h3>
        <div className="space-y-3">
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-md ${
                alert.type === 'critical'
                  ? 'bg-red-100 text-red-800'
                  : alert.type === 'warning'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {alert.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;