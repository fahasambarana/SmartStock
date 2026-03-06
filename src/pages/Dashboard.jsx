import Card from '../components/Card';
import { FiPackage, FiAlertTriangle, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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

  // Données pour le graphique Entrée vs Sortie de Stock
  const stockMovementData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Entrées',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Sorties',
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const stockMovementOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Mouvements de Stock Mensuels',
      },
    },
  };

  // Données pour le graphique Occupation des Zones
  const zoneOccupationData = {
    labels: ['Zone A', 'Zone B', 'Zone C', 'Zone D'],
    datasets: [
      {
        data: [85, 70, 60, 45],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const zoneOccupationOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Occupation des Zones (%)',
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de Bord</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, index) => (
          <Card key={index} title={kpi.title} value={kpi.value} iconComponent={kpi.icon} color={kpi.color} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <Bar data={stockMovementData} options={stockMovementOptions} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <Pie data={zoneOccupationData} options={zoneOccupationOptions} />
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