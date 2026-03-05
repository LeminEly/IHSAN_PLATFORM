import React, { useState, useEffect } from 'react';
import { validator } from '../../services/api';
import { useNavigate } from 'react-router-dom';

function ConfirmDelivery() {
  const [needs, setNeeds] = useState([]);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadNeedsToConfirm();
  }, []);

  const loadNeedsToConfirm = async () => {
    try {
      const response = await validator.getToConfirm();
      setNeeds(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleConfirm = async (needId) => {
    if (!photo) {
      alert('Veuillez prendre une photo de la remise');
      return;
    }

    setSubmitting(true);
    try {
      await validator.confirmDelivery(needId, { photo, proof_type: 'photo' });
      navigate('/validator');
    } catch (error) {
      alert('Erreur lors de la confirmation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;

  if (selectedNeed) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Confirmer la livraison</h1>

          <div className="bg-gray-50 p-4 rounded mb-6">
            <h3 className="font-bold">{selectedNeed.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{selectedNeed.location_quarter}</p>
            <div className="mt-2">
              <span className="text-sm">Partenaire: {selectedNeed.partner?.business_name}</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="label">Photo de la remise (visages floutés)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="input"
              required
            />
            {photoPreview && (
              <div className="mt-4">
                <img src={photoPreview} alt="Aperçu" className="max-w-full h-auto rounded" />
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedNeed(null)}
              className="btn-secondary flex-1"
            >
              Retour
            </button>
            <button
              onClick={() => handleConfirm(selectedNeed.id)}
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? 'Confirmation...' : 'Confirmer la livraison'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Livraisons à confirmer</h1>

      {needs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Aucune livraison en attente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {needs.map(need => (
            <div key={need.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{need.title}</h3>
                  <p className="text-gray-600">{need.location_quarter}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {need.estimated_amount} MRU
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <span className="text-gray-500">Donneur:</span>
                  <span className="ml-2">{need.transaction?.donor?.full_name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Téléphone:</span>
                  <span className="ml-2">{need.transaction?.donor?.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500">Partenaire:</span>
                  <span className="ml-2">{need.partner?.business_name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Financé le:</span>
                  <span className="ml-2">{new Date(need.funded_at).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedNeed(need)}
                className="btn-primary w-full mt-4"
              >
                Confirmer cette livraison
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConfirmDelivery;