import { extractUserId } from '../middleware/auth.js';
import express from 'express';
import realtimeDashboardService from '../services/realtimeDashboardService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(extractUserId);

// Get dashboard summary
router.get('/summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const summary = await realtimeDashboardService.getDashboardSummary(userId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error('Get summary error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get campaign metrics
router.get('/campaign/:userId/:campaignId/metrics', async (req, res) => {
  try {
    const { userId, campaignId } = req.params;
    const metrics = await realtimeDashboardService.getCampaignMetrics(userId, campaignId);

    if (!metrics) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Get campaign metrics error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get content metrics
router.get('/content/:userId/:contentId/metrics', async (req, res) => {
  try {
    const { userId, contentId } = req.params;
    const metrics = await realtimeDashboardService.getContentMetrics(userId, contentId);

    if (!metrics) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Get content metrics error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get agent execution status
router.get('/agent/:userId/:agentId/status', async (req, res) => {
  try {
    const { userId, agentId } = req.params;
    const status = await realtimeDashboardService.getAgentExecutionStatus(userId, agentId);

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error('Get agent status error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get analytics
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate required' });
    }

    const analytics = await realtimeDashboardService.getAnalyticsUpdate(userId, startDate, endDate);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Get analytics error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get team activity
router.get('/team/:teamId/activity', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { limit } = req.query;

    const activity = await realtimeDashboardService.getTeamActivity(
      teamId,
      limit ? parseInt(limit) : 50
    );

    res.json({
      success: true,
      data: activity,
      count: activity.length,
    });
  } catch (error) {
    logger.error('Get team activity error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get live stats
router.get('/live-stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await realtimeDashboardService.getLiveStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Get live stats error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Emit test notification (for testing)
router.post('/test/emit', async (req, res) => {
  try {
    const { userId, channel, data } = req.body;

    if (!userId || !channel || !data) {
      return res.status(400).json({ error: 'userId, channel, and data required' });
    }

    realtimeDashboardService.broadcast(userId, channel, data);

    res.json({
      success: true,
      message: 'Test notification broadcast',
    });
  } catch (error) {
    logger.error('Test emit error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
