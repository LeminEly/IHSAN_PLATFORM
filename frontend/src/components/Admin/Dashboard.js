import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { admin } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    admin.getStats()
      .then(r => setStats(r.data))
      .catch(() => setError('Erreur chargement statistiques'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20">Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500 mt-1">Bienvenue, {user?.full_name}</p>
        </div>
        <button onClick={logout} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Déconnexion
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <StatCard label="Utilisateurs actifs"     value={stats?.total_users ?? 0}       color="blue"   />
        <StatCard label="Validateurs en attente"  value={stats?.pending_validators ?? 0} color="yellow" urgent={stats?.pending_validators > 0} />
        <StatCard label="Partenaires en attente"  value={stats?.pending_partners ?? 0}   color="orange" urgent={stats?.pending_partners > 0} />
        <StatCard label="Transactions confirmées" value={stats?.total_transactions ?? 0} color="green"  />
        <StatCard label="Total dons"              value={`${(stats?.total_donations ?? 0).toLocaleString()} MRU`} color="green" />
        <StatCard label="Besoins complétés"       value={stats?.completed_needs ?? 0}    color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">⏳ Validateurs en attente {stats?.pending_validators > 0 && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full ml-2">{stats.pending_validators}</span>}</h2>
          <p className="text-gray-500 text-sm mb-4">Approuvez ou rejetez les demandes de validateurs terrain.</p>
          <Link to="/admin/validators" className="block text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">Gérer les validateurs</Link>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">🏪 Partenaires en attente {stats?.pending_partners > 0 && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full ml-2">{stats.pending_partners}</span>}</h2>
          <p className="text-gray-500 text-sm mb-4">Vérifiez et approuvez les restaurants et commerces partenaires.</p>
          <Link to="/admin/partners" className="block text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">Gérer les partenaires</Link>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">👥 Gestion des utilisateurs</h2>
          <p className="text-gray-500 text-sm mb-4">Consultez, suspendez ou activez les comptes utilisateurs.</p>
          <Link to="/admin/users" className="block text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">Gérer les utilisateurs</Link>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">📊 Dashboard public</h2>
          <p className="text-gray-500 text-sm mb-4">Voir le tableau de bord visible par tous les utilisateurs.</p>
          <Link to="/" className="block text-center border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50">Voir le dashboard</Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, urgent }) {
  const colors = { blue: 'bg-blue-50 text-blue-700 border-blue-200', green: 'bg-green-50 text-green-700 border-green-200', yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200', orange: 'bg-orange-50 text-orange-700 border-orange-200', purple: 'bg-purple-50 text-purple-700 border-purple-200' };
  return (
    <div className={`rounded-xl border p-6 ${colors[color]} ${urgent ? 'ring-2 ring-yellow-400' : ''}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm mt-1 opacity-80">{label}</div>
    </div>
  );
}

export default AdminDashboard;