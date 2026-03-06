import React, { useState, useEffect } from 'react';
import { donor } from '../../services/api';
import { Link } from 'react-router-dom';

function Donations() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const [donationsRes, statsRes] = await Promise.all([
        donor.getDonations(),
        donor.getDonationStats()
      ]);
      setDonations(donationsRes.data.donations);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Mes dons</h1>

      {/* Stats */}
      {stats && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-primary-600">
              {stats.overview.total_amount} MRU
            </div>
            <div className="text-gray-600">Total donné</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">
              {stats.overview.total_count}
            </div>
            <div className="text-gray-600">Nombre de dons</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">
              {Number(stats.overview.average_amount).toFixed(2)} MRU
            </div>
            <div className="text-gray-600">Don moyen</div>
          </div>
        </div>
      )}

      {/* Donations List */}
      <div className="space-y-4">
        {donations.map(donation => (
          <div key={donation.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{donation.need.title}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {donation.need.location_quarter} • {donation.need.partner?.business_name}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-500">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                    {donation.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">
                  {donation.amount} MRU
                </div>
                <div className="text-sm text-gray-500">
                  Reçu: {donation.receipt_number}
                </div>
              </div>
            </div>

            {donation.impact_proof && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={donation.impact_proof.thumbnail_url} 
                      alt="Preuve"
                      className="w-12 h-12 rounded object-cover"
                    />
                    <span className="ml-3 text-sm text-gray-600">
                      Preuve d'impact disponible
                    </span>
                  </div>
                  <Link
                    to={`/donor/receipt/${donation.id}`}
                    className="text-primary-600 hover:underline text-sm"
                  >
                    Voir le reçu →
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Donations;