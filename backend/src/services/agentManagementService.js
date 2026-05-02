import { logger } from '../utils/logger.js';
import pool from '../config/database.js';

export const agentManagementService = {
  // Enable agent for user
  async enableAgent(userId, agentId) {
    try {
      logger.info(`Enabling agent ${agentId} for user ${userId}`);

      const result = await pool.query(
        `INSERT INTO agent_profiles (user_id, agent_id, enabled, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, agent_id) DO UPDATE
         SET enabled = true, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId, agentId, true]
      );

      logger.info(`✓ Agent ${agentId} enabled`);
      return result.rows[0];
    } catch (error) {
      logger.error('Enable agent failed:', error.message);
      throw error;
    }
  },

  // Disable agent for user
  async disableAgent(userId, agentId) {
    try {
      logger.info(`Disabling agent ${agentId} for user ${userId}`);

      const result = await pool.query(
        `UPDATE agent_profiles
         SET enabled = false, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1 AND agent_id = $2
         RETURNING *`,
        [userId, agentId]
      );

      if (result.rows.length === 0) {
        // If profile doesn't exist, create it as disabled
        const insertResult = await pool.query(
          `INSERT INTO agent_profiles (user_id, agent_id, enabled)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [userId, agentId, false]
        );
        return insertResult.rows[0];
      }

      logger.info(`✓ Agent ${agentId} disabled`);
      return result.rows[0];
    } catch (error) {
      logger.error('Disable agent failed:', error.message);
      throw error;
    }
  },

  // Toggle agent (on/off)
  async toggleAgent(userId, agentId) {
    try {
      // Check current status
      const statusResult = await pool.query(
        'SELECT enabled FROM agent_profiles WHERE user_id = $1 AND agent_id = $2',
        [userId, agentId]
      );

      const isCurrentlyEnabled = statusResult.rows[0]?.enabled || false;
      const newStatus = !isCurrentlyEnabled;

      if (newStatus) {
        return this.enableAgent(userId, agentId);
      } else {
        return this.disableAgent(userId, agentId);
      }
    } catch (error) {
      logger.error('Toggle agent failed:', error.message);
      throw error;
    }
  },

  // Get user's enabled agents
  async getEnabledAgents(userId) {
    try {
      const result = await pool.query(
        `SELECT a.* FROM agents a
         JOIN agent_profiles ap ON a.id = ap.agent_id
         WHERE ap.user_id = $1 AND ap.enabled = true
         ORDER BY a.type, a.name`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Get enabled agents failed:', error.message);
      throw error;
    }
  },

  // Get user's disabled agents
  async getDisabledAgents(userId) {
    try {
      const result = await pool.query(
        `SELECT a.* FROM agents a
         LEFT JOIN agent_profiles ap ON a.id = ap.agent_id AND ap.user_id = $1
         WHERE ap.id IS NULL OR ap.enabled = false
         ORDER BY a.type, a.name`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Get disabled agents failed:', error.message);
      throw error;
    }
  },

  // Get all agents with user's status
  async getAllAgentsWithStatus(userId) {
    try {
      const result = await pool.query(
        `SELECT
           a.*,
           COALESCE(ap.enabled, false) as user_enabled,
           ap.custom_prompt
         FROM agents a
         LEFT JOIN agent_profiles ap ON a.id = ap.agent_id AND ap.user_id = $1
         ORDER BY a.type, a.name`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Get all agents with status failed:', error.message);
      throw error;
    }
  },

  // Create agent team/profile
  async createTeam(userId, teamConfig) {
    try {
      logger.info(`Creating team ${teamConfig.name} for user ${userId}`);

      const result = await pool.query(
        `INSERT INTO agent_teams (user_id, team_name, description, is_active)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, teamConfig.name, teamConfig.description, teamConfig.isActive || false]
      );

      const teamId = result.rows[0].id;

      // Add agents to team
      if (teamConfig.agentIds && teamConfig.agentIds.length > 0) {
        for (let i = 0; i < teamConfig.agentIds.length; i++) {
          await pool.query(
            `INSERT INTO team_agents (team_id, agent_id, position)
             VALUES ($1, $2, $3)`,
            [teamId, teamConfig.agentIds[i], i]
          );
        }
      }

      logger.info(`✓ Team created: ${teamId}`);
      return { ...result.rows[0], agents: teamConfig.agentIds };
    } catch (error) {
      logger.error('Create team failed:', error.message);
      throw error;
    }
  },

  // Get user's teams
  async getUserTeams(userId) {
    try {
      const result = await pool.query(
        `SELECT
           t.*,
           ARRAY_AGG(ta.agent_id ORDER BY ta.position) as agent_ids
         FROM agent_teams t
         LEFT JOIN team_agents ta ON t.id = ta.team_id
         WHERE t.user_id = $1
         GROUP BY t.id
         ORDER BY t.is_active DESC, t.created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Get user teams failed:', error.message);
      throw error;
    }
  },

  // Switch active team
  async switchTeam(userId, teamId) {
    try {
      logger.info(`Switching to team ${teamId}`);

      // Deactivate all teams
      await pool.query(
        'UPDATE agent_teams SET is_active = false WHERE user_id = $1',
        [userId]
      );

      // Activate selected team
      const result = await pool.query(
        `UPDATE agent_teams
         SET is_active = true
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [teamId, userId]
      );

      // Get team agents
      const agentsResult = await pool.query(
        'SELECT agent_id FROM team_agents WHERE team_id = $1 ORDER BY position',
        [teamId]
      );

      const agentIds = agentsResult.rows.map(row => row.agent_id);

      // Update user's enabled agents to match team
      await pool.query(
        'DELETE FROM agent_profiles WHERE user_id = $1',
        [userId]
      );

      for (const agentId of agentIds) {
        await pool.query(
          `INSERT INTO agent_profiles (user_id, agent_id, enabled)
           VALUES ($1, $2, true)`,
          [userId, agentId]
        );
      }

      logger.info(`✓ Switched to team ${teamId} with ${agentIds.length} agents`);
      return { team: result.rows[0], enabledAgents: agentIds };
    } catch (error) {
      logger.error('Switch team failed:', error.message);
      throw error;
    }
  },

  // Delete team
  async deleteTeam(userId, teamId) {
    try {
      logger.info(`Deleting team ${teamId}`);

      // Delete team agents first
      await pool.query('DELETE FROM team_agents WHERE team_id = $1', [teamId]);

      // Delete team
      const result = await pool.query(
        'DELETE FROM agent_teams WHERE id = $1 AND user_id = $2 RETURNING id',
        [teamId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Team not found');
      }

      logger.info('✓ Team deleted');
      return { deleted: true };
    } catch (error) {
      logger.error('Delete team failed:', error.message);
      throw error;
    }
  },

  // Get agent usage statistics
  async getAgentUsageStats(userId, days = 30) {
    try {
      logger.info(`Getting agent usage stats for ${days} days`);

      const result = await pool.query(
        `SELECT
           a.id, a.name, a.type,
           COUNT(CASE WHEN a.id = ANY(STRING_TO_ARRAY(ap.used_agents, ',')::int[]) THEN 1 END) as usage_count
         FROM agents a
         LEFT JOIN agent_profiles ap ON a.id = ap.agent_id AND ap.user_id = $1
         WHERE ap.created_at > NOW() - INTERVAL '${days} days'
         GROUP BY a.id, a.name, a.type
         ORDER BY usage_count DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Get usage stats failed:', error.message);
      return [];
    }
  },

  // Recommend agents for task
  async recommendAgents(userId, taskType) {
    try {
      logger.info(`Recommending agents for task: ${taskType}`);

      const recommendations = {
        content: [
          'Content Strategist',
          'Content Creator',
          'Designer',
          'Visual Storyteller',
          'Analytics Agent',
        ],
        ads: [
          'Ads Manager',
          'Growth Hacker',
          'PPC Specialist',
          'Analytics Agent',
          'Designer',
        ],
        ecommerce: [
          'Content Creator',
          'Designer',
          'Ads Manager',
          'Growth Hacker',
          'Email Marketing',
        ],
        growth: [
          'Growth Hacker',
          'Content Creator',
          'Ads Manager',
          'Analytics Agent',
          'Community Manager',
        ],
        email: [
          'Email Marketing',
          'Content Creator',
          'Designer',
          'Analytics Agent',
          'Community Manager',
        ],
        seo: [
          'SEO Specialist',
          'Content Creator',
          'Designer',
          'Analytics Agent',
          'Growth Hacker',
        ],
      };

      const agentNames = recommendations[taskType] || recommendations.content;

      // Get agent IDs from names
      const result = await pool.query(
        'SELECT id, name, type FROM agents WHERE name = ANY($1::text[])',
        [agentNames]
      );

      return {
        taskType,
        recommendedAgents: result.rows,
        count: result.rows.length,
      };
    } catch (error) {
      logger.error('Recommend agents failed:', error.message);
      throw error;
    }
  },
};

export default agentManagementService;
