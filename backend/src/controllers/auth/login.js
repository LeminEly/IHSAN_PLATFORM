import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import Environment from '../../config/environment.js';
import { validateMauritaniaPhone } from '../../utils/validation.js';

export const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    const phoneValidation = validateMauritaniaPhone(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({ error: phoneValidation.error });
    }

    const formattedPhone = phoneValidation.formatted;
    const user = await User.findOne({ where: { phone: formattedPhone } });

    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Compte désactivé' });
    }

    if (!user.is_phone_verified) {
      return res.status(403).json({
        error: 'Téléphone non vérifié',
        code: 'PHONE_NOT_VERIFIED',
      });
    }

    await user.update({ last_login: new Date() });

    const token = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone },
      Environment.get('JWT_SECRET'),
      { expiresIn: Environment.get('JWT_EXPIRE') },
    );

    const refreshToken = jwt.sign({ id: user.id }, Environment.get('JWT_REFRESH_SECRET'), {
      expiresIn: Environment.get('JWT_REFRESH_EXPIRE'),
    });

    await user.update({ refresh_token: refreshToken });

    res.json({
      message: 'Connexion réussie',
      token,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requis' });
    }

    const decoded = jwt.verify(refreshToken, Environment.get('JWT_REFRESH_SECRET'));
    const user = await User.findByPk(decoded.id);

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({ error: 'Refresh token invalide' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone },
      Environment.get('JWT_SECRET'),
      { expiresIn: Environment.get('JWT_EXPIRE') },
    );

    res.json({ token });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await req.user.update({ refresh_token: null });
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    next(error);
  }
};
