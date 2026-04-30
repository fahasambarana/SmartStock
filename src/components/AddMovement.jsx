import { useState, useEffect } from 'react';
import { FiX, FiPackage, FiMapPin, FiFileText, FiHash } from 'react-icons/fi';
import { getProducts, getZones, createInMovement, createOutMovement, createTransferMovement } from '../services/api';

const AddMovement = ({ isOpen, onClose, onSuccess, type }) => {
  const [products, setProducts] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    sourceZoneId: '',
    destinationZoneId: '',
    reason: '',
    notes: ''
  });

  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";
  const nmButton = "active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] transition-all duration-200";

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchZones();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const fetchZones = async () => {
    try {
      const response = await getZones();
      setZones(response.data || []);
    } catch (error) {
      console.error('Erreur chargement zones:', error);
    }
  };

  const getTitle = () => {
    switch(type) {
      case 'in': return 'Ajouter un stock';
      case 'out': return 'Sortie de stock';
      case 'transfer': return 'Transfert de stock';
      default: return 'Mouvement de stock';
    }
  };

  const getColor = () => {
    switch(type) {
      case 'in': return 'text-green-600';
      case 'out': return 'text-red-600';
      case 'transfer': return 'text-blue-600';
      default: return 'text-indigo-600';
    }
  };

  const getBgColor = () => {
    switch(type) {
      case 'in': return 'bg-green-50 dark:bg-green-900/20';
      case 'out': return 'bg-red-50 dark:bg-red-900/20';
      case 'transfer': return 'bg-blue-50 dark:bg-blue-900/20';
      default: return 'bg-indigo-50 dark:bg-indigo-900/20';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let response;
      switch(type) {
        case 'in':
          response = await createInMovement({
            productId: parseInt(formData.productId),
            quantity: parseInt(formData.quantity),
            destinationZoneId: formData.destinationZoneId ? parseInt(formData.destinationZoneId) : null,
            reason: formData.reason,
            notes: formData.notes
          });
          break;
        case 'out':
          response = await createOutMovement({
            productId: parseInt(formData.productId),
            quantity: parseInt(formData.quantity),
            sourceZoneId: formData.sourceZoneId ? parseInt(formData.sourceZoneId) : null,
            reason: formData.reason,
            notes: formData.notes
          });
          break;
        case 'transfer':
          response = await createTransferMovement({
            productId: parseInt(formData.productId),
            quantity: parseInt(formData.quantity),
            sourceZoneId: parseInt(formData.sourceZoneId),
            destinationZoneId: parseInt(formData.destinationZoneId),
            reason: formData.reason,
            notes: formData.notes
          });
          break;
      }
      
      if (response.data.success) {
        onSuccess();
        onClose();
        setFormData({
          productId: '',
          quantity: '',
          sourceZoneId: '',
          destinationZoneId: '',
          reason: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Erreur création mouvement:', error);
      alert(error.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className={`${nmFlat} rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${getBgColor()}`}>
          <div className="flex items-center gap-3">
            <div className={`${nmInset} p-2 rounded-xl`}>
              <FiPackage className={getColor()} size={24} />
            </div>
            <h2 className={`text-2xl font-bold ${getColor()}`}>
              {getTitle()}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-xl ${nmFlat} ${nmButton} hover:opacity-70`}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Produit */}
          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
              <FiPackage size={14} />
              Produit *
            </label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({...formData, productId: e.target.value})}
              className={`${nmInset} w-full p-3 rounded-xl outline-none cursor-pointer`}
              required
            >
              <option value="">Sélectionner un produit</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} (Stock: {product.quantity})
                </option>
              ))}
            </select>
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
              <FiHash size={14} />
              Quantité *
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              className={`${nmInset} w-full p-3 rounded-xl outline-none`}
              placeholder="Nombre d'unités"
              required
            />
          </div>

          {/* Zone Source (pour sortie et transfert) */}
          {(type === 'out' || type === 'transfer') && (
            <div>
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                <FiMapPin size={14} />
                Zone Source {type === 'transfer' && '*'}
              </label>
              <select
                value={formData.sourceZoneId}
                onChange={(e) => setFormData({...formData, sourceZoneId: e.target.value})}
                className={`${nmInset} w-full p-3 rounded-xl outline-none cursor-pointer`}
                required={type === 'transfer'}
              >
                <option value="">Sélectionner une zone</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Zone Destination (pour entrée et transfert) */}
          {(type === 'in' || type === 'transfer') && (
            <div>
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                <FiMapPin size={14} />
                Zone Destination {type === 'transfer' && '*'}
              </label>
              <select
                value={formData.destinationZoneId}
                onChange={(e) => setFormData({...formData, destinationZoneId: e.target.value})}
                className={`${nmInset} w-full p-3 rounded-xl outline-none cursor-pointer`}
                required={type === 'transfer'}
              >
                <option value="">Sélectionner une zone</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Motif */}
          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
              <FiFileText size={14} />
              Motif
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              className={`${nmInset} w-full p-3 rounded-xl outline-none`}
              placeholder="Ex: Réapprovisionnement, Vente, etc."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className={`${nmInset} w-full p-3 rounded-xl outline-none resize-none`}
              rows="3"
              placeholder="Informations supplémentaires..."
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`${nmFlat} ${nmButton} flex-1 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-400`}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${nmInset} ${nmButton} flex-1 py-3 rounded-xl font-bold ${getColor()} disabled:opacity-50`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Chargement...
                </div>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMovement;