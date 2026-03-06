import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const STEPS = [
  { n: 1, label: 'Informations', icon: '👤' },
  { n: 2, label: 'Rôle', icon: '🎭' },
  { n: 3, label: 'Documents', icon: '📄' },
];

function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ full_name: '', phone: '', email: '', password: '', role: 'donor', business_name: '', address: '' });
  const [files, setFiles] = useState({ id_card: null, selfie: null, commerce_registry: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, getHomeByRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };
  const handleFile = (e, key) => setFiles({ ...files, [key]: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    const data = new FormData();
    data.append('full_name', formData.full_name);
    data.append('phone', formData.phone);
    data.append('password', formData.password);
    data.append('role', formData.role);
    if (formData.email) data.append('email', formData.email);
    if (formData.role === 'validator') {
      if (!files.id_card || !files.selfie) { setError('Carte d\'identité et selfie requis'); setLoading(false); return; }
      data.append('id_card', files.id_card);
      data.append('selfie', files.selfie);
    }
    if (formData.role === 'partner') {
      if (!files.commerce_registry) { setError('Registre de commerce requis'); setLoading(false); return; }
      data.append('business_name', formData.business_name);
      data.append('address', formData.address);
      data.append('commerce_registry', files.commerce_registry);
    }
    const result = await register(data);
    if (result.success) {
      if (result.requiresVerification) navigate('/verify-phone', { state: { phone: formData.phone } });
      else navigate(getHomeByRole(formData.role));
    } else { setError(result.error || 'Erreur lors de l\'inscription'); }
    setLoading(false);
  };

  const roles = [
    { key: 'donor', label: 'Donneur', desc: 'Faites des dons, suivez leur impact', icon: '💚', color: '#dcfce7', border: '#86efac' },
    { key: 'validator', label: 'Validateur', desc: 'Validez les besoins sur le terrain', icon: '✅', color: '#ede9fe', border: '#c4b5fd' },
    { key: 'partner', label: 'Partenaire', desc: 'Restaurant ou commerce prestataire', icon: '🏪', color: '#fef9c3', border: '#fde047' },
  ];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--g-700), var(--g-500))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--gold-l)', fontSize: 12, fontFamily: "'Amiri', serif" }}>إ</span>
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '1.25rem', color: 'var(--g-800)' }}>IHSAN</span>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 700, color: 'var(--g-800)', lineHeight: 1 }}>Créer un compte</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '6px' }}>Rejoignez la plateforme de charité transparente</p>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: 0 }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s.n}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step > s.n ? 'var(--g-600)' : step === s.n ? 'linear-gradient(135deg, var(--g-700), var(--g-500))' : 'white',
                border: step >= s.n ? 'none' : '2px solid #e5e7eb',
                color: step >= s.n ? 'white' : '#9ca3af',
                fontSize: step > s.n ? '1rem' : '0.875rem',
                fontWeight: 600,
                boxShadow: step === s.n ? '0 4px 14px rgba(30,82,40,.3)' : 'none',
                transition: 'all .3s',
              }}>{step > s.n ? '✓' : s.n}</div>
              <span style={{ fontSize: '0.72rem', color: step === s.n ? 'var(--g-600)' : 'var(--muted)', fontWeight: step === s.n ? 600 : 400, marginTop: '6px', whiteSpace: 'nowrap' }}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 2, height: 2, background: step > s.n ? 'var(--g-500)' : '#e5e7eb', transition: 'background .3s', marginBottom: '20px' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', padding: '2rem', border: '1px solid rgba(0,0,0,.04)' }}>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, marginBottom: '1.25rem' }}>
            <span>⚠️</span>
            <span style={{ fontSize: '0.8125rem', color: '#dc2626' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

          {/* Step 1 */}
          {step === 1 && (
            <>
              <div>
                <label className="label">Nom complet</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="input" placeholder="Mohammed Ahmed" required />
              </div>
              <div>
                <label className="label">Numéro de téléphone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input" placeholder="+222 XX XX XX XX" required />
              </div>
              <div>
                <label className="label">Email <span style={{ color: 'var(--muted)' }}>(optionnel)</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" placeholder="vous@exemple.com" />
              </div>
              <div>
                <label className="label">Mot de passe</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="input" placeholder="Minimum 8 caractères" required />
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label className="label" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Quel est votre rôle ?</label>
              {roles.map(r => (
                <div key={r.key} onClick={() => setFormData({ ...formData, role: r.key })} style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 12,
                  border: formData.role === r.key ? `2px solid ${r.border}` : '2px solid #e5e7eb',
                  background: formData.role === r.key ? r.color : 'white',
                  cursor: 'pointer', transition: 'all .15s',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{r.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink)' }}>{r.label}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{r.desc}</div>
                  </div>
                  {formData.role === r.key && <span style={{ marginLeft: 'auto', color: 'var(--g-600)', fontWeight: 700 }}>✓</span>}
                </div>
              ))}
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              {formData.role === 'donor' && (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.375rem', color: 'var(--g-800)' }}>Aucun document requis</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '8px' }}>Les donneurs peuvent s'inscrire directement.</p>
                </div>
              )}
              {formData.role === 'validator' && (
                <>
                  <FileInput label="Carte d'identité" icon="🪪" onChange={e => handleFile(e, 'id_card')} file={files.id_card} accept="image/*" required />
                  <FileInput label="Selfie de vérification" icon="🤳" onChange={e => handleFile(e, 'selfie')} file={files.selfie} accept="image/*" required />
                </>
              )}
              {formData.role === 'partner' && (
                <>
                  <div>
                    <label className="label">Nom du commerce / restaurant</label>
                    <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} className="input" placeholder="Restaurant Al-Baraka" required />
                  </div>
                  <div>
                    <label className="label">Adresse</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="input" placeholder="Tevragh-Zeina, Nouakchott" required />
                  </div>
                  <FileInput label="Registre de commerce" icon="📋" onChange={e => handleFile(e, 'commerce_registry')} file={files.commerce_registry} accept="image/*,.pdf" required />
                </>
              )}
            </>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary">← Précédent</button>
            ) : <div />}
            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="btn-primary" style={{ marginLeft: 'auto' }}>Suivant →</button>
            ) : (
              <button type="submit" disabled={loading} className="btn-primary" style={{ marginLeft: 'auto' }}>
                {loading ? 'Inscription…' : 'S\'inscrire →'}
              </button>
            )}
          </div>
        </form>
      </div>

      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
        Déjà un compte ? <Link to="/login" style={{ color: 'var(--g-600)', fontWeight: 500, textDecoration: 'none' }}>Se connecter</Link>
      </p>
    </div>
  );
}

function FileInput({ label, icon, onChange, file, accept, required }) {
  return (
    <div>
      <label className="label">{label}</label>
      <label style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px', borderRadius: 10,
        border: `2px dashed ${file ? 'var(--g-500)' : '#d1d5db'}`,
        background: file ? 'var(--g-50)' : '#fafafa',
        cursor: 'pointer', transition: 'all .15s',
      }}>
        <span style={{ fontSize: '1.25rem' }}>{file ? '✅' : icon}</span>
        <span style={{ fontSize: '0.8125rem', color: file ? 'var(--g-600)' : 'var(--muted)', fontWeight: file ? 500 : 400 }}>
          {file ? file.name : 'Choisir un fichier…'}
        </span>
        <input type="file" accept={accept} onChange={onChange} required={required} style={{ display: 'none' }} />
      </label>
    </div>
  );
}

export default Register;