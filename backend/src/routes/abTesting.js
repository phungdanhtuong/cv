import express from 'express';
import abTestingService from '../services/abTestingService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Create A/B test
router.post('/create', async (req, res) => {
  try {
    const { userId, campaignId, variationAId, variationBId } = req.body;

    if (!userId || !campaignId || !variationAId || !variationBId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await abTestingService.createABTest(userId, campaignId, {
      variationAId,
      variationBId,
    });

    res.status(201).json({
      success: true,
      test: result,
    });
  } catch (error) {
    logger.error('Create A/B test endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get A/B test details
router.get('/:testId', async (req, res) => {
  try {
    const testId = req.params.testId;
    const test = await abTestingService.getABTest(testId);

    res.json({
      success: true,
      test,
    });
  } catch (error) {
    logger.error('Get A/B test endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Record variation metrics
router.post('/:testId/metrics/:variationId', async (req, res) => {
  try {
    const testId = req.params.testId;
    const variationId = req.params.variationId;
    const metrics = req.body;

    const result = await abTestingService.recordVariationMetrics(testId, variationId, metrics);

    res.json({
      success: true,
      test: result,
    });
  } catch (error) {
    logger.error('Record metrics endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Analyze A/B test
router.get('/:testId/analyze', async (req, res) => {
  try {
    const testId = req.params.testId;
    const analysis = await abTestingService.analyzeABTest(testId);

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    logger.error('Analyze A/B test endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Declare winner
router.post('/:testId/declare-winner', async (req, res) => {
  try {
    const testId = req.params.testId;
    const { winner } = req.body;

    if (!winner) {
      return res.status(400).json({ error: 'Winner (A or B) is required' });
    }

    const result = await abTestingService.declareWinner(testId, winner);

    res.json({
      success: true,
      test: result,
    });
  } catch (error) {
    logger.error('Declare winner endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get active tests for campaign
router.get('/campaign/:campaignId/active', async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const tests = await abTestingService.getActiveCampaignTests(campaignId);

    res.json({
      success: true,
      tests,
      count: tests.length,
    });
  } catch (error) {
    logger.error('Get active tests endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get test history
router.get('/user/:userId/history', async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = req.query.limit || 20;
    const tests = await abTestingService.getTestHistory(userId, parseInt(limit));

    res.json({
      success: true,
      tests,
      count: tests.length,
    });
  } catch (error) {
    logger.error('Get test history endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Run multivariate test
router.post('/multivariate/create', async (req, res) => {
  try {
    const { userId, campaignId, variants } = req.body;

    if (!userId || !campaignId || !variants || variants.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 variants' });
    }

    const result = await abTestingService.runMultivariateTest(userId, campaignId, variants);

    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Create multivariate test endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get statistics summary
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const userId = req.params.userId;
    const stats = await abTestingService.getStatisticsSummary(userId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error('Get statistics endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
