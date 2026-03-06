import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { donor } from '../../services/api';

const CATEGORY_LABELS = {
  iftar_meal: 'Repas Iftar', food_basket: 'Panier alimentaire',
  clothing: 'Vêtements', medical: 'Médical', other: 'Autre',
};
const CATEGORY_ICONS = {
  iftar_meal: '🍽', food_basket: '🧺', clothing: '👕', medical: '💊', other: '📦',
};
const PRIORITY_COLORS = ['', '#16a34a', '#ca8a04', '#d97706', '#dc2626', '#7f1d1d'];
const PRIORITY_LABELS = ['', 'Basse', 'Normale', 'Haute', 'Urgente', 'Critique'];

function NeedDetail() {
  const { id } = useParams();
  const [need, setNeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadNeed(); }, [id]);

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

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid var(--g-100)', borderTopColor: 'var(--g-500)', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Chargement…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!need) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--g-800)' }}>Besoin non trouvé</h3>
    </div>
  );

  const pColor = PRIORITY_COLORS[need.priority] || '#9ca3af';

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>

      {/* Back button */}
      <button onClick={() => navigate(-1)} style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'var(--g-600)', background: 'none', border: 'none',
        cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
        marginBottom: '1.5rem', padding: '6px 0',
        transition: 'color .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--g-800)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--g-600)'}
      >
        ← Retour au catalogue
      </button>

      <div style={{ background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', border: '1px solid rgba(0,0,0,.04)' }}>

        {/* Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--g-950) 0%, var(--g-800) 60%, var(--g-700) 100%)',
          padding: '2.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${pColor}, transparent)`, opacity: 0.8 }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{
                padding: '4px 12px', borderRadius: 999,
                background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
                color: 'rgba(255,255,255,.9)', fontSize: '0.75rem', fontWeight: 500,
              }}>
                {CATEGORY_ICONS[need.category]} {CATEGORY_LABELS[need.category] || need.category}
              </span>
              <span style={{
                padding: '4px 12px', borderRadius: 999,
                background: `${pColor}22`, border: `1px solid ${pColor}55`,
                color: '#fde68a', fontSize: '0.75rem', fontWeight: 600,
              }}>
                ● Priorité {PRIORITY_LABELS[need.priority] || need.priority}
              </span>
            </div>

            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: 'white', lineHeight: 1.1, marginBottom: '0.75rem' }}>
              {need.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                📍 {need.location_quarter}
              </span>
              {need.expiry_date && (
                <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,.5)' }}>
                  ⏳ Expire le {new Date(need.expiry_date).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          {/* Description */}
          <Section title="Description" icon="📝">
            <p style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{need.description}</p>
          </Section>

          {/* Two-col: Validator + Partner */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

            {/* Validator */}
            <Section title="Validateur" icon="✓">
              {need.validator ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--g-700), var(--g-400))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '1rem',
                  }}>
                    {need.validator.full_name?.[0]?.toUpperCase() || 'V'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink)' }}>{need.validator.full_name}</div>
                    {need.validator.validator && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '0.8125rem' }}>
                        <span style={{ color: '#ca8a04' }}>★ {need.validator.validator.reputation_score}</span>
                        <span style={{ color: 'var(--muted)' }}>{need.validator.validator.total_deliveries} livraisons</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Non assigné</span>}
            </Section>

            {/* Partner */}
            <Section title="Partenaire" icon="🏪">
              {need.partner ? (
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink)', marginBottom: '4px' }}>{need.partner.business_name}</div>
                  {need.partner.address && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      📍 {need.partner.address}
                    </div>
                  )}
                </div>
              ) : (
                <span style={{ color: 'var(--muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>Aucun partenaire assigné</span>
              )}
            </Section>
          </div>

          {/* Localisation */}
          <Section title="Localisation" icon="📍">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--g-50)', borderRadius: 10, border: '1px solid var(--g-200)' }}>
              <span style={{ fontSize: '1.25rem' }}>🗺</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--g-700)' }}>{need.location_quarter}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>Nouakchott, Mauritanie</div>
              </div>
            </div>
          </Section>

          {/* Amount + CTA */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1.5rem 2rem',
            background: 'linear-gradient(135deg, var(--g-50) 0%, #fff 100%)',
            borderRadius: '14px', border: '1px solid var(--g-200)',
            flexWrap: 'wrap', gap: '1rem',
          }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '4px', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 }}>Montant à financer</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '2.5rem', color: 'var(--g-700)', lineHeight: 1 }}>
                {parseFloat(need.estimated_amount).toLocaleString()} <span style={{ fontSize: '1.125rem', color: 'var(--g-500)' }}>MRU</span>
              </div>
            </div>
            <Link to={`/donor/fund/${need.id}`} style={{
              padding: '14px 36px', borderRadius: 12,
              background: 'linear-gradient(135deg, var(--g-700) 0%, var(--g-500) 100%)',
              color: 'white', fontWeight: 600, fontSize: '1rem',
              textDecoration: 'none', boxShadow: '0 6px 20px rgba(30,82,40,.3)',
              transition: 'all .2s', display: 'inline-block',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(30,82,40,.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(30,82,40,.3)'; }}
            >
              💚 Financer ce besoin
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

// Reusable section component
function Section({ title, icon, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.125rem', fontWeight: 700, color: 'var(--g-800)' }}>{title}</h2>
      </div>
      <div style={{ paddingLeft: '0' }}>{children}</div>
    </div>
  );
}

export default NeedDetail;