import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiX } from 'react-icons/fi';

const DashboardLayout = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter les écrans mobiles
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
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
          {children}
        </motion.main>
      </div>

      {/* Bouton flottant du ChatBot */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)] hover:scale-105 active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] transition-all duration-300 group"
        >
          <div className="relative">
            <FiMessageSquare className="text-indigo-600 dark:text-indigo-400" size={28} />
            {/* Indicateur de notification (optionnel) */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </div>
        </button>
      )}

      {/* Fenêtre du ChatBot */}
      {isChatOpen && (
        <div className={`fixed ${isMobile ? 'inset-0' : 'bottom-6 right-6'} z-50 ${isMobile ? 'w-full h-full' : 'w-96 h-[600px]'} rounded-2xl overflow-hidden shadow-2xl transition-all duration-300`}>
          <div className="relative h-full">
            <ChatBot onClose={() => setIsChatOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;