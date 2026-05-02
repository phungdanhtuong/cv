import express from 'express';
import adsService from '../services/adsService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Create ad campaign
router.post('/campaigns/create', async (req, res) => {
  try {
    const userId = req.body.userId;
    const result = await adsService.createAdCampaign(userId, req.body);
    res.json(result);
  } catch (error) {
    logger.error('Create campaign endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get user's campaigns
router.get('/campaigns/list', async (req, res) => {
  try {
    const userId = req.body.userId;
    const { platform, status } = req.query;
    const campaigns = await adsService.getUserCampaigns(userId, platform, status);
    res.json(campaigns);
  } catch (error) {
    logger.error('Get campaigns endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get campaign metrics
router.get('/campaigns/:id/metrics', async (req, res) => {
  try {
    const userId = req.body.userId;
    const metrics = await adsService.getCampaignMetrics(userId, req.params.id);
    res.json(metrics);
  } catch (error) {
    logger.error('Get metrics endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Approve campaign
router.post('/campaigns/:id/approve', async (req, res) => {
  try {
    const userId = req.body.userId;
    const approved = await adsService.approveCampaign(userId, req.params.id);
    res.json(approved);
  } catch (error) {
    logger.error('Approve campaign endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Pause campaign
router.post('/campaigns/:id/pause', async (req, res) => {
  try {
    const userId = req.body.userId;
    const paused = await adsService.pauseCampaign(userId, req.params.id);
    res.json(paused);
  } catch (error) {
    logger.error('Pause campaign endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
