import Validator from '../../models/Validator.js';
import User from '../../models/User.js';
import AdminAction from '../../models/AdminAction.js';
import twilioService from '../../services/sms/twilio.service.js';
import pushService from '../../services/notification/push.service.js';

export const getPendingValidators = async (req, res) => {
  try {
    const validators = await Validator.findAll({
      where: { verification_status: 'pending' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'phone', 'email', 'created_at']
      }],
      order: [['created_at', 'ASC']]
    });
    
    res.json(validators);
  } catch (error) {
    console.error('Get pending validators error:', error);
    res.status(500).json({ error: 'Erreur chargement validateurs' });
  }
};

export const approveValidator = async (req, res) => {
  try {
    const { validatorId } = req.params;
    const { reason } = req.body;
    
    const validator = await Validator.findByPk(validatorId, {
      include: [{ model: User, as: 'user' }]
    });
    
    if (!validator) {
      return res.status(404).json({ error: 'Validateur non trouvé' });
    }
    
    // Mettre à jour le statut
    await validator.update({
      verification_status: 'approved',
      verified_by: req.user.id,
      verified_at: new Date()
    });

    // Mettre à jour l'utilisateur
    await validator.user.update({ is_active: true });
    
    // Envoyer notification SMS (RÉELLE)
    await twilioService.notifyAccountApproved(
      validator.user.phone, 
      'validator'
    );

    // Envoyer notification push
    await pushService.sendToUser(validator.user.id, {
      title: 'Compte approuvé',
      body: 'Votre compte validateur a été approuvé !',
      data: { type: 'account_approved', role: 'validator' }
    });
    
    // Journaliser l'action
    await AdminAction.create({
      admin_id: req.user.id,
      action_type: 'approve_validator',
      target_user_id: validator.user_id,
      target_validator_id: validator.id,
      reason
    });
    
    res.json({
      message: 'Validateur approuvé avec succès',
      validator
    });

  } catch (error) {
    console.error('Approve validator error:', error);
    res.status(500).json({ error: 'Erreur approbation' });
  }
};

export const rejectValidator = async (req, res) => {
  try {
    const { validatorId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: 'La raison du rejet est requise' });
    }
    
    const validator = await Validator.findByPk(validatorId, {
      include: [{ model: User, as: 'user' }]
    });
    
    if (!validator) {
      return res.status(404).json({ error: 'Validateur non trouvé' });
    }
    
    await validator.update({
      verification_status: 'rejected',
      verified_by: req.user.id,
      verified_at: new Date(),
      rejection_reason: reason
    });

    // Envoyer notification SMS (RÉELLE)
    await twilioService.notifyAccountRejected(
      validator.user.phone,
      'validator',
      reason
    );
    
    await AdminAction.create({
      admin_id: req.user.id,
      action_type: 'reject_validator',
      target_user_id: validator.user_id,
      target_validator_id: validator.id,
      reason
    });
    
    res.json({
      message: 'Validateur rejeté',
      validator
    });

  } catch (error) {
    console.error('Reject validator error:', error);
    res.status(500).json({ error: 'Erreur rejet' });
  }
};

export const suspendValidator = async (req, res) => {
  try {
    const { validatorId } = req.params;
    const { reason } = req.body;
    
    const validator = await Validator.findByPk(validatorId, {
      include: [{ model: User, as: 'user' }]
    });
    
    if (!validator) {
      return res.status(404).json({ error: 'Validateur non trouvé' });
    }
    
    await validator.update({
      verification_status: 'suspended',
      verified_by: req.user.id
    });

    await validator.user.update({ is_active: false });

    // SMS de suspension
    await twilioService.sendVerificationCode(validator.user.phone, {
      body: `⚠️ IHSAN: Votre compte validateur a été suspendu. Raison: ${reason}. Contactez le support.`
    });
    
    await AdminAction.create({
      admin_id: req.user.id,
      action_type: 'suspend_validator',
      target_user_id: validator.user_id,
      target_validator_id: validator.id,
      reason
    });
    
    res.json({
      message: 'Validateur suspendu',
      validator
    });

  } catch (error) {
    console.error('Suspend validator error:', error);
    res.status(500).json({ error: 'Erreur suspension' });
  }
};