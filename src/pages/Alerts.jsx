import { FiAlertTriangle, FiInfo } from 'react-icons/fi';

const Alerts = () => {
  const alerts = [
    { id: 1, message: 'Le produit X est en rupture de stock (5 unités restantes)', type: 'critical', icon: FiAlertTriangle },
    { id: 2, message: 'La zone A est à 95% de capacité', type: 'warning', icon: FiAlertTriangle },
    { id: 3, message: 'Le produit Y expire dans 3 jours', type: 'warning', icon: FiAlertTriangle },
    { id: 4, message: 'Nouveau produit Z ajouté à l\'inventaire', type: 'info', icon: FiInfo },
  ];

  const getAlertStyles = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'info':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Alertes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 p-4 rounded-md shadow-md ${getAlertStyles(alert.type)}`}
          >
            <div className="flex items-center">
              <alert.icon className="w-6 h-6 mr-3" />
              <div>
                <p className="font-medium">{alert.message}</p>
                <span className="text-sm opacity-75 capitalize">{alert.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;