import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name || email.split('@')[0]]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, config.jwt.secret);

    logger.info(`User registered: ${user.email}`);

    res.status(201).json({
      success: true,
      user,
      authToken: token,
    });
  } catch (error) {
    logger.error('Register error:', error.message);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, config.jwt.secret);

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      authToken: token,
    });
  } catch (error) {
    logger.error('Login error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = req.headers['x-user-id'];

    if (!token && !userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const id = userId || (jwt.verify(token, config.jwt.secret) as any).userId;
    const result = await pool.query('SELECT id, email, name, created_at FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    logger.error('Get current user error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
