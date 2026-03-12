import { FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800">Tableau de Bord</h2>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FiUser className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700">{user?.role || "User"}</span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-gray-600 hover:text-gray-800">
          <FiLogOut className="w-5 h-5" />
        </button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmer la déconnexion">
        <p className="text-gray-700 mb-4">
          Êtes-vous sûr de vouloir vous déconnecter ?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Se déconnecter
          </button>
        </div>
      </Modal>
    </header>
  );
};

export default Navbar;
