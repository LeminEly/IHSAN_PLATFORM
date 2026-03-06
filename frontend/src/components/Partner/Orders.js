import React, { useState, useEffect } from "react";
import { partner } from "../../services/api";

const STATUS = {
  open: { label: "Ouvert", bg: "#dcfce7", color: "#16a34a", icon: "📂" },
  funded: { label: "Financé", bg: "#fef9c3", color: "#a16207", icon: "💰" },
  preparing: {
    label: "En préparation",
    bg: "#dbeafe",
    color: "#2563eb",
    icon: "👨‍🍳",
  },
  ready: { label: "Prêt", bg: "#ede9fe", color: "#7c3aed", icon: "✅" },
  completed: { label: "Complété", bg: "#f3f4f6", color: "#6b7280", icon: "📦" },
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const r = await partner.getOrders();
      setOrders(r.data.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await partner.updateOrderStatus(id, status);
      loadOrders();
    } catch {
      alert("Erreur mise à jour");
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
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <div className="gold-line" />
        <h1 className="page-header">Commandes</h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "0.875rem",
            marginTop: "4px",
          }}
        >
          {orders.length} commande{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {orders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            background: "white",
            borderRadius: "16px",
            color: "var(--muted)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.5rem",
              color: "var(--g-800)",
            }}
          >
            Aucune commande
          </h3>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.map((o, i) => {
            const sc = STATUS[o.status] || STATUS.open;
            return (
              <div
                key={o.id}
                className="animate-fade-up"
                style={{
                  background: "white",
                  borderRadius: "14px",
                  border: "1px solid rgba(0,0,0,.05)",
                  padding: "1.5rem",
                  boxShadow: "var(--shadow-sm)",
                  animationDelay: `${i * 0.07}s`,
                  opacity: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          padding: "3px 10px",
                          background: sc.bg,
                          color: sc.color,
                          borderRadius: 999,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                        }}
                      >
                        {sc.icon} {sc.label}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontWeight: 600,
                        fontSize: "0.9375rem",
                        color: "var(--ink)",
                        marginBottom: "4px",
                      }}
                    >
                      {o.title}
                    </h3>
                    <div
                      style={{ fontSize: "0.8125rem", color: "var(--muted)" }}
                    >
                      📍 {o.location_quarter}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 700,
                        fontSize: "1.5rem",
                        color: "var(--g-600)",
                        lineHeight: 1,
                      }}
                    >
                      {parseFloat(o.estimated_amount).toLocaleString()}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                      MRU
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--muted)",
                    lineHeight: 1.6,
                    marginBottom: "1rem",
                  }}
                >
                  {o.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "1rem",
                    borderTop: "1px solid #f3f4f6",
                  }}
                >
                  <div style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
                    Validateur : <strong>{o.validator?.full_name}</strong>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {o.status === "funded" && (
                      <>
                        <button
                          onClick={() => handleStatus(o.id, "preparing")}
                          className="btn-secondary"
                          style={{ fontSize: "0.8125rem", padding: "6px 12px" }}
                        >
                          En préparation
                        </button>
                        <button
                          onClick={() => handleStatus(o.id, "ready")}
                          className="btn-primary"
                          style={{ fontSize: "0.8125rem", padding: "6px 12px" }}
                        >
                          Prêt ✓
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;
