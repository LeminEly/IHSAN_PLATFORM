import Need from '../../models/Need.js';
import User from '../../models/User.js';
import Validator from '../../models/Validator.js';
import Partner from '../../models/Partner.js';
import AdminAction from '../../models/AdminAction.js';
import pushService from '../../services/notification/push.service.js';
import smsService from '../../services/sms/index.js';

/**
 * GET /api/v1/admin/needs/pending
 * List all needs awaiting admin approval
 */
export const getPendingNeeds = async (req, res) => {
    try {
        const needs = await Need.findAll({
            where: { status: 'pending' },
            include: [
                {
                    model: User,
                    as: 'validator',
                    attributes: ['id', 'full_name', 'phone']
                },
                {
                    model: Partner,
                    as: 'partner',
                    attributes: ['id', 'business_name', 'address']
                }
            ],
            order: [['created_at', 'ASC']]
        });

        res.json(needs);
    } catch (error) {
        console.error('Get pending needs error:', error);
        res.status(500).json({ error: 'Erreur chargement besoins en attente' });
    }
};

/**
 * PUT /api/v1/admin/needs/:needId/approve
 * Approve a need and make it visible to donors
 */
export const approveNeed = async (req, res) => {
    try {
        const { needId } = req.params;
        const { priority = 1 } = req.body;

        const need = await Need.findByPk(needId, {
            include: [
                { model: User, as: 'validator' },
                { model: Partner, as: 'partner' }
            ]
        });

        if (!need) {
            return res.status(404).json({ error: 'Besoin non trouvé' });
        }

        if (need.status !== 'pending') {
            return res.status(400).json({ error: 'Ce besoin est déjà traité' });
        }

        await need.update({
            status: 'open',
            priority: priority,
            approved_at: new Date(),
            approved_by: req.user.id
        });

        // Notify validator
        await pushService.sendToUser(need.validator_id, {
            title: 'Besoin approuvé',
            body: `Votre besoin "${need.title}" est maintenant visible par les donneurs.`,
            data: { type: 'need_approved', needId: need.id }
        });

        // Log action
        await AdminAction.create({
            admin_id: req.user.id,
            action_type: 'approve_need',
            target_user_id: need.validator_id,
            metadata: { need_id: need.id }
        });

        res.json({
            message: 'Besoin approuvé et publié',
            need
        });

    } catch (error) {
        console.error('Approve need error:', error);
        res.status(500).json({ error: 'Erreur approbation besoin' });
    }
};

/**
 * PUT /api/v1/admin/needs/:needId/reject
 * Reject a need
 */
export const rejectNeed = async (req, res) => {
    try {
        const { needId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ error: 'Veuillez fournir une raison pour le rejet' });
        }

        const need = await Need.findByPk(needId);

        if (!need) {
            return res.status(404).json({ error: 'Besoin non trouvé' });
        }

        await need.update({
            status: 'cancelled',
            cancellation_reason: reason,
            cancelled_at: new Date()
        });

        // Notify validator
        await pushService.sendToUser(need.validator_id, {
            title: 'Besoin rejeté',
            body: `Le besoin "${need.title}" a été rejeté par l'administrateur. Raison: ${reason}`,
            data: { type: 'need_rejected', needId: need.id }
        });

        // Log action
        await AdminAction.create({
            admin_id: req.user.id,
            action_type: 'reject_need',
            target_user_id: need.validator_id,
            reason,
            metadata: { need_id: need.id }
        });

        res.json({ message: 'Besoin rejeté' });

    } catch (error) {
        console.error('Reject need error:', error);
        res.status(500).json({ error: 'Erreur rejet' });
    }
};
