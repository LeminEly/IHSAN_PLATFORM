import React, { useState, useEffect } from 'react';
import { admin } from '../../services/api';

function PendingValidators() {
  const [validators, setValidators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadValidators();
  }, []);

  const loadValidators = async () => {
    try {
      const response = await admin.getPendingValidators();
      setValidators(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const reason = window.prompt('Raison (optionnelle):');
    setActionLoading(true);
    try {
      await admin.approveValidator(id, reason);
      loadValidators();
    } catch (error) {
      alert('Erreur lors de l\'approbation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Raison du rejet:');
    if (!reason) return;
    setActionLoading(true);
    try {
      await admin.rejectValidator(id, reason);
      loadValidators();
    } catch (error) {
      alert('Erreur lors du rejet');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Validateurs en attente</h1>

      {validators.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Aucun validateur en attente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {validators.map(v => (
            <div key={v.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{v.user.full_name}</h3>
                  <p className="text-gray-600">{v.user.phone}</p>
                  {v.user.email && <p className="text-gray-600 text-sm">{v.user.email}</p>}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleApprove(v.id)}
                    disabled={actionLoading}
                    className="btn-success"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => handleReject(v.id)}
                    disabled={actionLoading}
                    className="btn-danger"
                  >
                    Rejeter
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="text-sm text-gray-500 block">Carte d'identité</span>
                  <a
                    href={v.id_card_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline text-sm"
                  >
                    Voir le document
                  </a>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Selfie</span>
                  <a
                    href={v.selfie_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline text-sm"
                  >
                    Voir la photo
                  </a>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Inscrit le {new Date(v.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PendingValidators;