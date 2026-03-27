import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#e0e5ec] font-sans selection:bg-blue-200">
      <Sidebar />
      <div className="flex-1 flex flex-col  overflow-hidden md:ml-72">
        <Navbar />
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;