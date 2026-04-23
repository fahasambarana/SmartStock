import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { FiPlus, FiAlertCircle, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
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
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const canEdit = user?.role === 'Admin' || user?.role === 'Manager';

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'description', label: 'Description' },
    { key: 'location', label: 'Emplacement' },
  ];

  useEffect(() => { fetchZones(); }, []);

  const fetchZones = async () => {
    try {
      setIsLoading(true);
      const response = await getZones();
      setZones(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des zones');
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
    });
    setIsModalOpen(true);
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description || '',
      location: zone.location || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (zone) => {
    if (window.confirm(`Supprimer la zone "${zone.name}" ?`)) {
      try {
        await deleteZone(zone.id);
        fetchZones();
      } catch (err) {
        alert('Erreur lors de la suppression');
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
        await updateZone(editingZone.id, formData);
      } else {
        await createZone(formData);
      }
      setIsModalOpen(false);
      fetchZones();
    } catch (err) {
      alert('Erreur d\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredZones = zones.filter(zone =>
    zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (zone.description && zone.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (zone.location && zone.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] p-8 text-gray-700 dark:text-gray-200 transition-colors duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#44474a] dark:text-gray-100 uppercase ">
          Gestion des Zones
        </h1>
        <button
          onClick={handleAdd}
          className={`${nmFlat} ${nmButton} px-6 py-3 rounded-xl flex items-center font-bold text-blue-600 dark:text-blue-400`}
        >
          <FiPlus className="mr-2 stroke-[3px]" /> Ajouter une Zone
        </button>
      </div>

      {/* Search Bar */}
      <div className={`${nmInset} flex items-center px-4 py-2 rounded-2xl mb-8`}>
        <FiSearch className="text-gray-500 dark:text-gray-400 mr-3" />
        <input
          type="text"
          placeholder="Rechercher une zone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent w-full outline-none py-2 text-gray-600 dark:text-gray-300 placeholder-gray-400"
        />
      </div>

      {error && (
        <div className={`${nmFlat} p-4 rounded-xl mb-6 flex items-center text-red-500 font-medium`}>
          <FiAlertCircle className="mr-2" /> {error}
        </div>
      )}

      {/* Neumorphic Table */}
      <div className={`${nmFlat} rounded-3xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300/30 dark:border-white/5">
                <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Nom</th>
                <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Emplacement</th>
                <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Description</th>
                <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredZones.map((zone) => (
                <tr key={zone.id} className="hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                  <td className="p-5 font-semibold text-gray-800 dark:text-gray-200">{zone.name}</td>
                  <td className="p-5 text-gray-600 dark:text-gray-400">{zone.location || '-'}</td>
                  <td className="p-5 text-gray-500 dark:text-gray-500 italic text-sm">{zone.description || 'Pas de description'}</td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-4">
                      <button 
                        onClick={() => handleEdit(zone)}
                        className={`${nmFlat} ${nmButton} p-2 rounded-lg text-amber-600 dark:text-amber-500`}
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(zone)}
                        className={`${nmFlat} ${nmButton} p-2 rounded-lg text-red-500 dark:text-red-400`}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredZones.length === 0 && !isLoading && (
          <div className="p-10 text-center text-gray-400 font-medium italic">
            Aucun résultat trouvé dans la base de données.
          </div>
        )}
      </div>

      {/* Modal - Dark Mode Ready */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingZone ? 'Modifier la Zone' : 'Nouvelle Zone'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2 ml-1">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`${nmInset} w-full p-3 rounded-xl outline-none focus:text-blue-600 dark:focus:text-blue-400 text-gray-700 dark:text-gray-200`}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2 ml-1">Emplacement</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={`${nmInset} w-full p-3 rounded-xl outline-none text-gray-700 dark:text-gray-200`}
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
          <div>
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
          </div>
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
            <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2 ml-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Description ou notes concernant la zone..."
            />
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`${nmFlat} ${nmButton} px-6 py-2 rounded-xl text-gray-600 dark:text-gray-400 font-bold`}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${nmFlat} ${nmButton} px-6 py-2 rounded-xl text-blue-600 dark:text-blue-400 font-bold flex items-center`}
            >
              {isSubmitting ? '...' : (editingZone ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Zones;