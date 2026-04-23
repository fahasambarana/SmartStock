import { useState } from 'react';
import { FiArrowUpRight, FiArrowDownLeft, FiRefreshCw, FiPackage, FiCalendar, FiMapPin } from 'react-icons/fi';

const Movements = () => {
  const [activeTab, setActiveTab] = useState('in');

  // --- STYLES NEUMORPHISMES MIS À JOUR ---
  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";

  const movements = [
    { id: 1, product: 'Produit A', quantity: 50, type: 'in', date: '2024-03-01', sourceZone: '-', destinationZone: 'Zone A' },
    { id: 2, product: 'Produit B', quantity: 20, type: 'out', date: '2024-03-02', sourceZone: 'Zone B', destinationZone: '-' },
    { id: 3, product: 'Produit C', quantity: 30, type: 'transfer', date: '2024-03-03', sourceZone: 'Zone A', destinationZone: 'Zone B' },
    { id: 4, product: 'Produit D', quantity: 15, type: 'in', date: '2024-03-04', sourceZone: '-', destinationZone: 'Entrepôt Central' },
  ];

  const filteredMovements = movements.filter(m => m.type === activeTab);

  const tabs = [
    { id: 'in', label: 'Entrées', icon: FiArrowDownLeft, color: 'text-green-600 dark:text-green-400' },
    { id: 'out', label: 'Sorties', icon: FiArrowUpRight, color: 'text-red-600 dark:text-red-400' },
    { id: 'transfer', label: 'Transferts', icon: FiRefreshCw, color: 'text-blue-600 dark:text-blue-400' },
  ];

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-[#1a1d23] p-8 text-gray-700 dark:text-gray-200 transition-colors duration-300">
      {/* Header */}
      <h1 className="text-3xl  text-[#44474a] dark:text-gray-100 mb-10 uppercase  tracking-tighter">
       Mouvement de Stock
      </h1>

      {/* Neumorphic Tabs Navigation */}
      <div className={`${nmFlat} rounded-2xl p-2 mb-12 inline-flex flex-wrap gap-2`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                isActive 
                  ? `${nmInset} ${tab.color} scale-95` 
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className={`mr-2 stroke-[3px] ${isActive ? 'opacity-100' : 'opacity-40'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMovements.map((m) => (
          <div 
            key={m.id} 
            className={`${nmFlat} rounded-[2rem] p-6 hover:scale-[1.02] transition-transform duration-300 flex flex-col`}
          >
            {/* Card Header: Product & Icon */}
            <div className="flex justify-between items-start mb-6">
              <div className={`${nmInset} p-4 rounded-2xl`}>
                <FiPackage size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-gray-800 dark:text-gray-100">
                  {m.quantity}
                </span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Unités</p>
              </div>
            </div>

            {/* Product Name */}
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 truncate">
              {m.product}
            </h3>

            {/* Details Section */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <FiCalendar className="mr-2" />
                <span>{m.date}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-gray-400">Source</span>
                  <span className="text-sm font-semibold truncate max-w-[100px]">{m.sourceZone}</span>
                </div>
                <div className="px-2">
                  <FiArrowUpRight className={tabs.find(t => t.id === activeTab).color} />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] uppercase font-bold text-gray-400">Destination</span>
                  <span className="text-sm font-semibold truncate max-w-[100px]">{m.destinationZone}</span>
                </div>
              </div>
            </div>

            {/* Footer Tag */}
            <div className="mt-auto pt-4 border-t border-gray-300/30 dark:border-white/5 flex justify-between items-center">
               <span className={`text-[10px] font-black uppercase tracking-widest flex items-center ${tabs.find(t => t.id === activeTab).color}`}>
                 ● {activeTab === 'in' ? 'Entrée confirmée' : activeTab === 'out' ? 'Sortie effectuée' : 'Transfert complété'}
               </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMovements.length === 0 && (
        <div className={`${nmInset} rounded-[2rem] p-20 text-center`}>
          <div className="inline-block p-6 rounded-full bg-[#e0e5ec] dark:bg-[#1a1d23] mb-4 opacity-40">
            <FiRefreshCw size={48} className="animate-spin-slow" />
          </div>
          <p className="text-gray-400 font-bold italic">Aucun mouvement trouvé dans cette catégorie.</p>
        </div>
      )}
    </div>
  );
};

export default Movements;