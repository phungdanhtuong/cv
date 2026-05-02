import express from 'express';
import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get analytics summary
router.get('/summary', async (req, res) => {
  try {
    const userId = req.body.userId;

    // Get content stats
    const contentStats = await pool.query(
      `SELECT platform, COUNT(*) as count,
       SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published
       FROM content WHERE user_id = $1
       GROUP BY platform`,
      [userId]
    );

    // Get ad stats
    const adStats = await pool.query(
      `SELECT platform, COUNT(*) as count, SUM(budget) as total_spend,
       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
       FROM campaigns WHERE user_id = $1
       GROUP BY platform`,
      [userId]
    );

    res.json({
      content: contentStats.rows,
      ads: adStats.rows,
    });
  } catch (error) {
    logger.error('Get analytics endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get content analytics
router.get('/content', async (req, res) => {
  try {
    const userId = req.body.userId;
    const { platform, startDate, endDate } = req.query;

    let query = 'SELECT * FROM content WHERE user_id = $1';
    const params = [userId];

    if (platform) {
      query += ` AND platform = $${params.length + 1}`;
      params.push(platform);
    }

    if (startDate) {
      query += ` AND created_at >= $${params.length + 1}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND created_at <= $${params.length + 1}`;
      params.push(endDate);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error('Get content analytics endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get ad analytics
router.get('/ads', async (req, res) => {
  try {
    const userId = req.body.userId;
    const { platform, startDate, endDate } = req.query;

    let query = 'SELECT * FROM campaigns WHERE user_id = $1';
    const params = [userId];

    if (platform) {
      query += ` AND platform = $${params.length + 1}`;
      params.push(platform);
    }

    if (startDate) {
      query += ` AND created_at >= $${params.length + 1}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND created_at <= $${params.length + 1}`;
      params.push(endDate);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error('Get ad analytics endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get ROI calculation
router.get('/roi', async (req, res) => {
  try {
    const userId = req.body.userId;

    const campaigns = await pool.query(
      'SELECT budget, performance_data FROM campaigns WHERE user_id = $1',
      [userId]
    );

    let totalSpend = 0;
    let totalRevenue = 0;

    campaigns.rows.forEach((campaign) => {
      totalSpend += campaign.budget || 0;
      // Calculate revenue from performance data
      if (campaign.performance_data && campaign.performance_data.conversions) {
        totalRevenue += campaign.performance_data.conversions * 50; // Assume $50 per conversion
      }
    });

    const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

    res.json({
      totalSpend,
      totalRevenue,
      roi: roi.toFixed(2),
      campaigns: campaigns.rows.length,
    });
  } catch (error) {
    logger.error('Get ROI endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
