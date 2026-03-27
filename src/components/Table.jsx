import React from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const CardGrid = ({ columns, data, onEdit, onDelete }) => {
  // Variantes pour l'apparition en cascade
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-2"
    >
      {data.map((row, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          whileHover={{ y: -5 }}
          className="bg-[#e0e5ec] rounded-[2rem] p-6 shadow-[9px_9px_16px_#babecc,-9px_-9px_16px_#ffffff] flex flex-col justify-between border border-white/10"
        >
          {/* Contenu de la carte */}
          <div className="space-y-4">
            {columns.map((col) => (
              <div key={col.key} className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {col.label}
                </span>
                <span className="text-gray-700 font-bold text-lg truncate">
                  {row[col.key] || "—"}
                </span>
              </div>
            ))}
          </div>

          {/* Section Actions Neumorphique */}
          <div className="mt-8 pt-6 border-t border-gray-300/30 flex justify-end space-x-4">
            {onEdit && (
              <motion.button
                whileTap={{ scale: 0.9, shadow: "inset 2px 2px 5px #babecc" }}
                onClick={() => onEdit(row)}
                className="p-3 rounded-xl bg-[#e0e5ec] shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] text-blue-600 hover:text-blue-700 transition-colors"
                title="Modifier"
              >
                <FiEdit2 className="w-5 h-5" />
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                whileTap={{ scale: 0.9, shadow: "inset 2px 2px 5px #babecc" }}
                onClick={() => onDelete(row)}
                className="p-3 rounded-xl bg-[#e0e5ec] shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] text-red-500 hover:text-red-600 transition-colors"
                title="Supprimer"
              >
                <FiTrash2 className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default CardGrid;