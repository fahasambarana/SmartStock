import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Background Overlay avec flou subtil */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-500/20 backdrop-blur-sm"
          />

          {/* Fenêtre Modal Neumorphique */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-[#e0e5ec] rounded-[2.5rem] shadow-[20px_20px_60px_#babecc,-20px_-20px_60px_#ffffff] max-w-md w-full overflow-hidden border border-white/20"
          >
            {/* Header de la Modal */}
            <div className="flex justify-between items-center p-8 pb-4">
              <h3 className="text-xl font-black text-gray-700 uppercase tracking-tighter">
                {title}
              </h3>
              
              {/* Bouton Fermer Neumorphique */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full bg-[#e0e5ec] shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] text-gray-500 hover:text-red-500 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Corps de la Modal avec effet "Inset" pour le contenu si nécessaire */}
            <div className="p-8 pt-2">
              <div className="text-gray-600 font-medium">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;