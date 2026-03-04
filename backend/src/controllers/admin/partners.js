import Partner from '../../models/Partner.js';
import User from '../../models/User.js';
import AdminAction from '../../models/AdminAction.js';
import smsService from '../../services/sms/index.js';
import pushService from '../../services/notification/push.service.js';

export const getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'phone', 'email', 'created_at']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(partners);
  } catch (error) {
    console.error('Get all partners error:', error);
    res.status(500).json({ error: 'Erreur chargement partenaires' });
  }
};

export const getPendingPartners = async (req, res) => {
  try {
    const partners = await Partner.findAll({
      where: { verification_status: 'pending' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'phone', 'email', 'created_at']
      }],
      order: [['created_at', 'ASC']]
    });

    res.json(partners);
  } catch (error) {
    console.error('Get pending partners error:', error);
    res.status(500).json({ error: 'Erreur chargement partenaires' });
  }
};

export const approvePartner = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { reason } = req.body;

    const partner = await Partner.findByPk(partnerId, {
      include: [{ model: User, as: 'user' }]
    });

    if (!partner) {
      return res.status(404).json({ error: 'Partenaire non trouvé' });
    }

    await partner.update({
      verification_status: 'approved',
      verified_by: req.user.id,
      verified_at: new Date()
    });

    await partner.user.update({ is_active: true });

    // SMS d'approbation
    await smsService.notifyAccountApproved(
      partner.user.phone,
      'partner'
    );

    // Notification push
    await pushService.sendToUser(partner.user.id, {
      title: 'Compte approuvé',
      body: 'Votre compte partenaire a été approuvé ! Vous pouvez maintenant recevoir des commandes.',
      data: { type: 'account_approved', role: 'partner' }
    });

    await AdminAction.create({
      admin_id: req.user.id,
      action_type: 'approve_partner',
      target_user_id: partner.user_id,
      target_partner_id: partner.id,
      reason
    });

    res.json({
      message: 'Partenaire approuvé avec succès',
      partner
    });

  } catch (error) {
    console.error('Approve partner error:', error);
    res.status(500).json({ error: 'Erreur approbation' });
  }
};

export const rejectPartner = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { reason } = req.body;

    const partner = await Partner.findByPk(partnerId, {
      include: [{ model: User, as: 'user' }]
    });

    if (!partner) {
      return res.status(404).json({ error: 'Partenaire non trouvé' });
    }

    await partner.update({
      verification_status: 'rejected',
      verified_by: req.user.id,
      verified_at: new Date()
    });

    // SMS de rejet
    await smsService.notifyAccountRejected(
      partner.user.phone,
      'partner',
      reason
    );

    await AdminAction.create({
      admin_id: req.user.id,
      action_type: 'reject_partner',
      target_user_id: partner.user_id,
      target_partner_id: partner.id,
      reason
    });

    res.json({
      message: 'Partenaire rejeté',
      partner
    });

  } catch (error) {
    console.error('Reject partner error:', error);
    res.status(500).json({ error: 'Erreur rejet' });
  }
};

export const recordSiteVisit = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { notes, photos } = req.body;

    const partner = await Partner.findByPk(partnerId);

    if (!partner) {
      return res.status(404).json({ error: 'Partenaire non trouvé' });
    }

    await partner.update({
      site_visit_required: false,
      site_visit_date: new Date(),
      site_visit_notes: notes,
      site_visit_photos: photos,
      visited_by: req.user.id
    });

    res.json({
      message: 'Visite enregistrée avec succès',
      partner
    });

  } catch (error) {
    console.error('Record site visit error:', error);
    res.status(500).json({ error: 'Erreur enregistrement visite' });
  }
};