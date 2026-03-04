import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import Transaction from '../../models/Transaction.js';
import Need from '../../models/Need.js';
import ImpactProof from '../../models/ImpactProof.js';
import User from '../../models/User.js';
import Validator from '../../models/Validator.js';
import Partner from '../../models/Partner.js';
import Beneficiary from '../../models/Beneficiary.js';
import polygonService from '../../services/blockchain/polygon.service.js';
import { GeolocationUtils } from '../../utils/geolocation.js';

const getGlobalStats = async () => {
  try {
    const [totalDonations, totalTransactions, totalNeeds, validators, partners, quarters] = await Promise.all([
      Transaction.sum('amount', { where: { status: 'confirmed' } }),
      Transaction.count({ where: { status: 'confirmed' } }),
      Need.count({ where: { status: 'completed' } }),
      Validator.count({ where: { verification_status: 'approved' } }),
      Partner.count({ where: { verification_status: 'approved' } }),
      Need.count({ where: { status: 'completed' }, distinct: true, col: 'location_quarter' })
    ]);

    return {
      total_donations: totalDonations || 0,
      total_transactions: totalTransactions || 0,
      total_needs: totalNeeds || 0,
      active_validators: validators || 0,
      active_partners: partners || 0,
      quarters_covered: quarters || 0
    };
  } catch (error) {
    return {
      total_donations: 0,
      total_transactions: 0,
      total_needs: 0,
      active_validators: 0,
      active_partners: 0,
      quarters_covered: 0
    };
  }
};

export const getPublicDashboard = async (req, res) => {
  try {
    const { lat, lng, radius = 10, limit = 50, page = 1, quarter } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = { status: 'confirmed' };

    if (quarter) {
      whereClause['$need.location_quarter$'] = { [Op.iLike]: `%${quarter}%` };
    }

    if (lat && lng) {
      const box = GeolocationUtils.getBoundingBox(parseFloat(lat), parseFloat(lng), parseFloat(radius));
      whereClause = {
        ...whereClause,
        '$need.location_lat$': { [Op.between]: [box.minLat, box.maxLat] },
        '$need.location_lng$': { [Op.between]: [box.minLng, box.maxLng] }
      };
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Need,
          as: 'need',
          required: true,
          attributes: ['id', 'title', 'description', 'location_quarter', 'location_lat', 'location_lng', 'category', 'created_at'],
          include: [{
            model: User,
            as: 'validator',
            attributes: ['full_name'],
            include: [{
              model: Validator,
              as: 'validator',
              attributes: ['reputation_score', 'total_deliveries']
            }]
          }]
        },
        {
          model: ImpactProof,
          as: 'impact_proof',
          attributes: ['media_url', 'thumbnail_url', 'proof_type', 'created_at'],
          required: false
        },
        {
          model: Partner,
          as: 'partner',
          attributes: ['business_name', 'payment_operator']
        }
      ],
      order: [['confirmed_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    let blockchainTransactions = [];
    try {
      blockchainTransactions = await polygonService.getRecentTransactions(10);
    } catch (error) {
      console.error('Blockchain error:', error);
    }

    const stats = await getGlobalStats();

    const activeQuarters = await Need.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('location_quarter')), 'quarter'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'needs_count']
      ],
      where: { status: 'completed' },
      group: ['location_quarter'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 20
    });

    const mapPoints = await Transaction.findAll({
      where: { status: 'confirmed' },
      attributes: [
        [sequelize.col('need.location_lat'), 'lat'],
        [sequelize.col('need.location_lng'), 'lng'],
        [sequelize.col('need.location_quarter'), 'quarter'],
        [sequelize.col('need.title'), 'title'],
        'amount',
        'confirmed_at'
      ],
      include: [{
        model: Need,
        as: 'need',
        attributes: [],
        where: { location_lat: { [Op.ne]: null }, location_lng: { [Op.ne]: null } }
      }],
      limit: 500,
      order: [['confirmed_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        stats: {
          total_donations: stats.total_donations,
          total_transactions: stats.total_transactions,
          total_needs: stats.total_needs,
          active_validators: stats.active_validators,
          active_partners: stats.active_partners,
          quarters_covered: stats.quarters_covered,
          last_update: new Date().toISOString()
        },
        transactions: transactions.map(t => ({
          id: t.id,
          amount: t.amount,
          date: t.confirmed_at,
          receipt_number: t.receipt_number,
          need: {
            id: t.need.id,
            title: t.need.title,
            quarter: t.need.location_quarter,
            category: t.need.category,
            location: t.need.location_lat && t.need.location_lng ? {
              lat: t.need.location_lat,
              lng: t.need.location_lng
            } : null
          },
          validator: {
            name: t.need.validator?.full_name,
            reputation: t.need.validator?.validator?.reputation_score || 0
          },
          partner: {
            name: t.partner?.business_name
          },
          proof: t.impact_proof ? {
            image: t.impact_proof.thumbnail_url || t.impact_proof.media_url,
            date: t.impact_proof.created_at
          } : null,
          blockchain: t.blockchain_explorer_url ? {
            url: t.blockchain_explorer_url,
            hash: t.blockchain_tx_hash
          } : null
        })),
        blockchain_transactions: blockchainTransactions,
        map_points: mapPoints.map(p => ({
          lat: p.dataValues.lat,
          lng: p.dataValues.lng,
          quarter: p.dataValues.quarter,
          title: p.dataValues.title,
          amount: p.amount,
          date: p.confirmed_at
        })),
        filters: {
          quarters: activeQuarters.map(q => ({
            name: q.dataValues.quarter,
            count: parseInt(q.dataValues.needs_count)
          })),
          total_pages: Math.ceil(count / parseInt(limit)),
          current_page: parseInt(page),
          total_transactions: count
        }
      }
    });
  } catch (error) {
    console.error('Dashboard Error Stack:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur', details: error.message });
  }
};

export const getPublicTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, status: 'confirmed' },
      include: [
        {
          model: Need,
          as: 'need',
          include: [
            { model: User, as: 'validator', attributes: ['full_name'] },
            { model: Beneficiary, as: 'beneficiary', attributes: ['reference_code', 'description', 'family_size'] }
          ]
        },
        { model: ImpactProof, as: 'impact_proof', attributes: ['media_url', 'proof_type', 'created_at'] },
        { model: Partner, as: 'partner', attributes: ['business_name'] }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction non trouvée' });
    }

    let blockchainVerification = null;
    if (transaction.blockchain_tx_hash) {
      blockchainVerification = await polygonService.verifyHash(transaction.blockchain_hash);
    }

    res.json({
      success: true,
      data: {
        id: transaction.id,
        amount: transaction.amount,
        date: transaction.confirmed_at,
        receipt_number: transaction.receipt_number,
        need: {
          title: transaction.need.title,
          description: transaction.need.description,
          quarter: transaction.need.location_quarter,
          category: transaction.need.category
        },
        validator: { name: transaction.need.validator.full_name },
        partner: { name: transaction.partner.business_name },
        beneficiary: transaction.need.beneficiary ? {
          code: transaction.need.beneficiary.reference_code,
          description: transaction.need.beneficiary.description,
          family_size: transaction.need.beneficiary.family_size
        } : null,
        proof: transaction.impact_proof ? {
          image: transaction.impact_proof.media_url,
          type: transaction.impact_proof.proof_type,
          date: transaction.impact_proof.created_at
        } : null,
        blockchain: {
          hash: transaction.blockchain_hash,
          tx_hash: transaction.blockchain_tx_hash,
          url: transaction.blockchain_explorer_url,
          verified: blockchainVerification?.verified || false
        }
      }
    });
  } catch (error) {
    console.error('Transaction detail error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
};

export const verifyBlockchainProof = async (req, res) => {
  try {
    const { hash } = req.params;
    const verification = await polygonService.verifyHash(hash);

    const transaction = await Transaction.findOne({
      where: { blockchain_hash: hash },
      include: [{ model: Need, as: 'need', attributes: ['title', 'location_quarter'] }]
    });

    res.json({
      success: true,
      data: {
        verified: verification.verified,
        hash: hash,
        transaction: transaction ? {
          id: transaction.id,
          amount: transaction.amount,
          date: transaction.confirmed_at,
          need: transaction.need ? {
            title: transaction.need.title,
            quarter: transaction.need.location_quarter
          } : null
        } : null
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ success: false, error: 'Erreur vérification' });
  }
};

export const getMapData = async (req, res) => {
  try {
    const { quarter, limit = 100 } = req.query;

    const whereClause = { status: 'confirmed' };
    if (quarter) {
      whereClause['$need.location_quarter$'] = quarter;
    }

    const points = await Transaction.findAll({
      where: whereClause,
      attributes: [
        [sequelize.col('need.location_lat'), 'lat'],
        [sequelize.col('need.location_lng'), 'lng'],
        [sequelize.col('need.location_quarter'), 'quarter'],
        [sequelize.col('need.title'), 'title'],
        'amount',
        'confirmed_at'
      ],
      include: [{
        model: Need,
        as: 'need',
        attributes: [],
        where: { location_lat: { [Op.ne]: null }, location_lng: { [Op.ne]: null } }
      }],
      limit: parseInt(limit),
      order: [['confirmed_at', 'DESC']]
    });

    const quartersMap = {};
    points.forEach(p => {
      const quarter = p.dataValues.quarter;
      if (!quartersMap[quarter]) {
        quartersMap[quarter] = { name: quarter, count: 0, total_amount: 0, points: [] };
      }
      quartersMap[quarter].count++;
      quartersMap[quarter].total_amount += p.amount;
      quartersMap[quarter].points.push({
        lat: p.dataValues.lat,
        lng: p.dataValues.lng,
        amount: p.amount,
        date: p.confirmed_at,
        title: p.dataValues.title
      });
    });

    res.json({
      success: true,
      data: {
        points: points.map(p => ({
          lat: p.dataValues.lat,
          lng: p.dataValues.lng,
          quarter: p.dataValues.quarter,
          title: p.dataValues.title,
          amount: p.amount,
          date: p.confirmed_at
        })),
        quarters: Object.values(quartersMap)
      }
    });
  } catch (error) {
    console.error('Map error:', error);
    res.status(500).json({ success: false, error: 'Erreur chargement carte' });
  }
};