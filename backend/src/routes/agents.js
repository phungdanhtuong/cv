import express from 'express';
import agentService from '../services/agentService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all agents
router.get('/', async (req, res) => {
  try {
    const agents = await agentService.getAllAgents();
    res.json(agents);
  } catch (error) {
    logger.error('Get agents endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get single agent
router.get('/:id', async (req, res) => {
  try {
    const agent = await agentService.loadAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    logger.error('Get agent endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Execute agent
router.post('/:id/execute', async (req, res) => {
  try {
    const agent = await agentService.loadAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const { input, context } = req.body;
    const result = await agentService.executeAgent(agent, input, context);

    res.json({ agentId: agent.id, result });
  } catch (error) {
    logger.error('Execute agent endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
