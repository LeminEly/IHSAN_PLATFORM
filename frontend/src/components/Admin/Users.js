import React, { useState, useEffect } from "react";
import { admin } from "../../services/api";

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "active", label: "Actifs" },
  { key: "inactive", label: "Suspendus" },
  { key: "donor", label: "Donneurs" },
  { key: "validator", label: "Validateurs" },
  { key: "partner", label: "Partenaires" },
];
const ROLE_CONFIG = {
  admin: { label: "Admin", bg: "#fee2e2", color: "#dc2626" },
  validator: { label: "Validateur", bg: "#ede9fe", color: "#7c3aed" },
  partner: { label: "Partenaire", bg: "#fef9c3", color: "#a16207" },
  donor: { label: "Donneur", bg: "#dbeafe", color: "#2563eb" },
};

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const r = await admin.getUsers();
      setUsers(r.data.users || r.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id) => {
    const reason = window.prompt("Raison de la suspension :");
    if (!reason) return;
    try {
      await admin.suspendUser(id, reason);
      loadUsers();
    } catch {
      alert("Erreur lors de la suspension");
    }
  };

  const handleActivate = async (id) => {
    try {
      await admin.activateUser(id, "Réactivation manuelle");
      loadUsers();
    } catch {
      alert("Erreur lors de l'activation");
    }
  };

  const filtered = users.filter((u) => {
    if (filter === "all") return true;
    if (filter === "active") return u.is_active;
    if (filter === "inactive") return !u.is_active;
    return u.role === filter;
  });

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
        <h1 className="page-header">Gestion des utilisateurs</h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "0.875rem",
            marginTop: "4px",
          }}
        >
          {users.length} utilisateur{users.length !== 1 ? "s" : ""} au total
        </p>
      </div>

      {/* Filter Pills */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
          padding: "1rem",
          background: "white",
          borderRadius: "12px",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid rgba(0,0,0,.04)",
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: "0.8125rem",
              fontWeight: 500,
              background:
                filter === f.key
                  ? "linear-gradient(135deg, var(--g-700), var(--g-500))"
                  : "#f3f4f6",
              color: filter === f.key ? "white" : "#4b5563",
              border: "none",
              cursor: "pointer",
              boxShadow:
                filter === f.key ? "0 4px 12px rgba(30,82,40,.25)" : "none",
              transition: "all .15s",
            }}
          >
            {f.label}{" "}
            {filter === f.key && filtered.length > 0 && `(${filtered.length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid rgba(0,0,0,.05)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "var(--g-50)",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {[
                "Utilisateur",
                "Contact",
                "Rôle",
                "Statut",
                "Inscrit le",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "var(--muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  Aucun utilisateur
                </td>
              </tr>
            ) : (
              filtered.map((u, i) => {
                const rc = ROLE_CONFIG[u.role] || {
                  label: u.role,
                  bg: "#f3f4f6",
                  color: "#4b5563",
                };
                return (
                  <tr
                    key={u.id}
                    className="table-row"
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${rc.bg}, white)`,
                            border: `1px solid ${rc.color}30`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            color: rc.color,
                            flexShrink: 0,
                          }}
                        >
                          {u.full_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            color: "var(--ink)",
                          }}
                        >
                          {u.full_name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{ fontSize: "0.8125rem", color: "var(--ink)" }}
                      >
                        {u.phone}
                      </div>
                      {u.email && (
                        <div
                          style={{ fontSize: "0.75rem", color: "var(--muted)" }}
                        >
                          {u.email}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          background: rc.bg,
                          color: rc.color,
                          borderRadius: 999,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                        }}
                      >
                        {rc.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 999,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          background: u.is_active ? "#dcfce7" : "#fee2e2",
                          color: u.is_active ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {u.is_active ? "● Actif" : "○ Suspendu"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "0.8125rem",
                        color: "var(--muted)",
                      }}
                    >
                      {new Date(u.created_at || u.createdAt).toLocaleDateString(
                        "fr-FR",
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {u.role !== "admin" &&
                        (u.is_active ? (
                          <button
                            onClick={() => handleSuspend(u.id)}
                            style={{
                              padding: "5px 12px",
                              borderRadius: 6,
                              background: "#fee2e2",
                              color: "#dc2626",
                              border: "1px solid #fca5a5",
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            Suspendre
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(u.id)}
                            style={{
                              padding: "5px 12px",
                              borderRadius: 6,
                              background: "#dcfce7",
                              color: "#16a34a",
                              border: "1px solid #86efac",
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            Activer
                          </button>
                        ))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
