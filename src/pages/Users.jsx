import { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { FiPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Users = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Employee' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Employee',
  });
  const { user } = useAuth();

  const canEdit = user?.role === 'Admin';

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle' },
  ];

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Employee',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (user) => {
    setUsers(users.filter(u => u.id !== user.id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      setUsers([...users, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const getRoleBadge = (role) => {
    const colors = {
      Admin: 'bg-red-100 text-red-800',
      Manager: 'bg-blue-100 text-blue-800',
      Employee: 'bg-green-100 text-green-800',
      Viewer: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || colors.Viewer;
  };

  const customRender = (data) => {
    return data.map((row) => ({
      ...row,
      role: (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(row.role)}`}>
          {row.role === 'Admin' ? 'Administrateur' : row.role === 'Manager' ? 'Gestionnaire' : row.role === 'Employee' ? 'Employé' : 'Observateur'}
        </span>
      ),
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Utilisateurs</h1>
        {canEdit && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Ajouter un Utilisateur
          </button>
        )}
      </div>

      <Table
        columns={columns}
        data={customRender(users)}
        onEdit={canEdit ? handleEdit : null}
        onDelete={canEdit ? handleDelete : null}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rôle</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Admin">Administrateur</option>
              <option value="Manager">Gestionnaire</option>
              <option value="Employee">Employé</option>
              <option value="Viewer">Observateur</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingUser ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;