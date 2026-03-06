import { FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800">Tableau de Bord</h2>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FiUser className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700">{user?.role || 'User'}</span>
        </div>
        <button onClick={handleLogout} className="text-gray-600 hover:text-gray-800">
          <FiLogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;