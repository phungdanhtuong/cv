import { logger } from '../utils/logger.js';

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const userId = req.headers['x-user-id'] || req.query.userId || req.body.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Missing userId' });
  }

  req.userId = parseInt(userId, 10);
  next();
};

export const extractUserId = (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.query.userId || req.body.userId;
  if (userId) {
    req.userId = parseInt(userId, 10);
  }
  next();
};
