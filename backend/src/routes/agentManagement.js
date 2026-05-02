import express from 'express';
import agentManagementService from '../services/agentManagementService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Enable agent for user
router.post('/enable/:agentId', async (req, res) => {
  try {
    const userId = req.body.userId || req.query.userId;
    const agentId = req.params.agentId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await agentManagementService.enableAgent(userId, agentId);
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error('Enable agent error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Disable agent for user
router.post('/disable/:agentId', async (req, res) => {
  try {
    const userId = req.body.userId || req.query.userId;
    const agentId = req.params.agentId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await agentManagementService.disableAgent(userId, agentId);
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error('Disable agent error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Toggle agent
router.post('/toggle/:agentId', async (req, res) => {
  try {
    const userId = req.body.userId || req.query.userId;
    const agentId = req.params.agentId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await agentManagementService.toggleAgent(userId, agentId);
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error('Toggle agent error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get enabled agents
router.get('/enabled', async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const agents = await agentManagementService.getEnabledAgents(userId);
    res.json({
      success: true,
      agents,
      count: agents.length,
    });
  } catch (error) {
    logger.error('Get enabled agents error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get disabled agents
router.get('/disabled', async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const agents = await agentManagementService.getDisabledAgents(userId);
    res.json({
      success: true,
      agents,
      count: agents.length,
    });
  } catch (error) {
    logger.error('Get disabled agents error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all agents with status
router.get('/all', async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const agents = await agentManagementService.getAllAgentsWithStatus(userId);
    res.json({
      success: true,
      agents,
      total: agents.length,
    });
  } catch (error) {
    logger.error('Get all agents with status error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Create team
router.post('/teams', async (req, res) => {
  try {
    const userId = req.body.userId;
    const teamConfig = req.body.teamConfig;

    if (!userId || !teamConfig) {
      return res.status(400).json({ error: 'userId and teamConfig are required' });
    }

    const result = await agentManagementService.createTeam(userId, teamConfig);
    res.status(201).json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error('Create team error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get user teams
router.get('/teams', async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const teams = await agentManagementService.getUserTeams(userId);
    res.json({
      success: true,
      teams,
      count: teams.length,
    });
  } catch (error) {
    logger.error('Get user teams error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Switch team
router.post('/teams/:teamId/switch', async (req, res) => {
  try {
    const userId = req.body.userId;
    const teamId = req.params.teamId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await agentManagementService.switchTeam(userId, teamId);
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error('Switch team error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete team
router.delete('/teams/:teamId', async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    const teamId = req.params.teamId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await agentManagementService.deleteTeam(userId, teamId);
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error('Delete team error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get agent usage stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.query.userId;
    const days = req.query.days || 30;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const stats = await agentManagementService.getAgentUsageStats(userId, parseInt(days));
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error('Get usage stats error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get agent recommendations
router.get('/recommend/:taskType', async (req, res) => {
  try {
    const userId = req.query.userId;
    const taskType = req.params.taskType;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const recommendations = await agentManagementService.recommendAgents(userId, taskType);
    res.json({
      success: true,
      ...recommendations,
    });
  } catch (error) {
    logger.error('Get recommendations error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
