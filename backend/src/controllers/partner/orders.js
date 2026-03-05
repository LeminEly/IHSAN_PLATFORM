import Need from '../../models/Need.js';
import Transaction from '../../models/Transaction.js';
import Partner from '../../models/Partner.js';
import User from '../../models/User.js';
import Beneficiary from '../../models/Beneficiary.js';
import { Op } from 'sequelize';

export const getPartnerOrders = async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    const partner = await Partner.findOne({ where: { user_id: req.user.id } });
    if (!partner) return res.status(403).json({ error: 'Profil partenaire non trouvé' });

    const where = { partner_id: partner.id };
    if (status) where.status = status;

    const needs = await Need.findAndCountAll({
      where,
      include: [
        {
          model: Transaction, as: 'transaction', required: false,
          include: [{ model: User, as: 'donor', attributes: ['full_name'] }]
        },
        {
          model: Beneficiary, as: 'beneficiary',
          attributes: ['reference_code', 'description', 'family_size']
        }
      ],
      order: [['status', 'ASC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ total: needs.count, orders: needs.rows });
  } catch (error) {
    console.error('Get partner orders error:', error);
    res.status(500).json({ error: 'Erreur chargement commandes' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;

    const partner = await Partner.findOne({ where: { user_id: req.user.id } });
    if (!partner) return res.status(403).json({ error: 'Profil partenaire non trouvé' });

    const need = await Need.findOne({ where: { id: orderId, partner_id: partner.id } });
    if (!need) return res.status(404).json({ error: 'Commande non trouvée' });

    await need.update({
      status: status === 'ready' ? 'funded' : need.status,
    });

    res.json({ message: 'Statut mis à jour', order: need });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
};

export const getPartnerStats = async (req, res) => {
  try {
    const partner = await Partner.findOne({ where: { user_id: req.user.id } });
    if (!partner) return res.status(403).json({ error: 'Profil partenaire non trouvé' });

    const [total, pending, open, funded, completed, total_amount] = await Promise.all([
      Need.count({ where: { partner_id: partner.id } }),
      Need.count({ where: { partner_id: partner.id, status: 'pending' } }),
      Need.count({ where: { partner_id: partner.id, status: 'open' } }),
      Need.count({ where: { partner_id: partner.id, status: 'funded' } }),
      Need.count({ where: { partner_id: partner.id, status: 'completed' } }),
      Transaction.sum('amount', { where: { partner_id: partner.id, status: 'confirmed' } })
    ]);

    res.json({
      total_orders: total,
      pending_orders: pending,
      open_orders: open,
      funded_orders: funded,
      completed_orders: completed,
      total_amount: total_amount || 0
    });
  } catch (error) {
    console.error('Get partner stats error:', error);
    res.status(500).json({ error: 'Erreur chargement stats' });
  }
};