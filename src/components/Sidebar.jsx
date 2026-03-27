import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Ajout de motion
import { FiHome, FiMapPin, FiPackage, FiTruck, FiAlertTriangle, FiUsers, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const allMenuItems = [
    { name: 'Tableau de Bord', path: '/dashboard', icon: FiHome, roles: ['admin', 'manager', 'utilisateur', 'fournisseur'] },
    { name: 'Zones', path: '/zones', icon: FiMapPin, roles: ['admin', 'manager'] },
    { name: 'Produits', path: '/products', icon: FiPackage, roles: ['admin', 'manager', 'utilisateur'] },
    { name: 'Mouvements de Stock', path: '/movements', icon: FiTruck, roles: ['admin', 'manager', 'utilisateur'] },
    { name: 'Alertes', path: '/alerts', icon: FiAlertTriangle, roles: ['admin', 'manager', 'utilisateur', 'fournisseur'] },
    { name: 'Utilisateurs', path: '/users', icon: FiUsers, roles: ['admin'] },
    { name: 'Paramètres', path: '/settings', icon: FiSettings, roles: ['admin'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role));

  // Variantes d'animation pour la liste
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <>
      {/* Mobile menu button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-[#e0e5ec] shadow-[6px_6px_12px_#b8bec5,-6px_-6px_12px_#ffffff] text-gray-600"
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </motion.button>

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#e0e5ec] transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-500 ease-in-out border-r border-gray-200/30 shadow-[10px_0_20px_rgba(0,0,0,0.05)]`}>
        
        {/* Logo Area */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center h-24"
        >
          <div className="px-6 py-2 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8bec5,-4px_-4px_8px_#ffffff]">
            <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tighter">
              SMART-STOCK
            </h1>
          </div>
        </motion.div>

        {/* Navigation avec Framer Motion */}
        <nav className="mt-6 px-4">
          <motion.ul 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.li key={item.name} variants={itemVariants}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="relative group block"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        flex items-center px-6 py-4 rounded-2xl transition-all duration-300
                        ${isActive 
                          ? 'text-blue-600 shadow-[inset_6px_6px_12px_#b8bec5,inset_-6px_-6px_12px_#ffffff]' 
                          : 'text-gray-600 hover:shadow-[5px_5px_10px_#b8bec5,-5px_-5px_10px_#ffffff]'
                        }
                      `}
                    >
                      <item.icon className={`w-5 h-5 mr-4 transition-colors ${isActive ? 'text-blue-600' : 'group-hover:text-blue-500'}`} />
                      <span className="font-bold text-sm tracking-tight">{item.name}</span>
                    </motion.div>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        </nav>

        {/* User Badge - Animation d'entrée par le bas */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-4 right-4"
        >
          <div className="p-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8bec5,inset_-4px_-4px_8px_#ffffff] flex items-center gap-3">
             <motion.div 
               whileHover={{ rotate: 360 }}
               transition={{ duration: 0.7 }}
               className="w-10 h-10 rounded-full bg-blue-600 shadow-[4px_4px_8px_#b8bec5] flex items-center justify-center text-white font-black"
             >
               {user?.name?.charAt(0) || 'U'}
             </motion.div>
             <div>
               <p className="text-[10px] text-blue-600 font-black uppercase tracking-tighter">{user?.role}</p>
               <p className="text-sm font-bold text-gray-700 truncate tracking-tight">{user?.name || 'Utilisateur'}</p>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Overlay mobile avec animation de fondu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-30 bg-gray-400/20 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;