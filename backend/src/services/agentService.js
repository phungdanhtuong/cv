import { logger } from '../utils/logger.js';
import claudeService from './claudeService.js';
import pool from '../config/database.js';

export const agentService = {
  async loadAgent(agentId) {
    try {
      const result = await pool.query('SELECT * FROM agents WHERE id = $1', [agentId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error loading agent:', error.message);
      throw error;
    }
  },

  async getAllAgents() {
    try {
      const result = await pool.query('SELECT * FROM agents');
      return result.rows;
    } catch (error) {
      logger.error('Error getting agents:', error.message);
      throw error;
    }
  },

  async executeAgent(agent, input, context = null) {
    try {
      logger.info(`Executing agent: ${agent.name}`);

      const systemPrompt = agent.system_prompt || this.getDefaultPrompt(agent.type);
      const response = await claudeService.executeAgent(systemPrompt, input, context);

      logger.info(`Agent ${agent.name} completed successfully`);
      return response;
    } catch (error) {
      logger.error(`Error executing agent ${agent.name}:`, error.message);
      throw error;
    }
  },

  async orchestrateWorkflow(workflow, userInput, userId) {
    try {
      logger.info(`Starting workflow: ${workflow.name}`);

      const agents = workflow.agents || [];
      let context = userInput;
      const results = {};

      for (const agentId of agents) {
        const agent = await this.loadAgent(agentId);
        if (!agent) {
          logger.warn(`Agent ${agentId} not found, skipping`);
          continue;
        }

        const output = await this.executeAgent(agent, context, results);
        results[agent.name] = output;
        context = output;
      }

      logger.info(`Workflow ${workflow.name} completed`);
      return results;
    } catch (error) {
      logger.error('Error executing workflow:', error.message);
      throw error;
    }
  },

  getDefaultPrompt(agentType) {
    const prompts = {
      strategist: `You are a Content Strategist. Your role is to:
- Analyze brand voice and audience
- Define content strategy and messaging
- Suggest content themes and directions
Be concise and actionable.`,

      creator: `You are a Content Creator. Your role is to:
- Create engaging content for social media
- Follow the brand voice and strategy provided
- Generate platform-specific content (LinkedIn, TikTok, Instagram, etc.)
Provide high-quality, engaging content.`,

      'ads-manager': `You are an Ads Manager. Your role is to:
- Create and optimize paid advertising campaigns
- Define audience targeting and budgets
- Generate ad copy and creative briefs
- Maximize ROI and performance metrics
Be strategic and data-driven.`,

      analytics: `You are an Analytics Agent. Your role is to:
- Analyze performance metrics
- Identify trends and insights
- Suggest optimizations
- Generate actionable recommendations
Be precise with numbers and insights.`,
    };

    return prompts[agentType] || prompts.creator;
  },
};

export default agentService;
