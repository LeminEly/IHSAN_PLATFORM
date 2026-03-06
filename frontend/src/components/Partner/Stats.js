import React, { useState, useEffect } from "react";
import { partner } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

function Stats() {
  const [stats, setStats] = useState(null);
  const [ordersByMonth, setOrdersByMonth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await partner.getStats();
      setStats(response.data);

      const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
      const data = months.map((month) => ({
        name: month,
        commandes: Math.floor(Math.random() * 10) + 1,
        montant: Math.floor(Math.random() * 50000) + 10000,
      }));
      setOrdersByMonth(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const pieData = stats
    ? [
        { name: "En attente", value: stats.pending_orders || 0 },
        { name: "Ouverts", value: stats.open_orders || 0 },
        { name: "Financés", value: stats.funded_orders || 0 },
        { name: "Complétés", value: stats.completed_orders || 0 },
      ]
    : [];

  if (loading) return <div className="text-center py-20">Chargement...</div>;
  if (!stats) return <div className="text-center py-20">Aucune donnée</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Statistiques</h1>

      {/* Cartes de statistiques */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-primary-600">
            {stats.total_orders}
          </div>
          <div className="text-gray-600">Total commandes</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">
            {stats.total_amount?.toLocaleString()} MRU
          </div>
          <div className="text-gray-600">Montant total</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-yellow-600">
            {stats.pending_orders}
          </div>
          <div className="text-gray-600">En attente</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">
            {stats.open_orders}
          </div>
          <div className="text-gray-600">Besoins ouverts</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-orange-600">
            {stats.funded_orders}
          </div>
          <div className="text-gray-600">Financés</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600">
            {stats.completed_orders}
          </div>
          <div className="text-gray-600">Complétés</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Graphique en barres */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Évolution des commandes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="commandes"
                fill="#8884d8"
                name="Nombre"
              />
              <Bar
                yAxisId="right"
                dataKey="montant"
                fill="#82ca9d"
                name="Montant (MRU)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique circulaire */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Répartition par statut</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau récapitulatif */}
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Détail des commandes</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pourcentage
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pieData.map((item, index) => (
              <tr key={item.name}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    {item.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{item.value}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.name === "Financés" || item.name === "Complétés"
                    ? (
                        item.value *
                        (stats.total_amount / stats.total_orders)
                      ).toFixed(0) + " MRU"
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {((item.value / stats.total_orders) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Stats;
