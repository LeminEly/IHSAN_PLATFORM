class MobileMoneyService {
  async initiatePayment(donorPhone, partnerPhone, amount, description) {
    // Simulation de paiement pour le hackathon
    console.log(`
    ===== SIMULATION PAIEMENT =====
    De: ${donorPhone}
    Vers: ${partnerPhone}
    Montant: ${amount} MRU
    Description: ${description}
    Statut: Succès
    Référence: TXN-${Date.now()}
    ===============================
    `);
    
    return {
      success: true,
      reference: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString()
    };
  }

  async verifyPayment(reference) {
    // Simuler vérification
    return {
      verified: true,
      reference,
      status: 'completed'
    };
  }
}

export default new MobileMoneyService();