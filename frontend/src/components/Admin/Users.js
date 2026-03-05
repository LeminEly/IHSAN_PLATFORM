import React, { useState, useEffect } from 'react';
import { admin } from '../../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const response = await admin.getUsers();
      // Backend retourne { total, users } — pas directement un tableau
      setUsers(response.data.users || response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id) => {
    const reason = window.prompt('Raison de la suspension:');
    if (!reason) return;
    try {
      await admin.suspendUser(id, reason);
      loadUsers();
    } catch (error) { alert('Erreur lors de la suspension'); }
  };

  const handleActivate = async (id) => {
    try {
      await admin.activateUser(id, 'Réactivation manuelle');
      loadUsers();
    } catch (error) { alert('Erreur lors de l\'activation'); }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'active') return user.is_active;
    if (filter === 'inactive') return !user.is_active;
    return user.role === filter;
  });

  const filters = [
    { key: 'all', label: 'Tous', color: 'bg-gray-600' },
    { key: 'active', label: 'Actifs', color: 'bg-green-600' },
    { key: 'inactive', label: 'Suspendus', color: 'bg-red-600' },
    { key: 'donor', label: 'Donneurs', color: 'bg-blue-600' },
    { key: 'validator', label: 'Validateurs', color: 'bg-purple-600' },
    { key: 'partner', label: 'Partenaires', color: 'bg-yellow-600' },
  ];

  if (loading) return <div className="text-center py-20">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gestion des utilisateurs</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded text-sm font-medium transition ${
                filter === f.key ? `${f.color} text-white` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Utilisateur', 'Contact', 'Rôle', 'Statut', 'Inscrit le', 'Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Aucun utilisateur</td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{user.full_name}</div>
                </td>
                <td className="px-6 py-4">
                  <div>{user.phone}</div>
                  {user.email && <div className="text-sm text-gray-500">{user.email}</div>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'validator' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'partner' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>{user.role}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Actif' : 'Suspendu'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.created_at || user.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  {user.role !== 'admin' && (
                    user.is_active ? (
                      <button onClick={() => handleSuspend(user.id)}
                        className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700">
                        Suspendre
                      </button>
                    ) : (
                      <button onClick={() => handleActivate(user.id)}
                        className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700">
                        Activer
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;