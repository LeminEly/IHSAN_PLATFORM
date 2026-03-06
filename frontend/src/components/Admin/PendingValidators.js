import React, { useState, useEffect } from 'react';
import { admin } from '../../services/api';

function PendingValidators() {
  const [validators, setValidators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { loadValidators(); }, []);

  const loadValidators = async () => {
    setLoading(true);
    try { const r = await admin.getPendingValidators(); setValidators(r.data || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAction = async (id, type) => {
    const reason = window.prompt(type === 'approve' ? 'Raison (optionnelle) :' : 'Raison du rejet :');
    if (type === 'reject' && !reason) return;
    setActionLoading(id);
    try {
      if (type === 'approve') await admin.approveValidator(id, reason);
      else await admin.rejectValidator(id, reason);
      loadValidators();
    } catch (e) { alert('Erreur : ' + e.message); }
    finally { setActionLoading(null); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--g-100)', borderTopColor: 'var(--g-500)', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: '860px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div className="gold-line" />
        <h1 className="page-header">Validateurs en attente</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '4px' }}>
          {validators.length} demande{validators.length !== 1 ? 's' : ''} en attente de traitement
        </p>
      </div>

      {validators.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,.04)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--g-800)' }}>Aucun validateur en attente</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '8px' }}>Toutes les demandes ont été traitées.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {validators.map((v, i) => (
            <div key={v.id} className="animate-fade-up" style={{
              background: 'white', borderRadius: '14px',
              border: '1px solid rgba(0,0,0,.05)', padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              animationDelay: `${i * 0.08}s`, opacity: 0,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--g-700), var(--g-400))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0,
                  }}>{v.user?.full_name?.[0]?.toUpperCase() || 'V'}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink)' }}>{v.user?.full_name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{v.user?.phone}</div>
                    {v.user?.email && <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{v.user.email}</div>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => handleAction(v.id, 'approve')} disabled={actionLoading === v.id} className="btn-success"
                    style={{ opacity: actionLoading === v.id ? 0.7 : 1, fontSize: '0.8125rem' }}>
                    ✓ Approuver
                  </button>
                  <button onClick={() => handleAction(v.id, 'reject')} disabled={actionLoading === v.id} className="btn-danger"
                    style={{ opacity: actionLoading === v.id ? 0.7 : 1, fontSize: '0.8125rem' }}>
                    ✕ Rejeter
                  </button>
                </div>
              </div>

              {/* Documents */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f3f4f6' }}>
                <a href={v.id_card_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--g-50)', borderRadius: 10, border: '1px solid var(--g-200)', textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--g-100)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--g-50)'}
                >
                  <span style={{ fontSize: '1.2rem' }}>🪪</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Carte d'identité</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--g-600)', fontWeight: 500 }}>Voir le document →</div>
                  </div>
                </a>
                <a href={v.selfie_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--g-50)', borderRadius: 10, border: '1px solid var(--g-200)', textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--g-100)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--g-50)'}
                >
                  <span style={{ fontSize: '1.2rem' }}>🤳</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Selfie</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--g-600)', fontWeight: 500 }}>Voir la photo →</div>
                  </div>
                </a>
              </div>

              <div style={{ marginTop: '10px', fontSize: '0.72rem', color: 'var(--muted)' }}>
                Inscrit le {new Date(v.created_at).toLocaleString('fr-FR')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PendingValidators;