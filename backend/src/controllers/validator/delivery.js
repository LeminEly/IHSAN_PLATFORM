import Need from '../../models/Need.js';
import Transaction from '../../models/Transaction.js';
import ImpactProof from '../../models/ImpactProof.js';
import Validator from '../../models/Validator.js';
import Partner from '../../models/Partner.js';
import Beneficiary from '../../models/Beneficiary.js';
import User from '../../models/User.js';
import cloudinary from '../../config/cloudinary.js';
import smsService from '../../services/sms/index.js';
import pushService from '../../services/notification/push.service.js';
import polygonService from '../../services/blockchain/polygon.service.js';
import sharp from 'sharp'; // Pour flouter les visages

export const confirmDelivery = async (req, res) => {
  try {
    const { needId } = req.params;
    const { proof_type, confirmation_code } = req.body;

    // 1. Récupérer le besoin et la transaction
    const need = await Need.findOne({
      where: {
        id: needId,
        validator_id: req.user.id,
        status: 'funded'
      },
      include: [
        {
          model: Transaction,
          as: 'transaction',
          include: [
            { model: User, as: 'donor' },
            { model: Partner, as: 'partner' }
          ]
        },
        { model: Partner, as: 'partner' }
      ]
    });

    if (!need) {
      return res.status(404).json({
        error: 'Besoin non trouvé ou déjà confirmé'
      });
    }

    const transaction = need.transaction;

    // 2. Traiter la photo (floutage automatique)
    let mediaUrl = null;
    let thumbnailUrl = null;
    let isBlurred = false;

    if (req.file) {
      // 1. Privacy First: Blur faces using sharp
      const processedBuffer = await sharp(req.file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .blur(10) // Professional privacy blur
        .jpeg({ quality: 80 })
        .toBuffer();

      // 2. Pro Upload: Direct stream to Cloudinary
      const uploadToCloudinary = (buffer, options) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (result) resolve(result);
            else reject(error);
          });
          stream.end(buffer);
        });
      };

      const result = await uploadToCloudinary(processedBuffer, {
        folder: 'ihsan/impact',
        public_id: `proof-${transaction.id}`,
        tags: ['impact_proof', need.category]
      });

      mediaUrl = result.secure_url;

      // 3. Pro Thumbnail: Let Cloudinary handle the resizing for efficiency
      thumbnailUrl = cloudinary.url(result.public_id, {
        width: 300,
        height: 300,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto',
        fetch_format: 'auto'
      });

      isBlurred = true;
    }

    // 3. Créer la preuve d'impact
    await ImpactProof.create({
      transaction_id: transaction.id,
      proof_type: proof_type || 'photo',
      media_url: mediaUrl,
      thumbnail_url: thumbnailUrl,
      is_faces_blurred: isBlurred,
      uploaded_by: req.user.id
    });

    // 4. Mettre à jour la transaction
    await transaction.update({
      status: 'confirmed',
      confirmed_by: req.user.id,
      confirmed_at: new Date()
    });

    // 5. Mettre à jour le besoin
    await need.update({
      status: 'completed',
      completed_at: new Date()
    });

    // 6. Mettre à jour les stats du validateur
    const validator = await Validator.findOne({
      where: { user_id: req.user.id }
    });

    const newTotal = validator.total_deliveries + 1;
    await validator.update({
      total_deliveries: newTotal,
      reputation_score: validator.reputation_score + 1,
      success_rate: (newTotal / (newTotal + 1)) * 100
    });

    // 7. Envoyer les notifications
    // SMS au donneur
    await smsService.notifyDonorDelivery(
      transaction.donor_phone,
      need.title,
      transaction.receipt_number
    );

    // Notification push au donneur
    await pushService.sendToUser(transaction.donor_id, {
      title: 'Don confirmé',
      body: `Votre don pour "${need.title}" a été remis !`,
      data: {
        type: 'delivery_confirmed',
        transactionId: transaction.id,
        needId: need.id
      }
    });

    // 8. Enregistrer sur la blockchain (optionnel)
    let blockchainResult = null;
    try {
      blockchainResult = await polygonService.storeTransaction({
        id: transaction.id,
        amount: transaction.amount,
        need_id: need.id,
        donor_id: transaction.donor_id,
        location_quarter: need.location_quarter,
        created_at: transaction.created_at
      });

      if (blockchainResult.success) {
        await transaction.update({
          blockchain_tx_hash: blockchainResult.blockchain_tx_hash,
          blockchain_explorer_url: blockchainResult.explorer_url,
          blockchain_timestamp: new Date(blockchainResult.timestamp),
          blockchain_id: blockchainResult.hash_id
        });
      }
    } catch (blockchainError) {
      console.error('Erreur blockchain non bloquante:', blockchainError);
    }

    // 9. Émettre les événements Socket.io en temps réel
    try {
      const io = req.app.get('io');
      const impactProof = await ImpactProof.findOne({ where: { transaction_id: transaction.id } });
      if (io) {
        io.emit('new-transaction', {
          id: transaction.id,
          amount: transaction.amount,
          need_title: need.title,
          location_quarter: need.location_quarter,
          confirmed_at: transaction.confirmed_at,
          proof_image: impactProof?.thumbnail_url,
          blockchain_url: transaction.blockchain_explorer_url
        });
      }
    } catch (socketError) {
      console.error('Socket emit error (non-blocking):', socketError);
    }

    res.json({
      message: 'Livraison confirmée avec succès',
      transaction: {
        id: transaction.id,
        receipt_number: transaction.receipt_number,
        confirmed_at: transaction.confirmed_at,
        blockchain_url: transaction.blockchain_explorer_url
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

    // Générer un code unique pour le bénéficiaire
    const reference_code = 'BEN-' +
      Date.now().toString(36).toUpperCase() + '-' +
      Math.random().toString(36).substring(2, 6).toUpperCase();

    const beneficiary = await Beneficiary.create({
      reference_code,
      registered_by: req.user.id,
      description,
      family_size,
      location_quarter,
      location_lat,
      location_lng
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

export const getValidatorStats = async (req, res) => {
  try {
    const validator = await Validator.findOne({
      where: { user_id: req.user.id }
    });

    const stats = {
      reputation: validator.reputation_score,
      total_deliveries: validator.total_deliveries,
      success_rate: validator.success_rate,
      pending_needs: await Need.count({
        where: {
          validator_id: req.user.id,
          status: 'pending'
        }
      }),
      open_needs: await Need.count({
        where: {
          validator_id: req.user.id,
          status: 'open'
        }
      }),
      funded_needs: await Need.count({
        where: {
          validator_id: req.user.id,
          status: 'funded'
        }
      }),
      completed_needs: await Need.count({
        where: {
          validator_id: req.user.id,
          status: 'completed'
        }
      })
    };

    res.json(stats);
  } catch (error) {
    console.error('Get validator stats error:', error);
    res.status(500).json({ error: 'Erreur chargement stats' });
  }
};