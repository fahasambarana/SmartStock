// pages/Reports.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDownload, 
  FiCalendar, 
  FiTrendingUp, 
  FiAlertCircle, 
  FiFileText, 
  FiLoader,
  FiChevronRight,
  FiPrinter,
  FiMail
} from 'react-icons/fi';
import api from '../services/api';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportType, setReportType] = useState('inventory');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Styles neumorphismes
  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";
  const nmButton = "active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] transition-all duration-200";

  const reportTypes = [
    { id: 'inventory', name: 'Inventaire complet', icon: FiFileText, description: 'Rapport détaillé de tous les produits avec anomalies détectées' },
    { id: 'movements', name: 'Mouvements de stock', icon: FiTrendingUp, description: 'Historique des entrées, sorties et transferts' },
    { id: 'alerts', name: 'Alertes critiques', icon: FiAlertCircle, description: 'Produits en stock bas, expirations et anomalies' }
  ];

  const periods = [
    { id: 'week', name: 'Semaine dernière', days: 7 },
    { id: 'month', name: 'Mois dernier', days: 30 },
    { id: 'quarter', name: 'Trimestre dernier', days: 90 },
    { id: 'year', name: 'Année dernière', days: 365 }
  ];

  const handlePreview = async () => {
    setLoading(true);
    try {
      let response;
      if (reportType === 'inventory') {
        response = await api.get(`/reports/inventory/preview?period=${selectedPeriod}`);
      } else if (reportType === 'movements') {
        response = await api.get(`/reports/movements/preview?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      } else {
        response = await api.get(`/reports/alerts/preview`);
      }
      setPreview(response.data.data);
    } catch (error) {
      console.error('Erreur preview:', error);
      alert('Erreur lors du chargement de l\'aperçu');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (format = 'pdf') => {
    setExporting(true);
    try {
      let url = '';
      if (reportType === 'inventory') {
        url = `/reports/inventory/${format}?period=${selectedPeriod}`;
      } else if (reportType === 'movements') {
        url = `/reports/movements/${format}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      } else {
        url = `/reports/alerts/${format}`;
      }
      
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `rapport_${reportType}_${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export du PDF');
    } finally {
      setExporting(false);
    }
  };

  const getRiskColor = (severity) => {
    switch(severity) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getRiskBadge = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    }
  };

  const currentReportType = reportTypes.find(r => r.id === reportType);
  const currentPeriod = periods.find(p => p.id === selectedPeriod);

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] p-8 text-gray-700 dark:text-gray-200 transition-colors duration-300">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-gray-700 dark:text-gray-100 uppercase tracking-tighter flex items-center gap-3">
          <FiFileText className="text-indigo-600 dark:text-indigo-400" />
          Rapports & Export PDF
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Générer et exporter des rapports détaillés au format PDF
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panneau de configuration - Colonne de gauche */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className={`${nmFlat} rounded-2xl p-6 sticky top-8`}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FiCalendar className="text-indigo-600" />
              Configuration
            </h2>

            {/* Type de rapport */}
            <div className="mb-6">
              <label className="block text-sm font-bold mb-3 text-gray-600 dark:text-gray-400">
                Type de rapport
              </label>
              <div className="space-y-3">
                {reportTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`
                      w-full p-4 rounded-xl text-left transition-all duration-200
                      ${reportType === type.id 
                        ? `${nmInset} text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800`
                        : `${nmFlat} text-gray-600 dark:text-gray-400 hover:scale-[1.02]`
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <type.icon size={20} />
                      <div>
                        <p className="font-bold text-sm">{type.name}</p>
                        <p className="text-xs opacity-70">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Période (pour inventaire) */}
            {reportType === 'inventory' && (
              <div className="mb-6">
                <label className="block text-sm font-bold mb-3 text-gray-600 dark:text-gray-400">
                  Période d'analyse
                </label>
                <div className="flex flex-wrap gap-2">
                  {periods.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedPeriod(period.id)}
                      className={`
                        px-4 py-2 rounded-xl text-sm font-bold transition-all
                        ${selectedPeriod === period.id 
                          ? `${nmInset} text-indigo-600 dark:text-indigo-400`
                          : `${nmFlat} text-gray-600 dark:text-gray-400`
                        }
                      `}
                    >
                      {period.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date range (pour mouvements) */}
            {reportType === 'movements' && (
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-600 dark:text-gray-400">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className={`${nmInset} w-full p-3 rounded-xl bg-transparent outline-none text-gray-700 dark:text-gray-200`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-600 dark:text-gray-400">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className={`${nmInset} w-full p-3 rounded-xl bg-transparent outline-none text-gray-700 dark:text-gray-200`}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handlePreview}
                disabled={loading}
                className={`flex-1 ${nmInset} py-3 rounded-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2`}
              >
                {loading ? <FiLoader className="animate-spin" /> : <FiChevronRight />}
                Aperçu
              </button>
              <button
                onClick={() => handleExportPDF('pdf')}
                disabled={exporting || !preview}
                className={`flex-1 ${nmFlat} py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-green-600 dark:text-green-400 ${(!preview || exporting) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {exporting ? <FiLoader className="animate-spin" /> : <FiDownload />}
                PDF
              </button>
            </div>

            {/* Actions supplémentaires */}
            <div className="flex gap-3 mt-3">
              <button
                disabled={!preview}
                className={`flex-1 ${nmFlat} py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-gray-500 ${!preview ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FiPrinter /> Imprimer
              </button>
              <button
                disabled={!preview}
                className={`flex-1 ${nmFlat} py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-gray-500 ${!preview ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FiMail /> Envoyer
              </button>
            </div>
          </div>
        </motion.div>

        {/* Aperçu du rapport - Colonne de droite */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className={`${nmFlat} rounded-2xl p-6`}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-indigo-600" />
              Aperçu du rapport
              {currentReportType && (
                <span className="text-xs font-normal text-gray-400 ml-2">
                  {currentReportType.name}
                </span>
              )}
            </h2>

            {loading ? (
              <div className={`${nmInset} p-20 text-center`}>
                <FiLoader className="animate-spin text-3xl text-indigo-600 mx-auto mb-4" />
                <p className="text-gray-500">Génération de l'aperçu...</p>
              </div>
            ) : preview ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                
                {/* Résumé */}
                <div className={`${nmInset} p-5 rounded-xl`}>
                  <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-gray-500">Résumé</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Total produits</p>
                      <p className="text-2xl font-bold">{preview.summary?.totalProducts || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Valeur totale</p>
                      <p className="text-2xl font-bold">{preview.summary?.totalValue?.toLocaleString() || 0} €</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Anomalies</p>
                      <p className={`text-2xl font-bold ${preview.summary?.anomaliesCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {preview.summary?.anomaliesCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Précision</p>
                      <p className="text-2xl font-bold text-green-500">{preview.summary?.accuracyRate || 100}%</p>
                    </div>
                  </div>
                </div>

                {/* Anomalies */}
                {preview.anomalies && preview.anomalies.length > 0 && (
                  <div className={`${nmInset} p-5 rounded-xl`}>
                    <h3 className="font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-red-500">
                      <FiAlertCircle /> Anomalies détectées ({preview.anomalies.length})
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {preview.anomalies.map((anomaly, idx) => (
                        <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{anomaly.productName}</p>
                              <p className="text-xs text-gray-500">
                                Différence: {anomaly.difference > 0 ? '+' : ''}{anomaly.difference} unités
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${getRiskBadge(anomaly.severity)}`}>
                              {anomaly.severity}
                            </span>
                          </div>
                          <p className="text-xs mt-1 text-indigo-600 dark:text-indigo-400">{anomaly.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommandations IA */}
                {preview.recommendations && preview.recommendations.length > 0 && (
                  <div className={`${nmInset} p-5 rounded-xl`}>
                    <h3 className="font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-blue-500">
                      <FiTrendingUp /> Recommandations IA
                    </h3>
                    <div className="space-y-2">
                      {preview.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                          <span className="text-lg">{rec.priority === 'high' ? '🔴' : '🟡'}</span>
                          <span>{rec.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statistiques des mouvements */}
                {preview.stats && (
                  <div className={`${nmInset} p-5 rounded-xl`}>
                    <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-gray-500">Statistiques</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <p className="text-2xl font-bold text-green-600">{preview.stats.totalIn || 0}</p>
                        <p className="text-xs text-gray-500">Entrées</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <p className="text-2xl font-bold text-red-600">{preview.stats.totalOut || 0}</p>
                        <p className="text-xs text-gray-500">Sorties</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info génération */}
                <div className="text-center text-xs text-gray-400 pt-4">
                  Généré le {new Date().toLocaleString('fr-FR')}
                </div>
              </div>
            ) : (
              <div className={`${nmInset} p-20 text-center`}>
                <FiFileText className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  Cliquez sur "Aperçu" pour visualiser le rapport
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Sélectionnez un type de rapport et une période
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;