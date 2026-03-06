// src/components/Validator/ConfirmDelivery.js
import React, { useState } from "react";
import { validator } from "../../services/api";

const ConfirmDelivery = ({ needId }) => {
  const [photo, setPhoto] = useState(null);
  const [proofType, setProofType] = useState("delivery");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setPhoto(e.target.files[0]);

  const handleConfirm = async () => {
    if (!photo) {
      alert("Veuillez sélectionner une photo !");
      return;
    }
    setLoading(true);
    try {
      await validator.confirmDelivery(needId, { photo, proof_type: proofType });
      alert("Livraison confirmée !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la confirmation !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Confirmer Livraison</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleConfirm} disabled={loading}>
        {loading ? "Confirmation..." : "Confirmer"}
      </button>
    </div>
  );
};

export default ConfirmDelivery;