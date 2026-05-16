import { useState, useEffect } from "react";
import Table from "../components/Table";
import Modal from "../components/Modal";
import { FiPlus, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { getZoneTypes, createZoneType, updateZoneType, deleteZoneType } from "../services/api";

const ZoneTypes = () => {
  const [zoneTypes, setZoneTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unite_capacite: "Unités",
    capacite_max_default: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const canEdit = user?.role === "Admin";

  const columns = [
    { key: "name", label: "Nom du Type" },
    { key: "description", label: "Description" },
    { key: "unite_capacite", label: "Unité" },
    { key: "capacite_max_default", label: "Capacité Max (Défaut)" },
  ];

  useEffect(() => {
    fetchZoneTypes();
  }, []);

  const fetchZoneTypes = async () => {
    try {
      setIsLoading(true);
      const response = await getZoneTypes();
      setZoneTypes(response.data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des types de zones");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingType(null);
    setFormData({
      name: "",
      description: "",
      unite_capacite: "Unités",
      capacite_max_default: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || "",
      unite_capacite: type.unite_capacite || "Unités",
      capacite_max_default: type.capacite_max_default || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (type) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer le type "${type.name}" ? Les zones associées ne seront pas supprimées.`
      )
    ) {
      try {
        await deleteZoneType(type.id);
        setZoneTypes(zoneTypes.filter((t) => t.id !== type.id));
      } catch (err) {
        setError("Erreur lors de la suppression du type");
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        setError("Le nom du type est requis");
        setIsSubmitting(false);
        return;
      }

      if (!formData.capacite_max_default) {
        setError("La capacité maximale est requise");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        unite_capacite: formData.unite_capacite,
        capacite_max_default: parseFloat(formData.capacite_max_default),
      };

      if (editingType) {
        await updateZoneType(editingType.id, payload);
        setZoneTypes(
          zoneTypes.map((t) =>
            t.id === editingType.id ? { ...t, ...payload } : t
          )
        );
      } else {
        const response = await createZoneType(payload);
        setZoneTypes([...zoneTypes, response.data]);
      }

      setIsModalOpen(false);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'enregistrement du type"
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTypes = zoneTypes.filter(
    (type) =>
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (type.description &&
        type.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <h1 className="text-2xl font-bold text-gray-800">Types de Zones</h1>
        {canEdit && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center transition-colors shadow-sm">
            <FiPlus className="w-5 h-5 mr-2" />
            Ajouter un Type
          </button>
        )}
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
          placeholder="Rechercher des types de zones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={filteredTypes}
          onEdit={canEdit ? handleEdit : null}
          onDelete={canEdit ? handleDelete : null}
        />
        {filteredTypes.length === 0 && !error && (
          <div className="p-8 text-center text-gray-500">
            Aucun type de zone trouvé.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingType
            ? "Modifier le Type de Zone"
            : "Créer un Type de Zone"
        }>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ex: Armoire, Rack, Palette..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unité de Capacité <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.unite_capacite}
              onChange={(e) =>
                setFormData({ ...formData, unite_capacite: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <option value="Unités">Unités</option>
              <option value="Pièces">Pièces</option>
              <option value="Kg">Kg</option>
              <option value="Volume">Volume (m³)</option>
              <option value="Poids">Poids (kg)</option>
              <option value="Surface">Surface (m²)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacité Maximale (Défaut) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.capacite_max_default}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  capacite_max_default: e.target.value,
                })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Description du type de zone..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
              {isSubmitting
                ? "Enregistrement..."
                : editingType
                  ? "Modifier"
                  : "Créer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ZoneTypes;
