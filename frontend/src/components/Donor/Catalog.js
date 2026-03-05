import React, { useState, useEffect } from 'react';
import { donor } from '../../services/api';
import { Link } from 'react-router-dom';

function Catalog() {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    quarter: '',
    sort: 'priority'
  });

  useEffect(() => {
    loadNeeds();
  }, [filters]);

  const loadNeeds = async () => {
    try {
      const response = await donor.getNeeds(filters);
      setNeeds(response.data.needs);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'iftar_meal',
    'food_basket',
    'clothing',
    'medical',
    'other'
  ];

  if (loading) return <div className="text-center py-20">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Catalogue des besoins</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="label">Catégorie</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input"
            >
              <option value="">Toutes</option>
              {categories.map(c => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Quartier</label>
            <input
              type="text"
              value={filters.quarter}
              onChange={(e) => setFilters({ ...filters, quarter: e.target.value })}
              className="input"
              placeholder="Rechercher..."
            />
          </div>
          <div>
            <label className="label">Trier par</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="input"
            >
              <option value="priority">Priorité</option>
              <option value="date">Date</option>
              <option value="amount">Montant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Needs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {needs.map(need => (
          <div key={need.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                {need.category?.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-500">
                Priorité {need.priority}
              </span>
            </div>

            <h3 className="font-bold text-lg mb-2">{need.title}</h3>
            <p className="text-gray-600 text-sm mb-4">
              {need.description?.substring(0, 100)}...
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {need.location_quarter}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Validateur: {need.validator?.full_name}
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-primary-600">
                {need.estimated_amount} MRU
              </span>
              {need.validator?.validator && (
                <div className="text-right text-sm">
                  <div className="text-yellow-500">★ {need.validator.validator.reputation_score}</div>
                  <div className="text-gray-500">{need.validator.validator.total_deliveries} dons</div>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Link
                to={`/donor/need/${need.id}`}
                className="btn-secondary flex-1 text-center"
              >
                Détails
              </Link>
              <Link
                to={`/donor/fund/${need.id}`}
                className="btn-primary flex-1 text-center"
              >
                Financer
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalog;