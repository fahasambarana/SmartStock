import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { FiPlus, FiAlertCircle, FiEdit2, FiTrash2, FiSearch, FiMapPin } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { getZones, createZone, updateZone, deleteZone, getZoneTypes } from "../services/api";

const EMPTY_ZONE_FORM = {
  name: "",
  description: "",
  location: "",
  unite_capacite: "Unités",
  capacite_max: "",
  capacite_type: "",
  type: "",
  ZoneTypeId: "",
};

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [zoneTypes, setZoneTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState(EMPTY_ZONE_FORM);
  const [customType, setCustomType] = useState("");
  const [showCustomType, setShowCustomType] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Détection du rôle flexible
  const userRole = user?.role?.toLowerCase();
  const canManageZones = userRole === "admin" || userRole === "manager";

  // --- STYLES NEUMORPHISMES ---
  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";
  const nmButton = "active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0e1013,inset_-3px_-3px_6px_rgba(255,255,255,0.05)] transition-all duration-200";

  useEffect(() => {
    fetchZones();
    fetchZoneTypes();
  }, []);

  const fetchZoneTypes = async () => {
    try {
      const response = await getZoneTypes();
      setZoneTypes(response.data);
    } catch (err) {
      console.error("Erreur chargement types de zones:", err);
    }
  };

  const fetchZones = async () => {
    try {
      setIsLoading(true);
      const response = await getZones();
      setZones(response.data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des zones");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingZone(null);
    setFormData(EMPTY_ZONE_FORM);
    setCustomType("");
    setShowCustomType(false);
    setIsModalOpen(true);
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    const knownType = zoneTypes.some((zt) => zt.name === zone.type);
    const isCustomType = Boolean(zone.type) && !knownType && !zone.ZoneTypeId;

    setFormData({
      name: zone.name,
      description: zone.description || "",
      location: zone.location || "",
      unite_capacite: zone.unite_capacite || "Unités",
      capacite_max: zone.capacite_max || "",
      capacite_type: zone.capacite_type || "",
      type: isCustomType ? "Autre" : zone.type || "",
      ZoneTypeId: zone.ZoneTypeId || "",
    });
    setCustomType(isCustomType ? zone.type : "");
    setShowCustomType(isCustomType);
    setIsModalOpen(true);
  };

  const handleDelete = async (zone) => {
    if (window.confirm(`Supprimer la zone "${zone.name}" ?`)) {
      try {
        await deleteZone(zone.id);
        fetchZones();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalType = formData.type === "Autre" ? customType.trim() : formData.type;
    const submissionData = {
      ...formData,
      type: finalType,
      ZoneTypeId: formData.type === "Autre" ? "" : formData.ZoneTypeId,
    };

    try {
      if (editingZone) {
        await updateZone(editingZone.id, submissionData);
      } else {
        await createZone(submissionData);
      }
      setIsModalOpen(false);
      fetchZones();
    } catch (err) {
      alert("Erreur d'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredZones = zones.filter(zone =>
    zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (zone.type && zone.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] p-8 text-gray-700 dark:text-gray-200 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl font-black text-[#44474a] dark:text-gray-100 uppercase italic tracking-tighter flex items-center">
          <FiMapPin className="mr-3 text-blue-600" /> Gestion des Zones
        </h1>
        {canManageZones && (
          <button
            onClick={handleAdd}
            className={`${nmFlat} ${nmButton} px-6 py-3 rounded-2xl flex items-center font-bold text-blue-600 dark:text-blue-400`}
          >
            <FiPlus className="mr-2 stroke-[3px]" /> Ajouter une Zone
          </button>
        )}
      </div>

      {/* Barre de recherche */}
      <div className={`${nmInset} flex items-center px-5 py-1 rounded-2xl mb-8`}>
        <FiSearch className="text-gray-400 mr-3" />
        <input
          type="text"
          placeholder="Rechercher une zone (nom, type...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent w-full outline-none py-3 text-gray-600 dark:text-gray-300"
        />
      </div>

      {error && (
        <div className={`${nmFlat} p-4 rounded-xl mb-6 flex items-center text-red-500 font-bold`}>
          <FiAlertCircle className="mr-2" /> {error}
        </div>
      )}

      {/* TABLEAU NEUMORPHIQUE */}
      <div className={`${nmFlat} rounded-[2rem] overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300/30 dark:border-white/5 uppercase text-xs font-black tracking-widest text-gray-500 dark:text-gray-400">
                <th className="p-6">Zone principale</th>
                <th className="p-6">Type Interne</th>
                <th className="p-6">Unité</th>
                <th className="p-6">Cap. Zone</th>
                <th className="p-6">Cap. Type</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredZones.map((zone) => (
                <tr key={zone.id} className="hover:bg-white/10 transition-colors border-b border-gray-300/10 dark:border-white/5 group">
                  <td className="p-6 font-bold text-gray-800 dark:text-gray-100">{zone.name}</td>
                  <td className="p-6 text-gray-600 dark:text-gray-400">
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-bold">
                      {zone.type}
                    </span>
                  </td>
                  <td className="p-6 text-gray-500">{zone.unite_capacite}</td>
                  <td className="p-6 font-mono font-bold text-blue-600">{zone.capacite_max}</td>
                  <td className="p-6 font-mono">{zone.capacite_type}</td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-3">
                      {canManageZones && (
                        <>
                          <button 
                            onClick={() => handleEdit(zone)}
                            className={`${nmFlat} ${nmButton} p-3 rounded-xl text-amber-600`}
                            title="Modifier"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(zone)}
                            className={`${nmFlat} ${nmButton} p-3 rounded-xl text-red-500`}
                            title="Supprimer"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredZones.length === 0 && !isLoading && (
          <div className="p-10 text-center text-gray-400 italic font-medium">
            Aucune zone trouvée.
          </div>
        )}
      </div>

      {/* Modal - Formulaire identique à votre logique originale */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingZone ? "Modifier la Zone" : "Ajouter une Zone"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Zone principale *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`${nmInset} w-full p-3 rounded-xl outline-none`}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Emplacement</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={`${nmInset} w-full p-3 rounded-xl outline-none`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Unité</label>
              <select
                value={formData.unite_capacite}
                onChange={(e) => setFormData({ ...formData, unite_capacite: e.target.value })}
                className={`${nmInset} w-full p-3 rounded-xl outline-none bg-transparent`}
              >
                <option value="Unités">Unités</option>
                <option value="Volume">Volume (m³)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Capacité Max Zone *</label>
              <input
                type="number"
                step="0.01"
                value={formData.capacite_max}
                onChange={(e) => setFormData({ ...formData, capacite_max: e.target.value })}
                className={`${nmInset} w-full p-3 rounded-xl outline-none`}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Type de zone interne</label>
            <select
              value={formData.type}
              onChange={(e) => {
                const selectedTypeName = e.target.value;
                const selectedType = zoneTypes.find((zt) => zt.name === selectedTypeName);
                setFormData({
                  ...formData,
                  type: selectedTypeName,
                  ZoneTypeId: selectedType?.id || "",
                  capacite_type: selectedTypeName === "Autre" ? formData.capacite_type : selectedType?.capacite_max_default || "",
                });
                setShowCustomType(selectedTypeName === "Autre");
              }}
              className={`${nmInset} w-full p-3 rounded-xl outline-none bg-transparent`}
              required
            >
              <option value="">-- Sélectionner --</option>
              {zoneTypes.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
              <option value="Autre">Autre...</option>
            </select>
          </div>

          {showCustomType && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Précisez le Type</label>
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className={`${nmInset} w-full p-3 rounded-xl outline-none`}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Capacité Max Type *</label>
            <input
              type="number"
              step="0.01"
              value={formData.capacite_type}
              onChange={(e) => setFormData({ ...formData, capacite_type: e.target.value })}
              className={`${nmInset} w-full p-3 rounded-xl outline-none`}
              required
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`${nmFlat} ${nmButton} px-6 py-2 rounded-xl text-gray-500 font-bold`}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${nmFlat} ${nmButton} px-6 py-2 rounded-xl text-blue-600 font-black uppercase text-xs`}
            >
              {isSubmitting ? "..." : (editingZone ? "Modifier" : "Ajouter")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Zones;