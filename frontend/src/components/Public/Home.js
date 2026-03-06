import React, { useState, useEffect } from "react";
import { publicApi } from "../../services/api";
import socket from "../../services/socket";
import MapView from "./MapView";
import { Link } from "react-router-dom";

function Home() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    socket.on("new-transaction", (t) =>
      setTransactions((prev) => [t, ...prev].slice(0, 50)),
    );
    socket.on("stats-updated", (s) => setStats(s));
    return () => {
      socket.off("new-transaction");
      socket.off("stats-updated");
    };
  }, []);

  const loadDashboard = async () => {
    try {
      const r = await publicApi.getDashboard({ limit: 10 });
      setStats(r.data.data.stats);
      setTransactions(r.data.data.transactions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "3px solid var(--g-100)",
              borderTopColor: "var(--g-500)",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
            Chargement…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  return (
    <div style={{ paddingBottom: "4rem" }}>
      {/* Hero */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, var(--g-950) 0%, var(--g-800) 50%, var(--g-700) 100%)",
          borderRadius: "20px",
          padding: "5rem 4rem",
          marginBottom: "3rem",
          boxShadow: "0 20px 60px rgba(10,26,13,.4)",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,168,76,.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(45,122,58,.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {/* Geometric line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background:
              "linear-gradient(90deg, transparent 0%, var(--gold) 40%, var(--gold-l) 60%, transparent 100%)",
            opacity: 0.7,
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "640px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 14px",
              background: "rgba(201,168,76,.15)",
              border: "1px solid rgba(201,168,76,.3)",
              borderRadius: 999,
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--gold)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--gold-l)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              S3C'1447 · Défi 2 · Ramadan 1447
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              color: "white",
              lineHeight: 1,
              marginBottom: "0.5rem",
            }}
          >
            IHSAN
          </h1>
          <div
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: "1.375rem",
              color: "var(--gold-l)",
              marginBottom: "1.5rem",
              letterSpacing: "0.02em",
            }}
          >
            إحسان
          </div>

          <p
            style={{
              fontSize: "1.0625rem",
              color: "rgba(255,255,255,.72)",
              lineHeight: 1.7,
              marginBottom: "2.5rem",
            }}
          >
            La première plateforme de charité transparente de bout en bout en
            Mauritanie — chaque don traçable sur la blockchain, chaque
            bénéficiaire protégé dans sa dignité.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              to="/register"
              style={{
                padding: "12px 28px",
                borderRadius: 10,
                background:
                  "linear-gradient(135deg, var(--gold-d) 0%, var(--gold) 100%)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.9375rem",
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(201,168,76,.4)",
                transition: "all .2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              Rejoindre IHSAN →
            </Link>
            <Link
              to="/login"
              style={{
                padding: "12px 24px",
                borderRadius: 10,
                background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.2)",
                color: "rgba(255,255,255,.85)",
                fontWeight: 500,
                fontSize: "0.875rem",
                textDecoration: "none",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,.14)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,.08)";
              }}
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          marginBottom: "3rem",
        }}
      >
        {[
          {
            label: "Dons totaux",
            value: `${(stats?.total_donations ?? 0).toLocaleString()} MRU`,
            color: "green",
            icon: "💰",
          },
          {
            label: "Transactions",
            value: stats?.total_transactions ?? 0,
            color: "gold",
            icon: "⛓",
          },
          {
            label: "Validateurs actifs",
            value: stats?.active_validators ?? 0,
            color: "blue",
            icon: "✓",
          },
          {
            label: "Quartiers couverts",
            value: stats?.quarters_covered ?? 0,
            color: "purple",
            icon: "📍",
          },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`stat-card ${s.color} animate-fade-up stagger-${i + 1}`}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
              {s.icon}
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--g-800)",
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--muted)",
                marginTop: "4px",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{ marginBottom: "3rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <div className="gold-line" />
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.875rem",
                fontWeight: 700,
                color: "var(--g-800)",
                lineHeight: 1,
              }}
            >
              Carte interactive des dons
            </h2>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--muted)",
                marginTop: "4px",
              }}
            >
              Tous les besoins financés à Nouakchott en temps réel
            </p>
          </div>
        </div>
        <div
          style={{
            height: "420px",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid rgba(0,0,0,.06)",
          }}
        >
          <MapView />
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div style={{ marginBottom: "1.25rem" }}>
          <div className="gold-line" />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.875rem",
                  fontWeight: 700,
                  color: "var(--g-800)",
                  lineHeight: 1,
                }}
              >
                Transactions en direct
              </h2>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--muted)",
                  marginTop: "4px",
                }}
              >
                Mises à jour en temps réel via WebSocket
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                background: "#dcfce7",
                borderRadius: 999,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#16a34a",
                  display: "inline-block",
                  animation: "pulse-green 2s infinite",
                }}
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#15803d",
                  fontWeight: 500,
                }}
              >
                Live
              </span>
            </div>
          </div>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {transactions.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                background: "white",
                borderRadius: "16px",
                color: "var(--muted)",
              }}
            >
              Aucune transaction récente.
            </div>
          )}
          {transactions.map((t, i) => (
            <div
              key={t.id || i}
              className="animate-fade-up"
              style={{
                animationDelay: `${i * 0.06}s`,
                opacity: 0,
                background: "white",
                borderRadius: "14px",
                border: "1px solid rgba(0,0,0,.05)",
                padding: "1.25rem 1.5rem",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "box-shadow .2s, transform .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "10px",
                    background:
                      "linear-gradient(135deg, var(--g-100), var(--g-50))",
                    border: "1px solid var(--g-200)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      color: "var(--ink)",
                      marginBottom: "2px",
                    }}
                  >
                    {t.need?.title || t.need_title}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
                    📍 {t.need?.quarter || t.location_quarter}
                    {t.validator?.name && (
                      <span style={{ marginLeft: "10px" }}>
                        • {t.validator.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 700,
                    fontSize: "1.375rem",
                    color: "var(--g-600)",
                  }}
                >
                  {t.amount} <span style={{ fontSize: "0.875rem" }}>MRU</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {new Date(t.confirmed_at || t.date).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {t.blockchain?.url && (
                  <a
                    href={t.blockchain.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--g-500)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                      marginTop: 2,
                    }}
                  >
                    → Voir blockchain
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
