import React, { useState, useEffect } from "react";
import { FiUser, FiLogOut, FiSun, FiMoon } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Modal from "./Modal";

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // État pour le mode sombre
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Effet pour appliquer la classe 'dark' au document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="px-6 py-4 flex justify-between items-center bg-[#e0e5ec] dark:bg-[#1a1d23] mx-6 mt-4 rounded-2xl shadow-[6px_6px_12px_#babecc,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)] transition-colors duration-300">
      
      {/* Titre de la page */}
      <motion.h2 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-lg font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest"
      >
        Tableau de Bord
      </motion.h2>

      <div className="flex items-center space-x-6">
        
        {/* BOUTON DARK MODE - Style Neumorphisme */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center
            ${darkMode 
              ? "bg-[#1a1d23] shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)] text-yellow-400" 
              : "bg-[#e0e5ec] shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] text-indigo-600"
            }`}
        >
          {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </motion.button>

        {/* Badge Utilisateur */}
        <div className="flex items-center space-x-3 px-4 py-2 rounded-xl shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#0e1013,inset_-3px_-3px_6px_rgba(255,255,255,0.05)] bg-[#e0e5ec] dark:bg-[#1a1d23]">
          <div className="p-1 rounded-full bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[2px_2px_5px_#babecc,-2px_-2px_5px_#ffffff] dark:shadow-[2px_2px_5px_#0e1013,-2px_-2px_5px_rgba(255,255,255,0.05)]">
            <FiUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-gray-600 dark:text-gray-300 font-bold text-sm tracking-tight">
            {user?.role || "Utilisateur"}
          </span>
        </div>

        {/* Bouton Déconnexion */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="p-3 rounded-xl bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1013,-4px_-4px_8px_rgba(255,255,255,0.05)] text-red-500 hover:text-red-600 transition-colors"
        >
          <FiLogOut className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Modal de confirmation */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Déconnexion"
      >
        <p className="text-gray-600 dark:text-gray-300 font-medium mb-8 leading-relaxed">
          Êtes-vous sûr de vouloir quitter votre session **Smart-STOCK** ?
        </p>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-6 py-2 text-gray-500 dark:text-gray-400 font-bold rounded-xl shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1013,-4px_-4px_8px_rgba(255,255,255,0.05)]"
          >
            Annuler
          </button>
          
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl shadow-[4px_4px_10px_rgba(239,68,68,0.3)]"
          >
            Se déconnecter
          </button>
        </div>
      </Modal>
    </header>
  );
};

export default Navbar;