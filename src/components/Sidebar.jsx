import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <>
      {/* Mobile menu button - AJOUT DARK MODE */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[6px_6px_12px_#b8bec5,-6px_-6px_12px_#ffffff] dark:shadow-[4px_4px_8px_#0e1013,-4px_-4px_8px_rgba(255,255,255,0.05)] text-gray-600 dark:text-gray-300 transition-colors duration-300"
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </motion.button>

      {/* Sidebar Container - AJOUT DARK MODE */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#e0e5ec] dark:bg-[#1a1d23] transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-all duration-500 ease-in-out border-r border-gray-200/30 dark:border-white/5 shadow-[10px_0_20px_rgba(0,0,0,0.05)]`}>
        
        {/* Logo Area - AJOUT DARK MODE */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center h-24"
        >
          <div className="px-6 py-2 rounded-2xl bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[4px_4px_8px_#b8bec5,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1013,-4px_-4px_8px_rgba(255,255,255,0.05)]">
            <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tighter">
              SMART-STOCK
            </h1>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <motion.ul variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.li key={item.name} variants={itemVariants}>
                  <Link to={item.path} onClick={() => setIsOpen(false)} className="relative group block">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        flex items-center px-6 py-4 rounded-2xl transition-all duration-300
                        ${isActive 
                          ? 'text-blue-600 dark:text-blue-400 shadow-[inset_6px_6px_12px_#b8bec5,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]' 
                          : 'text-gray-600 dark:text-gray-400 hover:shadow-[5px_5px_10px_#b8bec5,-5px_-5px_10px_#ffffff] dark:hover:shadow-[4px_4px_8px_#0e1013,-4px_-4px_8px_rgba(255,255,255,0.05)]'
                        }
                      `}
                    >
                      <item.icon className={`w-5 h-5 mr-4 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'group-hover:text-blue-500'}`} />
                      <span className="font-bold text-sm tracking-tight">{item.name}</span>
                    </motion.div>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        </nav>

        {/* User Badge - AJOUT DARK MODE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-3 bottom-8 left-4 right-4"
        >
          <div className="p-4 rounded-2xl bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_4px_4px_8px_#b8bec5,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)] flex items-center gap-3">
             <motion.div 
               whileHover={{ rotate: 360 }}
               transition={{ duration: 0.7 }}
               className="w-10 h-10 rounded-full bg-blue-600 shadow-[4px_4px_8px_#b8bec5] dark:shadow-[2px_2px_5px_black] flex items-center justify-center text-white font-black"
             >
               {user?.name?.charAt(0) || 'U'}
             </motion.div>
             <div className="overflow-hidden">
               <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-tighter">{user?.role}</p>
               <p className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate tracking-tight">{user?.name || 'Utilisateur'}</p>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Overlay mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-30 bg-black/20 dark:bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;