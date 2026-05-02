import { logger } from '../utils/logger.js';
import pool from '../config/database.js';

export const contentCalendarService = {
  // Add content to calendar
  async addToCalendar(userId, contentId, scheduledTime, platforms, timezone = 'UTC') {
    try {
      logger.info(`Adding content ${contentId} to calendar for ${scheduledTime}`);

      const result = await pool.query(
        `INSERT INTO scheduled_content (user_id, content_id, scheduled_time, platforms, timezone, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING *`,
        [userId, contentId, scheduledTime, JSON.stringify(platforms), timezone]
      );

      logger.info(`✓ Content added to calendar: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Add to calendar failed:', error.message);
      throw error;
    }
  },

  // Get calendar events for date range
  async getCalendarEvents(userId, startDate, endDate) {
    try {
      const result = await pool.query(
        `SELECT sc.*, c.title, c.content, c.platform
         FROM scheduled_content sc
         JOIN content c ON sc.content_id = c.id
         WHERE sc.user_id = $1
         AND sc.scheduled_time >= $2
         AND sc.scheduled_time <= $3
         AND sc.status IN ('pending', 'published')
         ORDER BY sc.scheduled_time ASC`,
        [userId, startDate, endDate]
      );

      return result.rows.map((row) => ({
        ...row,
        platforms: JSON.parse(row.platforms),
      }));
    } catch (error) {
      logger.error('Get calendar events failed:', error.message);
      throw error;
    }
  },

  // Get calendar events by month
  async getCalendarByMonth(userId, year, month) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const result = await pool.query(
        `SELECT
           DATE(sc.scheduled_time) as date,
           COUNT(*) as count,
           JSON_AGG(JSON_BUILD_OBJECT(
             'id', sc.id,
             'contentId', sc.content_id,
             'title', c.title,
             'time', sc.scheduled_time,
             'platforms', sc.platforms,
             'status', sc.status
           )) as events
         FROM scheduled_content sc
         JOIN content c ON sc.content_id = c.id
         WHERE sc.user_id = $1
         AND sc.scheduled_time >= $2
         AND sc.scheduled_time < $3
         GROUP BY DATE(sc.scheduled_time)
         ORDER BY date ASC`,
        [userId, startDate, endDate]
      );

      return result.rows.map((row) => ({
        date: row.date,
        count: parseInt(row.count),
        events: row.events.map((event) => ({
          ...event,
          platforms: JSON.parse(event.platforms),
        })),
      }));
    } catch (error) {
      logger.error('Get calendar by month failed:', error.message);
      throw error;
    }
  },

  // Get calendar events by week
  async getCalendarByWeek(userId, weekStart) {
    try {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const result = await pool.query(
        `SELECT
           DATE(sc.scheduled_time) as date,
           EXTRACT(DOW FROM sc.scheduled_time) as day_of_week,
           COUNT(*) as count,
           JSON_AGG(JSON_BUILD_OBJECT(
             'id', sc.id,
             'contentId', sc.content_id,
             'title', c.title,
             'time', sc.scheduled_time,
             'platforms', sc.platforms,
             'status', sc.status
           )) as events
         FROM scheduled_content sc
         JOIN content c ON sc.content_id = c.id
         WHERE sc.user_id = $1
         AND sc.scheduled_time >= $2
         AND sc.scheduled_time < $3
         GROUP BY DATE(sc.scheduled_time), EXTRACT(DOW FROM sc.scheduled_time)
         ORDER BY date ASC`,
        [userId, weekStart, weekEnd]
      );

      return result.rows.map((row) => ({
        date: row.date,
        dayOfWeek: parseInt(row.day_of_week),
        count: parseInt(row.count),
        events: row.events.map((event) => ({
          ...event,
          platforms: JSON.parse(event.platforms),
        })),
      }));
    } catch (error) {
      logger.error('Get calendar by week failed:', error.message);
      throw error;
    }
  },

  // Reschedule content
  async rescheduleContent(scheduleId, newScheduledTime) {
    try {
      logger.info(`Rescheduling content ${scheduleId} to ${newScheduledTime}`);

      const result = await pool.query(
        `UPDATE scheduled_content
         SET scheduled_time = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [newScheduledTime, scheduleId]
      );

      if (result.rows.length === 0) {
        throw new Error('Schedule not found');
      }

      logger.info(`✓ Content rescheduled: ${scheduleId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Reschedule content failed:', error.message);
      throw error;
    }
  },

  // Drag-drop reschedule (update multiple fields)
  async dragDropReschedule(scheduleId, newScheduledTime, newPlatforms) {
    try {
      logger.info(`Drag-drop rescheduling: ${scheduleId}`);

      let query = 'UPDATE scheduled_content SET ';
      const params = [];
      let paramCount = 1;

      if (newScheduledTime) {
        query += `scheduled_time = $${paramCount++}, `;
        params.push(newScheduledTime);
      }

      if (newPlatforms) {
        query += `platforms = $${paramCount++}, `;
        params.push(JSON.stringify(newPlatforms));
      }

      query += `updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount}`;
      params.push(scheduleId);

      const result = await pool.query(query, params);

      if (result.rowCount === 0) {
        throw new Error('Schedule not found');
      }

      logger.info(`✓ Drag-drop reschedule completed: ${scheduleId}`);
      return { success: true, id: scheduleId };
    } catch (error) {
      logger.error('Drag-drop reschedule failed:', error.message);
      throw error;
    }
  },

  // Delete schedule
  async deleteSchedule(scheduleId) {
    try {
      logger.info(`Deleting schedule ${scheduleId}`);

      const result = await pool.query('DELETE FROM scheduled_content WHERE id = $1 RETURNING id', [
        scheduleId,
      ]);

      if (result.rows.length === 0) {
        throw new Error('Schedule not found');
      }

      logger.info(`✓ Schedule deleted: ${scheduleId}`);
      return { deleted: true };
    } catch (error) {
      logger.error('Delete schedule failed:', error.message);
      throw error;
    }
  },

  // Get upcoming events
  async getUpcomingEvents(userId, daysAhead = 30) {
    try {
      const result = await pool.query(
        `SELECT sc.*, c.title, c.content
         FROM scheduled_content sc
         JOIN content c ON sc.content_id = c.id
         WHERE sc.user_id = $1
         AND sc.status = 'pending'
         AND sc.scheduled_time >= NOW()
         AND sc.scheduled_time <= NOW() + INTERVAL '${daysAhead} days'
         ORDER BY sc.scheduled_time ASC`,
        [userId]
      );

      return result.rows.map((row) => ({
        ...row,
        platforms: JSON.parse(row.platforms),
      }));
    } catch (error) {
      logger.error('Get upcoming events failed:', error.message);
      throw error;
    }
  },

  // Get past events
  async getPastEvents(userId, daysBack = 30) {
    try {
      const result = await pool.query(
        `SELECT sc.*, c.title, c.content
         FROM scheduled_content sc
         JOIN content c ON sc.content_id = c.id
         WHERE sc.user_id = $1
         AND sc.status = 'published'
         AND sc.scheduled_time < NOW()
         AND sc.scheduled_time >= NOW() - INTERVAL '${daysBack} days'
         ORDER BY sc.scheduled_time DESC`,
        [userId]
      );

      return result.rows.map((row) => ({
        ...row,
        platforms: JSON.parse(row.platforms),
      }));
    } catch (error) {
      logger.error('Get past events failed:', error.message);
      throw error;
    }
  },

  // Update publish status
  async updatePublishStatus(scheduleId, status) {
    try {
      logger.info(`Updating status for schedule ${scheduleId} to ${status}`);

      const result = await pool.query(
        `UPDATE scheduled_content
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [status, scheduleId]
      );

      if (result.rows.length === 0) {
        throw new Error('Schedule not found');
      }

      logger.info(`✓ Status updated: ${scheduleId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Update status failed:', error.message);
      throw error;
    }
  },

  // Bulk reschedule
  async bulkReschedule(scheduleIds, daysOffset) {
    try {
      logger.info(`Bulk rescheduling ${scheduleIds.length} items with offset ${daysOffset} days`);

      const result = await pool.query(
        `UPDATE scheduled_content
         SET scheduled_time = scheduled_time + INTERVAL '${daysOffset} days',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ANY($1::int[])
         RETURNING id`,
        [scheduleIds]
      );

      logger.info(`✓ Bulk reschedule completed: ${result.rows.length} items`);
      return {
        updated: result.rows.length,
        ids: result.rows.map((r) => r.id),
      };
    } catch (error) {
      logger.error('Bulk reschedule failed:', error.message);
      throw error;
    }
  },

  // Get calendar analytics
  async getCalendarAnalytics(userId, startDate, endDate) {
    try {
      const result = await pool.query(
        `SELECT
           COUNT(*) as total_scheduled,
           COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
           COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
           COUNT(DISTINCT c.platform) as platforms_covered,
           AVG(ARRAY_LENGTH(STRING_TO_ARRAY(sc.platforms, ','), 1)) as avg_platforms_per_content
         FROM scheduled_content sc
         JOIN content c ON sc.content_id = c.id
         WHERE sc.user_id = $1
         AND sc.scheduled_time >= $2
         AND sc.scheduled_time <= $3`,
        [userId, startDate, endDate]
      );

      const stats = result.rows[0];
      return {
        totalScheduled: parseInt(stats.total_scheduled),
        published: parseInt(stats.published),
        pending: parseInt(stats.pending),
        platformsCovered: parseInt(stats.platforms_covered),
        avgPlatformsPerContent: (stats.avg_platforms_per_content || 0).toFixed(1),
      };
    } catch (error) {
      logger.error('Get calendar analytics failed:', error.message);
      throw error;
    }
  },
};

export default contentCalendarService;
