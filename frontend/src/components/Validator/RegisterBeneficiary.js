import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validator } from "../../services/api";

function RegisterBeneficiary() {
  const [formData, setFormData] = useState({
    description: "",
    family_size: 1,
    location_quarter: "",
    location_lat: "",
    location_lng: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await validator.registerBeneficiary(formData);
      setSuccess({
        message: "Bénéficiaire enregistré avec succès",
        reference_code: response.data.reference_code,
      });
      setTimeout(() => navigate("/validator"), 3000);
    } catch (error) {
      setError(
        error.response?.data?.error || "Erreur lors de l'enregistrement",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Enregistrer un bénéficiaire</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
            <p className="font-bold">{success.message}</p>
            <p className="text-sm mt-2">
              Code de référence: <strong>{success.reference_code}</strong>
            </p>
            <p className="text-sm mt-1">Redirection dans 3 secondes...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="input"
              placeholder="Ex: Famille monoparentale, situation difficile, etc."
              required
            />
          </div>

          <div>
            <label className="label">Taille de la famille</label>
            <input
              type="number"
              name="family_size"
              value={formData.family_size}
              onChange={handleChange}
              className="input"
              min="1"
              required
            />
          </div>

          <div>
            <label className="label">Quartier</label>
            <input
              type="text"
              name="location_quarter"
              value={formData.location_quarter}
              onChange={handleChange}
              className="input"
              placeholder="Tevragh Zeina, Ksar, etc."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Latitude (optionnel)</label>
              <input
                type="text"
                name="location_lat"
                value={formData.location_lat}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Longitude (optionnel)</label>
              <input
                type="text"
                name="location_lng"
                value={formData.location_lng}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/validator")}
              className="btn-secondary flex-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="btn-primary flex-1"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterBeneficiary;
