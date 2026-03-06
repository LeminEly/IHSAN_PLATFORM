// Fund.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { donor } from '../../services/api';

function Fund() {
  const { id } = useParams();
  const [need, setNeed] = useState(null);
  const [formData, setFormData] = useState({ payment_method: 'mobile_money', donor_phone: '' });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { donor.getNeed(id).then(r => setNeed(r.data)).catch(console.error).finally(() => setLoading(false)); }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setProcessing(true);
    try { await donor.fundNeed(id, formData); navigate('/donor/donations'); }
    catch (e) { setError(e.response?.data?.error || 'Erreur lors du paiement'); }
    finally { setProcessing(false); }
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'50vh'}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid var(--g-100)',borderTopColor:'var(--g-500)',animation:'spin 1s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if (!need) return <div style={{textAlign:'center',padding:'4rem',color:'var(--muted)'}}>Besoin non trouvé</div>;

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', border: '1px solid rgba(0,0,0,.04)' }}>
        {/* Top accent */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--gold-d), var(--gold), var(--gold-l))' }} />

        <div style={{ padding: '2.5rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', fontWeight: 700, color: 'var(--g-800)', marginBottom: '1.5rem' }}>Finaliser votre don</h1>

          {/* Need Summary */}
          <div style={{ padding: '1rem 1.25rem', background: 'var(--g-50)', borderRadius: 12, border: '1px solid var(--g-200)', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--g-600)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>Besoin à financer</div>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink)', marginBottom: '4px' }}>{need.title}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '10px' }}>📍 {need.location_quarter}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--g-200)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Montant total</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', fontWeight: 700, color: 'var(--g-600)' }}>
                {parseFloat(need.estimated_amount).toLocaleString()} <span style={{ fontSize: '0.875rem' }}>MRU</span>
              </span>
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, marginBottom: '1.25rem', fontSize: '0.8125rem', color: '#dc2626' }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label className="label">Numéro Mobile Money</label>
              <input type="tel" value={formData.donor_phone} onChange={e => setFormData({...formData, donor_phone: e.target.value})}
                className="input" placeholder="+222 XX XX XX XX" required />
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '5px' }}>Le numéro associé à votre compte Masrivi / Mobile Money</p>
            </div>

            <div>
              <label className="label">Méthode de paiement</label>
              <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 10, border: '1.5px solid var(--g-400)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>📱</span>
                <span style={{ fontWeight: 500, color: 'var(--g-700)', fontSize: '0.875rem' }}>Mobile Money (Masrivi)</span>
                <span style={{ marginLeft: 'auto', color: 'var(--g-500)', fontSize: '0.875rem' }}>✓</span>
              </div>
            </div>

            <button type="submit" disabled={processing} className="btn-primary" style={{ padding: '14px', fontSize: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
              {processing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,.4)', borderTopColor: 'white', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                  Traitement en cours…
                </span>
              ) : `💚 Confirmer le don · ${parseFloat(need.estimated_amount).toLocaleString()} MRU`}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '1rem' }}>
            📲 Vous recevrez une notification SMS de confirmation
          </p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default Fund;