import Need from '../../models/Need.js';
import Partner from '../../models/Partner.js';
import User from '../../models/User.js';
import Validator from '../../models/Validator.js';
import { Op } from 'sequelize';
import { GeolocationUtils } from '../../utils/geolocation.js';

export const getAvailableNeeds = async (req, res) => {
  try {
    const {
      category,
      quarter,
      lat,
      lng,
      radius = 10,
      limit = 20,
      offset = 0,
      sort = 'priority',
    } = req.query;

    const where = {
      status: 'open',
      expiry_date: { [Op.or]: [{ [Op.gt]: new Date() }, null] },
    };

    if (category) where.category = category;
    if (quarter) where.location_quarter = { [Op.iLike]: `%${quarter}%` };

    // Filtre géographique
    if (lat && lng) {
      const box = GeolocationUtils.getBoundingBox(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius),
      );

      where.location_lat = { [Op.between]: [box.minLat, box.maxLat] };
      where.location_lng = { [Op.between]: [box.minLng, box.maxLng] };
    }

    // Déterminer l'ordre
    let order = [];
    switch (sort) {
      case 'priority':
        order = [
          ['priority', 'DESC'],
          ['created_at', 'ASC'],
        ];
        break;
      case 'date':
        order = [['created_at', 'DESC']];
        break;
      case 'amount':
        order = [['estimated_amount', 'ASC']];
        break;
      default:
        order = [
          ['priority', 'DESC'],
          ['created_at', 'ASC'],
        ];
    }

    const needs = await Need.findAndCountAll({
      where,
      include: [
        {
          model: Partner,
          as: 'partner',
          attributes: ['business_name', 'payment_operator'],
        },
        {
          model: User,
          as: 'validator',
          attributes: ['full_name'],
          include: [
            {
              model: Validator,
              as: 'validator',
              attributes: ['reputation_score', 'total_deliveries'],
            },
          ],
        },
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Ajouter la distance si coordonnées fournies
    let needsWithDistance = needs.rows;
    if (lat && lng && needs.rows.length > 0) {
      needsWithDistance = needs.rows.map((need) => {
        const needJson = need.toJSON();
        if (need.location_lat && need.location_lng) {
          needJson.distance = GeolocationUtils.calculateDistance(
            parseFloat(lat),
            parseFloat(lng),
            need.location_lat,
            need.location_lng,
          );
        }
        return needJson;
      });
    }

    res.json({
      total: needs.count,
      needs: needsWithDistance,
    });
  } catch (error) {
    console.error('Get available needs error:', error);
    res.status(500).json({ error: 'Erreur chargement catalogue' });
  }
};

export const getNeedById = async (req, res) => {
  try {
    const { needId } = req.params;

    const need = await Need.findOne({
      where: {
        id: needId,
        status: 'open',
      },
      include: [
        {
          model: Partner,
          as: 'partner',
          attributes: ['business_name', 'address', 'payment_operator'],
        },
        {
          model: User,
          as: 'validator',
          attributes: ['full_name'],
          include: [
            {
              model: Validator,
              as: 'validator',
              attributes: ['reputation_score', 'total_deliveries', 'working_quarters'],
            },
          ],
        },
      ],
    });

    if (!need) {
      return res.status(404).json({ error: 'Besoin non trouvé' });
    }

    res.json(need);
  } catch (error) {
    console.error('Get need by id error:', error);
    res.status(500).json({ error: 'Erreur chargement besoin' });
  }
};

export const searchNeeds = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 3) {
      return res.json({ needs: [] });
    }

    const needs = await Need.findAll({
      where: {
        status: 'open',
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          { location_quarter: { [Op.iLike]: `%${q}%` } },
        ],
      },
      include: [
        {
          model: Partner,
          as: 'partner',
          attributes: ['business_name'],
        },
      ],
      limit: parseInt(limit),
      order: [['priority', 'DESC']],
    });

    res.json({ needs });
  } catch (error) {
    console.error('Search needs error:', error);
    res.status(500).json({ error: 'Erreur recherche' });
  }
};
