import { logger } from '../utils/logger.js';
import agentService from './agentService.js';
import claudeService from './claudeService.js';
import pool from '../config/database.js';

export const contentService = {
  async createContent(userId, request) {
    try {
      logger.info(`Creating content for user ${userId}`);

      const {
        description,
        platforms,
        contentType = 'text',
        brandVoiceId = null,
        agentIds = [],
      } = request;

      // Step 1: Get brand voice if available
      let brandVoiceContext = '';
      if (brandVoiceId) {
        const voiceResult = await pool.query(
          'SELECT * FROM brand_voices WHERE id = $1 AND user_id = $2',
          [brandVoiceId, userId]
        );
        if (voiceResult.rows.length > 0) {
          brandVoiceContext = voiceResult.rows[0].guidelines;
        }
      }

      // Step 2: Strategy phase (use Content Strategist agent)
      const strategistAgent = await agentService.loadAgent(1); // Content Strategist
      const strategy = await agentService.executeAgent(
        strategistAgent,
        `Create a content strategy for: ${description}`,
        `Platform: ${platforms.join(', ')}\nBrand Voice: ${brandVoiceContext}`
      );

      logger.info('✓ Strategy created');

      // Step 3: Content creation phase (use Content Creator agent)
      const creatorAgent = await agentService.loadAgent(2); // Content Creator
      const contentByPlatform = {};

      for (const platform of platforms) {
        const platformContent = await agentService.executeAgent(
          creatorAgent,
          `Create ${platform} content for: ${description}`,
          `Strategy: ${strategy}\nPlatform: ${platform}\nBrand Voice: ${brandVoiceContext}`
        );

        contentByPlatform[platform] = platformContent;
      }

      logger.info('✓ Content created for all platforms');

      // Step 4: Save to database
      const contentPromises = platforms.map((platform) =>
        pool.query(
          `INSERT INTO content (user_id, title, content, platform, status)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [userId, description, contentByPlatform[platform], platform, 'draft']
        )
      );

      const contentResults = await Promise.all(contentPromises);

      const savedContent = contentResults.map((result) => ({
        id: result.rows[0].id,
        status: 'draft',
      }));

      return {
        success: true,
        strategy,
        content: contentByPlatform,
        saved: savedContent,
      };
    } catch (error) {
      logger.error('Content creation failed:', error.message);
      throw error;
    }
  },

  async approveContent(userId, contentId) {
    try {
      logger.info(`Approving content ${contentId}`);

      const result = await pool.query(
        `UPDATE content SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        ['approved', contentId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Content not found');
      }

      logger.info('✓ Content approved');
      return result.rows[0];
    } catch (error) {
      logger.error('Content approval failed:', error.message);
      throw error;
    }
  },

  async rejectContent(userId, contentId, reason) {
    try {
      logger.info(`Rejecting content ${contentId}`);

      const result = await pool.query(
        `UPDATE content SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        ['rejected', contentId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Content not found');
      }

      logger.info('✓ Content rejected');
      return result.rows[0];
    } catch (error) {
      logger.error('Content rejection failed:', error.message);
      throw error;
    }
  },

  async getContent(userId, contentId) {
    try {
      const result = await pool.query(
        'SELECT * FROM content WHERE id = $1 AND user_id = $2',
        [contentId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Content not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Get content failed:', error.message);
      throw error;
    }
  },

  async getUserContent(userId, platform = null, status = null) {
    try {
      let query = 'SELECT * FROM content WHERE user_id = $1';
      const params = [userId];

      if (platform) {
        query += ` AND platform = $${params.length + 1}`;
        params.push(platform);
      }

      if (status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Get user content failed:', error.message);
      throw error;
    }
  },

  async deleteContent(userId, contentId) {
    try {
      logger.info(`Deleting content ${contentId}`);

      const result = await pool.query(
        'DELETE FROM content WHERE id = $1 AND user_id = $2 RETURNING id',
        [contentId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Content not found');
      }

      logger.info('✓ Content deleted');
      return { deleted: true };
    } catch (error) {
      logger.error('Content deletion failed:', error.message);
      throw error;
    }
  },
};

export default contentService;
