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
  // 1. Définition des données pour les graphiques
  const stockMovementData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Entrées',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: '#3b82f6', // Bleu
        borderRadius: 8,
      },
      {
        label: 'Sorties',
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: '#f43f5e', // Rouge/Rose
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
      legend: { position: 'bottom', labels: { font: { weight: 'bold' } } },
    },
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
        className="text-3xl font-black text-gray-700 mb-8 tracking-tighter uppercase"
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
            className="p-6 rounded-[2rem] bg-[#e0e5ec] shadow-[9px_9px_18px_#babecc,-9px_-9px_18px_#ffffff]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.title}</p>
                <p className="text-2xl font-black text-gray-700">{kpi.value}</p>
              </div>
              <div className="p-3 rounded-xl shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]">
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts - Ici les erreurs sont corrigées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#e0e5ec] rounded-[2.5rem] p-8 shadow-[12px_12px_24px_#babecc,-12px_-12px_24px_#ffffff] h-[400px]"
        >
          <Bar data={stockMovementData} options={commonOptions} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#e0e5ec] rounded-[2.5rem] p-8 shadow-[12px_12px_24px_#babecc,-12px_-12px_24px_#ffffff] h-[400px]"
        >
          <Pie data={zoneOccupationData} options={commonOptions} />
        </motion.div>
      </div>

      {/* Alertes Récentes */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#e0e5ec] rounded-[3rem] p-10 shadow-[15px_15px_30px_#babecc,-15px_-15px_30px_#ffffff]"
      >
        <h3 className="text-xl font-black text-gray-700 mb-8 uppercase tracking-widest">Alertes de Stock</h3>
        <div className="space-y-6">
          {[1, 2, 3].map((id) => (
            <motion.div 
              key={id}
              whileHover={{ x: 10 }}
              className="p-5 rounded-2xl bg-[#e0e5ec] shadow-[inset_6px_6px_12px_#babecc,inset_-6px_-6px_12px_#ffffff] flex items-center border border-white/20"
            >
              <div className="w-10 h-10 rounded-full shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] flex items-center justify-center mr-4">
                <FiAlertTriangle className="text-amber-500" />
              </div>
              <p className="text-gray-600 font-bold italic">Incident #{id} : Analyse de stock requise sur la Zone {id}.</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;