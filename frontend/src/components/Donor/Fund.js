import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { donor } from '../../services/api';

function Fund() {
  const { id } = useParams();
  const [need, setNeed] = useState(null);
  const [formData, setFormData] = useState({
    payment_method: 'mobile_money',
    donor_phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadNeed();
  }, [id]);

  const loadNeed = async () => {
    try {
      const response = await donor.getNeed(id);
      setNeed(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      await donor.fundNeed(id, formData);
      navigate('/donor/donations');
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;
  if (!need) return <div className="text-center py-20">Besoin non trouvé</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Finaliser votre don</h1>

        {/* Need Summary */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <h2 className="font-bold mb-2">{need.title}</h2>
          <p className="text-gray-600 mb-2">{need.location_quarter}</p>
          <div className="flex justify-between items-center">
            <span>Montant</span>
            <span className="text-xl font-bold text-primary-600">
              {need.estimated_amount} MRU
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Numéro de téléphone (Mobile Money)</label>
            <input
              type="tel"
              value={formData.donor_phone}
              onChange={(e) => setFormData({ ...formData, donor_phone: e.target.value })}
              className="input"
              placeholder="+222 XX XX XX XX"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Le numéro associé à votre compte Mobile Money
            </p>
          </div>

          <div>
            <label className="label">Méthode de paiement</label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="input"
            >
              <option value="mobile_money">Mobile Money</option>
            </select>
          </div>

          <div className="border-t pt-6">
            <button
              type="submit"
              disabled={processing}
              className="btn-primary w-full py-3"
            >
              {processing ? 'Traitement...' : `Confirmer le don de ${need.estimated_amount} MRU`}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Vous recevrez une notification SMS dès que votre don sera confirmé
        </p>
      </div>
    </div>
  );
}

export default Fund;