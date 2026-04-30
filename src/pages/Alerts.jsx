// Alerts.js - Version avec IA
import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiInfo, FiBell, FiChevronRight, FiCpu, FiTrendingUp, FiClock } from 'react-icons/fi';
import { getAIProductAlerts, getAIZoneAlerts, getAIDashboardAlerts } from '../services/api';

const Alerts = () => {
  const [productAlerts, setProductAlerts] = useState([]);
  const [zoneAlerts, setZoneAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";

  useEffect(() => {
    fetchAlerts();
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const [productsRes, zonesRes, dashboardRes] = await Promise.all([
        getAIProductAlerts(),
        getAIZoneAlerts(),
        getAIDashboardAlerts()
      ]);
      
      setProductAlerts(productsRes.data.alerts || []);
      setZoneAlerts(zonesRes.data.alerts || []);
      setSummary(dashboardRes.data.summary);
    } catch (error) {
      console.error("Erreur chargement alertes IA:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskScore) => {
    if (riskScore >= 75) return 'text-red-600 dark:text-red-400';
    if (riskScore >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getPriorityBadge = (priority) => {
    if (priority === 1) return { label: 'URGENT', color: 'bg-red-500' };
    if (priority === 2) return { label: 'HAUTE', color: 'bg-amber-500' };
    if (priority === 3) return { label: 'MOYENNE', color: 'bg-blue-500' };
    return { label: 'NORMALE', color: 'bg-gray-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] flex items-center justify-center">
        <div className="text-center">
          <FiCpu className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Analyse IA en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] p-8 text-gray-700 dark:text-gray-200 transition-colors duration-300">
      {/* Header avec IA badge */}
      <div className="flex items-center mb-6">
        <div className={`${nmFlat} p-4 rounded-2xl mr-5`}>
          <FiBell className="text-indigo-600 dark:text-indigo-400" size={28} />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-[#44474a] dark:text-gray-100 uppercase tracking-tighter">
              Centre d'Alerte IA
            </h1>
            <div className={`${nmInset} px-3 py-1 rounded-full text-xs font-bold text-indigo-600`}>
              <FiCpu className="inline mr-1" size={12} />
              Analyse temps réel
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Alertes intelligentes basées sur l'analyse prédictive
          </p>
        </div>
      </div>

      {/* Résumé IA */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`${nmInset} p-4 rounded-2xl text-center`}>
            <p className="text-xs text-gray-500">Total Alertes</p>
            <p className="text-2xl font-bold text-indigo-600">{summary.totalAlerts}</p>
          </div>
          <div className={`${nmInset} p-4 rounded-2xl text-center`}>
            <p className="text-xs text-gray-500">Alertes Critiques</p>
            <p className="text-2xl font-bold text-red-600">{summary.criticalAlerts}</p>
          </div>
          <div className={`${nmInset} p-4 rounded-2xl text-center`}>
            <p className="text-xs text-gray-500">Anomalies Détectées</p>
            <p className="text-2xl font-bold text-amber-600">{summary.anomaliesFound}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={`${nmFlat} rounded-2xl p-2 inline-flex flex-wrap gap-2 mb-8`}>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'products' ? `${nmInset} text-indigo-600` : 'text-gray-500'
          }`}
        >
          <FiTrendingUp className="inline mr-2" />
          Produits
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'zones' ? `${nmInset} text-indigo-600` : 'text-gray-500'
          }`}
        >
          <FiClock className="inline mr-2" />
          Zones
        </button>
      </div>

      {/* Affichage des alertes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeTab === 'products' && productAlerts.map((alert) => {
          const priority = getPriorityBadge(alert.priority);
          return (
            <div key={alert.productId} className={`${nmFlat} rounded-[2rem] p-6 relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 ${priority.color} text-white px-3 py-1 rounded-bl-2xl text-xs font-bold`}>
                {priority.label}
              </div>
              
              <div className="flex items-start mb-4">
                <div className={`${nmInset} p-3 rounded-xl mr-4`}>
                  <FiAlertTriangle className={getRiskColor(alert.riskScore)} size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{alert.productName}</h3>
                  <p className="text-xs text-gray-500">Stock: {alert.currentStock} unités</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Risque:</span>
                  <span className={`font-bold ${getRiskColor(alert.riskScore)}`}>{alert.riskScore}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Jours estimés:</span>
                  <span className="font-bold">{Math.floor(alert.estimatedDaysLeft)} jours</span>
                </div>
                <div className={`${nmInset} p-3 rounded-xl mt-3`}>
                  <p className="text-sm font-medium">💡 {alert.recommendation}</p>
                </div>
              </div>
            </div>
          );
        })}

        {activeTab === 'zones' && zoneAlerts.map((alert) => (
          <div key={alert.zoneId} className={`${nmFlat} rounded-[2rem] p-6`}>
            <div className="flex items-start mb-4">
              <div className={`${nmInset} p-3 rounded-xl mr-4`}>
                <FiInfo className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{alert.zoneName}</h3>
                <p className="text-xs text-gray-500">Capacité: {alert.capacityPercent}%</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all" 
                style={{ width: `${alert.capacityPercent}%` }}
              ></div>
            </div>
            
            <div className={`${nmInset} p-3 rounded-xl`}>
              <p className="text-sm">{alert.recommendation}</p>
            </div>
          </div>
        ))}
      </div>

      {productAlerts.length === 0 && zoneAlerts.length === 0 && (
        <div className={`${nmInset} rounded-[3rem] p-20 text-center`}>
          <FiCpu className="text-4xl text-green-500 mx-auto mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest">
            ✅ Aucune alerte critique - Analyse IA satisfaisante
          </p>
        </div>
      )}
    </div>
  );
};

export default Alerts;