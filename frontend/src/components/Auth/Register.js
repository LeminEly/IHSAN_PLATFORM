import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '', phone: '', email: '', password: '', role: 'donor',
    business_name: '', address: '',
  });
  const [files, setFiles] = useState({
    id_card: null, selfie: null, commerce_registry: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, getHomeByRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFile = (e, key) => {
    setFiles({ ...files, [key]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Construire FormData pour envoyer les fichiers correctement
    const data = new FormData();
    data.append('full_name', formData.full_name);
    data.append('phone', formData.phone);
    data.append('password', formData.password);
    data.append('role', formData.role);
    if (formData.email) data.append('email', formData.email);

    if (formData.role === 'validator') {
      if (!files.id_card || !files.selfie) {
        setError('Carte d\'identité et selfie sont requis');
        setLoading(false);
        return;
      }
      data.append('id_card', files.id_card);
      data.append('selfie', files.selfie);
    }

    if (formData.role === 'partner') {
      if (!files.commerce_registry) {
        setError('Registre de commerce requis');
        setLoading(false);
        return;
      }
      data.append('business_name', formData.business_name);
      data.append('address', formData.address);
      data.append('commerce_registry', files.commerce_registry);
    }

    const result = await register(data);
    if (result.success) {
      if (result.requiresVerification) {
        navigate('/verify-phone', { state: { phone: formData.phone } });
      } else {
        navigate(getHomeByRole(formData.role));
      }
    } else {
      setError(result.error || 'Erreur lors de l\'inscription');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8">Inscription</h2>

        {/* Steps indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                s <= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>{s}</div>
              <div className="text-sm">
                {s === 1 && 'Compte'}{s === 2 && 'Rôle'}{s === 3 && 'Documents'}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Step 1 : Infos de base */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="label">Nom complet</label>
                <input type="text" name="full_name" value={formData.full_name}
                  onChange={handleChange} className="input" required />
              </div>
              <div>
                <label className="label">Numéro de téléphone</label>
                <input type="tel" name="phone" value={formData.phone}
                  onChange={handleChange} className="input"
                  placeholder="+222XXXXXXXX" required />
              </div>
              <div>
                <label className="label">Email (optionnel)</label>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Mot de passe</label>
                <input type="password" name="password" value={formData.password}
                  onChange={handleChange} className="input" required />
              </div>
            </div>
          )}

          {/* Step 2 : Rôle */}
          {step === 2 && (
            <div className="space-y-4">
              <label className="label">Choisissez votre rôle</label>
              <div className="grid grid-cols-3 gap-4">
                {['donor', 'validator', 'partner'].map((role) => (
                  <button key={role} type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`p-4 border rounded-lg text-center ${
                      formData.role === role
                        ? 'border-green-600 bg-green-50 text-green-600'
                        : 'border-gray-200 hover:border-green-300'
                    }`}>
                    <div className="font-medium capitalize">{role}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {role === 'donor' && 'Faire un don'}
                      {role === 'validator' && 'Valider terrain'}
                      {role === 'partner' && 'Restaurant/Commerce'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 : Documents */}
          {step === 3 && (
            <div className="space-y-4">
              {formData.role === 'donor' && (
                <p className="text-gray-500 text-center py-4">
                  Aucun document requis pour les donneurs. ✅
                </p>
              )}

              {formData.role === 'validator' && (
                <>
                  <div>
                    <label className="label">Carte d'identité (photo)</label>
                    <input type="file" accept="image/*"
                      onChange={(e) => handleFile(e, 'id_card')}
                      className="input" required />
                    {files.id_card && <p className="text-green-600 text-sm mt-1">✅ {files.id_card.name}</p>}
                  </div>
                  <div>
                    <label className="label">Selfie</label>
                    <input type="file" accept="image/*"
                      onChange={(e) => handleFile(e, 'selfie')}
                      className="input" required />
                    {files.selfie && <p className="text-green-600 text-sm mt-1">✅ {files.selfie.name}</p>}
                  </div>
                </>
              )}

              {formData.role === 'partner' && (
                <>
                  <div>
                    <label className="label">Nom du commerce/restaurant</label>
                    <input type="text" name="business_name" value={formData.business_name}
                      onChange={handleChange} className="input" required />
                  </div>
                  <div>
                    <label className="label">Adresse</label>
                    <input type="text" name="address" value={formData.address}
                      onChange={handleChange} className="input" required />
                  </div>
                  <div>
                    <label className="label">Registre de commerce</label>
                    <input type="file" accept="image/*,.pdf"
                      onChange={(e) => handleFile(e, 'commerce_registry')}
                      className="input" required />
                    {files.commerce_registry && <p className="text-green-600 text-sm mt-1">✅ {files.commerce_registry.name}</p>}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary">
                Précédent
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="btn-primary ml-auto">
                Suivant
              </button>
            ) : (
              <button type="submit" disabled={loading} className="btn-primary ml-auto">
                {loading ? 'Inscription...' : "S'inscrire"}
              </button>
            )}
          </div>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary-600 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;