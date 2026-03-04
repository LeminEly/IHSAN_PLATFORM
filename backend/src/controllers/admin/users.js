import User from '../../models/User.js';
import Validator from '../../models/Validator.js';
import Partner from '../../models/Partner.js';
import Transaction from '../../models/Transaction.js';
import Need from '../../models/Need.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';

/**
 * GET /api/v1/admin/stats
 * Global platform statistics for admin dashboard
 */
export const getAdminStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalDonors,
            totalValidators,
            totalPartners,
            pendingValidators,
            pendingPartners,
            totalTransactions,
            confirmedTransactions,
            totalDonated,
            totalNeeds,
            openNeeds,
            completedNeeds
        ] = await Promise.all([
            User.count(),
            User.count({ where: { role: 'donor' } }),
            User.count({ where: { role: 'validator' } }),
            User.count({ where: { role: 'partner' } }),
            Validator.count({ where: { verification_status: 'pending' } }),
            Partner.count({ where: { verification_status: 'pending' } }),
            Transaction.count(),
            Transaction.count({ where: { status: 'confirmed' } }),
            Transaction.sum('amount', { where: { status: 'confirmed' } }),
            Need.count(),
            Need.count({ where: { status: 'open' } }),
            Need.count({ where: { status: 'completed' } })
        ]);

        // Monthly stats (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyStats = await Transaction.findAll({
            where: {
                status: 'confirmed',
                created_at: { [Op.gte]: sixMonthsAgo }
            },
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total']
            ],
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        // Recent transactions
        const recentTransactions = await Transaction.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [{
                model: Need,
                as: 'need',
                attributes: ['title', 'location_quarter']
            }]
        });

        res.json({
            users: {
                total: totalUsers,
                donors: totalDonors,
                validators: totalValidators,
                partners: totalPartners
            },
            pending: {
                validators: pendingValidators,
                partners: pendingPartners
            },
            transactions: {
                total: totalTransactions,
                confirmed: confirmedTransactions,
                total_donated: totalDonated || 0
            },
            needs: {
                total: totalNeeds,
                open: openNeeds,
                completed: completedNeeds
            },
            monthly_stats: monthlyStats,
            recent_transactions: recentTransactions
        });

    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ error: 'Erreur chargement statistiques' });
    }
};

/**
 * PUT /api/v1/admin/users/:userId/suspend
 * Suspend a user account
 */
export const suspendUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Impossible de suspendre un administrateur' });
        }

        await user.update({ is_active: false });

        console.log(`Admin ${req.user.id} suspended user ${userId}. Reason: ${reason}`);

        res.json({
            message: 'Utilisateur suspendu avec succès',
            user: {
                id: user.id,
                full_name: user.full_name,
                role: user.role,
                is_active: false
            }
        });

    } catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({ error: 'Erreur suspension utilisateur' });
    }
};

/**
 * PUT /api/v1/admin/users/:userId/activate
 * Reactivate a suspended user
 */
export const activateUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        await user.update({ is_active: true });

        res.json({
            message: 'Utilisateur activé avec succès',
            user: {
                id: user.id,
                full_name: user.full_name,
                role: user.role,
                is_active: true
            }
        });

    } catch (error) {
        console.error('Activate user error:', error);
        res.status(500).json({ error: 'Erreur activation utilisateur' });
    }
};
