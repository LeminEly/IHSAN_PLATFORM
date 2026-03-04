import Need from '../../models/Need.js';
import Partner from '../../models/Partner.js';
import Validator from '../../models/Validator.js';
import Beneficiary from '../../models/Beneficiary.js';
import twilioService from '../../services/sms/twilio.service.js';
import pushService from '../../services/notification/push.service.js';
import { Op } from 'sequelize';

export const createNeed = async (req, res) => {
  try {
    const {
      title,
      description,
      estimated_amount,
      location_quarter,
      location_lat,
      location_lng,
      category,
      priority,
      expiry_date,
      partner_id,
      beneficiary_description,
      family_size
    } = req.body;
    
    // Vérifier que le validateur est approuvé
    const validator = await Validator.findOne({
      where: { user_id: req.user.id }
    });
    
    if (!validator || validator.verification_status !== 'approved') {
      return res.status(403).json({ 
        error: 'Vous devez être un validateur approuvé pour créer un besoin' 
      });
    }

    // Créer un bénéficiaire anonyme
    const beneficiary = await Beneficiary.create({
      reference_code: 'BEN-' + Date.now().toString(36).toUpperCase(),
      registered_by: req.user.id,
      description: beneficiary_description,
      family_size,
      location_quarter,
      location_lat,
      location_lng
    });
    
    // Créer le besoin
    const need = await Need.create({
      validator_id: req.user.id,
      partner_id,
      beneficiary_id: beneficiary.id,
      title,
      description,
      estimated_amount,
      location_quarter,
      location_lat,
      location_lng,
      category,
      priority,
      expiry_date: expiry_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours par défaut
      status: 'pending' // En attente de validation admin
    });

    // Notifier le partenaire par SMS
    const partner = await Partner.findByPk(partner_id, {
      include: [{ model: User, as: 'user' }]
    });

    if (partner) {
      await twilioService.notifyPartnerNewNeed(
        partner.payment_phone,
        title,
        estimated_amount,
        location_quarter
      );
    }
    
    res.status(201).json({
      message: 'Besoin créé avec succès. En attente de validation admin.',
      need
    });

  } catch (error) {
    console.error('Create need error:', error);
    res.status(500).json({ error: 'Erreur création besoin' });
  }
};

export const getMyNeeds = async (req, res) => {
  try {
    const needs = await Need.findAll({
      where: { validator_id: req.user.id },
      include: [
        {
          model: Partner,
          as: 'partner',
          attributes: ['business_name', 'payment_phone']
        },
        {
          model: Beneficiary,
          as: 'beneficiary',
          attributes: ['reference_code', 'description', 'family_size']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(needs);
  } catch (error) {
    console.error('Get my needs error:', error);
    res.status(500).json({ error: 'Erreur chargement besoins' });
  }
};

export const getNeedsToConfirm = async (req, res) => {
  try {
    const needs = await Need.findAll({
      where: {
        validator_id: req.user.id,
        status: 'funded'
      },
      include: [
        {
          model: Transaction,
          as: 'transaction',
          where: { status: 'pending' },
          required: true,
          include: [
            {
              model: User,
              as: 'donor',
              attributes: ['full_name', 'phone']
            }
          ]
        },
        {
          model: Partner,
          as: 'partner',
          attributes: ['business_name', 'address']
        },
        {
          model: Beneficiary,
          as: 'beneficiary'
        }
      ],
      order: [['funded_at', 'ASC']]
    });
    
    res.json(needs);
  } catch (error) {
    console.error('Get needs to confirm error:', error);
    res.status(500).json({ error: 'Erreur chargement' });
  }
};