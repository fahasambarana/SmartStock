import { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { FiPlus, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getZones, createZone, updateZone, deleteZone } from '../services/api';

const ZONE_TYPES = ['Étagère', 'Palette', 'Chambre Froide', 'Rack', 'Zone de Quai', 'Armoire'];

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    unite_capacite: 'Unités',
    capacite_max: '',
    capacite_type: '',
    type: '',
  });
  const [customType, setCustomType] = useState('');
  const [showCustomType, setShowCustomType] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const canEdit = user?.role === 'Admin' || user?.role === 'Manager';

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'type', label: 'Type' },
    { key: 'unite_capacite', label: 'Unité' },
    { key: 'capacite_max', label: 'Cap. Max' },
    // { key: 'capacite_type', label: 'Cap. Type' },
    { key: 'capacite_actuelle', label: 'Utilisée' },
  ];

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setIsLoading(true);
      const response = await getZones();
      setZones(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des zones');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingZone(null);
    setFormData({
      name: '',
      description: '',
      location: '',
      unite_capacite: 'Unités',
      capacite_max: '',
      capacite_type: '',
      type: '',
    });
    setCustomType('');
    setShowCustomType(false);
    setIsModalOpen(true);
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    const isStandardType = ZONE_TYPES.includes(zone.type);
    setFormData({
      name: zone.name,
      description: zone.description || '',
      location: zone.location || '',
      unite_capacite: zone.unite_capacite || 'Unités',
      capacite_max: zone.capacite_max || '',
      capacite_type: zone.capacite_type || '',
      type: ZONE_TYPES.includes(zone.type) ? zone.type : 'Autre',
    });
    setCustomType(!ZONE_TYPES.includes(zone.type) ? (zone.type || '') : '');
    setShowCustomType(!ZONE_TYPES.includes(zone.type) && !!zone.type);
    setIsModalOpen(true);
  };

  const handleDelete = async (zone) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la zone "${zone.name}" ?`)) {
      try {
        await deleteZone(zone.id);
        fetchZones(); // Refresh the list
      } catch (err) {
        alert('Erreur lors de la suppression de la zone');
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const finalType = formData.type === 'Autre' ? customType : formData.type;
    const submissionData = { ...formData, type: finalType };

    try {
      if (editingZone) {
        await updateZone(editingZone.id, submissionData);
      } else {
        await createZone(submissionData);
      }
      setIsModalOpen(false);
      fetchZones(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'enregistrement de la zone');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredZones = zones.filter(zone =>
    zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (zone.description && zone.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (zone.location && zone.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (zone.type && zone.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Zones</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center transition-colors shadow-sm"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Ajouter une Zone
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-md flex items-center shadow-sm">
          <FiAlertCircle className="w-5 h-5 mr-2 text-red-500" />
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher des zones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={filteredZones}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {filteredZones.length === 0 && !error && (
          <div className="p-8 text-center text-gray-500">
            Aucune zone trouvée.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingZone ? 'Modifier la Zone' : 'Ajouter une Zone'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la zone <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ex: Entrepôt Principal"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ex: Bâtiment A, Étage 1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unité de Capacité</label>
              <select
                value={formData.unite_capacite}
                onChange={(e) => setFormData({ ...formData, unite_capacite: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Unités">Unités</option>
                <option value="Volume">Volume (m³)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacité Max <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.capacite_max}
                onChange={(e) => setFormData({ ...formData, capacite_max: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacité Type</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.capacite_type}
              onChange={(e) => setFormData({ ...formData, capacite_type: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="0.00"
            />
          </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de Zone</label>
            <select
              value={formData.type}
              onChange={(e) => {
                setFormData({ ...formData, type: e.target.value });
                setShowCustomType(e.target.value === 'Autre');
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">-- Sélectionner --</option>
              {ZONE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="Autre">Autre...</option>
            </select>
          </div>

          {showCustomType && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-gray-700 mb-1">Précisez le Type</label>
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ex: Conteneur, Rack Mobile..."
                required={showCustomType}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Description ou notes concernant la zone..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center transition-colors"
            >
              {isSubmitting ? (
                 <span className="flex items-center">
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                   Enregistrement...
                 </span>
              ) : (
                editingZone ? 'Modifier' : 'Ajouter'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Zones;