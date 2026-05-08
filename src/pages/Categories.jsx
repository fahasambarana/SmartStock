import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiX, FiLayers, FiBox, FiActivity } from 'react-icons/fi';
import api from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', products: [{ name: '', unit: '' }] });

  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";
  const nmButton = "active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] transition-all duration-200";

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur categories:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', products: [{ name: '', unit: '' }] });
      fetchCategories();
    } catch (error) {
      console.error('Erreur submit:', error);
    }
  };

  const handleAddProductField = () => {
    setFormData({ ...formData, products: [...formData.products, { name: '', unit: '' }] });
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index][field] = value;
    setFormData({ ...formData, products: newProducts });
  };

  const handleRemoveProductField = (index) => {
    setFormData({ ...formData, products: formData.products.filter((_, i) => i !== index) });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-700 dark:text-gray-100 tracking-tighter uppercase">Spécifications</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Définissez les modèles de produits et leurs unités</p>
        </div>
        <button
          onClick={() => { setEditingCategory(null); setFormData({ name: '', description: '', products: [{ name: '', unit: '' }] }); setIsModalOpen(true); }}
          className={`${nmFlat} ${nmButton} px-8 py-4 rounded-2xl text-blue-600 font-bold flex items-center gap-2 group`}
        >
          <FiPlus className="group-hover:rotate-90 transition-transform" />
          Nouvelle Catégorie
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${nmFlat} p-8 rounded-[3rem] relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 p-6 flex gap-2">
                <button onClick={() => { setEditingCategory(cat); setFormData({ name: cat.name, description: cat.description, products: cat.Products.map(p => ({ name: p.name, unit: p.unit })) }); setIsModalOpen(true); }} className="text-blue-500 hover:scale-110 transition-transform"><FiEdit2 /></button>
                <button onClick={async () => { if(window.confirm('Supprimer?')) { await api.delete(`/categories/${cat.id}`); fetchCategories(); } }} className="text-red-400 hover:scale-110 transition-transform"><FiTrash2 /></button>
              </div>

              <div className={`${nmInset} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-blue-600`}>
                <FiLayers size={28} />
              </div>

              <h3 className="text-2xl font-black text-gray-700 dark:text-gray-100 mb-2">{cat.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2">{cat.description}</p>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                  <FiBox /> Modèles autorisés
                </p>
                <div className="flex flex-wrap gap-2">
                  {cat.Products?.map((p, i) => (
                    <span key={i} className={`${nmInset} px-3 py-1 rounded-full text-[11px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2`}>
                      {p.name} <span className="text-blue-500 text-[9px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30">{p.unit}</span>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal Neumorphique */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`${nmFlat} w-full max-w-2xl rounded-[3.5rem] p-10 max-h-[90vh] overflow-y-auto relative`}
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600"><FiX size={24}/></button>
              
              <h2 className="text-3xl font-black text-gray-700 dark:text-gray-100 mb-8 uppercase tracking-tighter">
                {editingCategory ? 'Modifier Catégorie' : 'Nouvelle Catégorie'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 ml-2">Nom de la catégorie</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`${nmInset} w-full px-6 py-4 rounded-2xl outline-none focus:text-blue-600 transition-colors`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 ml-2">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className={`${nmInset} w-full px-6 py-4 rounded-2xl outline-none`}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-xs font-black uppercase text-gray-400">Modèles de produits & Unités</label>
                    <button type="button" onClick={handleAddProductField} className="text-blue-600 text-sm font-bold flex items-center gap-1"><FiPlus/> Ajouter</button>
                  </div>
                  
                  {formData.products.map((p, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <input
                        placeholder="Ex: Riz Luxe"
                        value={p.name}
                        onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                        className={`${nmInset} flex-1 px-5 py-3 rounded-xl text-sm outline-none`}
                        required
                      />
                      <input
                        placeholder="kg, L, pcs..."
                        value={p.unit}
                        onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
                        className={`${nmInset} w-24 px-5 py-3 rounded-xl text-sm outline-none text-center`}
                        required
                      />
                      {formData.products.length > 1 && (
                        <button type="button" onClick={() => handleProductChange(index)} className="text-red-400 p-2"><FiTrash2/></button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className={`${nmFlat} ${nmButton} w-full py-5 rounded-[2rem] text-blue-600 font-black uppercase tracking-widest mt-4`}
                >
                  {editingCategory ? 'Mettre à jour' : 'Créer la catégorie'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Categories;
