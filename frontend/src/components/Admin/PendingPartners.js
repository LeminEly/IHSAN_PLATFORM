import React, { useState, useEffect } from "react";
import { admin } from "../../services/api";

function PendingPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [visitModal, setVisitModal] = useState(null); // partner object
  const [visitNotes, setVisitNotes] = useState("");

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const r = await admin.getPendingPartners();
      setPartners(r.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, type, payload) => {
    setActionLoading(id);
    try {
      if (type === "approve") {
        const reason = window.prompt("Raison (optionnelle) :");
        await admin.approvePartner(id, reason);
      } else if (type === "reject") {
        const reason = window.prompt("Raison du rejet :");
        if (!reason) return;
        await admin.rejectPartner(id, reason);
      } else if (type === "visit") {
        await admin.recordSiteVisit(id, { notes: payload });
        setVisitModal(null);
        setVisitNotes("");
      }
      loadPartners();
    } catch (e) {
      alert("Erreur : " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "40vh",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "3px solid var(--g-100)",
            borderTopColor: "var(--g-500)",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  return (
    <div style={{ maxWidth: "860px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div className="gold-line" />
        <h1 className="page-header">Partenaires en attente</h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "0.875rem",
            marginTop: "4px",
          }}
        >
          {partners.length} demande{partners.length !== 1 ? "s" : ""} en attente
          de vérification
        </p>
      </div>

      {/* Visit Modal */}
      {visitModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 24px 80px rgba(0,0,0,.2)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.375rem",
                fontWeight: 700,
                color: "var(--g-800)",
                marginBottom: "0.5rem",
              }}
            >
              Visite terrain
            </h3>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--muted)",
                marginBottom: "1.25rem",
              }}
            >
              <strong>{visitModal.business_name}</strong> · {visitModal.address}
            </p>
            <label className="label">Notes de la visite</label>
            <textarea
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              rows={4}
              className="input"
              placeholder="Observations, remarques, état des lieux…"
              style={{ resize: "vertical", marginBottom: "1.25rem" }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => handleAction(visitModal.id, "visit", visitNotes)}
                disabled={!visitNotes.trim()}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                Confirmer la visite
              </button>
              <button
                onClick={() => {
                  setVisitModal(null);
                  setVisitNotes("");
                }}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {partners.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "white",
            borderRadius: "16px",
            border: "1px solid rgba(0,0,0,.04)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏪</div>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.5rem",
              color: "var(--g-800)",
            }}
          >
            Aucun partenaire en attente
          </h3>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {partners.map((p, i) => (
            <div
              key={p.id}
              className="animate-fade-up"
              style={{
                background: "white",
                borderRadius: "14px",
                border: "1px solid rgba(0,0,0,.05)",
                padding: "1.5rem",
                boxShadow: "var(--shadow-sm)",
                animationDelay: `${i * 0.08}s`,
                opacity: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "14px" }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                      border: "1px solid #fcd34d",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.375rem",
                      flexShrink: 0,
                    }}
                  >
                    🏪
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.9375rem",
                        color: "var(--ink)",
                      }}
                    >
                      {p.business_name}
                    </div>
                    <div
                      style={{ fontSize: "0.8125rem", color: "var(--muted)" }}
                    >
                      👤 {p.owner_name}
                    </div>
                    <div
                      style={{ fontSize: "0.8125rem", color: "var(--muted)" }}
                    >
                      📍 {p.address}
                    </div>
                    <div
                      style={{ fontSize: "0.8125rem", color: "var(--muted)" }}
                    >
                      📞 {p.payment_phone}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setVisitModal(p)}
                    disabled={actionLoading === p.id}
                    className="btn-secondary"
                    style={{ fontSize: "0.8125rem" }}
                  >
                    📋 Visite terrain
                  </button>
                  <button
                    onClick={() => handleAction(p.id, "approve")}
                    disabled={actionLoading === p.id}
                    className="btn-success"
                    style={{ fontSize: "0.8125rem" }}
                  >
                    ✓ Approuver
                  </button>
                  <button
                    onClick={() => handleAction(p.id, "reject")}
                    disabled={actionLoading === p.id}
                    className="btn-danger"
                    style={{ fontSize: "0.8125rem" }}
                  >
                    ✕ Rejeter
                  </button>
                </div>
              </div>

              {p.commerce_registry_url && (
                <div
                  style={{
                    marginTop: "1.25rem",
                    paddingTop: "1.25rem",
                    borderTop: "1px solid #f3f4f6",
                  }}
                >
                  <a
                    href={p.commerce_registry_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 14px",
                      background: "var(--g-50)",
                      borderRadius: 10,
                      border: "1px solid var(--g-200)",
                      textDecoration: "none",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>📋</span>
                    <div>
                      <div
                        style={{ fontSize: "0.72rem", color: "var(--muted)" }}
                      >
                        Registre de commerce
                      </div>
                      <div
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--g-600)",
                          fontWeight: 500,
                        }}
                      >
                        Voir le document →
                      </div>
                    </div>
                  </a>
                </div>
              )}

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "0.72rem",
                  color: "var(--muted)",
                }}
              >
                Inscrit le {new Date(p.created_at).toLocaleString("fr-FR")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PendingPartners;
