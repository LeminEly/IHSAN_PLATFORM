import User from '../../models/User.js';
import AdminAction from '../../models/AdminAction.js';
import Validator from '../../models/Validator.js';
import Partner from '../../models/Partner.js';
import Transaction from '../../models/Transaction.js';
import Need from '../../models/Need.js';
import sequelize from '../../config/database.js';

export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      pendingValidators,
      pendingPartners,
      totalTransactions,
      totalDonations,
      completedNeeds,
    ] = await Promise.all([
      User.count({ where: { is_active: true } }),
      Validator.count({ where: { verification_status: 'pending' } }),
      Partner.count({ where: { verification_status: 'pending' } }),
      Transaction.count({ where: { status: 'confirmed' } }),
      Transaction.sum('amount', { where: { status: 'confirmed' } }),
      Need.count({ where: { status: 'completed' } }),
    ]);

    res.json({
      total_users: totalUsers,
      pending_validators: pendingValidators,
      pending_partners: pendingPartners,
      total_transactions: totalTransactions,
      total_donations: totalDonations || 0,
      completed_needs: completedNeeds,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Erreur chargement statistiques' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { role, is_active, limit = 50, offset = 0 } = req.query;
    const where = {};
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash', 'refresh_token'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({ total: count, users: rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erreur chargement utilisateurs' });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'La raison est requise' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Impossible de suspendre un admin' });
    }

    await user.update({ is_active: false });

    await AdminAction.create({
      admin_id: req.user.id,
      action_type: 'suspend_user',
      target_user_id: userId,
      reason,
    });

    res.json({ message: 'Utilisateur suspendu', user });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ error: 'Erreur suspension' });
  }
};

export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await user.update({ is_active: true });

    await AdminAction.create({
      admin_id: req.user.id,
      action_type: 'activate_user',
      target_user_id: userId,
      reason: reason || 'Réactivation manuelle',
    });

    res.json({ message: 'Utilisateur activé', user });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ error: 'Erreur activation' });
  }
};
