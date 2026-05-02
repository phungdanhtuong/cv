import { logger } from '../utils/logger.js';
import pool from '../config/database.js';
import platformService from './platformService.js';

export const schedulingService = {
  async scheduleContent(userId, contentId, scheduleConfig) {
    try {
      logger.info(`Scheduling content ${contentId} for user ${userId}`);

      const { scheduledTime, platforms, timezone = 'UTC' } = scheduleConfig;

      // Validate scheduled time is in future
      if (new Date(scheduledTime) < new Date()) {
        throw new Error('Scheduled time must be in the future');
      }

      // Save schedule to database
      const result = await pool.query(
        `INSERT INTO scheduled_content (user_id, content_id, scheduled_time, platforms, timezone, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, contentId, scheduledTime, platforms, timezone, 'scheduled']
      );

      logger.info(`✓ Content scheduled for ${scheduledTime}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Content scheduling failed:', error.message);
      throw error;
    }
  },

  async rescheduleContent(userId, scheduleId, newScheduledTime) {
    try {
      logger.info(`Rescheduling content ${scheduleId}`);

      if (new Date(newScheduledTime) < new Date()) {
        throw new Error('New scheduled time must be in the future');
      }

      const result = await pool.query(
        `UPDATE scheduled_content
         SET scheduled_time = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        [newScheduledTime, scheduleId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Schedule not found');
      }

      logger.info('✓ Content rescheduled');
      return result.rows[0];
    } catch (error) {
      logger.error('Reschedule failed:', error.message);
      throw error;
    }
  },

  async publishScheduledContent(scheduleId) {
    try {
      logger.info(`Publishing scheduled content ${scheduleId}`);

      // Get schedule details
      const scheduleResult = await pool.query(
        'SELECT * FROM scheduled_content WHERE id = $1',
        [scheduleId]
      );

      if (scheduleResult.rows.length === 0) {
        throw new Error('Schedule not found');
      }

      const schedule = scheduleResult.rows[0];

      // Get content
      const contentResult = await pool.query(
        'SELECT * FROM content WHERE id = $1',
        [schedule.content_id]
      );

      if (contentResult.rows.length === 0) {
        throw new Error('Content not found');
      }

      const content = contentResult.rows[0];

      // Get user credentials for platforms
      const credentialsResult = await pool.query(
        `SELECT * FROM platform_credentials
         WHERE user_id = $1 AND platform = ANY($2::text[])`,
        [schedule.user_id, schedule.platforms]
      );

      const credentials = {};
      credentialsResult.rows.forEach((cred) => {
        credentials[cred.platform] = cred.encrypted_value;
      });

      // Publish to platforms
      const publishResults = await platformService.publishToMultiplePlatforms(
        { [content.platform]: content.content },
        schedule.platforms,
        credentials
      );

      // Update schedule status
      await pool.query(
        `UPDATE scheduled_content
         SET status = $1, published_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        ['published', scheduleId]
      );

      logger.info('✓ Content published to platforms');
      return publishResults;
    } catch (error) {
      logger.error('Content publishing failed:', error.message);
      throw error;
    }
  },

  // Check for content that should be published
  async checkAndPublishScheduledContent() {
    try {
      logger.info('Checking for scheduled content to publish...');

      // Find all scheduled content where time has passed
      const result = await pool.query(
        `SELECT id FROM scheduled_content
         WHERE status = 'scheduled' AND scheduled_time <= NOW()
         LIMIT 10`
      );

      logger.info(`Found ${result.rows.length} content items to publish`);

      const publishedIds = [];
      for (const schedule of result.rows) {
        try {
          await this.publishScheduledContent(schedule.id);
          publishedIds.push(schedule.id);
        } catch (error) {
          logger.error(`Failed to publish schedule ${schedule.id}:`, error.message);
        }
      }

      return {
        total: result.rows.length,
        successful: publishedIds.length,
        failed: result.rows.length - publishedIds.length,
      };
    } catch (error) {
      logger.error('Check and publish failed:', error.message);
      throw error;
    }
  },

  async getScheduledContent(userId, status = null, limit = 50) {
    try {
      let query = 'SELECT * FROM scheduled_content WHERE user_id = $1';
      const params = [userId];

      if (status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(status);
      }

      query += ` ORDER BY scheduled_time ASC LIMIT ${limit}`;

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Get scheduled content failed:', error.message);
      throw error;
    }
  },

  async deleteScheduledContent(userId, scheduleId) {
    try {
      logger.info(`Deleting schedule ${scheduleId}`);

      const result = await pool.query(
        `DELETE FROM scheduled_content
         WHERE id = $1 AND user_id = $2 AND status != 'published'
         RETURNING id`,
        [scheduleId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Schedule not found or already published');
      }

      logger.info('✓ Schedule deleted');
      return { deleted: true };
    } catch (error) {
      logger.error('Delete schedule failed:', error.message);
      throw error;
    }
  },

  // Best time to post analysis
  async findBestTimeToPost(userId, platform, historicalData = null) {
    try {
      logger.info(`Finding best time to post on ${platform}`);

      // Analyze historical performance to find optimal posting times
      const result = await pool.query(
        `SELECT
           EXTRACT(DOW FROM published_at) as day_of_week,
           EXTRACT(HOUR FROM published_at) as hour,
           AVG((performance_data->>'impressions')::int) as avg_impressions,
           AVG((performance_data->>'engagement')::int) as avg_engagement
         FROM content
         WHERE user_id = $1 AND platform = $2 AND published_at IS NOT NULL
         GROUP BY day_of_week, hour
         ORDER BY avg_engagement DESC
         LIMIT 5`,
        [userId, platform]
      );

      if (result.rows.length === 0) {
        // Default recommendation if no data
        return {
          recommendation: 'No historical data. Try posting Tuesday-Thursday, 9AM-11AM',
          optimal_times: [],
        };
      }

      return {
        recommendation: 'Based on your performance data',
        optimal_times: result.rows.map((row) => ({
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][row.day_of_week],
          hour: `${row.hour}:00`,
          engagement: row.avg_engagement,
        })),
      };
    } catch (error) {
      logger.error('Find best time failed:', error.message);
      throw error;
    }
  },
};

export default schedulingService;
