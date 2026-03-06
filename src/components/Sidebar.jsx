import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiMapPin, FiPackage, FiTruck, FiAlertTriangle, FiUsers, FiSettings } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const allMenuItems = [
    { name: 'Tableau de Bord', path: '/dashboard', icon: FiHome, roles: ['Admin', 'Manager', 'Employee', 'Viewer'] },
    { name: 'Zones', path: '/zones', icon: FiMapPin, roles: ['Admin', 'Manager'] },
    { name: 'Produits', path: '/products', icon: FiPackage, roles: ['Admin', 'Manager', 'Employee'] },
    { name: 'Mouvements de Stock', path: '/movements', icon: FiTruck, roles: ['Admin', 'Manager', 'Employee'] },
    { name: 'Alertes', path: '/alerts', icon: FiAlertTriangle, roles: ['Admin', 'Manager', 'Employee', 'Viewer'] },
    { name: 'Utilisateurs', path: '/users', icon: FiUsers, roles: ['Admin'] },
    { name: 'Paramètres', path: '/settings', icon: FiSettings, roles: ['Admin'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role));

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden ml-64 fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-800 text-white p-2 rounded-md"
        >
          <FiHome className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <h1 className="text-xl font-bold">Inventaire</h1>
        </div>
        <nav className="mt-8">
          <ul>
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;