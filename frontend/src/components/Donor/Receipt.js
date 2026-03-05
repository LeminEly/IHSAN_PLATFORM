import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { donor } from '../../services/api';

function Receipt() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceipt();
  }, [id]);

  const loadReceipt = async () => {
    try {
      const response = await donor.getReceipt(id);
      setReceipt(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;
  if (!receipt) return <div className="text-center py-20">Reçu non trouvé</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">IHSAN</h1>
          <p className="text-gray-500">Reçu de don</p>
        </div>

        {/* Receipt Number */}
        <div className="bg-gray-50 p-4 rounded text-center mb-6">
          <div className="text-sm text-gray-500">Numéro de reçu</div>
          <div className="text-xl font-mono">{receipt.receipt_number}</div>
        </div>

        {/* Details */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Date</span>
            <span className="font-medium">{new Date(receipt.date).toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Montant</span>
            <span className="text-2xl font-bold text-primary-600">{receipt.amount} MRU</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Statut</span>
            <span className={`px-2 py-1 rounded text-sm ${
              receipt.status === 'confirmed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {receipt.status === 'confirmed' ? 'Confirmé' : 'En attente'}
            </span>
          </div>
        </div>

        {/* Need Details */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <h3 className="font-bold mb-2">Besoin financé</h3>
          <p className="text-gray-700">{receipt.need.title}</p>
          <p className="text-sm text-gray-500 mt-1">{receipt.need.location_quarter}</p>
        </div>

        {/* Impact Proof */}
        {receipt.impact_proof && (
          <div className="mb-6">
            <h3 className="font-bold mb-2">Preuve d'impact</h3>
            <img 
              src={receipt.impact_proof.media_url} 
              alt="Preuve"
              className="rounded-lg max-w-full"
            />
            <p className="text-sm text-gray-500 mt-2">
              {new Date(receipt.impact_proof.uploaded_at).toLocaleString()}
            </p>
          </div>
        )}

        {/* Blockchain */}
        {receipt.blockchain && (
          <div className="border-t pt-6">
            <h3 className="font-bold mb-2">Vérification blockchain</h3>
            <div className="bg-gray-50 p-4 rounded text-sm">
              <div className="grid gap-2">
                <div>
                  <span className="text-gray-500">Hash:</span>
                  <code className="ml-2 font-mono text-xs break-all">
                    {receipt.blockchain.hash}
                  </code>
                </div>
                {receipt.blockchain.explorer_url && (
                  <a
                    href={receipt.blockchain.explorer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-block mt-2"
                  >
                    Voir sur l'explorateur blockchain
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => window.print()}
            className="btn-secondary"
          >
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export default Receipt;