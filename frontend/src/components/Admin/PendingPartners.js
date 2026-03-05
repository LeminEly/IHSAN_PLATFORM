import React, { useState, useEffect } from 'react';
import { admin } from '../../services/api';

function PendingPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const response = await admin.getPendingPartners();
      setPartners(response.data);
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
      await admin.approvePartner(id, reason);
      loadPartners();
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
      await admin.rejectPartner(id, reason);
      loadPartners();
    } catch (error) {
      alert('Erreur lors du rejet');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSiteVisit = async (id) => {
    const notes = window.prompt('Notes de la visite:');
    if (!notes) return;
    setActionLoading(true);
    try {
      await admin.recordSiteVisit(id, { notes });
      loadPartners();
      setSelectedPartner(null);
    } catch (error) {
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Partenaires en attente</h1>

      {selectedPartner && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Visite terrain</h2>
            <p className="mb-4">
              Partenaire: <strong>{selectedPartner.business_name}</strong>
            </p>
            <p className="mb-4">Adresse: {selectedPartner.address}</p>
            <textarea
              className="input mb-4"
              rows="4"
              placeholder="Notes de la visite..."
              id="visitNotes"
            ></textarea>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  const notes = document.getElementById('visitNotes').value;
                  if (notes) handleSiteVisit(selectedPartner.id, notes);
                }}
                className="btn-primary flex-1"
              >
                Confirmer la visite
              </button>
              <button
                onClick={() => setSelectedPartner(null)}
                className="btn-secondary flex-1"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {partners.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Aucun partenaire en attente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {partners.map(p => (
            <div key={p.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{p.business_name}</h3>
                  <p className="text-gray-600">Propriétaire: {p.owner_name}</p>
                  <p className="text-gray-600">{p.address}</p>
                  <p className="text-gray-600">Tél: {p.payment_phone}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setSelectedPartner(p)}
                    disabled={actionLoading}
                    className="btn-secondary"
                  >
                    Visite terrain
                  </button>
                  <button
                    onClick={() => handleApprove(p.id)}
                    disabled={actionLoading}
                    className="btn-success"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => handleReject(p.id)}
                    disabled={actionLoading}
                    className="btn-danger"
                  >
                    Rejeter
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-sm text-gray-500 block">Registre de commerce</span>
                <a
                  href={p.commerce_registry_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline text-sm"
                >
                  Voir le document
                </a>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Inscrit le {new Date(p.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PendingPartners;