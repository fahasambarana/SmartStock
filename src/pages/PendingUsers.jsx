import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiUsers, FiClock, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";
  const nmButton = "active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] transition-all duration-200";

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/pending');
      setUsers(response.data.data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs en attente");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/users/${id}/approve`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert("Erreur lors de l'approbation");
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Refuser cet utilisateur ?")) {
      try {
        await api.put(`/users/${id}/reject`);
        setUsers(users.filter(u => u.id !== id));
      } catch (err) {
        alert("Erreur lors du refus");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-700 dark:text-gray-100 tracking-tighter uppercase">Approbation Comptes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gérez les demandes d'inscription en attente</p>
        </div>
        <div className={`${nmFlat} p-4 rounded-2xl text-blue-600`}>
          <FiUsers size={24} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className={`${nmFlat} p-6 rounded-2xl text-red-500 flex items-center gap-3`}>
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : users.length === 0 ? (
        <div className={`${nmInset} p-20 rounded-[3rem] text-center`}>
          <FiClock size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 font-bold italic">Aucune demande en attente</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {users.map((user) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className={`${nmFlat} p-6 rounded-[2.5rem] flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
                      {user.role}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 dark:text-gray-100 mb-1">{user.username}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{user.email}</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(user.id)}
                    className={`${nmFlat} ${nmButton} flex-1 py-3 rounded-xl text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-2`}
                  >
                    <FiCheck size={18} />
                    <span>Approuver</span>
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    className={`${nmFlat} ${nmButton} flex-1 py-3 rounded-xl text-red-500 font-bold flex items-center justify-center gap-2`}
                  >
                    <FiX size={18} />
                    <span>Refuser</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default PendingUsers;
