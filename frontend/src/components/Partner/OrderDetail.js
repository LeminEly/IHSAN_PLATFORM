import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { partner } from '../../services/api';

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const response = await partner.getOrder(id);
      setOrder(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;
  if (!order) return <div className="text-center py-20">Commande non trouvée</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-primary-600 hover:underline mb-4"
      >
        ← Retour
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Détail de la commande</h1>

        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Titre</span>
            <span className="font-medium">{order.title}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Description</span>
            <span className="font-medium">{order.description}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Montant</span>
            <span className="font-bold text-primary-600">{order.estimated_amount} MRU</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Quartier</span>
            <span className="font-medium">{order.location_quarter}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Statut</span>
            <span className={`px-2 py-1 rounded text-sm ${
              order.status === 'open' ? 'bg-green-100 text-green-800' :
              order.status === 'funded' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {order.status}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Validateur</span>
            <span className="font-medium">{order.validator?.full_name}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Téléphone validateur</span>
            <span className="font-medium">{order.validator?.phone}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Créé le</span>
            <span className="font-medium">{new Date(order.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;