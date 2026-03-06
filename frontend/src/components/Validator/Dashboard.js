import React, { useState, useEffect } from "react";
import { validator } from "../../services/api";
import { Link } from "react-router-dom";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, needsRes] = await Promise.all([
        validator.getStats(),
        validator.getNeeds(),
      ]);
      setStats(statsRes.data);
      setNeeds(needsRes.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard Validateur</h1>
        <div className="space-x-4">
          <Link to="/validator/create-need" className="btn-primary">
            + Créer un besoin
          </Link>
          <Link to="/validator/register-beneficiary" className="btn-secondary">
            Enregistrer bénéficiaire
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {stats?.reputation}
          </div>
          <div className="text-sm text-gray-600">Réputation</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats?.total_deliveries}
          </div>
          <div className="text-sm text-gray-600">Livraisons</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {stats?.open_needs}
          </div>
          <div className="text-sm text-gray-600">Besoins ouverts</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600">
            {stats?.funded_needs}
          </div>
          <div className="text-sm text-gray-600">À confirmer</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-600">
            {stats?.completed_needs}
          </div>
          <div className="text-sm text-gray-600">Complétés</div>
        </div>
      </div>

      {/* Actions */}
      {stats?.funded_needs > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-yellow-800">
                ⚠️ {stats.funded_needs} besoin(s) à confirmer
              </span>
              <p className="text-sm text-yellow-700 mt-1">
                Des dons ont été effectués et attendent votre confirmation
              </p>
            </div>
            <Link to="/validator/confirm" className="btn-primary">
              Confirmer maintenant
            </Link>
          </div>
        </div>
      )}

      {/* Recent Needs */}
      <h2 className="text-xl font-bold mb-4">Besoins récents</h2>
      <div className="space-y-4">
        {needs.slice(0, 5).map((need) => (
          <div key={need.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{need.title}</h3>
                <p className="text-sm text-gray-600">{need.location_quarter}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  need.status === "open"
                    ? "bg-green-100 text-green-800"
                    : need.status === "funded"
                      ? "bg-yellow-100 text-yellow-800"
                      : need.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {need.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
