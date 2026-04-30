// Dashboard.js - Version avec données réelles
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiAlertTriangle, FiCalendar, FiTrendingUp, FiLoader } from 'react-icons/fi';
import { Bar, Pie } from 'react-chartjs-2';
import { getFullDashboard } from '../services/api';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#e5e7eb' : '#374151';

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Rafraîchir toutes les minutes
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getFullDashboard();
      if (response.data.success) {
        setDashboardData(response.data.dashboard);
      }
      setError(null);
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
      setError("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          color: textColor,
          font: { weight: 'bold' } 
        } 
      },
    },
    scales: {
      x: { ticks: { color: textColor } },
      y: { ticks: { color: textColor } },
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          color: textColor,
          font: { weight: 'bold' } 
        } 
      },
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading && !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto pb-10 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto pb-10">
        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 p-4 rounded-2xl text-center">
          {error}
        </div>
      </div>
    );
  }

  const kpis = [
    { title: 'Total Produits', value: dashboardData?.kpis.totalProducts || '0', icon: FiPackage, color: 'text-blue-500' },
    { title: 'Stock Faible', value: dashboardData?.kpis.lowStock || '0', icon: FiAlertTriangle, color: 'text-red-500' },
    { title: 'Périssables', value: dashboardData?.kpis.perishable || '0', icon: FiCalendar, color: 'text-amber-500' },
    { title: 'Occupation %', value: dashboardData?.kpis.occupation || '0%', icon: FiTrendingUp, color: 'text-emerald-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <motion.h1 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="text-3xl font-black text-gray-700 dark:text-gray-200 mb-8 tracking-tighter uppercase transition-colors"
      >
        Tableau de Bord
      </motion.h1>

      {/* KPI Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
      >
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="p-6 rounded-[2rem] bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_18px_#babecc,-9px_-9px_18px_#ffffff] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)] transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{kpi.title}</p>
                <p className="text-2xl font-black text-gray-700 dark:text-gray-200">{kpi.value}</p>
              </div>
              <div className="p-3 rounded-xl shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_3px_3px_6px_#0e1013,inset_-3px_-3px_6px_rgba(255,255,255,0.05)]">
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#e0e5ec] dark:bg-[#1a1d23] rounded-[2.5rem] p-8 shadow-[12px_12px_24px_#babecc,-12px_-12px_24px_#ffffff] dark:shadow-[10px_10px_20px_#0e1013,-10px_-10px_20px_rgba(255,255,255,0.05)] h-[400px] transition-all"
        >
          {dashboardData?.movementChart && (
            <Bar data={dashboardData.movementChart} options={commonOptions} />
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#e0e5ec] dark:bg-[#1a1d23] rounded-[2.5rem] p-8 shadow-[12px_12px_24px_#babecc,-12px_-12px_24px_#ffffff] dark:shadow-[10px_10px_20px_#0e1013,-10px_-10px_20px_rgba(255,255,255,0.05)] h-[400px] transition-all"
        >
          {dashboardData?.zoneChart && (
            <Pie data={dashboardData.zoneChart} options={pieOptions} />
          )}
        </motion.div>
      </div>

      {/* Alertes Récentes */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#e0e5ec] dark:bg-[#1a1d23] rounded-[3rem] p-10 shadow-[15px_15px_30px_#babecc,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e1013,-10px_-10px_30px_rgba(255,255,255,0.05)] transition-all"
      >
        <h3 className="text-xl font-black text-gray-700 dark:text-gray-200 mb-8 uppercase tracking-widest">Alertes de Stock</h3>
        <div className="space-y-6">
          {dashboardData?.recentAlerts && dashboardData.recentAlerts.length > 0 ? (
            dashboardData.recentAlerts.map((alert) => (
              <motion.div 
                key={alert.id}
                whileHover={{ x: 10 }}
                className="p-5 rounded-2xl bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#babecc,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)] flex items-center border border-white/20 dark:border-white/5 transition-all"
              >
                <div className="w-10 h-10 rounded-full shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] dark:shadow-[2px_2px_5px_#0e1013] flex items-center justify-center mr-4 bg-[#e0e5ec] dark:bg-[#1a1d23]">
                  <FiAlertTriangle className={`${alert.priority === 1 ? 'text-red-500' : alert.priority === 2 ? 'text-amber-500' : 'text-blue-500'}`} />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-bold">
                  {alert.productName} : {alert.message}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="p-5 text-center text-gray-400">
              ✅ Aucune alerte active - Tout est sous contrôle
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;