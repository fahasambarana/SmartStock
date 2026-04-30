// components/InventoryCalendar.jsx
import React, { useState } from 'react';
import { FiDownload, FiCalendar, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';

const InventoryCalendar = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportType, setReportType] = useState('inventory');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff]";

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      let url = '';
      if (reportType === 'inventory') {
        url = `/reports/inventory/pdf?period=${selectedPeriod}`;
      } else if (reportType === 'movements') {
        url = `/reports/movements/pdf?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      } else {
        url = `/reports/alerts/pdf`;
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
      alert('Erreur lors de l\'export PDF');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/inventory/preview?period=${selectedPeriod}`);
      setPreview(response.data.data);
    } catch (error) {
      console.error('Erreur preview:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] p-8">
      <h1 className="text-3xl font-black text-gray-700 dark:text-gray-200 mb-8">
        📅 Calendrier & Rapports IA
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panneau de contrôle */}
        <div className={`${nmFlat} rounded-2xl p-6 lg:col-span-1`}>
          <h2 className="text-xl font-bold mb-6">Générer un rapport</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Type de rapport</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className={`${nmInset} w-full p-3 rounded-xl bg-transparent outline-none`}
            >
              <option value="inventory">📊 Inventaire complet</option>
              <option value="movements">🔄 Mouvements de stock</option>
              <option value="alerts">⚠️ Alertes critiques</option>
            </select>
          </div>

          {reportType === 'inventory' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Période</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className={`${nmInset} w-full p-3 rounded-xl bg-transparent outline-none`}
              >
                <option value="week">Semaine dernière</option>
                <option value="month">Mois dernier</option>
                <option value="quarter">Trimestre dernier</option>
                <option value="year">Année dernière</option>
              </select>
            </div>
          )}

          {reportType === 'movements' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date début</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className={`${nmInset} w-full p-3 rounded-xl bg-transparent outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date fin</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className={`${nmInset} w-full p-3 rounded-xl bg-transparent outline-none`}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handlePreview}
              disabled={loading}
              className={`flex-1 ${nmInset} py-3 rounded-xl font-bold text-indigo-600`}
            >
              Aperçu
            </button>
            <button
              onClick={handleExportPDF}
              disabled={loading}
              className={`flex-1 ${nmFlat} py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-green-600`}
            >
              {loading ? '⏳' : <FiDownload />}
              PDF
            </button>
          </div>
        </div>

        {/* Aperçu du rapport */}
        <div className={`${nmFlat} rounded-2xl p-6 lg:col-span-2`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiCalendar /> Aperçu du rapport
          </h2>
          
          {preview ? (
            <div className="space-y-4">
              <div className={`${nmInset} p-4 rounded-xl`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total produits</p>
                    <p className="text-2xl font-bold">{preview.summary.totalProducts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Valeur totale</p>
                    <p className="text-2xl font-bold">{preview.summary.totalValue.toLocaleString()} €</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Anomalies</p>
                    <p className="text-2xl font-bold text-red-500">{preview.summary.anomaliesCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Précision</p>
                    <p className="text-2xl font-bold text-green-500">{preview.summary.accuracyRate}%</p>
                  </div>
                </div>
              </div>

              {preview.anomalies.length > 0 && (
                <div className={`${nmInset} p-4 rounded-xl`}>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <FiAlertCircle className="text-red-500" />
                    Anomalies détectées ({preview.anomalies.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {preview.anomalies.slice(0, 5).map((a, i) => (
                      <div key={i} className="text-sm border-b border-gray-200 dark:border-gray-700 pb-2">
                        <p className="font-medium">{a.productName}</p>
                        <p className="text-xs text-gray-500">{a.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {preview.recommendations.length > 0 && (
                <div className={`${nmInset} p-4 rounded-xl`}>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <FiTrendingUp className="text-blue-500" />
                    Recommandations IA
                  </h3>
                  <div className="space-y-2">
                    {preview.recommendations.map((rec, i) => (
                      <div key={i} className="text-sm flex items-start gap-2">
                        <span>{rec.priority === 'high' ? '🔴' : '🟡'}</span>
                        <span>{rec.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`${nmInset} p-8 text-center text-gray-400`}>
              Cliquez sur "Aperçu" pour visualiser le rapport
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryCalendar;