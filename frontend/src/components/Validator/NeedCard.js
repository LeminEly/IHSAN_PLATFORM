import React from "react";
import { useNavigate } from "react-router-dom";

const NeedCard = ({ need }) => {
  const navigate = useNavigate();

  const handleConfirm = () => {
    navigate(`/validator/confirm/${need.id}`);
  };

  return (
    <div style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
      <h3>{need.title}</h3>
      <p>{need.description}</p>
      <p>Montant estimé: {need.estimated_amount} MRO</p>
      <button onClick={handleConfirm}>Confirmer Livraison</button>
    </div>
  );
};

export default NeedCard;