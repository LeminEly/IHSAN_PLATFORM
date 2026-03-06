import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { publicApi } from "../../services/api";

function TransactionDetail() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    try {
      const response = await publicApi.getTransaction(id);
      setTransaction(response.data.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;
  if (!transaction)
    return <div className="text-center py-20">Transaction non trouvée</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Détail de la transaction</h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 text-white p-6">
          <div className="text-3xl font-bold">{transaction.amount} MRU</div>
          <div className="mt-2">Reçu: {transaction.receipt_number}</div>
          <div className="text-sm opacity-90">
            {new Date(transaction.date).toLocaleString()}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Need Info */}
          <div>
            <h2 className="text-xl font-bold mb-4">Besoin financé</h2>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-bold text-lg">{transaction.need.title}</h3>
              <p className="text-gray-600 mt-2">
                {transaction.need.description}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="text-sm text-gray-500">Quartier</span>
                  <div className="font-medium">{transaction.need.quarter}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Catégorie</span>
                  <div className="font-medium">{transaction.need.category}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actors */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Validateur</h2>
              <div className="bg-gray-50 p-4 rounded">
                <div className="font-medium">{transaction.validator.name}</div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4">Partenaire</h2>
              <div className="bg-gray-50 p-4 rounded">
                <div className="font-medium">{transaction.partner.name}</div>
              </div>
            </div>
          </div>

          {/* Beneficiary (if exists) */}
          {transaction.beneficiary && (
            <div>
              <h2 className="text-xl font-bold mb-4">Bénéficiaire</h2>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600 mb-2">
                  Code: {transaction.beneficiary.code}
                </div>
                <p>{transaction.beneficiary.description}</p>
                <div className="mt-2">
                  Famille: {transaction.beneficiary.family_size} personnes
                </div>
              </div>
            </div>
          )}

          {/* Impact Proof */}
          {transaction.proof && (
            <div>
              <h2 className="text-xl font-bold mb-4">Preuve d'impact</h2>
              <div className="bg-gray-50 p-4 rounded">
                <img
                  src={transaction.proof.image}
                  alt="Preuve"
                  className="max-w-full h-auto rounded"
                />
                <div className="text-sm text-gray-500 mt-2">
                  {new Date(transaction.proof.date).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Blockchain */}
          {transaction.blockchain && (
            <div>
              <h2 className="text-xl font-bold mb-4">
                Vérification blockchain
              </h2>
              <div className="bg-gray-50 p-4 rounded">
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Hash:</span>
                    <code className="ml-2 font-mono text-xs">
                      {transaction.blockchain.hash}
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-500">Transaction:</span>
                    <code className="ml-2 font-mono text-xs">
                      {transaction.blockchain.tx_hash}
                    </code>
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.blockchain.verified
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {transaction.blockchain.verified
                        ? "✓ Vérifié"
                        : "En attente"}
                    </span>
                  </div>
                  <a
                    href={transaction.blockchain.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Voir sur l'explorateur blockchain →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionDetail;
