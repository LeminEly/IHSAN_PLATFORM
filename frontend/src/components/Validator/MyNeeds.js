import React, { useState, useEffect } from 'react';
import { validator } from '../../services/api';

function MyNeeds() {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNeeds();
  }, []);

  const loadNeeds = async () => {
    try {
      const response = await validator.getNeeds();
      setNeeds(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'funded': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Mes besoins</h1>

      <div className="space-y-4">
        {needs.map(need => (
          <div key={need.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{need.title}</h3>
                <p className="text-gray-600 mt-1">{need.location_quarter}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(need.status)}`}>
                {need.status}
              </span>
            </div>

            <p className="text-gray-700 mt-3 mb-4">{need.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Montant:</span>
                <span className="ml-2 font-medium">{need.estimated_amount} MRU</span>
              </div>
              <div>
                <span className="text-gray-500">Catégorie:</span>
                <span className="ml-2">{need.category}</span>
              </div>
              <div>
                <span className="text-gray-500">Partenaire:</span>
                <span className="ml-2">{need.partner?.business_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Créé le:</span>
                <span className="ml-2">{new Date(need.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {need.beneficiary && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Bénéficiaire:</span> {need.beneficiary.description}
                  {need.beneficiary.family_size && ` (Famille de ${need.beneficiary.family_size} personnes)`}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyNeeds;