import React, { useState, useEffect } from "react";
import { validator } from "../../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await validator.getStats();
        setStats(response.data); // ou selon la structure de ton API
      } catch (err) {
        console.error("Erreur en récupérant les stats :", err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <p>Chargement des statistiques...</p>;

  return (
    <div>
      <h2>Dashboard Validateur</h2>
      <p>Total besoins à valider : {stats.toConfirm}</p>
      <p>Total besoins validés : {stats.confirmed}</p>
    </div>
  );
};

export default Dashboard;