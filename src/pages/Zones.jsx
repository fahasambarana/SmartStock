import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { FiPlus, FiAlertCircle, FiEdit2, FiTrash2, FiSearch, FiLoader, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getZones, createZone, updateZone, deleteZone } from '../services/api';

const ZONE_TYPES = ['Étagère', 'Palette', 'Chambre Froide', 'Rack', 'Zone de Quai', 'Armoire'];

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [showCustomType, setShowCustomType] = useState(false);
  const [customType, setCustomType] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    unite_capacite: 'Unités',
    capacite_max: '',
    capacite_type: '',
    type: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Débogage : Affiche le rôle actuel dans la console du navigateur (F12)
  console.log("Utilisateur connecté :", user?.email, "Rôle :", user?.role);

  // Détection du rôle flexible (admin, ADMIN, Admin fonctionneront tous)
  const userRole = user?.role?.toLowerCase();
  const canEdit = userRole === 'admin' || userRole === 'manager';

  // --- STYLES NEUMORPHISMES ---
  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";
  const nmButton = "active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0e1013,inset_-3px_-3px_6px_rgba(255,255,255,0.05)] transition-all duration-200";

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
      name: '', description: '', location: '',
      unite_capacite: 'Unités', capacite_max: '',
      capacite_type: '', type: ''
    });
    setShowCustomType(false);
    setCustomType('');
    setIsModalOpen(true);
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    const isOtherType = zone.type && !ZONE_TYPES.includes(zone.type);
    setFormData({
      name: zone.name,
      description: zone.description || '',
      location: zone.location || '',
      unite_capacite: zone.unite_capacite || 'Unités',
      capacite_max: zone.capacite_max || '',
      capacite_type: zone.capacite_type || '',
      type: isOtherType ? 'Autre' : (zone.type || '')
    });
    if (isOtherType) {
      setShowCustomType(true);
      setCustomType(zone.type);
    }
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
        await updateZone(editingZone.id, submissionData);
      } else {
        await createZone(submissionData);
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
    (zone.location && zone.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] flex items-center justify-center transition-colors">
        <FiLoader className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] p-8 text-gray-700 dark:text-gray-200 transition-colors duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl font-black text-[#44474a] dark:text-gray-100 uppercase  tracking-tighter flex items-center">
          <FiMapPin className="mr-3 text-blue-600 dark:text-blue-400" /> Gestion des Zones
        </h1>
        {canEdit && (
          <button
            onClick={handleAdd}
            className={`${nmFlat} ${nmButton} px-6 py-3 rounded-2xl flex items-center font-bold text-blue-600 dark:text-blue-400`}
          >
            <FiPlus className="mr-2 stroke-[3px]" /> Ajouter une Zone
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className={`${nmInset} flex items-center px-5 py-1 rounded-2xl mb-8`}>
        <FiSearch className="text-gray-400 dark:text-gray-500 mr-3" />
        <input
          type="text"
          placeholder="Rechercher une zone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent w-full outline-none py-3 text-gray-600 dark:text-gray-300 placeholder-gray-400"
        />
      </div>

      {error && (
        <div className={`${nmFlat} p-4 rounded-xl mb-6 flex items-center text-red-500 font-bold`}>
          <FiAlertCircle className="mr-2" /> {error}
        </div>
      )}

      {/* Table Section */}
      <div className={`${nmFlat} rounded-[2rem] overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300/30 dark:border-white/5 uppercase text-xs font-black tracking-widest text-gray-500 dark:text-gray-400">
                <th className="p-6">Nom</th>
                <th className="p-6">Emplacement</th>
                <th className="p-6">Description</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredZones.map((zone) => (
                <tr key={zone.id} className="hover:bg-white/10 dark:hover:bg-white/5 transition-colors border-b border-gray-300/10 dark:border-white/5 group">
                  <td className="p-6 font-bold text-gray-800 dark:text-gray-100">{zone.name}</td>
                  <td className="p-6 text-gray-600 dark:text-gray-400">{zone.location || '-'}</td>
                  <td className="p-6 text-gray-500 dark:text-gray-500 italic text-sm">{zone.description || 'N/A'}</td>
                  <td className="p-6">
                    <div className="flex justify-end gap-3">
                      {canEdit ? (
                        <>
                          <button 
                            onClick={() => handleEdit(zone)}
                            className={`${nmFlat} ${nmButton} p-3 rounded-xl text-amber-600 dark:text-amber-500`}
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(zone)}
                            className={`${nmFlat} ${nmButton} p-3 rounded-xl text-red-500 dark:text-red-400`}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-black uppercase text-gray-400 opacity-50">Lecture Seule</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Formulaire */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingZone ? 'Modifier la Zone' : 'Nouvelle Zone'}
      >
        <form onSubmit={handleSubmit} className="space-y-5 p-1">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 mb-1 ml-1 tracking-widest">Nom de la Zone</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`${nmInset} w-full p-4 rounded-2xl outline-none text-gray-700 dark:text-gray-200 transition-all`}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 mb-1 ml-1 tracking-widest">Emplacement</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={`${nmInset} w-full p-4 rounded-2xl outline-none text-gray-700 dark:text-gray-200 transition-all`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 mb-1 ml-1 tracking-widest">Unité</label>
              <select
                value={formData.unite_capacite}
                onChange={(e) => setFormData({ ...formData, unite_capacite: e.target.value })}
                className={`${nmInset} w-full p-4 rounded-2xl outline-none text-gray-700 dark:text-gray-200 bg-transparent`}
              >
                <option value="Unités">Unités</option>
                <option value="Volume">Volume (m³)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 mb-1 ml-1 tracking-widest">Capacité Max</label>
              <input
                type="number"
                value={formData.capacite_max}
                onChange={(e) => setFormData({ ...formData, capacite_max: e.target.value })}
                className={`${nmInset} w-full p-4 rounded-2xl outline-none text-gray-700 dark:text-gray-200`}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 mb-1 ml-1 tracking-widest">Type</label>
            <select
              value={formData.type}
              onChange={(e) => {
                setFormData({ ...formData, type: e.target.value });
                setShowCustomType(e.target.value === 'Autre');
              }}
              className={`${nmInset} w-full p-4 rounded-2xl outline-none text-gray-700 dark:text-gray-200 bg-transparent`}
              required
            >
              <option value="">-- Sélectionner --</option>
              {ZONE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              <option value="Autre">Autre...</option>
            </select>
          </div>

          {showCustomType && (
            <div className="animate-in fade-in duration-300">
              <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 mb-1 ml-1 tracking-widest">Précisez le Type</label>
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className={`${nmInset} w-full p-4 rounded-2xl outline-none text-gray-700 dark:text-gray-200 transition-all`}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 mb-1 ml-1 tracking-widest">Notes / Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`${nmInset} w-full p-4 rounded-2xl outline-none text-gray-700 dark:text-gray-200 h-24 resize-none transition-all`}
            />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`${nmFlat} ${nmButton} px-8 py-3 rounded-2xl text-gray-500 dark:text-gray-400 font-bold`}
            >
              Fermer
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${nmFlat} ${nmButton} px-10 py-3 rounded-2xl text-blue-600 dark:text-blue-400 font-black uppercase text-xs tracking-widest`}
            >
              {isSubmitting ? '...' : (editingZone ? 'Sauvegarder' : 'Créer')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Zones;