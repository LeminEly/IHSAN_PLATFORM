import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { donor } from "../../services/api";

function Receipt() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donor
      .getReceipt(id)
      .then((r) => setReceipt(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

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
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  if (!receipt)
    return (
      <div
        style={{ textAlign: "center", padding: "4rem", color: "var(--muted)" }}
      >
        Reçu non trouvé
      </div>
    );

  const confirmed = receipt.status === "confirmed";

  return (
    <div style={{ maxWidth: "540px", margin: "0 auto" }}>
      {/* Print button */}
      <div style={{ textAlign: "right", marginBottom: "1rem" }}>
        <button
          onClick={() => window.print()}
          className="btn-secondary"
          style={{ fontSize: "0.8125rem" }}
        >
          🖨 Imprimer
        </button>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "20px",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,.04)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background:
              "linear-gradient(135deg, var(--g-950) 0%, var(--g-800) 100%)",
            padding: "2rem 2.5rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 140,
              height: 140,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(201,168,76,.15) 0%, transparent 70%)",
            }}
          />
          <div
            style={{
              fontSize: "1.5rem",
              marginBottom: "6px",
              fontFamily: "'Amiri', serif",
              color: "var(--gold-l)",
            }}
          >
            إحسان
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2rem",
              fontWeight: 700,
              color: "white",
              lineHeight: 1,
              marginBottom: "6px",
            }}
          >
            IHSAN
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,.5)" }}>
            Reçu de don officiel
          </p>
          <div style={{ marginTop: "1rem" }}>
            <span
              style={{
                padding: "4px 16px",
                borderRadius: 999,
                fontSize: "0.75rem",
                fontWeight: 600,
                background: confirmed
                  ? "rgba(34,197,94,.2)"
                  : "rgba(234,179,8,.2)",
                color: confirmed ? "#4ade80" : "#fde047",
              }}
            >
              {confirmed ? "✓ Confirmé" : "⏳ En attente"}
            </span>
          </div>
        </div>

        <div
          style={{
            padding: "2rem 2.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* Receipt number */}
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
              background: "var(--g-50)",
              borderRadius: 12,
              border: "1px solid var(--g-200)",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--muted)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Numéro de reçu
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "1.125rem",
                color: "var(--g-700)",
                letterSpacing: "0.04em",
              }}
            >
              {receipt.receipt_number}
            </div>
          </div>

          {/* Details */}
          {[
            ["Date", new Date(receipt.date).toLocaleString("fr-FR")],
            ["Besoin financé", receipt.need?.title],
            ["Quartier", receipt.need?.location_quarter],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
                {label}
              </span>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--ink)",
                  textAlign: "right",
                  maxWidth: "60%",
                }}
              >
                {value}
              </span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
              Montant
            </span>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "1.75rem",
                color: "var(--g-600)",
              }}
            >
              {parseFloat(receipt.amount).toLocaleString()}{" "}
              <span style={{ fontSize: "0.875rem" }}>MRU</span>
            </span>
          </div>

          {/* Impact proof */}
          {receipt.impact_proof && (
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Preuve d'impact
              </div>
              <img
                src={receipt.impact_proof.media_url}
                alt="Preuve"
                style={{
                  width: "100%",
                  borderRadius: 12,
                  objectFit: "cover",
                  maxHeight: "200px",
                }}
              />
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  marginTop: "6px",
                }}
              >
                {new Date(receipt.impact_proof.uploaded_at).toLocaleString(
                  "fr-FR",
                )}
              </p>
            </div>
          )}

          {/* Blockchain */}
          {receipt.blockchain && (
            <div
              style={{
                padding: "1rem",
                background: "#0a1a0d",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--gold)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                ⛓ Vérification Blockchain
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,.5)",
                  marginBottom: "4px",
                }}
              >
                Hash SHA-256
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,.8)",
                  wordBreak: "break-all",
                  marginBottom: "10px",
                }}
              >
                {receipt.blockchain.hash}
              </div>
              {receipt.blockchain.explorer_url && (
                <a
                  href={receipt.blockchain.explorer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--gold-l)",
                    textDecoration: "none",
                  }}
                >
                  Voir sur l'explorateur →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Receipt;
