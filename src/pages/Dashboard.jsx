import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiLayers, FiAlertTriangle, FiActivity, FiPackage, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getFullDashboard } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const EMPTY_MOVEMENT_CHART = {
  labels: [],
  datasets: [
    { label: 'Entrées', data: [], backgroundColor: '#3b82f6' },
    { label: 'Sorties', data: [], backgroundColor: '#f43f5e' },
  ],
};

const EMPTY_ZONE_CHART = {
  labels: ['Aucune donnée'],
  datasets: [
    {
      data: [1],
      backgroundColor: ['#cbd5e1'],
    },
  ],
  details: [],
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const response = await getFullDashboard();
      setData(response.data.dashboard);
      setError(null);
    } catch (error) {
      console.error("Erreur dashboard data:", error);
      setError("Impossible de charger les données du dashboard");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  const movementChart = data?.movementChart || EMPTY_MOVEMENT_CHART;
  const zoneChart = data?.zoneChart?.labels?.length ? data.zoneChart : EMPTY_ZONE_CHART;
  const zoneDetails = data?.zoneChart?.details || [];
  const updatedAt = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '--:--';
  const currentRole = user?.role?.toLowerCase?.() || '';
  const sessionLabel = currentRole === 'manager' && user?.username
    ? `Session manager: ${user.username}`
    : currentRole === 'admin'
      ? 'Vue administrateur globale'
      : 'Vue utilisateur';

  const managerKpis = [
    { label: 'Stock faible', value: data?.kpis?.lowStock || 0, icon: FiAlertTriangle, color: 'text-red-500' },
    { label: 'Zones', value: data?.kpis?.totalZones || 0, icon: FiMapPin, color: 'text-indigo-600' },
    { label: 'Produits', value: data?.kpis?.totalProducts || 0, icon: FiPackage, color: 'text-blue-600' },
  ];

  const adminKpis = [
    { label: 'Managers', value: data?.kpis?.totalManagers || 0, icon: FiUsers, color: 'text-blue-600' },
    { label: 'Catégories', value: data?.kpis?.totalCategories || 0, icon: FiLayers, color: 'text-indigo-600' },
    { label: 'Occupation zones', value: data?.kpis?.occupation || '0%', icon: FiActivity, color: 'text-green-500' },
  ];

  const kpis = currentRole === 'admin' ? adminKpis : managerKpis;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-700 dark:text-gray-100 uppercase tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {sessionLabel} • Dernière mise à jour: {updatedAt}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchDashboardData}
          disabled={isRefreshing}
          className={`${nmFlat} px-5 py-3 rounded-2xl text-indigo-600 font-bold flex items-center gap-2 disabled:opacity-60`}
        >
          <FiRefreshCw className={isRefreshing ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className={`${nmInset} p-4 rounded-2xl text-red-600 text-sm font-semibold`}>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${nmFlat} p-6 rounded-[2rem] flex items-center justify-between group`}
          >
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className="text-3xl font-black text-gray-700 dark:text-gray-100 tracking-tighter">{kpi.value}</p>
            </div>
            <div className={`${nmInset} p-4 rounded-2xl ${kpi.color}`}>
              <kpi.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts */}
        <div className={`${nmFlat} lg:col-span-3 p-8 rounded-[3rem]`}>
          <h3 className="text-xl font-black text-gray-700 dark:text-gray-100 mb-6 uppercase tracking-tighter">Flux de Stock</h3>
          <div className="h-80">
            <Bar
              data={movementChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.05)' } } }
              }}
            />
          </div>
        </div>

        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`${nmFlat} lg:col-span-2 p-8 rounded-[3rem]`}>
          <h3 className="text-xl font-black text-gray-700 dark:text-gray-100 mb-6 uppercase tracking-tighter">Détail des Zones</h3>
          <div className="space-y-4">
            {zoneDetails.map((zone) => (
              <div key={zone.id} className={`${nmInset} p-4 rounded-2xl`}>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <p className="font-black text-gray-700 dark:text-gray-100">{zone.name}</p>
                    <p className="text-xs text-gray-500">{zone.type} • {zone.location}</p>
                  </div>
                  <span className="text-sm font-black text-indigo-600">{zone.occupation}%</span>
                </div>
                <div className="h-2 bg-gray-300/60 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${Math.min(zone.occupation, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {zone.current} / {zone.max} {zone.unit} • {zone.productCount || 0} produits • stock {zone.totalQuantity || 0}
                </p>
              </div>
            ))}
            {zoneDetails.length === 0 && (
              <p className="text-center text-gray-400 py-10 italic">Aucune zone configurée</p>
            )}
          </div>
        </div>

        {/* AI Alerts */}
        <div className={`${nmFlat} p-8 rounded-[3rem]`}>
          <h3 className="text-xl font-black text-gray-700 dark:text-gray-100 mb-6 uppercase tracking-tighter">Alertes IA Critiques</h3>
          <div className="space-y-4">
            {data?.recentAlerts?.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className={`${nmInset} p-4 rounded-2xl relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${alert.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <h4 className="text-sm font-black text-gray-700 dark:text-gray-200 mb-1">{alert.productName}</h4>
                <p className="text-[11px] text-gray-500 leading-tight">{alert.message}</p>
                <p className="text-[10px] text-gray-400 mt-2">
                  Stock: {alert.currentStock} • Zone: {alert.zone}
                </p>
              </motion.div>
            ))}
            {(!data?.recentAlerts || data.recentAlerts.length === 0) && (
              <p className="text-center text-gray-400 py-10 italic">Aucune alerte critique</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
