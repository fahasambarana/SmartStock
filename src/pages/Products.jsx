import { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { FiPlus, FiAlertCircle } from 'react-icons/fi';
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
    category: 'Food',
    price: '',
    quantity: '',
    ZoneId: '',
    expirationDate: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const canEdit = user?.role === 'Admin' || user?.role === 'Manager';

  const columns = [
    { key: 'name', label: 'Nom du Produit' },
    { key: 'category', label: 'Catégorie' },
    { key: 'price', label: 'Prix' },
    { key: 'quantity', label: 'Quantité' },
    { key: 'storageZone', label: 'Zone de Stockage' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, zonesRes] = await Promise.all([
        getProducts(),
        getZones()
      ]);
      setProducts(productsRes.data);
      setAvailableZones(zonesRes.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Food',
      price: '',
      quantity: '',
      ZoneId: '',
      expirationDate: '',
    });
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
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) {
      try {
        await deleteProduct(product.id);
        fetchData(); // Refresh the list
      } catch (err) {
        alert('Erreur lors de la suppression du produit');
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Parse empty strings to null for relations
    const finalData = {
      ...formData,
      ZoneId: formData.ZoneId === '' ? null : formData.ZoneId
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, finalData);
      } else {
        await createProduct(finalData);
      }
      setIsModalOpen(false);
      fetchData(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'enregistrement du produit');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.Zone && product.Zone.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ).map(product => ({
    ...product,
    storageZone: product.Zone ? product.Zone.name : 'Aucune'
  }));

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
        <h1 className="text-2xl font-bold text-gray-800">Produits</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center transition-colors shadow-sm"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Ajouter un Produit
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
          placeholder="Rechercher des produits..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {filteredProducts.length === 0 && !error && (
          <div className="p-8 text-center text-gray-500">
            Aucun produit trouvé.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Produit <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ex: Ordinateur Portable"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="Food">Alimentation</option>
              <option value="Electronics">Électronique</option>
              <option value="Cosmetics">Cosmétiques</option>
              <option value="Other">Autre</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zone de Stockage</label>
            <select
              value={formData.ZoneId}
              onChange={(e) => setFormData({ ...formData, ZoneId: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">-- Sélectionnez une Zone --</option>
              {availableZones.map(zone => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} {zone.location ? `(${zone.location})` : ''}
                </option>
              ))}
            </select>
          </div>
          {formData.category === 'Food' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'Expiration</label>
              <input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          )}
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
                editingProduct ? 'Modifier' : 'Ajouter'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;