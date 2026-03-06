import { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { FiPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Products = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Product A', category: 'Electronics', price: 100, quantity: 50 },
    { id: 2, name: 'Product B', category: 'Food', price: 20, quantity: 30, expirationDate: '2024-12-31' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food',
    price: '',
    quantity: '',
    storageZone: '',
    expirationDate: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const canEdit = user?.role === 'Admin' || user?.role === 'Manager';

  const columns = [
    { key: 'name', label: 'Nom du Produit' },
    { key: 'category', label: 'Catégorie' },
    { key: 'price', label: 'Prix' },
    { key: 'quantity', label: 'Quantité' },
    { key: 'storageZone', label: 'Zone de Stockage' },
  ];

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Food',
      price: '',
      quantity: '',
      storageZone: '',
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
      storageZone: product.storageZone || '',
      expirationDate: product.expirationDate || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (product) => {
    setProducts(products.filter(p => p.id !== product.id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } : p));
    } else {
      setProducts([...products, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produits</h1>
        {canEdit && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Ajouter un Produit
          </button>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher des produits..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <Table
        columns={columns}
        data={filteredProducts}
        onEdit={canEdit ? handleEdit : null}
        onDelete={canEdit ? handleDelete : null}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom du Produit</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Catégorie</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Food">Alimentation</option>
              <option value="Electronics">Électronique</option>
              <option value="Cosmetics">Cosmétiques</option>
              <option value="Other">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Prix</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantité</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Zone de Stockage</label>
            <input
              type="text"
              value={formData.storageZone}
              onChange={(e) => setFormData({ ...formData, storageZone: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {formData.category === 'Food' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Date d'Expiration</label>
              <input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          )}
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
              {editingProduct ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;