import React, { useState, useEffect } from 'react';
import { partner } from '../../services/api';
import { Link } from 'react-router-dom';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await partner.getOrders();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await partner.updateOrderStatus(orderId, status);
      loadOrders();
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'funded': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Commandes</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{order.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{order.location_quarter}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <p className="text-gray-700 mt-3 mb-4">{order.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-gray-500">Montant:</span>
                <span className="ml-2 font-medium">{order.estimated_amount} MRU</span>
              </div>
              <div>
                <span className="text-gray-500">Validateur:</span>
                <span className="ml-2">{order.validator?.full_name}</span>
              </div>
            </div>

            {order.status === 'funded' && (
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleStatusUpdate(order.id, 'preparing')}
                  className="btn-secondary flex-1"
                >
                  En préparation
                </button>
                <button
                  onClick={() => handleStatusUpdate(order.id, 'ready')}
                  className="btn-primary flex-1"
                >
                  Prêt
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;