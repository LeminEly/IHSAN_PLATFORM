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
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await verifyPhone({ phone, code });
    if (result.success) {
      // Rediriger selon le rôle de l'utilisateur vérifié
      navigate(getHomeByRole(result.user?.role || 'donor'));
    } else {
      setError(result.error || 'Code incorrect');
    }
    setLoading(false);
  };

  if (!phone) {
    navigate('/register');
    return null;
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-4">
          Vérification téléphone
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Un code de vérification a été envoyé au <br />
          <strong>{phone}</strong>
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Code de vérification</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="input text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength="6"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyPhone;