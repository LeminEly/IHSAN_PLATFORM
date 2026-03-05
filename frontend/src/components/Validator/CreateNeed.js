import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validator } from '../../services/api';

function CreateNeed() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimated_amount: '',
    location_quarter: '',
    location_lat: '',
    location_lng: '',
    category: 'iftar_meal',
    priority: 1,
    partner_id: '',
    beneficiary_description: '',
    family_size: 1
  });
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      // Récupérer la liste des partenaires approuvés
      const response = await validator.getPartners();
      setPartners(response.data);
    } catch (error) {
      console.error('Error loading partners:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await validator.createNeed(formData);
      navigate('/validator');
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Créer un besoin</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Need Info */}
          <div>
            <h2 className="font-bold mb-4">Informations du besoin</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Titre</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Montant estimé (MRU)</label>
                <input
                  type="number"
                  name="estimated_amount"
                  value={formData.estimated_amount}
                  onChange={handleChange}
                  className="input"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="label">Catégorie</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="iftar_meal">Repas Iftar</option>
                  <option value="food_basket">Panier alimentaire</option>
                  <option value="clothing">Vêtements</option>
                  <option value="medical">Médical</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="font-bold mb-4">Localisation</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Quartier</label>
                <input
                  type="text"
                  name="location_quarter"
                  value={formData.location_quarter}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Latitude</label>
                  <input
                    type="text"
                    name="location_lat"
                    value={formData.location_lat}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Longitude</label>
                  <input
                    type="text"
                    name="location_lng"
                    value={formData.location_lng}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Beneficiary */}
          <div>
            <h2 className="font-bold mb-4">Bénéficiaire (anonyme)</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Description</label>
                <textarea
                  name="beneficiary_description"
                  value={formData.beneficiary_description}
                  onChange={handleChange}
                  rows="2"
                  className="input"
                  placeholder="Ex: Famille de 4 personnes, situation difficile"
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
            </div>
          </div>

          {/* Partner */}
          <div>
            <h2 className="font-bold mb-4">Partenaire</h2>
            <div>
              <label className="label">Sélectionner un partenaire</label>
              <select
                name="partner_id"
                value={formData.partner_id}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Choisir un partenaire</option>
                {partners.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.business_name} - {p.address}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/validator')}
              className="btn-secondary flex-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Création...' : 'Créer le besoin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateNeed;