import { FiAlertTriangle, FiInfo, FiBell, FiChevronRight } from 'react-icons/fi';

const Alerts = () => {
  const alerts = [
    { id: 1, message: 'Le produit X est en rupture de stock (5 unités restantes)', type: 'critical' },
    { id: 2, message: 'La zone A est à 95% de capacité', type: 'warning' },
    { id: 3, message: 'Le produit Y expire dans 3 jours', type: 'warning' },
    { id: 4, message: "Nouveau produit Z ajouté à l'inventaire", type: 'info' },
  ];

  // --- STYLES NEUMORPHISMES ---
  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";

  const getAlertTheme = (type) => {
    switch (type) {
      case 'critical':
        return {
          icon: FiAlertTriangle,
          color: 'text-red-600 dark:text-red-400',
          accent: 'bg-red-500',
          label: 'Critique'
        };
      case 'warning':
        return {
          icon: FiAlertTriangle,
          color: 'text-amber-500 dark:text-amber-400',
          accent: 'bg-amber-500',
          label: 'Avertissement'
        };
      case 'info':
        return {
          icon: FiInfo,
          color: 'text-blue-600 dark:text-blue-400',
          accent: 'bg-blue-500',
          label: 'Information'
        };
      default:
        return {
          icon: FiInfo,
          color: 'text-gray-500',
          accent: 'bg-gray-500',
          label: 'Note'
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] p-8 text-gray-700 dark:text-gray-200 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center mb-10">
        <div className={`${nmFlat} p-4 rounded-2xl mr-5`}>
          <FiBell className="text-indigo-600 dark:text-indigo-400 animate-pulse" size={28} />
        </div>
        <h1 className="text-3xl font-black text-[#44474a] dark:text-gray-100 uppercase  tracking-tighter">
          Centre de Notifications
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {alerts.map((alert) => {
          const theme = getAlertTheme(alert.type);
          const Icon = theme.icon;

          return (
            <div
              key={alert.id}
              className={`${nmFlat} rounded-[2rem] p-6 flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
            >
              {/* Barre d'accentuation latérale discrète */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.accent} opacity-80`} />

              <div className="flex items-start mb-4">
                <div className={`${nmInset} p-3 rounded-xl mr-4`}>
                  <Icon className={`${theme.color}`} size={20} />
                </div>
                <div className="flex-1">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.color}`}>
                    {theme.label}
                  </span>
                  <p className="font-bold text-gray-800 dark:text-gray-100 mt-1 leading-tight">
                    {alert.message}
                  </p>
                </div>
              </div>

              {/* Action / Date fictive */}
              <div className="mt-auto pt-4 flex justify-between items-center border-t border-gray-300/30 dark:border-white/5">
                <span className="text-xs text-gray-400 font-medium">Il y a 10 min</span>
                <button className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase flex items-center group-hover:translate-x-1 transition-transform">
                  Détails <FiChevronRight className="ml-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* État vide si aucune alerte */}
      {alerts.length === 0 && (
        <div className={`${nmInset} rounded-[3rem] p-20 text-center`}>
          <p className="text-gray-400 font-bold italic uppercase tracking-widest">
            Tous les systèmes sont opérationnels
          </p>
        </div>
      )}
    </div>
  );
};

export default Alerts;