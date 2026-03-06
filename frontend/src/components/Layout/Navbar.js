import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = {
    donor:     [{ to: '/donor', label: 'Catalogue' }, { to: '/donor/donations', label: 'Mes dons' }],
    validator: [{ to: '/validator', label: 'Dashboard' }, { to: '/validator/create-need', label: 'Créer besoin' }, { to: '/validator/confirm', label: 'Confirmer' }],
    partner:   [{ to: '/partner', label: 'Commandes' }, { to: '/partner/stats', label: 'Statistiques' }],
    admin:     [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/validators', label: 'Validateurs' }, { to: '/admin/partners', label: 'Partenaires' }, { to: '/admin/users', label: 'Utilisateurs' }],
  };

  const roleColors = {
    donor: 'badge-blue', validator: 'badge-purple', partner: 'badge-gold', admin: 'badge-red'
  };
  const roleLabels = {
    donor: 'Donneur', validator: 'Validateur', partner: 'Partenaire', admin: 'Admin'
  };

  const links = user ? (navLinks[user.role] || []) : [];
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.98)',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(0,0,0,.07)' : '1px solid rgba(0,0,0,.05)',
      transition: 'all .25s ease',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,.06)' : 'none',
    }}>
      <div className="container mx-auto px-6" style={{ maxWidth: '1280px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--g-700) 0%, var(--g-500) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(30,82,40,.3)',
            }}>
              <span style={{ color: 'var(--gold-l)', fontSize: 14, fontFamily: "'Amiri', serif", fontWeight: 700 }}>إ</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '1.25rem', color: 'var(--g-800)', lineHeight: 1 }}>IHSAN</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1 }}>Charité transparente</div>
            </div>
          </Link>

          {/* Navigation links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {links.map(link => (
              <Link key={link.to} to={link.to} style={{
                padding: '6px 14px', borderRadius: 8,
                fontSize: '0.875rem', fontWeight: 500,
                color: isActive(link.to) ? 'var(--g-600)' : '#4b5563',
                background: isActive(link.to) ? 'var(--g-100)' : 'transparent',
                textDecoration: 'none',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { if (!isActive(link.to)) { e.target.style.background = '#f9fafb'; e.target.style.color = 'var(--g-600)'; }}}
              onMouseLeave={e => { if (!isActive(link.to)) { e.target.style.background = 'transparent'; e.target.style.color = '#4b5563'; }}}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--g-700), var(--g-400))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 600, fontSize: '0.8rem',
                    flexShrink: 0,
                  }}>
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>{user.full_name}</div>
                    <span className={`badge ${roleColors[user.role] || 'badge-gray'}`} style={{ fontSize: '0.6rem' }}>
                      {roleLabels[user.role] || user.role}
                    </span>
                  </div>
                </div>
                <button onClick={handleLogout} style={{
                  padding: '6px 14px', borderRadius: 8,
                  fontSize: '0.8125rem', fontWeight: 500,
                  color: '#dc2626', background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  cursor: 'pointer', transition: 'all .15s',
                }}
                onMouseEnter={e => { e.target.style.background = '#fecaca'; }}
                onMouseLeave={e => { e.target.style.background = '#fee2e2'; }}
                >Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ padding: '7px 16px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', textDecoration: 'none', transition: 'color .15s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--g-600)'}
                  onMouseLeave={e => e.target.style.color = '#4b5563'}
                >Se connecter</Link>
                <Link to="/register" className="btn-primary" style={{ fontSize: '0.8125rem' }}>S'inscrire</Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;