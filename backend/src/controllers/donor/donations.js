import Need from '../../models/Need.js';
import Transaction from '../../models/Transaction.js';
import Partner from '../../models/Partner.js';
import ImpactProof from '../../models/ImpactProof.js';
import User from '../../models/User.js';
import { HashGenerator } from '../../utils/hash.js';
import polygonService from '../../services/blockchain/polygon.service.js';
import twilioService from '../../services/sms/twilio.service.js';
import pushService from '../../services/notification/push.service.js';
import mobileMoneyService from '../../services/payment/mobile-money.service.js';
import { validateMauritaniaPhone } from '../../utils/validation.js';

export const fundNeed = async (req, res) => {
  try {
    const { needId } = req.params;
    const { payment_method, donor_phone } = req.body;

    // Valider le numéro du donneur
    const phoneValidation = validateMauritaniaPhone(donor_phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({ error: phoneValidation.error });
    }

    const formattedDonorPhone = phoneValidation.formatted;
    
    // Récupérer le besoin
    const need = await Need.findOne({
      where: {
        id: needId,
        status: 'open'
      },
      include: [
        {
          model: Partner,
          as: 'partner',
          required: true
        },
        {
          model: User,
          as: 'validator',
          attributes: ['id', 'full_name', 'phone']
        }
      ]
    });
    
    if (!need) {
      return res.status(400).json({ error: 'Besoin non disponible' });
    }
    
    if (need.expiry_date && need.expiry_date < new Date()) {
      return res.status(400).json({ error: 'Ce besoin a expiré' });
    }

    // Vérifier que le partenaire a un numéro de paiement valide
    if (!need.partner.payment_phone) {
      return res.status(400).json({ 
        error: 'Le partenaire n\'a pas de numéro de paiement configuré' 
      });
    }

    // 1. Simuler le paiement mobile money
    const paymentResult = await mobileMoneyService.initiatePayment(
      formattedDonorPhone,
      need.partner.payment_phone,
      need.estimated_amount,
      `Don IHSAN: ${need.title}`
    );

    if (!paymentResult.success) {
      return res.status(400).json({ error: 'Échec du paiement' });
    }

    // 2. Créer la transaction
    const receipt_number = HashGenerator.generateReceiptNumber();
    
    const transaction = await Transaction.create({
      need_id: need.id,
      donor_id: req.user.id,
      partner_id: need.partner_id,
      amount: need.estimated_amount,
      payment_method,
      donor_phone: formattedDonorPhone,
      partner_phone: need.partner.payment_phone,
      payment_reference: paymentResult.reference,
      payment_status: 'completed',
      payment_completed_at: new Date(),
      receipt_number,
      status: 'pending' // En attente de confirmation terrain
    });

    // 3. Mettre à jour le besoin
    await need.update({
      status: 'funded',
      funded_at: new Date()
    });

    // 4. Générer le hash blockchain
    const transactionData = {
      transaction_id: transaction.id,
      need_id: need.id,
      donor_id: req.user.id,
      amount: need.estimated_amount,
      timestamp: new Date().toISOString(),
      receipt: receipt_number
    };
    
    const dataHash = HashGenerator.generateSHA256(transactionData);
    
    // 5. Enregistrer sur la blockchain (asynchrone, ne pas bloquer)
    polygonService.storeTransaction({
      id: transaction.id,
      amount: need.estimated_amount,
      need_id: need.id,
      donor_id: req.user.id,
      location_quarter: need.location_quarter,
      created_at: new Date()
    }).then(async (result) => {
      if (result.success) {
        await transaction.update({
          blockchain_hash: dataHash,
          blockchain_tx_hash: result.blockchain_tx_hash,
          blockchain_explorer_url: result.explorer_url,
          blockchain_timestamp: new Date(result.timestamp),
          blockchain_id: result.hash_id
        });
      }
    }).catch(err => console.error('Blockchain async error:', err));

    // 6. Notifications
    // Au validateur (SMS)
    await twilioService.notifyValidatorDelivery(
      need.validator.phone,
      need.title,
      need.estimated_amount
    );

    // Au partenaire (SMS)
    await twilioService.notifyPartnerPayment(
      need.partner.payment_phone,
      need.title,
      need.estimated_amount,
      formattedDonorPhone
    );

    // Au donneur (Push)
    await pushService.sendToUser(req.user.id, {
      title: 'Don effectué',
      body: `Votre don de ${need.estimated_amount} MRU a été enregistré`,
      data: {
        type: 'donation_made',
        transactionId: transaction.id,
        needId: need.id
      }
    });

    res.status(201).json({
      message: 'Don effectué avec succès',
      transaction: {
        id: transaction.id,
        receipt_number: transaction.receipt_number,
        amount: transaction.amount,
        status: transaction.status,
        payment_reference: paymentResult.reference
      }
    });

  } catch (error) {
    console.error('Fund need error:', error);
    res.status(500).json({ error: 'Erreur lors du don' });
  }
};

export const getMyDonations = async (req, res) => {
  try {
    const donations = await Transaction.findAll({
      where: { donor_id: req.user.id },
      include: [
        {
          model: Need,
          as: 'need',
          attributes: ['id', 'title', 'description', 'location_quarter', 'category'],
          include: [
            {
              model: Partner,
              as: 'partner',
              attributes: ['business_name']
            },
            {
              model: User,
              as: 'validator',
              attributes: ['full_name']
            }
          ]
        },
        {
          model: ImpactProof,
          as: 'impact_proof',
          attributes: ['thumbnail_url', 'proof_type', 'uploaded_at'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json({ donations });

  } catch (error) {
    console.error('Get my donations error:', error);
    res.status(500).json({ error: 'Erreur chargement dons' });
  }
};

export const getDonationReceipt = async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await Transaction.findOne({
      where: {
        id: transactionId,
        donor_id: req.user.id
      },
      include: [
        {
          model: Need,
          as: 'need',
          attributes: ['title', 'location_quarter', 'created_at'],
          include: [
            {
              model: Partner,
              as: 'partner',
              attributes: ['business_name', 'address']
            }
          ]
        },
        {
          model: ImpactProof,
          as: 'impact_proof',
          required: false
        }
      ]
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }
    
    // Vérifier sur la blockchain si disponible
    let blockchainVerification = null;
    if (transaction.blockchain_tx_hash) {
      blockchainVerification = await polygonService.verifyHash(
        transaction.blockchain_hash
      );
    }
    
    res.json({
      receipt_number: transaction.receipt_number,
      amount: transaction.amount,
      date: transaction.created_at,
      status: transaction.status,
      need: transaction.need,
      impact_proof: transaction.impact_proof,
      blockchain: {
        hash: transaction.blockchain_hash,
        tx_hash: transaction.blockchain_tx_hash,
        explorer_url: transaction.blockchain_explorer_url,
        verified: blockchainVerification?.verified || false,
        timestamp: transaction.blockchain_timestamp
      }
    });

  } catch (error) {
    console.error('Get donation receipt error:', error);
    res.status(500).json({ error: 'Erreur chargement reçu' });
  }
};

export const getDonationStats = async (req, res) => {
  try {
    const stats = await Transaction.findAll({
      where: { donor_id: req.user.id },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_count'],
        [sequelize.fn('AVG', sequelize.col('amount')), 'average_amount']
      ],
      raw: true
    });

    const byStatus = await Transaction.findAll({
      where: { donor_id: req.user.id },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const byMonth = await Transaction.findAll({
      where: { 
        donor_id: req.user.id,
        created_at: { [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']]
    });

    res.json({
      overview: stats[0],
      by_status: byStatus,
      by_month: byMonth
    });

  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({ error: 'Erreur chargement statistiques' });
  }
};