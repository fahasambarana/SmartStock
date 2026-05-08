import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2, FiBox, FiFilter, FiUser, FiLayers, FiTag } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({ categoryId: '', managerId: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    CategoryId: '',
    quantity: 0,
    price: 0,
    ZoneId: '',
    expirationDate: '',
    volume_unitaire: 0
  });

  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";
  const nmButton = "active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] transition-all duration-200";

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('CategoryId', filters.categoryId);
      if (filters.managerId) params.append('UserId', filters.managerId);
      
      const [prodRes, catRes, userRes] = await Promise.all([
        api.get(`/products?${params.toString()}`),
        api.get('/categories'),
        user.role === 'admin' ? api.get('/users') : Promise.resolve({ data: { data: [] } })
      ]);

      setProducts(prodRes.data);
      setCategories(catRes.data);
      if (user.role === 'admin') {
        setManagers(userRes.data.data.filter(u => u.role === 'manager'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  // Get template names for selected category
  const selectedCategory = categories.find(c => c.id === parseInt(formData.CategoryId));
  const availableTemplates = selectedCategory?.Products || [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header & Filters */}
      <div className="flex flex-col gap-8 mb-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-gray-700 dark:text-gray-100 uppercase tracking-tighter">Inventaire</h1>
            <p className="text-gray-500 font-medium">Gestion des stocks et des produits</p>
          </div>
          {user.role === 'manager' && (
            <button
              onClick={() => { setEditingProduct(null); setFormData({ name: '', CategoryId: '', quantity: 0, price: 0, ZoneId: '', expirationDate: '', volume_unitaire: 0 }); setIsModalOpen(true); }}
              className={`${nmFlat} ${nmButton} px-8 py-4 rounded-2xl text-indigo-600 font-black flex items-center gap-2`}
            >
              <FiPlus /> Ajouter Stock
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className={`${nmInset} px-4 py-2 rounded-xl flex items-center gap-3`}>
            <FiFilter className="text-gray-400" />
            <select 
              value={filters.categoryId} 
              onChange={e => setFilters({...filters, categoryId: e.target.value})}
              className="bg-transparent outline-none text-sm font-bold text-gray-600"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {user.role === 'admin' && (
            <div className={`${nmInset} px-4 py-2 rounded-xl flex items-center gap-3`}>
              <FiUser className="text-gray-400" />
              <select 
                value={filters.managerId} 
                onChange={e => setFilters({...filters, managerId: e.target.value})}
                className="bg-transparent outline-none text-sm font-bold text-gray-600"
              >
                <option value="">Tous les Managers</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${nmFlat} p-6 rounded-[2.5rem] relative group`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`${nmInset} p-3 rounded-2xl text-indigo-600`}>
                  <FiBox size={24} />
                </div>
                <div className="flex gap-2">
                  {user.role === 'manager' && (
                    <>
                      <button onClick={() => { setEditingProduct(product); setFormData(product); setIsModalOpen(true); }} className="text-blue-500"><FiEdit2 /></button>
                      <button onClick={async () => { if(window.confirm('Supprimer?')) { await api.delete(`/products/${product.id}`); fetchData(); } }} className="text-red-400"><FiTrash2 /></button>
                    </>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-black text-gray-700 dark:text-gray-100 mb-1">{product.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                  {product.Category?.name || 'Sans Catégorie'}
                </span>
                <span className="text-[10px] font-black uppercase text-gray-400 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800">
                  {product.unit || 'pcs'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className={`${nmInset} p-3 rounded-2xl`}>
                  <p className="text-[9px] font-black text-gray-400 uppercase">Stock Actuel</p>
                  <p className={`text-lg font-black ${product.quantity <= 10 ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'}`}>
                    {product.quantity}
                  </p>
                </div>
                <div className={`${nmInset} p-3 rounded-2xl`}>
                  <p className="text-[9px] font-black text-gray-400 uppercase">Localisation</p>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400 truncate">
                    {product.Zone?.name || 'Non Assigné'}
                  </p>
                </div>
              </div>

              {user.role === 'admin' && product.manager && (
                <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-800/50 flex items-center gap-2">
                  <FiUser className="text-gray-400" size={12} />
                  <span className="text-[10px] font-bold text-gray-500">Géré par: {product.manager.username}</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal Produit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${nmFlat} w-full max-w-2xl rounded-[3rem] p-10 relative`}
            >
              <h2 className="text-2xl font-black text-gray-700 dark:text-gray-100 mb-8 uppercase tracking-tighter">
                {editingProduct ? 'Modifier Stock' : 'Nouveau Stock'}
              </h2>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-2">Catégorie</label>
                  <select
                    value={formData.CategoryId}
                    onChange={(e) => setFormData({...formData, CategoryId: e.target.value, name: ''})}
                    className={`${nmInset} w-full px-6 py-4 rounded-2xl outline-none`}
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-2">Produit (Modèle autorisé)</label>
                  <select
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`${nmInset} w-full px-6 py-4 rounded-2xl outline-none`}
                    required
                    disabled={!formData.CategoryId}
                  >
                    <option value="">Sélectionner un produit</option>
                    {availableTemplates.map((p, i) => <option key={i} value={p.name}>{p.name} ({p.unit})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-2">Quantité Initiale</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className={`${nmInset} w-full px-6 py-4 rounded-2xl outline-none`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-2">Prix Unitaire</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className={`${nmInset} w-full px-6 py-4 rounded-2xl outline-none`}
                  />
                </div>

                <div className="md:col-span-2 flex gap-4 mt-6">
                  <button type="submit" className={`${nmFlat} ${nmButton} flex-1 py-4 rounded-2xl text-indigo-600 font-black uppercase tracking-widest`}>
                    {editingProduct ? 'Mettre à jour' : 'Ajouter au Stock'}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className={`${nmFlat} ${nmButton} px-8 py-4 rounded-2xl text-gray-400 font-bold uppercase`}>
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;