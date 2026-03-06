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
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const response = await validator.getPartners();
      setPartners(response.data);
    } catch (error) {
      console.error('Error loading partners:', error);
    }
  };

  const getGPS = () => {
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée par ce navigateur.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          location_lat: pos.coords.latitude.toFixed(6),
          location_lng: pos.coords.longitude.toFixed(6)
        }));
        setGpsLoading(false);
      },
      (err) => {
        setError("Impossible d'obtenir votre position. Veuillez saisir manuellement.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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
      setSuccess(true);
      setTimeout(() => navigate('/validator'), 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'iftar_meal', label: '🍽️ Repas Iftar', icon: '🍽️' },
    { value: 'food_basket', label: '🧺 Panier alimentaire', icon: '🧺' },
    { value: 'clothing', label: '👕 Vêtements', icon: '👕' },
    { value: 'medical', label: '💊 Médical', icon: '💊' },
    { value: 'other', label: '📦 Autre', icon: '📦' }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Créer un nouveau besoin</h1>
        <p className="text-secondary-500 mt-2">
          Remplissez ce formulaire pour enregistrer un besoin que vous avez identifié sur le terrain
        </p>
      </div>

      {/* Message de succès */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold">Besoin créé avec succès !</p>
            <p className="text-sm">Redirection vers votre tableau de bord...</p>
          </div>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations du besoin */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-primary-600 font-bold">1</span>
            </span>
            Informations du besoin
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="input-label">Titre du besoin</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Ex: Repas Iftar pour famille de 4 personnes"
                required
              />
            </div>

            <div>
              <label className="input-label">Description détaillée</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="input"
                placeholder="Décrivez la situation et les besoins spécifiques..."
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Montant estimé (MRU)</label>
                <div className="relative">
                  <input
                    type="number"
                    name="estimated_amount"
                    value={formData.estimated_amount}
                    onChange={handleChange}
                    className="input pl-12"
                    min="1"
                    required
                  />
                  <span className="absolute left-3 top-3 text-secondary-500">MRU</span>
                </div>
              </div>

              <div>
                <label className="input-label">Catégorie</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="input-label">Priorité</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`flex-1 py-2 rounded-lg border transition-all ${
                      formData.priority === p
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-secondary-600 border-secondary-200 hover:border-primary-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-primary-600 font-bold">2</span>
            </span>
            Localisation
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="input-label">Quartier</label>
              <input
                type="text"
                name="location_quarter"
                value={formData.location_quarter}
                onChange={handleChange}
                className="input"
                placeholder="Ex: Tevragh Zeina"
                required
              />
            </div>

            <div>
              <label className="input-label">Coordonnées GPS (optionnel)</label>
              <div className="grid md:grid-cols-2 gap-4 mb-3">
                <input
                  type="text"
                  name="location_lat"
                  value={formData.location_lat}
                  onChange={handleChange}
                  className="input"
                  placeholder="Latitude"
                />
                <input
                  type="text"
                  name="location_lng"
                  value={formData.location_lng}
                  onChange={handleChange}
                  className="input"
                  placeholder="Longitude"
                />
              </div>
              
              <button
                type="button"
                onClick={getGPS}
                disabled={gpsLoading}
                className="btn-secondary w-full"
              >
                {gpsLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                    Obtention de la position...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Utiliser ma position GPS
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bénéficiaire */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-primary-600 font-bold">3</span>
            </span>
            Bénéficiaire (anonyme)
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="input-label">Description</label>
              <textarea
                name="beneficiary_description"
                value={formData.beneficiary_description}
                onChange={handleChange}
                rows="2"
                className="input"
                placeholder="Ex: Famille monoparentale avec 3 enfants en bas âge"
                required
              />
            </div>

            <div>
              <label className="input-label">Taille de la famille</label>
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

        {/* Partenaire */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-primary-600 font-bold">4</span>
            </span>
            Partenaire (optionnel)
          </h2>
          
          <div>
            <select
              name="partner_id"
              value={formData.partner_id}
              onChange={handleChange}
              className="input"
            >
              <option value="">Sélectionner un partenaire </option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>
                  {p.business_name} - {p.address}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/validator')}
            className="btn-secondary flex-1"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || success}
            className="btn-primary flex-1"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Création...
              </span>
            ) : (
              'Créer le besoin'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateNeed;