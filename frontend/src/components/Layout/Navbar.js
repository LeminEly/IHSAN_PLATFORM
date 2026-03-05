import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold">
            IHSAN
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm">
                  {user.full_name} ({user.role})
                </span>
                
                {user.role === 'donor' && (
                  <>
                    <Link to="/donor" className="hover:text-primary-200">Catalogue</Link>
                    <Link to="/donor/donations" className="hover:text-primary-200">Mes dons</Link>
                  </>
                )}

                {user.role === 'validator' && (
                  <>
                    <Link to="/validator" className="hover:text-primary-200">Dashboard</Link>
                    <Link to="/validator/create-need" className="hover:text-primary-200">Créer besoin</Link>
                    <Link to="/validator/confirm" className="hover:text-primary-200">Confirmer</Link>
                  </>
                )}

                {user.role === 'partner' && (
                  <>
                    <Link to="/partner" className="hover:text-primary-200">Commandes</Link>
                    <Link to="/partner/stats" className="hover:text-primary-200">Statistiques</Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className="hover:text-primary-200">Dashboard</Link>
                    <Link to="/admin/validators" className="hover:text-primary-200">Validateurs</Link>
                    <Link to="/admin/partners" className="hover:text-primary-200">Partenaires</Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary-200">Connexion</Link>
                <Link to="/register" className="bg-white text-primary-600 px-4 py-2 rounded hover:bg-gray-100">
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;