import Need from '../../models/Need.js';
import Partner from '../../models/Partner.js';
import Validator from '../../models/Validator.js';
import Beneficiary from '../../models/Beneficiary.js';
import Transaction from '../../models/Transaction.js';
import User from '../../models/User.js';
import smsService from '../../services/sms/chinguisoft.service.js';

const toFloatOrNull = (val) => (val !== '' && val != null ? parseFloat(val) : null);

export const getValidatorStats = async (req, res) => {
  try {
    const validator = await Validator.findOne({ where: { user_id: req.user.id } });

    if (!validator) {
      return res.json({
        reputation: 0,
        total_deliveries: 0,
        success_rate: 0,
        pending_needs: 0,
        open_needs: 0,
        funded_needs: 0,
        completed_needs: 0,
        verification_status: 'not_found',
      });
    }

    const [pending, open, funded, completed] = await Promise.all([
      Need.count({ where: { validator_id: req.user.id, status: 'pending' } }),
      Need.count({ where: { validator_id: req.user.id, status: 'open' } }),
      Need.count({ where: { validator_id: req.user.id, status: 'funded' } }),
      Need.count({ where: { validator_id: req.user.id, status: 'completed' } }),
    ]);

    res.json({
      reputation: validator.reputation_score || 0,
      total_deliveries: validator.total_deliveries || 0,
      success_rate: validator.success_rate || 0,
      verification_status: validator.verification_status,
      pending_needs: pending,
      open_needs: open,
      funded_needs: funded,
      completed_needs: completed,
    });
  } catch (error) {
    console.error('Get validator stats error:', error);
    res.status(500).json({ error: 'Erreur chargement stats' });
  }
};

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
      family_size,
    } = req.body;

    // Validation des champs obligatoires
    if (!title || !estimated_amount || !location_quarter) {
      return res.status(400).json({ error: 'Titre, montant et quartier sont obligatoires' });
    }
    if (!partner_id) {
      return res.status(400).json({ error: 'Veuillez sélectionner un partenaire' });
    }

    const validator = await Validator.findOne({ where: { user_id: req.user.id } });
    if (!validator || validator.verification_status !== 'approved') {
      return res.status(403).json({
        error: 'Vous devez être un validateur approuvé pour créer un besoin',
      });
    }

    const lat = toFloatOrNull(location_lat);
    const lng = toFloatOrNull(location_lng);

    const beneficiary = await Beneficiary.create({
      reference_code: 'BEN-' + Date.now().toString(36).toUpperCase(),
      registered_by: req.user.id,
      description: beneficiary_description || 'Non spécifié',
      family_size: parseInt(family_size) || 1,
      location_quarter,
      location_lat: lat,
      location_lng: lng,
    });

    const need = await Need.create({
      validator_id: req.user.id,
      partner_id: partner_id || null,
      beneficiary_id: beneficiary.id,
      title,
      description,
      estimated_amount: parseFloat(estimated_amount),
      location_quarter,
      location_lat: lat,
      location_lng: lng,
      category,
      priority: parseInt(priority) || 1,
      expiry_date: expiry_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'open',
    });

    // Notifier le partenaire (non bloquant)
    if (partner_id) {
      try {
        const partner = await Partner.findByPk(partner_id);
        if (partner) {
          await smsService.notifyPartnerNewNeed(
            partner.payment_phone,
            title,
            estimated_amount,
            location_quarter,
          );
        }
      } catch (e) {
        console.error('SMS error:', e.message);
      }
    }

    res.status(201).json({
      message: 'Besoin créé avec succès. En attente de validation admin.',
      need,
    });
  } catch (error) {
    console.error('Create need error:', error.message, error.name);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Partenaire invalide ou inexistant' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors?.[0]?.message || 'Données invalides' });
    }
    res.status(500).json({ error: 'Erreur création besoin: ' + error.message });
  }
};

export const getMyNeeds = async (req, res) => {
  try {
    const needs = await Need.findAll({
      where: { validator_id: req.user.id },
      include: [
        { model: Partner, as: 'partner', attributes: ['business_name', 'payment_phone'] },
        {
          model: Beneficiary,
          as: 'beneficiary',
          attributes: ['reference_code', 'description', 'family_size'],
        },
      ],
      order: [['created_at', 'DESC']],
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
      where: { validator_id: req.user.id, status: 'funded' },
      include: [
        {
          model: Transaction,
          as: 'transaction',
          required: true,
          include: [{ model: User, as: 'donor', attributes: ['full_name', 'phone'] }],
        },
        { model: Partner, as: 'partner', attributes: ['business_name', 'address'] },
        { model: Beneficiary, as: 'beneficiary' },
      ],
      order: [['created_at', 'ASC']],
    });
    res.json(needs);
  } catch (error) {
    console.error('Get needs to confirm error:', error);
    res.status(500).json({ error: 'Erreur chargement' });
  }
};
