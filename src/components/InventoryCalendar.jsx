// components/InventoryCalendar.jsx
import React, { useState } from 'react';
import { 
  FiRefreshCw, 
  FiCalendar, 
  FiTrendingUp, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiPackage, 
  FiClock,
  FiArrowUp,
  FiArrowDown,
  FiCircle,
  FiInfo // Remplaçant pour FiLightbulb qui n'existe pas dans 'fi'
} from 'react-icons/fi';
import api from '../services/api';

const InventoryCalendar = () => {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState(null);

  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[9px_9px_16px_rgba(0,0,0,0.4),-4px_-4px_10px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.5),inset_-2px_-2px_8px_rgba(255,255,255,0.02)]";

  const runInventory = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/inventory-calendar/preview?period=${period}`);
      if (response.data.success) {
        setInventory(response.data.data);
      }
    } catch (error) {
      console.error('Erreur inventaire:', error);
      alert('Erreur lors de la génération de l\'inventaire');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] p-8 text-gray-700 dark:text-gray-300">
      <h1 className="text-3xl font-black text-gray-700 dark:text-gray-200 mb-8 flex items-center gap-3">
        <FiCalendar className="text-indigo-500" />
        Calendrier d'Inventaire Automatique
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panneau de contrôle */}
        <div className={`${nmFlat} rounded-2xl p-6 lg:col-span-1`}>
          <h2 className="text-xl font-bold mb-6"> Générer un inventaire</h2>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Période d'analyse</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={`${nmInset} w-full p-3 rounded-xl bg-transparent outline-none dark:text-gray-300`}
            >
              <option value="week" className="dark:bg-[#1a1d23]"> Semaine dernière</option>
              <option value="month" className="dark:bg-[#1a1d23]"> Mois dernier</option>
              <option value="quarter" className="dark:bg-[#1a1d23]"> Trimestre dernier</option>
              <option value="year" className="dark:bg-[#1a1d23]"> Année dernière</option>
            </select>
          </div>
          <button
            onClick={runInventory}
            disabled={loading}
            className={`w-full ${nmInset} py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 disabled:opacity-50`}
          >
            {loading ? <FiRefreshCw className="animate-spin" /> : <FiRefreshCw />}
            {loading ? 'Analyse en cours...' : 'Lancer l\'analyse IA'}
          </button>
        </div>

        {/* Résultats de l'inventaire */}
        <div className={`${nmFlat} rounded-2xl p-6 lg:col-span-2`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiTrendingUp /> Résultats de l'analyse IA
          </h2>
          
          {inventory ? (
            <div className="space-y-6">
              {/* Score de santé */}
              <div className={`${nmInset} p-5 rounded-xl text-center`}>
                <div className={`text-5xl font-bold ${getHealthColor(inventory.summary.healthScore)}`}>
                  {inventory.summary.healthScore}
                </div>
              </div>

              {/* Statistiques clés */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`${nmInset} p-3 rounded-xl text-center`}><FiPackage className="mx-auto text-blue-500" /><p>{inventory.summary.totalProducts}</p></div>
                <div className={`${nmInset} p-3 rounded-xl text-center`}><FiAlertCircle className="mx-auto text-red-500" /><p>{inventory.summary.anomaliesCount}</p></div>
                <div className={`${nmInset} p-3 rounded-xl text-center`}><FiClock className="mx-auto text-orange-500" /><p>{inventory.summary.expiringProducts}</p></div>
                <div className={`${nmInset} p-3 rounded-xl text-center`}><FiCheckCircle className="mx-auto text-green-500" /><p>{inventory.summary.accuracyRate}%</p></div>
              </div>

              {/* Anomalies détectées */}
              {inventory.anomalies.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold flex items-center gap-2"><FiAlertCircle className="text-red-500" /> Anomalies</h3>
                  {inventory.anomalies.slice(0, 10).map((a, idx) => (
                    <div key={idx} className={`p-3 rounded-xl ${getSeverityColor(a.severity)}`}>
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold">{a.productName}</p>
                        <span className="flex items-center gap-1 text-xs font-bold">
                          {a.difference > 0 ? <FiArrowUp /> : <FiArrowDown />} {a.difference}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommandations IA */}
              {inventory.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold flex items-center gap-2"><FiTrendingUp className="text-blue-500" /> Recommandations</h3>
                  {inventory.recommendations.map((rec, idx) => (
                    <div key={idx} className={`${nmInset} p-3 rounded-xl`}>
                      <div className="flex items-start gap-3">
                        <FiCircle className={`mt-1 flex-shrink-0 ${rec.priority === 'critical' ? 'text-red-500 fill-red-500' : 'text-orange-500 fill-orange-500'}`} size={12} />
                        <div>
                          <p className="text-sm font-medium">{rec.message}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <FiInfo className="text-indigo-400" size={14} /> {rec.action}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={`${nmInset} p-12 text-center text-gray-400`}>
              <FiRefreshCw className="mx-auto mb-3 text-3xl opacity-50" />
              <p>Lancer l'analyse pour voir les résultats</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryCalendar;