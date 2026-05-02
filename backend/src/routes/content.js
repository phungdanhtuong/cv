import express from 'express';
import contentService from '../services/contentService.js';
import { extractUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(extractUserId);

// Create content
router.post('/create', async (req, res) => {
  try {
    const userId = req.userId;
    const result = await contentService.createContent(userId, req.body);
    res.json(result);
  } catch (error) {
    logger.error('Content creation endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get user's content
router.get('/list', async (req, res) => {
  try {
    const userId = req.userId;
    const { platform, status } = req.query;
    const content = await contentService.getUserContent(userId, platform, status);
    res.json(content);
  } catch (error) {
    logger.error('Get content endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get single content
router.get('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const content = await contentService.getContent(userId, req.params.id);
    res.json(content);
  } catch (error) {
    logger.error('Get single content endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Approve content
router.post('/:id/approve', async (req, res) => {
  try {
    const userId = req.userId;
    const approved = await contentService.approveContent(userId, req.params.id);
    res.json(approved);
  } catch (error) {
    logger.error('Approve content endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Reject content
router.post('/:id/reject', async (req, res) => {
  try {
    const userId = req.userId;
    const { reason } = req.body;
    const rejected = await contentService.rejectContent(userId, req.params.id, reason);
    res.json(rejected);
  } catch (error) {
    logger.error('Reject content endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete content
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const result = await contentService.deleteContent(userId, req.params.id);
    res.json(result);
  } catch (error) {
    logger.error('Delete content endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
