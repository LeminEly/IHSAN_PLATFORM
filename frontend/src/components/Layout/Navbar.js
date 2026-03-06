import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = {
    donor: [
      { to: "/donor", label: "Catalogue" },
      { to: "/donor/donations", label: "Mes dons" },
    ],
    validator: [
      { to: "/validator", label: "Dashboard" },
      { to: "/validator/create-need", label: "Créer besoin" },
      { to: "/validator/confirm", label: "Confirmer" },
    ],
    partner: [
      { to: "/partner", label: "Commandes" },
      { to: "/partner/stats", label: "Statistiques" },
    ],
    admin: [
      { to: "/admin", label: "Dashboard" },
      { to: "/admin/validators", label: "Validateurs" },
      { to: "/admin/partners", label: "Partenaires" },
      { to: "/admin/users", label: "Utilisateurs" },
    ],
  };

  const roleColors = {
    donor: "badge-blue",
    validator: "badge-purple",
    partner: "badge-gold",
    admin: "badge-red",
  };
  const roleLabels = {
    donor: "Donneur",
    validator: "Validateur",
    partner: "Partenaire",
    admin: "Admin",
  };

  const links = user ? navLinks[user.role] || [] : [];
  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-right  { display: none !important; }
          .nav-hamburger      { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
        }
        .nav-hamburger {
          display: none; width: 40px; height: 40px;
          background: none; border: 1px solid #e5e7eb; border-radius: 8px;
          cursor: pointer; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
        }
        .nav-hamburger-line {
          width: 18px; height: 2px; background: #4b5563; border-radius: 1px; transition: all .2s ease;
        }
        .nav-hamburger.open .nav-hamburger-line:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .nav-hamburger.open .nav-hamburger-line:nth-child(2) { opacity: 0; }
        .nav-hamburger.open .nav-hamburger-line:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .nav-backdrop {
          display: none; position: fixed; inset: 0; z-index: 48;
          background: rgba(0,0,0,.3); backdrop-filter: blur(3px);
        }
        .nav-backdrop.open { display: block; }
        .nav-mobile-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(300px, 85vw); z-index: 49;
          background: rgba(255,255,255,0.98);
          border-left: 1px solid rgba(0,0,0,.07);
          box-shadow: -8px 0 40px rgba(0,0,0,.1);
          display: flex; flex-direction: column;
          transform: translateX(100%); transition: transform .25s ease;
          overflow-y: auto;
        }
        .nav-mobile-drawer.open { transform: translateX(0); }
        .nav-drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-bottom: 1px solid rgba(0,0,0,.05);
        }
        .nav-drawer-close {
          width: 34px; height: 34px; border-radius: 8px;
          background: #f9fafb; border: 1px solid #e5e7eb;
          color: #6b7280; font-size: 1rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-drawer-user { padding: 14px 16px; border-bottom: 1px solid rgba(0,0,0,.05); background: #f9fafb; }
        .nav-drawer-links { padding: 10px 8px; flex: 1; }
        .nav-drawer-link {
          display: block; padding: 10px 12px; border-radius: 8px;
          font-size: 0.9375rem; font-weight: 500; text-decoration: none; color: #4b5563;
          transition: all .15s; margin-bottom: 2px;
        }
        .nav-drawer-link:hover { background: #f9fafb; color: var(--g-600); }
        .nav-drawer-link.active { background: var(--g-100); color: var(--g-600); font-weight: 600; }
        .nav-drawer-section-label {
          font-size: 0.65rem; font-weight: 700; color: #9ca3af;
          letter-spacing: .08em; text-transform: uppercase; padding: 8px 12px 4px;
        }
        .nav-drawer-footer { padding: 12px 16px; border-top: 1px solid rgba(0,0,0,.05); }
      `}</style>

      <div
        className={`nav-backdrop${menuOpen ? " open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: scrolled
            ? "rgba(255,255,255,0.92)"
            : "rgba(255,255,255,0.98)",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(0,0,0,.07)"
            : "1px solid rgba(0,0,0,.05)",
          transition: "all .25s ease",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,.06)" : "none",
        }}
      >
        <div className="container mx-auto px-6" style={{ maxWidth: "1280px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "64px",
            }}
          >
            {/* Logo */}
            <Link
              to="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background:
                    "linear-gradient(135deg, var(--g-700) 0%, var(--g-500) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(30,82,40,.3)",
                }}
              >
                <span
                  style={{
                    color: "var(--gold-l)",
                    fontSize: 14,
                    fontFamily: "'Amiri', serif",
                    fontWeight: 700,
                  }}
                >
                  إ
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    color: "var(--g-800)",
                    lineHeight: 1,
                  }}
                >
                  IHSAN
                </div>
                <div
                  style={{
                    fontSize: "0.6rem",
                    color: "var(--muted)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    lineHeight: 1,
                  }}
                >
                  Charité transparente
                </div>
              </div>
            </Link>

            {/* Liens desktop */}
            <div
              className="nav-desktop-links"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: isActive(link.to) ? "var(--g-600)" : "#4b5563",
                    background: isActive(link.to)
                      ? "var(--g-100)"
                      : "transparent",
                    textDecoration: "none",
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(link.to)) {
                      e.target.style.background = "#f9fafb";
                      e.target.style.color = "var(--g-600)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.to)) {
                      e.target.style.background = "transparent";
                      e.target.style.color = "#4b5563";
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right desktop */}
            <div
              className="nav-desktop-right"
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              {user ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "6px 12px",
                      background: "#f9fafb",
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, var(--g-700), var(--g-400))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        flexShrink: 0,
                      }}
                    >
                      {user.full_name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "var(--ink)",
                          lineHeight: 1.2,
                        }}
                      >
                        {user.full_name}
                      </div>
                      <span
                        className={`badge ${roleColors[user.role] || "badge-gray"}`}
                        style={{ fontSize: "0.6rem" }}
                      >
                        {roleLabels[user.role] || user.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      color: "#dc2626",
                      background: "#fee2e2",
                      border: "1px solid #fca5a5",
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#fecaca";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#fee2e2";
                    }}
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    style={{
                      padding: "7px 16px",
                      borderRadius: 8,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#4b5563",
                      textDecoration: "none",
                      transition: "color .15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--g-600)")
                    }
                    onMouseLeave={(e) => (e.target.style.color = "#4b5563")}
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                    style={{ fontSize: "0.8125rem" }}
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger mobile */}
            <button
              className={`nav-hamburger${menuOpen ? " open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className="nav-hamburger-line" />
              <span className="nav-hamburger-line" />
              <span className="nav-hamburger-line" />
            </button>
          </div>
        </div>
      </nav>

      {/* Drawer mobile */}
      <div
        ref={menuRef}
        className={`nav-mobile-drawer${menuOpen ? " open" : ""}`}
      >
        <div className="nav-drawer-header">
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background:
                  "linear-gradient(135deg, var(--g-700) 0%, var(--g-500) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 8px rgba(30,82,40,.25)",
              }}
            >
              <span
                style={{
                  color: "var(--gold-l)",
                  fontSize: 11,
                  fontFamily: "'Amiri', serif",
                  fontWeight: 700,
                }}
              >
                إ
              </span>
            </div>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "1.125rem",
                color: "var(--g-800)",
              }}
            >
              IHSAN
            </span>
          </Link>
          <button
            className="nav-drawer-close"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        {user && (
          <div className="nav-drawer-user">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--g-700), var(--g-400))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  flexShrink: 0,
                }}
              >
                {user.full_name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  {user.full_name}
                </div>
                <span
                  className={`badge ${roleColors[user.role] || "badge-gray"}`}
                  style={{ fontSize: "0.6rem" }}
                >
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="nav-drawer-links">
          {links.length > 0 && (
            <>
              <div className="nav-drawer-section-label">Navigation</div>
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-drawer-link${isActive(link.to) ? " active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </>
          )}
          {!user && (
            <>
              <div className="nav-drawer-section-label">Compte</div>
              <Link to="/login" className="nav-drawer-link">
                Se connecter
              </Link>
              <Link to="/register" className="nav-drawer-link">
                S'inscrire
              </Link>
            </>
          )}
          <div
            style={{
              borderTop: "1px solid rgba(0,0,0,.05)",
              marginTop: 8,
              paddingTop: 8,
            }}
          >
            <Link to="/" className="nav-drawer-link">
              Accueil public
            </Link>
          </div>
        </div>

        {user && (
          <div className="nav-drawer-footer">
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "9px 14px",
                borderRadius: 8,
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#dc2626",
                background: "#fee2e2",
                border: "1px solid #fca5a5",
                cursor: "pointer",
                transition: "all .15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#fecaca")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#fee2e2")
              }
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Navbar;
