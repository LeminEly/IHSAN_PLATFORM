import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { donor } from '../../services/api';

function NeedDetail() {
  const { id } = useParams();
  const [need, setNeed] = useState(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div className="text-center py-20">Chargement...</div>;
  if (!need) return <div className="text-center py-20">Besoin non trouvé</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-primary-600 hover:underline mb-4 inline-flex items-center"
      >
        ← Retour
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 text-white p-6">
          <h1 className="text-3xl font-bold mb-2">{need.title}</h1>
          <div className="flex items-center space-x-4">
            <span className="bg-primary-500 px-3 py-1 rounded">
              {need.category?.replace('_', ' ')}
            </span>
            <span>Priorité {need.priority}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{need.description}</p>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-xl font-bold mb-4">Localisation</h2>
            <div className="bg-gray-50 p-4 rounded">
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Quartier: {need.location_quarter}
              </div>
            </div>
          </div>

          {/* Validator Info */}
          <div>
            <h2 className="text-xl font-bold mb-4">Validateur</h2>
            <div className="bg-gray-50 p-4 rounded">
              <div className="font-medium">{need.validator?.full_name}</div>
              {need.validator?.validator && (
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="text-yellow-500">★ {need.validator.validator.reputation_score}</span>
                  <span className="text-gray-500">{need.validator.validator.total_deliveries} livraisons</span>
                </div>
              )}
            </div>
          </div>

          {/* Partner Info */}
          <div>
            <h2 className="text-xl font-bold mb-4">Partenaire</h2>
            <div className="bg-gray-50 p-4 rounded">
              <div className="font-medium">{need.partner?.business_name}</div>
              <div className="text-gray-600 text-sm mt-1">{need.partner?.address}</div>
            </div>
          </div>

          {/* Amount */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center">
              <span className="text-2xl text-gray-600">Montant à financer</span>
              <span className="text-4xl font-bold text-primary-600">
                {need.estimated_amount} MRU
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <Link
              to={`/donor/fund/${need.id}`}
              className="btn-primary flex-1 text-center py-3"
            >
              Financer ce besoin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NeedDetail;