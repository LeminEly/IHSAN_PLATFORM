import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const { login, getHomeByRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const result = await login(formData);
    if (result.success) {
      navigate(getHomeByRole(result.role));
    } else {
      setError(result.error || 'Identifiants invalides');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, maxWidth: '900px', width: '100%', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.14)' }}>

        {/* Left panel */}
        <div style={{
          background: 'linear-gradient(160deg, var(--g-950) 0%, var(--g-800) 60%, var(--g-700) 100%)',
          padding: '3rem 2.5rem',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,.15) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,122,58,.2) 0%, transparent 70%)' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2.5rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201,168,76,.2)', border: '1px solid rgba(201,168,76,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--gold-l)', fontSize: 14, fontFamily: "'Amiri', serif" }}>إ</span>
              </div>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '1.375rem', color: 'white' }}>IHSAN</span>
            </div>

            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '2rem', color: 'white', lineHeight: 1.1, marginBottom: '1rem' }}>
              Bienvenue<br />de retour
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.7 }}>
              Connectez-vous pour accéder à votre espace et contribuer à la transparence de la charité.
            </p>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ padding: '16px', background: 'rgba(201,168,76,.1)', borderRadius: 10, borderLeft: '2px solid var(--gold)', marginBottom: '1.5rem' }}>
              <p className="arabic" style={{ fontSize: '1rem', color: 'rgba(255,255,255,.8)', lineHeight: 1.8, marginBottom: '4px' }}>
                وَأَحْسِنُوا إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>Al-Baqara : 195</p>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,.3)' }}>
              Pas encore de compte ?{' '}
              <Link to="/register" style={{ color: 'var(--gold-l)', textDecoration: 'none', fontWeight: 500 }}>S'inscrire</Link>
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div style={{ background: 'white', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.625rem', fontWeight: 700, color: 'var(--g-800)', marginBottom: '0.5rem' }}>Connexion</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '2rem' }}>Saisissez vos identifiants</p>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.875rem' }}>⚠️</span>
              <span style={{ fontSize: '0.8125rem', color: '#dc2626' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label className="label">Numéro de téléphone</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '0.875rem' }}>📞</span>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  placeholder="+222 XX XX XX XX" required
                  className="input" style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  placeholder="••••••••" required
                  className="input" style={{ paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.8rem' }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full"
              style={{ marginTop: '0.5rem', padding: '12px', fontSize: '0.9375rem', justifyContent: 'center' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,.4)', borderTopColor: 'white', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                  Connexion en cours…
                </span>
              ) : 'Se connecter →'}
            </button>
          </form>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </div>
  );
};

export default Login;