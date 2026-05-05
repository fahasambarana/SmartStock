// Dashboard.js - Version avec Graphique d'occupation
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiAlertTriangle, FiCalendar, FiTrendingUp, FiLoader, FiPieChart } from 'react-icons/fi';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
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
    const interval = setInterval(fetchDashboardData, 60000);
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

  // --- LOGIQUE DU GRAPHIQUE D'OCCUPATION ---
  const getOccupationData = () => {
    // On récupère le pourcentage d'occupation depuis les KPIs (ex: "75%")
    const occupationStr = dashboardData?.kpis.occupation || '0%';
    const occupiedValue = parseFloat(occupationStr.replace('%', ''));
    const freeValue = 100 - occupiedValue;

    return {
      labels: ['Espace Occupé', 'Espace Libre'],
      datasets: [{
        data: [occupiedValue, freeValue],
        backgroundColor: [
          isDark ? '#4f46e5' : '#6366f1', // Indigo pour occupé
          isDark ? '#1f2937' : '#d1d5db', // Gris pour libre
        ],
        borderWidth: 0,
        hoverOffset: 10
      }]
    };
  };

  const occupationOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', // Transforme le cercle en anneau (Doughnut)
    plugins: {
      legend: { position: 'bottom', labels: { color: textColor, font: { weight: 'bold' } } },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw}%`
        }
      }
    }
  };
  // ------------------------------------------

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: textColor, font: { weight: 'bold' } } },
    },
    scales: {
      x: { ticks: { color: textColor }, grid: { display: false } },
      y: { ticks: { color: textColor }, grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } },
    }
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
        Tableau de Bord Manager
      </motion.h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i}
            whileHover={{ scale: 1.03 }}
            className="p-6 rounded-[2rem] bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_18px_#babecc,-9px_-9px_18px_#ffffff] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]"
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
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Flux de Stock */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#e0e5ec] dark:bg-[#1a1d23] rounded-[2.5rem] p-8 shadow-[12px_12px_24px_#babecc,-12px_-12px_24px_#ffffff] dark:shadow-[10px_10px_20px_#0e1013,-10px_-10px_20px_rgba(255,255,255,0.05)] h-[450px]"
        >
          <h3 className="text-sm font-black text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
            <FiTrendingUp /> Flux Entrées/Sorties
          </h3>
          <div className="h-[320px]">
            {dashboardData?.movementChart && (
              <Bar data={dashboardData.movementChart} options={commonOptions} />
            )}
          </div>
        </motion.div>

        {/* Occupation des Zones (Cercle) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#e0e5ec] dark:bg-[#1a1d23] rounded-[2.5rem] p-8 shadow-[12px_12px_24px_#babecc,-12px_-12px_24px_#ffffff] dark:shadow-[10px_10px_20px_#0e1013,-10px_-10px_20px_rgba(255,255,255,0.05)] h-[450px]"
        >
          <h3 className="text-sm font-black text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
            <FiPieChart /> Occupation Globale des Zones
          </h3>
          <div className="h-[320px] relative">
            <Doughnut data={getOccupationData()} options={occupationOptions} />
            {/* Texte au centre de l'anneau */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-gray-700 dark:text-gray-200">
                {dashboardData?.kpis.occupation}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Occupé</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Alertes Récentes */}
      {/* ... (votre code d'alertes reste identique) */}
    </div>
  );
};

export default Dashboard;