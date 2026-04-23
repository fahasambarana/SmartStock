import React from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiAlertTriangle, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  // Détecter si on est en mode sombre pour les graphiques
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#e5e7eb' : '#374151'; // gray-200 : gray-700

  // 1. Définition des données pour les graphiques
  const stockMovementData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Entrées',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: '#3b82f6', 
        borderRadius: 8,
      },
      {
        label: 'Sorties',
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: '#f43f5e', 
        borderRadius: 8,
      },
    ],
  };

  const zoneOccupationData = {
    labels: ['Zone A', 'Zone B', 'Zone C', 'Zone D'],
    datasets: [
      {
        data: [85, 70, 60, 45],
        backgroundColor: ['#f43f5e', '#3b82f6', '#fbbf24', '#10b981'],
        borderWidth: 0,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          color: textColor, // Couleur dynamique des légendes
          font: { weight: 'bold' } 
        } 
      },
    },
    scales: {
      x: { ticks: { color: textColor } }, // Couleur dynamique des axes X
      y: { ticks: { color: textColor } }, // Couleur dynamique des axes Y
    }
  };

  // 2. Variantes d'animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const kpis = [
    { title: 'Total Produits', value: '1,234', icon: FiPackage, color: 'text-blue-500' },
    { title: 'Stock Faible', value: '23', icon: FiAlertTriangle, color: 'text-red-500' },
    { title: 'Périssables', value: '12', icon: FiCalendar, color: 'text-amber-500' },
    { title: 'Occupation %', value: '85%', icon: FiTrendingUp, color: 'text-emerald-500' },
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
          <Bar data={stockMovementData} options={commonOptions} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#e0e5ec] dark:bg-[#1a1d23] rounded-[2.5rem] p-8 shadow-[12px_12px_24px_#babecc,-12px_-12px_24px_#ffffff] dark:shadow-[10px_10px_20px_#0e1013,-10px_-10px_20px_rgba(255,255,255,0.05)] h-[400px] transition-all"
        >
          <Pie data={zoneOccupationData} options={commonOptions} />
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
          {[1, 2, 3].map((id) => (
            <motion.div 
              key={id}
              whileHover={{ x: 10 }}
              className="p-5 rounded-2xl bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#babecc,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)] flex items-center border border-white/20 dark:border-white/5 transition-all"
            >
              <div className="w-10 h-10 rounded-full shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] dark:shadow-[2px_2px_5px_#0e1013] flex items-center justify-center mr-4 bg-[#e0e5ec] dark:bg-[#1a1d23]">
                <FiAlertTriangle className="text-amber-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-bold italic">Incident #{id} : Analyse de stock requise sur la Zone {id}.</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;