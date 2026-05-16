import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2, FiBox, FiFilter, FiUser, FiSearch, FiAlertCircle, FiMapPin } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({ categoryId: '', managerId: '', search: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    CategoryId: '',
    quantity: 0,
    price: 0,
    ZoneId: '',
    expirationDate: '',
    volume_unitaire: 0
  });

  // --- STYLES NEUMORPHISMES ---
  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";
  const nmButton = "active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] transition-all duration-200";

  useEffect(() => {
    fetchData();
  }, [filters.categoryId, filters.managerId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('CategoryId', filters.categoryId);
      if (filters.managerId) params.append('UserId', filters.managerId);
      
      const [prodRes, catRes, zoneRes, userRes] = await Promise.all([
        api.get(`/products?${params.toString()}`),
        api.get('/categories'),
        api.get('/zones'),
        user.role === 'admin' ? api.get('/users') : Promise.resolve({ data: { data: [] } })
      ]);

      setProducts(prodRes.data);
      setCategories(catRes.data);
      setZones(zoneRes.data || []);
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

  const selectedCategory = categories.find(c => c.id === parseInt(formData.CategoryId));
  const availableTemplates = selectedCategory?.Products || [];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen transition-colors duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-700 dark:text-gray-100 uppercase tracking-tighter italic">Inventaire</h1>
          <p className="text-gray-500 font-medium">Gestion centralisée des stocks</p>
        </div>
        
        {user.role === 'manager' && (
          <button
            onClick={() => { 
              setEditingProduct(null); 
              setFormData({ name: '', CategoryId: '', quantity: 0, price: 0, ZoneId: '', expirationDate: '', volume_unitaire: 0 }); 
              setIsModalOpen(true); 
            }}
            className={`${nmFlat} ${nmButton} px-8 py-4 rounded-2xl text-indigo-600 font-black flex items-center gap-2 uppercase text-xs tracking-widest`}
          >
            <FiPlus strokeWidth={3} /> Nouveau Stock
          </button>
        )}
      </div>

      {/* FILTERS BAR */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className={`${nmInset} flex-1 min-w-[250px] px-5 py-3 rounded-2xl flex items-center gap-3`}>
          <FiSearch className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher un produit..."
            className="bg-transparent outline-none w-full text-sm font-bold text-gray-600 dark:text-gray-300"
            value={filters.search}
            onChange={e => setFilters({...filters, search: e.target.value})}
          />
        </div>

        <div className={`${nmInset} px-5 py-3 rounded-2xl flex items-center gap-3`}>
          <FiFilter className="text-gray-400" />
          <select 
            value={filters.categoryId} 
            onChange={e => setFilters({...filters, categoryId: e.target.value})}
            className="bg-transparent outline-none text-sm font-bold text-gray-600 dark:text-gray-300 cursor-pointer"
          >
            <option value="">Catégories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {user.role === 'admin' && (
          <div className={`${nmInset} px-5 py-3 rounded-2xl flex items-center gap-3`}>
            <FiUser className="text-gray-400" />
            <select 
              value={filters.managerId} 
              onChange={e => setFilters({...filters, managerId: e.target.value})}
              className="bg-transparent outline-none text-sm font-bold text-gray-600 dark:text-gray-300 cursor-pointer"
            >
              <option value="">Managers</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* TABLE SECTION */}
      <div className={`${nmFlat} rounded-[2.5rem] overflow-hidden transition-all duration-500`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-200/50 dark:border-gray-800/50">
                <th className="p-6">Produit</th>
                <th className="p-6">Catégorie</th>
                <th className="p-6">Stock</th>
                <th className="p-6">Prix</th>
                <th className="p-6">Zone</th>
                {user.role === 'admin' && <th className="p-6">Manager</th>}
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group border-b border-gray-200/30 dark:border-gray-800/30 hover:bg-white/5 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`${nmInset} p-2 rounded-lg text-indigo-500`}>
                        <FiBox size={18} />
                      </div>
                      <span className="font-bold text-gray-700 dark:text-gray-200">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                      {product.Category?.name || '---'}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black ${product.quantity <= 10 ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                        {product.quantity}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{product.unit || 'pcs'}</span>
                    </div>
                  </td>
                  <td className="p-6 font-mono text-sm font-bold text-gray-500 italic">
                    {product.price?.toLocaleString()} FCFA
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                       {product.Zone?.name || 'Non Assigné'}
                    </span>
                  </td>
                  {user.role === 'admin' && (
                    <td className="p-6">
                      <span className="text-xs font-medium text-gray-400">
                        {product.manager?.username || '---'}
                      </span>
                    </td>
                  )}
                  <td className="p-6">
                    <div className="flex justify-end gap-3">
                      {user.role === 'manager' && (
                        <>
                          <button 
                            onClick={() => { setEditingProduct(product); setFormData(product); setIsModalOpen(true); }}
                            className={`${nmFlat} p-2 rounded-xl text-blue-500 hover:scale-110 transition-transform`}
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button 
                            onClick={async () => { if(window.confirm('Supprimer?')) { await api.delete(`/products/${product.id}`); fetchData(); } }}
                            className={`${nmFlat} p-2 rounded-xl text-red-400 hover:scale-110 transition-transform`}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <FiAlertCircle size={48} className="text-gray-300" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Aucun produit trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL - Identique à l'original pour la logique de formulaire */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`${nmFlat} w-full max-w-2xl rounded-[3rem] p-10 relative`}
            >
              <h2 className="text-2xl font-black text-gray-700 dark:text-gray-100 mb-8 uppercase tracking-tighter">
                {editingProduct ? 'Modifier Stock' : 'Nouveau Stock'}
              </h2>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">Catégorie</label>
                  <select
                    value={formData.CategoryId}
                    onChange={(e) => setFormData({...formData, CategoryId: e.target.value, name: ''})}
                    className={`${nmInset} w-full px-6 py-4 rounded-2xl outline-none bg-transparent dark:text-white`}
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">Produit</label>
                  <select
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`${nmInset} w-full px-6 py-4 rounded-2xl outline-none bg-transparent dark:text-white disabled:opacity-50`}
                    required
                    disabled={!formData.CategoryId}
                  >
                    <option value="">Sélectionner un produit</option>
                    {availableTemplates.map((p, i) => <option key={i} value={p.name}>{p.name} ({p.unit})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">Quantité</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className={`${nmInset} w-full px-6 py-4 rounded-2xl outline-none bg-transparent dark:text-white`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">Prix (Unit)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className={`${nmInset} w-full px-6 py-4 rounded-2xl outline-none bg-transparent dark:text-white`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">
                    Zone de stockage
                  </label>
                  <div className={`${nmInset} flex items-center px-5 rounded-2xl`}>
                    <FiMapPin className="text-gray-400 mr-3" />
                    <select
                      value={formData.ZoneId || ''}
                      onChange={(e) => setFormData({...formData, ZoneId: e.target.value})}
                      className="w-full py-4 outline-none bg-transparent dark:text-white"
                      required
                    >
                      <option value="">Sélectionner une zone</option>
                      {zones.map(zone => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} - max {zone.capacite_max} {zone.unite_capacite}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-4 mt-8">
                  <button type="submit" className={`${nmFlat} ${nmButton} flex-1 py-5 rounded-2xl text-indigo-600 font-black uppercase tracking-widest text-xs`}>
                    {editingProduct ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className={`${nmFlat} ${nmButton} px-10 py-5 rounded-2xl text-gray-400 font-bold uppercase text-xs tracking-widest`}>
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
