// components/InventoryCalendar.jsx
import React, { useState } from 'react';
import { FiRefreshCw, FiCalendar, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiPackage, FiClock } from 'react-icons/fi';
import api from '../services/api';

const InventoryCalendar = () => {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState(null);

  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff]";

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
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] p-8">
      <h1 className="text-3xl font-black text-gray-700 dark:text-gray-200 mb-8 flex items-center gap-3">
        <FiCalendar className="text-indigo-500" />
        Calendrier d'Inventaire Automatique
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panneau de contrôle */}
        <div className={`${nmFlat} rounded-2xl p-6 lg:col-span-1`}>
          <h2 className="text-xl font-bold mb-6">📊 Générer un inventaire</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Période d'analyse</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={`${nmInset} w-full p-3 rounded-xl bg-transparent outline-none`}
            >
              <option value="week">📅 Semaine dernière</option>
              <option value="month">📆 Mois dernier</option>
              <option value="quarter">🗓️ Trimestre dernier</option>
              <option value="year">📅 Année dernière</option>
            </select>
          </div>

          <button
            onClick={runInventory}
            disabled={loading}
            className={`w-full ${nmInset} py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-indigo-600 disabled:opacity-50`}
          >
            {loading ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <FiRefreshCw />
            )}
            {loading ? 'Analyse en cours...' : 'Lancer l\'analyse IA'}
          </button>

          <div className="mt-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
            <p className="text-xs text-gray-500 mb-2">🤖 Comment ça marche ?</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              L'IA analyse automatiquement tous les mouvements de stock pour 
              détecter les anomalies, les produits périmés et générer des 
              recommandations personnalisées.
            </p>
          </div>
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
                <p className="text-sm text-gray-500 mb-2">Score de santé du stock</p>
                <div className="flex items-center justify-center gap-3">
                  <div className={`text-5xl font-bold ${getHealthColor(inventory.summary.healthScore)}`}>
                    {inventory.summary.healthScore}
                  </div>
                  <div className="text-sm text-gray-500">/ 100</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${inventory.summary.healthScore}%` }}
                  />
                </div>
              </div>

              {/* Statistiques clés */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`${nmInset} p-3 rounded-xl text-center`}>
                  <FiPackage className="mx-auto mb-1 text-blue-500" size={20} />
                  <p className="text-2xl font-bold">{inventory.summary.totalProducts}</p>
                  <p className="text-xs text-gray-500">Produits</p>
                </div>
                <div className={`${nmInset} p-3 rounded-xl text-center`}>
                  <FiAlertCircle className="mx-auto mb-1 text-red-500" size={20} />
                  <p className="text-2xl font-bold text-red-500">{inventory.summary.anomaliesCount}</p>
                  <p className="text-xs text-gray-500">Anomalies</p>
                </div>
                <div className={`${nmInset} p-3 rounded-xl text-center`}>
                  <FiClock className="mx-auto mb-1 text-orange-500" size={20} />
                  <p className="text-2xl font-bold text-orange-500">{inventory.summary.expiringProducts}</p>
                  <p className="text-xs text-gray-500">À expirer</p>
                </div>
                <div className={`${nmInset} p-3 rounded-xl text-center`}>
                  <FiCheckCircle className="mx-auto mb-1 text-green-500" size={20} />
                  <p className="text-2xl font-bold">{inventory.summary.accuracyRate}%</p>
                  <p className="text-xs text-gray-500">Précision</p>
                </div>
              </div>

              {/* Anomalies détectées */}
              {inventory.anomalies.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold flex items-center gap-2">
                    <FiAlertCircle className="text-red-500" />
                    Anomalies détectées ({inventory.anomalies.length})
                  </h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {inventory.anomalies.slice(0, 10).map((a, idx) => (
                      <div key={idx} className={`p-3 rounded-xl ${getSeverityColor(a.severity)}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm">{a.productName}</p>
                            <p className="text-xs mt-1">{a.recommendation}</p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            a.difference > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {a.difference > 0 ? `+${a.difference}` : a.difference}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommandations IA */}
              {inventory.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold flex items-center gap-2">
                    <FiTrendingUp className="text-blue-500" />
                    Recommandations IA
                  </h3>
                  <div className="space-y-2">
                    {inventory.recommendations.map((rec, idx) => (
                      <div key={idx} className={`${nmInset} p-3 rounded-xl`}>
                        <div className="flex items-start gap-2">
                          <span>{rec.priority === 'critical' ? '🔴' : rec.priority === 'high' ? '🟠' : '🟡'}</span>
                          <div>
                            <p className="text-sm font-medium">{rec.message}</p>
                            <p className="text-xs text-gray-500 mt-1">💡 {rec.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Métadonnées */}
              <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                📅 Généré le {new Date(inventory.generatedAt).toLocaleString('fr-FR')} | 
                📊 Période: {inventory.period} |
                🤖 Analyse IA v1.0
              </div>
            </div>
          ) : (
            <div className={`${nmInset} p-12 text-center text-gray-400`}>
              <FiRefreshCw className="mx-auto mb-3 text-3xl opacity-50" />
              <p>Cliquez sur "Lancer l'analyse IA" pour générer un inventaire automatique</p>
              <p className="text-xs mt-2">L'IA analysera tous les mouvements et détectera les anomalies</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryCalendar;