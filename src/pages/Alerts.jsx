import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiInfo, FiBell, FiCpu, FiTrendingUp, FiClock, FiActivity, FiCheckCircle } from 'react-icons/fi';
import { getAIProductAlerts, getAIZoneAlerts, getAIDashboardAlerts } from '../services/api';

const Alerts = () => {
  const [productAlerts, setProductAlerts] = useState([]);
  const [zoneAlerts, setZoneAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";
  const nmButton = "active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] transition-all duration-200";

  useEffect(() => {
    fetchAlerts();
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
      console.error("Erreur IA:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- NOUVELLE FONCTIONNALITÉ : RÉSOUDRE L'ALERTE ---
  const handleAction = (id, type) => {
    // Ici, vous pouvez ajouter un appel API pour marquer l'alerte comme traitée
    // Pour l'instant, on simule en filtrant localement l'alerte traitée
    if (type === 'product') {
      setProductAlerts(prev => prev.filter(a => a.productId !== id));
    } else {
      setZoneAlerts(prev => prev.filter(a => a.zoneId !== id));
    }
    alert("L'alerte a été marquée comme traitée.");
  };

  const getRiskStyle = (score) => {
    if (score >= 75) return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200";
    if (score >= 50) return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200";
    return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200";
  };

  const getPriorityBadge = (priority) => {
    if (priority === 1) return { label: 'CRITIQUE', color: 'text-red-500 border-red-500' };
    if (priority === 2) return { label: 'ÉLEVÉ', color: 'text-amber-500 border-amber-500' };
    return { label: 'NORMAL', color: 'text-blue-500 border-blue-500' };
  };

  if (loading) return <div className="p-10 text-center font-black text-gray-400">ANALYSE EN COURS...</div>;

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] p-4 md:p-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-5">
          <div className={`${nmFlat} p-4 rounded-[1.5rem]`}>
            <FiBell className="text-indigo-600" size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-700 dark:text-gray-100 uppercase italic tracking-tighter flex items-center gap-3">
              Alertes IA <FiActivity className="text-indigo-500 text-2xl" />
            </h1>
            <p className="text-gray-500 font-medium">Surveillance prédictive par intelligence artificielle</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`${activeTab === 'products' ? nmInset : nmFlat} ${nmButton} px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 ${activeTab === 'products' ? 'text-indigo-600' : 'text-gray-500'}`}
        >
          <FiTrendingUp /> Produits & Stock
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          className={`${activeTab === 'zones' ? nmInset : nmFlat} ${nmButton} px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 ${activeTab === 'zones' ? 'text-indigo-600' : 'text-gray-500'}`}
        >
          <FiClock /> Occupation Zones
        </button>
      </div>

      {/* TABLEAU */}
      <div className={`${nmFlat} rounded-[2.5rem] overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-200/50 dark:border-gray-800/50">
                <th className="p-6">Priorité</th>
                <th className="p-6">{activeTab === 'products' ? 'Produit' : 'Zone'}</th>
                <th className="p-6">Statut IA</th>
                <th className="p-6">Recommandation</th>
                <th className="p-6 text-right">Traiter</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'products' && productAlerts.map((alert) => (
                <tr key={alert.productId} className="group border-b border-gray-200/30 dark:border-gray-800/30">
                  <td className="p-6">
                    <span className={`text-[9px] font-black px-2 py-1 rounded border ${getPriorityBadge(alert.priority).color}`}>
                      {getPriorityBadge(alert.priority).label}
                    </span>
                  </td>
                  <td className="p-6 font-bold text-gray-700 dark:text-gray-100 uppercase italic">
                    {alert.productName}
                  </td>
                  <td className="p-6">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${getRiskStyle(alert.riskScore)}`}>
                      {alert.riskScore}% RISQUE
                    </span>
                  </td>
                  <td className="p-6">
                    <div className={`${nmInset} p-3 rounded-xl text-xs text-gray-500 italic`}>
                      "{alert.recommendation}"
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => handleAction(alert.productId, 'product')}
                      className={`${nmFlat} ${nmButton} p-3 rounded-xl text-green-500 hover:text-green-600 transition-colors`}
                      title="Marquer comme traité"
                    >
                      <FiCheckCircle size={18} strokeWidth={3} />
                    </button>
                  </td>
                </tr>
              ))}

              {activeTab === 'zones' && zoneAlerts.map((alert) => (
                <tr key={alert.zoneId} className="group border-b border-gray-200/30 dark:border-gray-800/30">
                  <td className="p-6"><FiInfo className="text-blue-500" /></td>
                  <td className="p-6 font-bold text-gray-700 dark:text-gray-100 uppercase">{alert.zoneName}</td>
                  <td className="p-6 font-black text-xs text-gray-500">{alert.capacityPercent}% OCCUPÉ</td>
                  <td className="p-6 italic text-xs text-gray-400">{alert.recommendation}</td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => handleAction(alert.zoneId, 'zone')}
                      className={`${nmFlat} ${nmButton} p-3 rounded-xl text-green-500`}
                    >
                      <FiCheckCircle size={18} strokeWidth={3} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(activeTab === 'products' ? productAlerts : zoneAlerts).length === 0 && (
            <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
              ✅ Tout est sous contrôle
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;