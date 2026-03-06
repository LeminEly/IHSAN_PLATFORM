import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../../services/api';

function VerifyHash() {
  const { hash } = useParams();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { verifyHashFn(); }, [hash]);

  const verifyHashFn = async () => {
    try {
      const response = await publicApi.verifyHash(hash);
      setVerification(response.data.data);
    } catch {
      setError('Erreur lors de la vérification. Hash introuvable ou invalide.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        border: '3px solid var(--g-100)', borderTopColor: 'var(--g-500)',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{ color: 'var(--muted)', fontSize: '0.9375rem', fontWeight: 500 }}>Vérification en cours…</p>
      <p style={{ color: 'var(--muted)', fontSize: '0.8125rem', fontFamily: 'monospace', background: '#f3f4f6', padding: '4px 12px', borderRadius: 6, maxWidth: '400px', wordBreak: 'break-all', textAlign: 'center' }}>{hash?.substring(0, 32)}…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const verified = verification?.verified;
  const isBlockchain = verification?.mode === 'blockchain';

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '3rem' }}>

      {/* Back */}
      <Link to="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'var(--g-600)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
        marginBottom: '1.5rem', transition: 'color .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--g-800)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--g-600)'}
      >
        ← Retour à l'accueil
      </Link>

      <div style={{ background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', border: '1px solid rgba(0,0,0,.04)' }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--g-950) 0%, var(--g-800) 100%)',
          padding: '2rem 2.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--gold), var(--gold-l), transparent)', opacity: 0.7 }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '12px',
              background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.375rem', flexShrink: 0,
            }}>⛓</div>
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '1.75rem', color: 'white', lineHeight: 1 }}>
                Vérification Blockchain
              </h1>
              <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,.5)', marginTop: '4px' }}>
                IHSAN · Preuve d'impact immuable
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Error state */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '1rem 1.25rem', background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: 12,
            }}>
              <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 600, color: '#dc2626', marginBottom: '4px' }}>Vérification échouée</div>
                <div style={{ fontSize: '0.8125rem', color: '#991b1b' }}>{error}</div>
              </div>
            </div>
          )}

          {verification && (
            <>
              {/* Status Banner */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '1.25rem 1.5rem',
                background: verified ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : 'linear-gradient(135deg, #fffbeb, #fef9c3)',
                border: `1.5px solid ${verified ? '#86efac' : '#fde047'}`,
                borderRadius: 14,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                  background: verified ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'linear-gradient(135deg, #ca8a04, #eab308)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.375rem',
                  boxShadow: verified ? '0 4px 14px rgba(22,163,74,.3)' : '0 4px 14px rgba(202,138,4,.3)',
                }}>
                  {verified ? '✓' : '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: verified ? '#15803d' : '#a16207' }}>
                    {verified ? 'Hash vérifié avec succès' : 'Hash non trouvé'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: verified ? '#166534' : '#92400e', marginTop: '2px' }}>
                    Mode : {isBlockchain ? '⛓ Blockchain Polygon Amoy' : '🔒 SHA-256 Local'}
                  </div>
                </div>
              </div>

              {/* Hash display */}
              <div style={{ padding: '1.25rem', background: '#0a1a0d', borderRadius: 12 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>
                  Hash SHA-256
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: '0.7875rem',
                  color: 'rgba(255,255,255,.85)', wordBreak: 'break-all', lineHeight: 1.6,
                  padding: '10px 12px', background: 'rgba(255,255,255,.04)',
                  borderRadius: 8, border: '1px solid rgba(255,255,255,.07)',
                }}>
                  {hash}
                </div>
              </div>

              {/* Transaction details */}
              {verification.transaction && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                    <span>📄</span>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.125rem', fontWeight: 700, color: 'var(--g-800)' }}>Détails de la transaction</h3>
                  </div>
                  <div style={{ background: 'var(--g-50)', borderRadius: 12, border: '1px solid var(--g-200)', overflow: 'hidden' }}>
                    {[
                      ['Montant', `${parseFloat(verification.transaction.amount).toLocaleString()} MRU`],
                      ['Date', new Date(verification.transaction.date).toLocaleString('fr-FR')],
                      ['Besoin financé', verification.transaction.need?.title || '—'],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--g-200)' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{label}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)' }}>{value}</span>
                      </div>
                    ))}
                    <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>Lien</span>
                      <Link to={`/transaction/${verification.transaction.id}`} style={{ fontSize: '0.875rem', color: 'var(--g-600)', fontWeight: 500, textDecoration: 'none' }}>
                        Voir les détails →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode info box */}
              <div style={{
                padding: '1rem 1.25rem',
                background: isBlockchain ? '#eff6ff' : '#faf5ff',
                border: `1px solid ${isBlockchain ? '#bfdbfe' : '#ddd6fe'}`,
                borderRadius: 12,
                display: 'flex', gap: '12px', alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{isBlockchain ? '⛓' : '🔒'}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: isBlockchain ? '#1e40af' : '#6d28d9', marginBottom: '4px' }}>
                    {isBlockchain ? 'Enregistré sur Polygon Amoy Testnet' : 'Mode SHA-256 Local'}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: isBlockchain ? '#1e3a8a' : '#5b21b6', lineHeight: 1.6 }}>
                    {isBlockchain
                      ? 'Ce hash est ancré de façon immuable sur la blockchain Polygon. Son intégrité est vérifiable publiquement à tout moment, indépendamment de la plateforme IHSAN.'
                      : 'Ce hash a été généré localement avec l\'algorithme SHA-256. Il garantit l\'intégrité des données de la transaction dans la base IHSAN.'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', paddingTop: '0.5rem' }}>
                <button onClick={() => window.print()} className="btn-secondary" style={{ fontSize: '0.8125rem' }}>
                  🖨 Imprimer
                </button>
                <Link to="/" className="btn-primary" style={{ fontSize: '0.8125rem' }}>
                  Retour à l'accueil
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyHash;