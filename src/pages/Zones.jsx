import { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { FiPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Zones = () => {
  const [zones, setZones] = useState([
    { id: 1, name: 'Zone A', type: 'Dry', capacity: 1000, occupancy: 85 },
    { id: 2, name: 'Zone B', type: 'Cold', capacity: 500, occupancy: 70 },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Dry',
    capacity: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const canEdit = user?.role === 'Admin' || user?.role === 'Manager';

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'type', label: 'Type' },
    { key: 'capacity', label: 'Capacité' },
    { key: 'occupancy', label: 'Occupation %' },
  ];

  const handleAdd = () => {
    setEditingZone(null);
    setFormData({
      name: '',
      type: 'Dry',
      capacity: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      type: zone.type,
      capacity: zone.capacity,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (zone) => {
    setZones(zones.filter(z => z.id !== zone.id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingZone) {
      setZones(zones.map(z => z.id === editingZone.id ? { ...z, ...formData } : z));
    } else {
      setZones([...zones, { ...formData, id: Date.now(), occupancy: Math.floor(Math.random() * 100) }]);
    }
    setIsModalOpen(false);
  };

  const filteredZones = zones.filter(zone =>
    zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Zones</h1>
        {canEdit && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Ajouter une Zone
          </button>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher des zones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <Table
        columns={columns}
        data={filteredZones}
        onEdit={canEdit ? handleEdit : null}
        onDelete={canEdit ? handleDelete : null}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingZone ? 'Modifier la Zone' : 'Ajouter une Zone'}
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
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Dry">Sec</option>
              <option value="Cold">Froid</option>
              <option value="Frozen">Congelé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacité</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
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
              {editingZone ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Zones;