import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { admin } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    admin
      .getStats()
      .then((r) => setStats(r.data))
      .catch(() => setError("Erreur chargement statistiques"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid var(--g-100)",
            borderTopColor: "var(--g-500)",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  const statsCards = [
    {
      label: "Utilisateurs actifs",
      value: stats?.total_users ?? 0,
      color: "blue",
      icon: "👥",
    },
    {
      label: "Validateurs en attente",
      value: stats?.pending_validators ?? 0,
      color: "purple",
      icon: "⏳",
      urgent: stats?.pending_validators > 0,
      link: "/admin/validators",
    },
    {
      label: "Partenaires en attente",
      value: stats?.pending_partners ?? 0,
      color: "orange",
      icon: "🏪",
      urgent: stats?.pending_partners > 0,
      link: "/admin/partners",
    },
    {
      label: "Transactions confirmées",
      value: stats?.total_transactions ?? 0,
      color: "green",
      icon: "⛓",
    },
    {
      label: "Total dons",
      value: `${(stats?.total_donations ?? 0).toLocaleString()} MRU`,
      color: "gold",
      icon: "💰",
    },
    {
      label: "Besoins complétés",
      value: stats?.completed_needs ?? 0,
      color: "green",
      icon: "✅",
    },
  ];

  const panels = [
    {
      icon: "⏳",
      title: "Validateurs en attente",
      desc: "Approuvez ou rejetez les demandes de validateurs terrain.",
      to: "/admin/validators",
      count: stats?.pending_validators,
      countColor: "#7c3aed",
      countBg: "#ede9fe",
    },
    {
      icon: "🏪",
      title: "Partenaires en attente",
      desc: "Vérifiez et approuvez les restaurants et commerces partenaires.",
      to: "/admin/partners",
      count: stats?.pending_partners,
      countColor: "#d97706",
      countBg: "#fef3c7",
    },
    {
      icon: "👥",
      title: "Gestion des utilisateurs",
      desc: "Consultez, suspendez ou activez les comptes utilisateurs.",
      to: "/admin/users",
      count: null,
    },
    {
      icon: "📊",
      title: "Dashboard public",
      desc: "Voir le tableau de bord visible par tous les utilisateurs.",
      to: "/",
      count: null,
      external: true,
    },
  ];

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <div className="gold-line" />
          <h1 className="page-header">Dashboard Administration</h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.875rem",
              marginTop: "4px",
            }}
          >
            Bienvenue,{" "}
            <strong style={{ color: "var(--g-700)" }}>{user?.full_name}</strong>
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            background: "#fee2e2",
            color: "#dc2626",
            border: "1px solid #fca5a5",
            fontSize: "0.8125rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fecaca")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fee2e2")}
        >
          Déconnexion
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 10,
            marginBottom: "1.5rem",
            color: "#dc2626",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        {statsCards.map((s, i) => (
          <div
            key={s.label}
            className={`stat-card ${s.color} animate-fade-up stagger-${i + 1}`}
            style={{
              outline: s.urgent ? "2px solid #f59e0b" : "none",
              outlineOffset: "2px",
              cursor: s.link ? "pointer" : "default",
            }}
            onClick={() => s.link && (window.location.href = s.link)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ fontSize: "1.375rem", marginBottom: "8px" }}>
                  {s.icon}
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "2.25rem",
                    fontWeight: 700,
                    color: "var(--g-800)",
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--muted)",
                    marginTop: "6px",
                  }}
                >
                  {s.label}
                </div>
              </div>
              {s.urgent && (
                <span
                  style={{
                    padding: "3px 8px",
                    background: "#fef3c7",
                    color: "#d97706",
                    borderRadius: 999,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  Urgent
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Panels */}
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--g-800)",
          marginBottom: "1rem",
        }}
      >
        Actions rapides
      </h2>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        {panels.map((p, i) => (
          <div
            key={p.to}
            className="animate-fade-up"
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid rgba(0,0,0,.05)",
              padding: "1.5rem",
              boxShadow: "var(--shadow-sm)",
              animationDelay: `${i * 0.1}s`,
              opacity: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span style={{ fontSize: "1.375rem" }}>{p.icon}</span>
                <h3
                  style={{
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    color: "var(--ink)",
                  }}
                >
                  {p.title}
                </h3>
              </div>
              {p.count > 0 && (
                <span
                  style={{
                    padding: "2px 10px",
                    background: p.countBg,
                    color: p.countColor,
                    borderRadius: 999,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {p.count}
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--muted)",
                lineHeight: 1.6,
                marginBottom: "1.25rem",
              }}
            >
              {p.desc}
            </p>
            <Link
              to={p.to}
              className="btn-primary"
              style={{ fontSize: "0.8125rem", display: "inline-flex" }}
            >
              {p.external ? "Voir →" : "Gérer →"}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
