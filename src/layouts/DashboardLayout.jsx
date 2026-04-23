import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

const DashboardLayout = ({ children }) => {
  return (
    /* Ajout de dark:bg-[#1a1d23] et transition pour la fluidité */
    <div className="flex h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] font-sans selection:bg-blue-200 transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-72">
        <Navbar />
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8"
        >
          {/* Le contenu (children) profitera aussi du mode sombre */}
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;