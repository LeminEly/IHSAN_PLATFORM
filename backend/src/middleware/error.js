import Environment from '../config/environment.js';

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err);

  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    error = new AppError(message, 400);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    error = new AppError('Cette valeur existe déjà', 409);
  }

  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Token invalide', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Session expirée', 401);
  }

  res.status(error.statusCode || 500).json({
    error: error.message || 'Erreur interne du serveur',
    ...(Environment.isDevelopment() && { stack: err.stack })
  });
};