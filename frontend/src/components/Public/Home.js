import React, { useState, useEffect } from 'react';
import { publicApi } from '../../services/api';
import socket from '../../services/socket';
import MapView from './MapView';
import { Link } from 'react-router-dom';

function Home() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();

    socket.on('new-transaction', (newTransaction) => {
      setTransactions(prev => [newTransaction, ...prev].slice(0, 50));
    });

    socket.on('stats-updated', (newStats) => {
      setStats(newStats);
    });

    return () => {
      socket.off('new-transaction');
      socket.off('stats-updated');
    };
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await publicApi.getDashboard({ limit: 10 });
      setStats(response.data.data.stats);
      setTransactions(response.data.data.transactions);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-2xl p-12 mb-12">
        <h1 className="text-5xl font-bold mb-4">IHSAN</h1>
        <p className="text-xl mb-8 max-w-2xl">
          Une plateforme de charité transparente où chaque don est traçable de bout en bout,
          préservant la dignité des bénéficiaires.
        </p>
        <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100">
          Rejoindre IHSAN
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-primary-600">{stats?.total_donations?.toLocaleString()} MRU</div>
          <div className="text-gray-600">Dons totaux</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{stats?.total_transactions}</div>
          <div className="text-gray-600">Transactions</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600">{stats?.active_validators}</div>
          <div className="text-gray-600">Validateurs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{stats?.quarters_covered}</div>
          <div className="text-gray-600">Quartiers</div>
        </div>
      </div>

      {/* Map */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Carte interactive des dons</h2>
        <div className="h-96 rounded-lg overflow-hidden shadow-lg">
          <MapView />
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Dernières transactions en direct</h2>
        <div className="grid gap-4">
          {transactions.map((t, index) => (
            <div key={t.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{t.need?.title || t.need_title}</h3>
                  <p className="text-gray-600">Quartier: {t.need?.quarter || t.location_quarter}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Validateur: {t.validator?.name} • {new Date(t.confirmed_at || t.date).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{t.amount} MRU</div>
                  {t.blockchain?.url && (
                    <a 
                      href={t.blockchain.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                    >
                      Voir sur blockchain →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;