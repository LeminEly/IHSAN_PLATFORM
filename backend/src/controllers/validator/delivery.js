import Need from '../../models/Need.js';
import Transaction from '../../models/Transaction.js';
import ImpactProof from '../../models/ImpactProof.js';
import Beneficiary from '../../models/Beneficiary.js';
import Validator from '../../models/Validator.js';
import Partner from '../../models/Partner.js';
import User from '../../models/User.js';
import twilioService from '../../services/sms/chinguisoft.service.js';
import pushService from '../../services/notification/push.service.js';
import polygonService from '../../services/blockchain/polygon.service.js';

const toFloatOrNull = (val) => (val !== '' && val != null) ? parseFloat(val) : null;

export const confirmDelivery = async (req, res) => {
  try {
    const { needId } = req.params;
    const { proof_type } = req.body;

    // Photo obligatoire
    if (!req.file) {
      return res.status(400).json({ error: 'Une photo de preuve est obligatoire pour confirmer la livraison' });
    }

    const need = await Need.findOne({
      where: { id: needId, validator_id: req.user.id, status: 'funded' },
      include: [
        { model: Transaction, as: 'transaction', include: [{ model: User, as: 'donor' }] },
        { model: Partner, as: 'partner' }
      ]
    });

    if (!need) return res.status(404).json({ error: 'Besoin non trouvé ou déjà confirmé' });

    const transaction = need.transaction;
    if (!transaction) return res.status(404).json({ error: 'Transaction non trouvée' });

    // Upload middleware (CloudinaryStorage) a déjà uploadé la photo
    // req.file.path = URL Cloudinary, req.file.filename = public_id
    const mediaUrl = req.file.path;
    const thumbnailUrl = req.file.path; // même URL, Cloudinary peut générer thumbnail via transformation

    // Créer la preuve d'impact
    await ImpactProof.create({
      transaction_id: transaction.id,
      proof_type: proof_type || 'photo',
      media_url: mediaUrl,
      thumbnail_url: thumbnailUrl,
      is_faces_blurred: true,
      uploaded_by: req.user.id
    });

    // Confirmer la transaction
    await transaction.update({
      status: 'confirmed',
      confirmed_by: req.user.id,
      confirmed_at: new Date()
    });

    // Compléter le besoin
    await need.update({ status: 'completed', completed_at: new Date() });

    // Stats validateur
    const validator = await Validator.findOne({ where: { user_id: req.user.id } });
    if (validator) {
      await validator.update({
        total_deliveries: (validator.total_deliveries || 0) + 1,
        reputation_score: (validator.reputation_score || 0) + 1
      });
    }

    // Blockchain (non-bloquant)
    polygonService.storeTransaction({
      id: transaction.id, amount: transaction.amount,
      need_id: need.id, donor_id: transaction.donor_id,
      location_quarter: need.location_quarter, created_at: transaction.created_at
    }).then(async (result) => {
      if (result.success) {
        await transaction.update({
          blockchain_hash: result.blockchain_hash,
          blockchain_tx_hash: result.blockchain_tx_hash,
          blockchain_explorer_url: result.explorer_url,
          blockchain_timestamp: new Date(result.timestamp)
        });
        try {
          const io = req.app.get('io');
          if (io) {
            io.emit('new-transaction', {
              id: transaction.id, amount: transaction.amount,
              need: { title: need.title, quarter: need.location_quarter },
              validator: { name: req.user.full_name },
              partner: { name: need.partner?.business_name },
              date: transaction.confirmed_at,
              proof: { image: thumbnailUrl },
              blockchain: { url: result.explorer_url, hash: result.blockchain_hash }
            });
          }
        } catch (e) {}
      }
    }).catch(err => console.error('Blockchain error (non-blocking):', err.message));

    // Notifications non-bloquantes
    try { await twilioService.notifyDonorDelivery(transaction.donor_phone, need.title); } catch (e) { console.error('Twilio error:', e.message); }
    try { await pushService.sendToUser(transaction.donor_id, { title: 'Don confirmé ✅', body: `Votre don pour "${need.title}" a été remis !` }); } catch (e) {}

    res.json({
      message: 'Livraison confirmée avec succès',
      transaction: {
        id: transaction.id,
        receipt_number: transaction.receipt_number,
        confirmed_at: transaction.confirmed_at,
        media_url: mediaUrl
      }
    });

  } catch (error) {
    console.error('Confirm delivery error:', error);
    res.status(500).json({ error: 'Erreur confirmation livraison' });
  }
};

export const registerBeneficiary = async (req, res) => {
  try {
    const { description, family_size, location_quarter, location_lat, location_lng } = req.body;

    const beneficiary = await Beneficiary.create({
      reference_code: 'BEN-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      registered_by: req.user.id,
      description,
      family_size: parseInt(family_size) || 1,
      location_quarter,
      location_lat: toFloatOrNull(location_lat),
      location_lng: toFloatOrNull(location_lng)
    });

    res.status(201).json({
      message: 'Bénéficiaire enregistré avec succès',
      reference_code: beneficiary.reference_code,
      beneficiary_id: beneficiary.id
    });
  } catch (error) {
    console.error('Register beneficiary error:', error);
    res.status(500).json({ error: 'Erreur enregistrement' });
  }
};