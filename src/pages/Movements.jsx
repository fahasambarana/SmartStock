import { useState } from 'react';
import Table from '../components/Table';

const Movements = () => {
  const [activeTab, setActiveTab] = useState('in');

  const movements = [
    { id: 1, product: 'Produit A', quantity: 50, type: 'Entrée de Stock', date: '2024-03-01', sourceZone: '-', destinationZone: 'Zone A' },
    { id: 2, product: 'Produit B', quantity: 20, type: 'Sortie de Stock', date: '2024-03-02', sourceZone: 'Zone B', destinationZone: '-' },
    { id: 3, product: 'Produit C', quantity: 30, type: 'Transfert', date: '2024-03-03', sourceZone: 'Zone A', destinationZone: 'Zone B' },
  ];

  const filteredMovements = movements.filter(m => {
    if (activeTab === 'in') return m.type === 'Stock In';
    if (activeTab === 'out') return m.type === 'Stock Out';
    if (activeTab === 'transfer') return m.type === 'Transfer';
    return true;
  });

  const columns = [
    { key: 'product', label: 'Produit' },
    { key: 'quantity', label: 'Quantité' },
    { key: 'type', label: 'Type de Mouvement' },
    { key: 'date', label: 'Date' },
    { key: 'sourceZone', label: 'Zone Source' },
    { key: 'destinationZone', label: 'Zone Destination' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mouvements de Stock</h1>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('in')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'in'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Entrée de Stock
          </button>
          <button
            onClick={() => setActiveTab('out')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'out'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sortie de Stock
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'transfer'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Transfert
          </button>
        </nav>
      </div>

      <Table columns={columns} data={filteredMovements} />
    </div>
  );
};

export default Movements;