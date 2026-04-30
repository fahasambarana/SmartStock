import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiMail, FiShield, FiLoader } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'utilisateur',
  });
  const { user } = useAuth();

  const canEdit = user?.role === 'admin';

  // --- STYLES NEUMORPHISMES MIS À JOUR (DARK MODE) ---
  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";
  const nmButton = "active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0e1013,inset_-3px_-3px_6px_rgba(255,255,255,0.05)] transition-all duration-200";

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers();
      setUsers(response.data.data || response.data);
    } catch (err) {
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (username) => {
    if (!username) return '??';
    return username.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const translateRole = (role) => {
    const roles = { admin: 'Administrateur', manager: 'Manager', utilisateur: 'Utilisateur', fournisseur: 'Fournisseur' };
    return roles[role] || role;
  };

  // Couleurs de badges adaptées au mode sombre
  const getRoleColor = (role) => {
    const colors = {
      'admin': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      'manager': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      'utilisateur': 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      'fournisseur': 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return colors[role] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', role: 'utilisateur' });
    setIsModalOpen(true);
  };

  const handleEdit = (u) => {
    setEditingUser(u);
    setFormData({ username: u.username, email: u.email, password: '', role: u.role });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, username) => {
    if (window.confirm(`Supprimer l'utilisateur "${username}" ?`)) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData = { username: formData.username, email: formData.email, role: formData.role };
        if (formData.password) updateData.password = formData.password;
        await updateUser(editingUser.id, updateData);
      } else {
        await createUser(formData);
      }
      fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur d\'enregistrement');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-bold">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] p-8 text-gray-700 dark:text-gray-200 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-black text-[#44474a] dark:text-gray-100 flex items-center uppercase  tracking-tighter">
          <FiUsers className="mr-3 text-indigo-600 dark:text-indigo-400" /> Utilisateurs
          <span className="ml-3 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full font-bold">
            {users.length}
          </span>
        </h1>
        {canEdit && (
          <button onClick={handleAdd} className={`${nmFlat} ${nmButton} px-6 py-3 rounded-2xl flex items-center font-bold text-indigo-600 dark:text-indigo-400`}>
            <FiPlus className="mr-2 stroke-[3px]" /> Ajouter
          </button>
        )}
      </div>

      {/* Grid de Cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {users.map((u) => (
          <div key={u.id} className={`${nmFlat} rounded-[2rem] p-8 flex flex-col items-center text-center relative transition-all`}>
            <div className={`${nmInset} w-24 h-24 rounded-full flex items-center justify-center mb-6 border-4 border-[#e0e5ec] dark:border-[#1a1d23]`}>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {getInitials(u.username)}
              </span>
            </div>

            <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 mb-1">{u.username}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center italic">
              <FiMail className="mr-2" /> {u.email}
            </p>

            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 flex items-center shadow-sm ${getRoleColor(u.role)}`}>
              <FiShield className="mr-1" /> {translateRole(u.role)}
            </span>

            {canEdit && (
              <div className="flex gap-5 mt-auto w-full justify-center pt-6 border-t border-gray-300/30 dark:border-white/5">
                <button onClick={() => handleEdit(u)} className={`${nmFlat} ${nmButton} p-3 rounded-xl text-amber-600 dark:text-amber-500`}>
                  <FiEdit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(u.id, u.username)} 
                  disabled={u.id === user?.id}
                  className={`${nmFlat} ${nmButton} p-3 rounded-xl text-red-500 dark:text-red-400 ${u.id === user?.id ? 'opacity-30' : ''}`}
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Modifier' : 'Nouveau'}>
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-2">Nom d'utilisateur</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={`${nmInset} w-full p-4 rounded-2xl outline-none focus:text-indigo-600 dark:focus:text-indigo-400 dark:text-gray-200`}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`${nmInset} w-full p-4 rounded-2xl outline-none dark:text-gray-200`}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-2">Mot de passe</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`${nmInset} w-full p-4 rounded-2xl outline-none dark:text-gray-200`}
              required={!editingUser}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-2">Rôle</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className={`${nmInset} w-full p-4 rounded-2xl outline-none bg-transparent dark:text-gray-200 appearance-none`}
            >
              <option value="admin" className="dark:bg-[#1a1d23]">Administrateur</option>
              <option value="manager" className="dark:bg-[#1a1d23]">Manager</option>
              <option value="utilisateur" className="dark:bg-[#1a1d23]">Utilisateur</option>
              <option value="fournisseur" className="dark:bg-[#1a1d23]">Fournisseur</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={() => setIsModalOpen(false)} className={`${nmFlat} ${nmButton} px-6 py-3 rounded-2xl text-gray-500 font-bold`}>Annuler</button>
            <button type="submit" className={`${nmFlat} ${nmButton} px-8 py-3 rounded-2xl text-indigo-600 dark:text-indigo-400 font-bold`}>Enregistrer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;