import React, { useState } from "react";
import { FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Modal from "./Modal";

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="px-6 py-4 flex justify-between items-center bg-[#e0e5ec] mx-6 mt-4 rounded-2xl shadow-[6px_6px_12px_#babecc,-6px_-6px_12px_#ffffff]">
      {/* Titre de la page avec style moderne */}
      <motion.h2 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-lg font-black text-gray-700 uppercase tracking-widest"
      >
        Tableau de Bord
      </motion.h2>

      <div className="flex items-center space-x-6">
        {/* Badge Utilisateur - Style "Inset" (creusé) */}
        <div className="flex items-center space-x-3 px-4 py-2 rounded-xl shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff] bg-[#e0e5ec]">
          <div className="p-1 rounded-full bg-[#e0e5ec] shadow-[2px_2px_5px_#babecc,-2px_-2px_5px_#ffffff]">
            <FiUser className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-gray-600 font-bold text-sm tracking-tight">
            {user?.role || "Utilisateur"}
          </span>
        </div>

        {/* Bouton Déconnexion - Style "Extruded" (relief) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, shadow: "inset 4px 4px 8px #babecc" }}
          onClick={() => setIsModalOpen(true)}
          className="p-3 rounded-xl bg-[#e0e5ec] shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] text-red-500 hover:text-red-600 transition-colors"
        >
          <FiLogOut className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Modal de confirmation personnalisée */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Déconnexion"
      >
        <p className="text-gray-600 font-medium mb-8 leading-relaxed">
          Êtes-vous sûr de vouloir quitter votre session **Smart-STOCK** ?
        </p>
        
        <div className="flex justify-end space-x-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(false)}
            className="px-6 py-2 text-gray-500 font-bold rounded-xl shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#babecc]"
          >
            Annuler
          </motion.button>
          
          <motion.button
            whileHover={{ backgroundColor: "#ef4444" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl shadow-[4px_4px_10px_rgba(239,68,68,0.3)]"
          >
            Se déconnecter
          </motion.button>
        </div>
      </Modal>
    </header>
  );
};

export default Navbar;