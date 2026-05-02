import { extractUserId } from '../middleware/auth.js';
import express from 'express';
import schedulingService from '../services/schedulingService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(extractUserId);

// Schedule content
router.post('/schedule', async (req, res) => {
  try {
    const userId = req.userId;
    const result = await schedulingService.scheduleContent(userId, req.body.contentId, {
      scheduledTime: req.body.scheduledTime,
      platforms: req.body.platforms,
      timezone: req.body.timezone,
    });
    res.json(result);
  } catch (error) {
    logger.error('Schedule endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get scheduled content
router.get('/scheduled', async (req, res) => {
  try {
    const userId = req.userId;
    const scheduled = await schedulingService.getScheduledContent(userId, req.query.status);
    res.json(scheduled);
  } catch (error) {
    logger.error('Get scheduled endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Reschedule
router.post('/reschedule/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const result = await schedulingService.rescheduleContent(
      userId,
      req.params.id,
      req.body.scheduledTime
    );
    res.json(result);
  } catch (error) {
    logger.error('Reschedule endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete scheduled content
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const result = await schedulingService.deleteScheduledContent(userId, req.params.id);
    res.json(result);
  } catch (error) {
    logger.error('Delete schedule endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get best time to post
router.get('/best-time/:platform', async (req, res) => {
  try {
    const userId = req.userId;
    const result = await schedulingService.findBestTimeToPost(userId, req.params.platform);
    res.json(result);
  } catch (error) {
    logger.error('Best time endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
