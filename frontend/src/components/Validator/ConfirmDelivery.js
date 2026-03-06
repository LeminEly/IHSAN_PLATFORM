import React, { useState, useEffect } from "react";
import { validator } from "../../services/api";
import { useNavigate } from "react-router-dom";

function ConfirmDelivery() {
  const [needs, setNeeds] = useState([]);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadNeedsToConfirm();
  }, []);

  const loadNeedsToConfirm = async () => {
    try {
      const response = await validator.getToConfirm();
      setNeeds(response.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleConfirm = async (needId) => {
    if (!photo) {
      alert("Veuillez prendre une photo de la remise");
      return;
    }

    setSubmitting(true);
    try {
      await validator.confirmDelivery(needId, { photo, proof_type: "photo" });
      setSuccess(true);
      setTimeout(() => navigate("/validator"), 2000);
    } catch (error) {
      alert("Erreur lors de la confirmation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-16 h-16 mx-auto"></div>
          <p className="mt-4 text-secondary-600">
            Chargement des livraisons...
          </p>
        </div>
      </div>
    );
  }

  if (selectedNeed) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold mb-6">Confirmer la livraison</h1>

          {success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-2">
                Livraison confirmée !
              </h3>
              <p className="text-secondary-500">
                Redirection vers votre tableau de bord...
              </p>
            </div>
          ) : (
            <>
              {/* Récapitulatif du besoin */}
              <div className="bg-secondary-50 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-lg mb-2">{selectedNeed.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-secondary-500">Quartier</p>
                    <p className="font-medium">
                      {selectedNeed.location_quarter}
                    </p>
                  </div>
                  <div>
                    <p className="text-secondary-500">Montant</p>
                    <p className="font-medium text-primary-600">
                      {selectedNeed.estimated_amount} MRU
                    </p>
                  </div>
                  <div>
                    <p className="text-secondary-500">Partenaire</p>
                    <p className="font-medium">
                      {selectedNeed.partner?.business_name || "Non spécifié"}
                    </p>
                  </div>
                  <div>
                    <p className="text-secondary-500">Financé le</p>
                    <p className="font-medium">
                      {new Date(selectedNeed.funded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload photo */}
              <div className="mb-6">
                <label className="input-label">
                  Photo de la remise (visages floutés)
                </label>
                <div className="border-2 border-dashed border-secondary-300 rounded-xl p-6 text-center">
                  {photoPreview ? (
                    <div>
                      <img
                        src={photoPreview}
                        alt="Aperçu"
                        className="max-h-64 mx-auto rounded-lg mb-4"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhoto(null);
                          setPhotoPreview(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer inline-flex flex-col items-center"
                      >
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                          <svg
                            className="w-8 h-8 text-primary-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <span className="text-primary-600 font-medium">
                          Cliquez pour ajouter une photo
                        </span>
                        <span className="text-xs text-secondary-500 mt-1">
                          JPG, PNG (max. 5MB)
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedNeed(null)}
                  className="btn-secondary flex-1"
                >
                  Retour
                </button>
                <button
                  onClick={() => handleConfirm(selectedNeed.id)}
                  disabled={submitting || !photo}
                  className="btn-primary flex-1"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Confirmation...
                    </span>
                  ) : (
                    "Confirmer la livraison"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Livraisons à confirmer</h1>

      {needs.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-secondary-900 mb-2">
            Aucune livraison en attente
          </h3>
          <p className="text-secondary-500">
            Vous n'avez pas de livraison à confirmer pour le moment
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {needs.map((need) => (
            <div
              key={need.id}
              className="card hover:shadow-medium transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{need.title}</h3>
                  <p className="text-secondary-600">{need.location_quarter}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">
                    {need.estimated_amount} MRU
                  </p>
                  <span className="badge badge-warning mt-1">À confirmer</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-secondary-500">Donneur</p>
                  <p className="font-medium">
                    {need.transaction?.donor?.full_name}
                  </p>
                </div>
                <div>
                  <p className="text-secondary-500">Contact</p>
                  <p className="font-medium">
                    {need.transaction?.donor?.phone}
                  </p>
                </div>
                <div>
                  <p className="text-secondary-500">Partenaire</p>
                  <p className="font-medium">{need.partner?.business_name}</p>
                </div>
                <div>
                  <p className="text-secondary-500">Financé le</p>
                  <p className="font-medium">
                    {new Date(need.funded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedNeed(need)}
                className="btn-primary w-full"
              >
                Confirmer cette livraison
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConfirmDelivery;
