// VerifyPhone.js
import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function VerifyPhone() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyPhone, getHomeByRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone;

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    const result = await verifyPhone({ phone, code });
    if (result.success) navigate(getHomeByRole(result.user?.role || 'donor'));
    else { setError(result.error || 'Code incorrect'); }
    setLoading(false);
  };

  if (!phone) { navigate('/register'); return null; }

  return (
    <div style={{ maxWidth: '440px', margin: '4rem auto', padding: '0 1rem' }}>
      <div style={{ background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', border: '1px solid rgba(0,0,0,.04)' }}>
        <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--g-700), var(--g-400))' }} />
        <div style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--g-100), var(--g-50))', border: '2px solid var(--g-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '2rem' }}>
            📲
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', fontWeight: 700, color: 'var(--g-800)', marginBottom: '0.5rem' }}>Vérification</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            Un code a été envoyé au<br />
            <strong style={{ color: 'var(--g-700)', fontSize: '0.9375rem' }}>{phone}</strong>
          </p>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, margin: '1.25rem 0', textAlign: 'left' }}>
              <span>⚠️</span>
              <span style={{ fontSize: '0.8125rem', color: '#dc2626' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="input"
                placeholder="• • • • • •"
                maxLength="6"
                required
                style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '0.4em', fontWeight: 700, color: 'var(--g-700)' }}
              />
            </div>
            <button type="submit" disabled={loading || code.length < 4} className="btn-primary" style={{ padding: '12px', fontSize: '0.9375rem', justifyContent: 'center' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,.4)', borderTopColor: 'white', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                  Vérification…
                </span>
              ) : 'Vérifier →'}
            </button>
          </form>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    </div>
  );
}

export default VerifyPhone;