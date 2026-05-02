import { extractUserId } from '../middleware/auth.js';
import express from 'express';
import autoOptimizationService from '../services/autoOptimizationService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(extractUserId);

// Run optimizations
router.post('/run', async (req, res) => {
  try {
    const result = await autoOptimizationService.runOptimizations();
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error('Run optimization endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get predictions
router.get('/predictions', async (req, res) => {
  try {
    const userId = req.userId;
    const predictions = await autoOptimizationService.generatePredictions(userId);
    res.json(predictions);
  } catch (error) {
    logger.error('Predictions endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Optimize specific campaign
router.post('/campaign/:campaignId', async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const campaign = {
      id: campaignId,
      platform: req.body.platform,
      budget: req.body.budget,
      performance_data: req.body.performanceData,
    };

    const result = await autoOptimizationService.optimizeCampaign(campaign);
    res.json(result);
  } catch (error) {
    logger.error('Optimize campaign endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
