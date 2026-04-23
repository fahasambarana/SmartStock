import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { FiPlus, FiAlertCircle, FiEdit2, FiTrash2, FiSearch, FiPackage } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct, getZones } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [availableZones, setAvailableZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Alimentaire',
    price: '',
    quantity: '',
    ZoneId: '',
    expirationDate: '',
    volume_unitaire: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // --- STYLES NEUMORPHISMES DYNAMIQUES (DARK MODE READY) ---
  const nmBg = "bg-[#e0e5ec] dark:bg-[#1a1d23]";
  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";
  const nmButton = "active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0e1013,inset_-3px_-3px_6px_rgba(255,255,255,0.05)] transition-all duration-200";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, zonesRes] = await Promise.all([getProducts(), getZones()]);
      setProducts(productsRes.data);
      setAvailableZones(zonesRes.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: 'Food', price: '', quantity: '', ZoneId: '', expirationDate: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      ZoneId: product.ZoneId || '',
      expirationDate: product.expirationDate || '',
      volume_unitaire: product.volume_unitaire || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Supprimer le produit "${product.name}" ?`)) {
      try {
        await deleteProduct(product.id);
        fetchData();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalData = { ...formData, ZoneId: formData.ZoneId === '' ? null : formData.ZoneId };

    try {
      editingProduct ? await updateProduct(editingProduct.id, finalData) : await createProduct(finalData);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.Zone && product.Zone.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className={`min-h-screen ${nmBg} flex justify-center items-center transition-colors duration-300`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${nmBg} p-8 text-gray-700 dark:text-gray-200 transition-colors duration-300`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl font-extrabold text-[#44474a] dark:text-gray-100 flex items-center tracking-tighter uppercase ">
          <FiPackage className="mr-3 text-blue-500 dark:text-blue-400" /> Produits
        </h1>
        <button
          onClick={handleAdd}
          className={`${nmFlat} ${nmButton} px-6 py-3 rounded-xl flex items-center font-bold text-blue-600 dark:text-blue-400`}
        >
          <FiPlus className="mr-2 stroke-[3px]" /> Ajouter un Produit
        </button>
      </div>

      {/* Barre de recherche */}
      <div className={`${nmInset} flex items-center px-5 py-3 rounded-2xl mb-8`}>
        <FiSearch className="text-gray-400 dark:text-gray-500 mr-3" />
        <input
          type="text"
          placeholder="Rechercher un produit, une catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent w-full outline-none text-gray-600 dark:text-gray-300 placeholder-gray-400"
        />
      </div>

      {error && (
        <div className={`${nmFlat} p-4 rounded-xl mb-6 flex items-center text-red-500 font-medium`}>
          <FiAlertCircle className="mr-2" /> {error}
        </div>
      )}

      {/* Table Neumorphique */}
      <div className={`${nmFlat} rounded-3xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300/40 dark:border-white/5">
                <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs">Produit</th>
                <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs">Catégorie</th>
                <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs">Prix</th>
                <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs">Quantité</th>
                <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs">Zone</th>
                <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                  <td className="p-5 font-semibold text-gray-800 dark:text-gray-200">{product.name}</td>
                  <td className="p-5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-gray-200 dark:bg-[#252a33] text-gray-600 dark:text-gray-400 shadow-sm">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-5 font-mono dark:text-gray-300">{product.price} €</td>
                  <td className="p-5">
                    <span className={`font-bold ${product.quantity < 5 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="p-5 text-gray-500 dark:text-gray-400 text-sm italic">
                    {product.Zone ? product.Zone.name : 'Non assigné'}
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleEdit(product)} className={`${nmFlat} ${nmButton} p-2 rounded-lg text-amber-600 dark:text-amber-500`}>
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(product)} className={`${nmFlat} ${nmButton} p-2 rounded-lg text-red-500 dark:text-red-400`}>
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="p-10 text-center text-gray-400 italic">Aucun produit trouvé.</div>
        )}
      </div>

      {/* Modal Neumorphique */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
      >
        <form onSubmit={handleSubmit} className="space-y-5 p-2">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2 ml-1">Nom du Produit</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`${nmInset} w-full p-3 rounded-xl outline-none focus:text-blue-600 dark:focus:text-blue-400 text-gray-700 dark:text-gray-200 transition-all`}
              placeholder="Ex: iPhone 15"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2 ml-1">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`${nmInset} w-full p-3 rounded-xl outline-none bg-transparent text-gray-700 dark:text-gray-200`}
              >
                <option value="Food" className="dark:bg-[#1a1d23]">Alimentation</option>
                <option value="Electronics" className="dark:bg-[#1a1d23]">Électronique</option>
                <option value="Cosmetics" className="dark:bg-[#1a1d23]">Cosmétiques</option>
                <option value="Other" className="dark:bg-[#1a1d23]">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2 ml-1">Zone</label>
              <select
                value={formData.ZoneId}
                onChange={(e) => setFormData({ ...formData, ZoneId: e.target.value })}
                className={`${nmInset} w-full p-3 rounded-xl outline-none bg-transparent text-gray-700 dark:text-gray-200`}
              >
                <option value="" className="dark:bg-[#1a1d23]">Sélectionner...</option>
                {availableZones.map(zone => (
                  <option key={zone.id} value={zone.id} className="dark:bg-[#1a1d23]">{zone.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2 ml-1">Prix (€)</label>
              <input
                type="number" step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className={`${nmInset} w-full p-3 rounded-xl outline-none text-gray-700 dark:text-gray-200`}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2 ml-1">Quantité</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className={`${nmInset} w-full p-3 rounded-xl outline-none text-gray-700 dark:text-gray-200`}
                required
              />
            </div>
          </div>

          {formData.category === 'Food' && (
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2 ml-1">Date d'Expiration</label>
              <input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                className={`${nmInset} w-full p-3 rounded-xl outline-none text-gray-700 dark:text-gray-200`}
              />
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`${nmFlat} ${nmButton} px-6 py-2 rounded-xl text-gray-500 dark:text-gray-400 font-bold`}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${nmFlat} ${nmButton} px-8 py-2 rounded-xl text-blue-600 dark:text-blue-400 font-bold disabled:opacity-50`}
            >
              {isSubmitting ? '...' : (editingProduct ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;