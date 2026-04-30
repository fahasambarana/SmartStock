import { useState, useEffect } from 'react';
import { FiArrowUpRight, FiArrowDownLeft, FiRefreshCw, FiPackage, FiCalendar, FiMapPin, FiLoader, FiPlus } from 'react-icons/fi';
import { getMovementsByType, getMovementStats } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AddMovement from '../components/AddMovement';

const Movements = () => {
  const [activeTab, setActiveTab] = useState('in');
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [movementType, setMovementType] = useState('in');
  const { user } = useAuth();

  // --- STYLES NEUMORPHISMES ---
  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";
  const nmButton = "active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] transition-all duration-200";

  useEffect(() => {
    fetchMovements();
    fetchStats();
  }, [activeTab]);

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMovementsByType(activeTab);
      setMovements(response.data.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des mouvements:', err);
      setError('Impossible de charger les mouvements');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getMovementStats();
      setStats(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'in', label: 'Entrées', icon: FiArrowDownLeft, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { id: 'out', label: 'Sorties', icon: FiArrowUpRight, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
    { id: 'transfer', label: 'Transferts', icon: FiRefreshCw, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ];

  const getCurrentTab = () => tabs.find(t => t.id === activeTab);
  const currentTab = getCurrentTab();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des mouvements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] p-8 text-gray-700 dark:text-gray-200 transition-colors duration-300">
      {/* Header avec stats */}
      <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#44474a] dark:text-gray-100 uppercase tracking-tighter">
            Mouvement de Stock
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gérez les entrées, sorties et transferts de stock
          </p>
        </div>
        
        <div className="flex gap-4">
          {stats && stats.stats && (
            <div className={`${nmInset} px-4 py-2 rounded-xl text-center`}>
              <p className="text-xs text-gray-500">Total mouvements</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.total || 0}</p>
            </div>
          )}
          
          <button
            onClick={() => {
              setMovementType(activeTab);
              setShowAddModal(true);
            }}
            className={`${nmFlat} ${nmButton} px-6 py-3 rounded-2xl flex items-center gap-2 font-bold text-indigo-600`}
          >
            <FiPlus size={20} />
            Ajouter un mouvement
          </button>
        </div>
      </div>

      {/* Neumorphic Tabs */}
      <div className="mb-8">
        <div className={`${nmFlat} rounded-2xl p-2 inline-flex flex-wrap gap-2`}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  isActive 
                    ? `${nmInset} ${tab.color} scale-95 ${tab.bg}` 
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                }`}
              >
                <TabIcon className={`mr-2 stroke-[3px] ${isActive ? 'opacity-100' : 'opacity-40'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className={`${nmInset} p-4 rounded-2xl text-red-600 text-center mb-8`}>
          {error}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {movements.map((m) => {
          const TabIcon = currentTab.icon;
          return (
            <div 
              key={m.id} 
              className={`${nmFlat} rounded-[2rem] p-6 hover:scale-[1.02] transition-transform duration-300 flex flex-col`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div className={`${nmInset} p-4 rounded-2xl ${currentTab.bg}`}>
                  <FiPackage size={24} className={currentTab.color} />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-gray-800 dark:text-gray-100">
                    {m.quantity}
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Unités</p>
                </div>
              </div>

              {/* Product Name */}
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 truncate">
                {m.productName}
              </h3>

              {/* Details Section */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <FiCalendar className="mr-2" />
                  <span>{formatDate(m.movementDate)}</span>
                </div>
                
                <div className={`flex items-center justify-between p-3 rounded-xl ${currentTab.bg}`}>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-gray-400">Source</span>
                    <span className="text-sm font-semibold truncate max-w-[100px]">
                      {m.sourceZoneName || '-'}
                    </span>
                  </div>
                  <div className="px-2">
                    <TabIcon size={16} className={currentTab.color} />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] uppercase font-bold text-gray-400">Destination</span>
                    <span className="text-sm font-semibold truncate max-w-[100px]">
                      {m.destinationZoneName || '-'}
                    </span>
                  </div>
                </div>

                {m.reason && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-bold">Motif:</span> {m.reason}
                  </div>
                )}
                
                {m.reference && (
                  <div className="text-[10px] text-gray-400">
                    Réf: {m.reference}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-gray-300/30 dark:border-white/5 flex justify-between items-center">
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${currentTab.color}`}>
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                  <span>
                    {activeTab === 'in' ? 'Entrée confirmée' : 
                     activeTab === 'out' ? 'Sortie effectuée' : 
                     'Transfert complété'}
                  </span>
                </div>
                <span className="text-[9px] text-gray-400">
                  Par: {m.userName}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {movements.length === 0 && !error && (
        <div className={`${nmInset} rounded-[2rem] p-20 text-center`}>
          <div className={`inline-block p-6 rounded-full ${currentTab.bg} mb-4`}>
            <currentTab.icon size={48} className={currentTab.color} />
          </div>
          <p className="text-gray-400 font-bold italic mb-4">
            Aucun mouvement {currentTab.label.toLowerCase()} trouvé
          </p>
          <button
            onClick={() => {
              setMovementType(activeTab);
              setShowAddModal(true);
            }}
            className={`${nmFlat} ${nmButton} px-6 py-3 rounded-2xl flex items-center gap-2 font-bold text-indigo-600 mx-auto`}
          >
            <FiPlus size={20} />
            Ajouter une {currentTab.label.toLowerCase()}
          </button>
        </div>
      )}

      {/* Modal d'ajout */}
      <AddMovement
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchMovements();
          fetchStats();
        }}
        type={movementType}
      />
    </div>
  );
};

export default Movements;