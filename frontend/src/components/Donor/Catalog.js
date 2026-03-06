import React, { useState, useEffect } from 'react';
import { donor } from '../../services/api';
import { Link } from 'react-router-dom';

const CATEGORY_LABELS = {
  iftar_meal: 'Repas Iftar', food_basket: 'Panier alimentaire',
  clothing: 'Vêtements', medical: 'Médical', other: 'Autre',
};
const CATEGORY_ICONS = {
  iftar_meal: '🍽', food_basket: '🧺', clothing: '👕', medical: '💊', other: '📦',
};
const PRIORITY_COLORS = ['', '#16a34a', '#ca8a04', '#d97706', '#dc2626', '#7f1d1d'];
const PRIORITY_LABELS = ['', 'Basse', 'Normale', 'Haute', 'Urgente', 'Critique'];

function Catalog() {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', quarter: '', sort: 'priority' });

  useEffect(() => { loadNeeds(); }, [filters]);

  const loadNeeds = async () => {
    setLoading(true);
    try {
      const r = await donor.getNeeds(filters);
      setNeeds(r.data.needs || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="gold-line" />
        <h1 className="page-header">Catalogue des besoins</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '4px' }}>
          {needs.length} besoin{needs.length !== 1 ? 's' : ''} disponible{needs.length !== 1 ? 's' : ''} · En attente de financement
        </p>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,.04)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 160px' }}>
          <label className="label">Catégorie</label>
          <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} className="input">
            <option value="">Toutes</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{CATEGORY_ICONS[k]} {v}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1 1 160px' }}>
          <label className="label">Quartier</label>
          <input type="text" value={filters.quarter} onChange={e => setFilters({ ...filters, quarter: e.target.value })} className="input" placeholder="🔍 Rechercher..." />
        </div>
        <div style={{ flex: '1 1 140px' }}>
          <label className="label">Trier par</label>
          <select value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })} className="input">
            <option value="priority">Priorité</option>
            <option value="date">Date</option>
            <option value="amount">Montant</option>
          </select>
        </div>
        {(filters.category || filters.quarter) && (
          <button onClick={() => setFilters({ category: '', quarter: '', sort: 'priority' })} className="btn-secondary" style={{ alignSelf: 'flex-end', fontSize: '0.8125rem' }}>
            ✕ Réinitialiser
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid rgba(0,0,0,.04)' }}>
              <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 20 }} />
              <div className="skeleton" style={{ height: 36, width: '100%' }} />
            </div>
          ))}
        </div>
      ) : needs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,.04)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--g-800)' }}>Aucun besoin trouvé</h3>
          <p style={{ color: 'var(--muted)', marginTop: '8px', fontSize: '0.875rem' }}>Modifiez vos filtres ou revenez plus tard.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {needs.map((need, i) => (
            <div key={need.id} className="animate-fade-up" style={{
              background: 'white', borderRadius: '14px',
              border: '1px solid rgba(0,0,0,.05)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
              transition: 'box-shadow .2s, transform .2s',
              animationDelay: `${i * 0.06}s`, opacity: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Card top accent by priority */}
              <div style={{ height: '3px', background: `linear-gradient(90deg, ${PRIORITY_COLORS[need.priority] || '#9ca3af'}, transparent)` }} />

              <div style={{ padding: '1.25rem' }}>
                {/* Tags row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ padding: '3px 10px', background: 'var(--g-100)', color: 'var(--g-700)', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600 }}>
                    {CATEGORY_ICONS[need.category]} {CATEGORY_LABELS[need.category] || need.category}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: PRIORITY_COLORS[need.priority] || 'var(--muted)' }}>
                    ● {PRIORITY_LABELS[need.priority] || `P${need.priority}`}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '1.1875rem', color: 'var(--g-900)', marginBottom: '0.5rem', lineHeight: 1.2 }}>{need.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {need.description?.substring(0, 90)}{need.description?.length > 90 ? '…' : ''}
                </p>

                {/* Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '1.125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--muted)' }}>
                    <span>📍</span> <span>{need.location_quarter}</span>
                  </div>
                  {need.validator?.full_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--muted)' }}>
                      <span>✓</span> <span>{need.validator.full_name}</span>
                      {need.validator?.validator?.reputation_score && (
                        <span style={{ color: '#ca8a04' }}>★ {need.validator.validator.reputation_score}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Amount + Actions */}
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '1.5rem', color: 'var(--g-600)', lineHeight: 1 }}>{parseFloat(need.estimated_amount).toLocaleString()}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.04em' }}>MRU</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/donor/need/${need.id}`} className="btn-secondary" style={{ padding: '7px 14px', fontSize: '0.8125rem' }}>Détails</Link>
                    <Link to={`/donor/fund/${need.id}`} className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.8125rem' }}>Financer</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Catalog;