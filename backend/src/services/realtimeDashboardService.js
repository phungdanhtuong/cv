import { logger } from '../utils/logger.js';
import pool from '../config/database.js';

class RealtimeDashboardService {
  constructor() {
    this.subscribers = new Map();
    this.channels = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 1000;
  }

  // Subscribe to channel
  subscribe(userId, channel, ws) {
    const channelKey = `${userId}:${channel}`;

    if (!this.subscribers.has(channelKey)) {
      this.subscribers.set(channelKey, new Set());
    }

    this.subscribers.get(channelKey).add(ws);
    logger.info(`User ${userId} subscribed to ${channel}`);

    // Send initial data
    this.sendHistoryToClient(ws, channel);

    return () => {
      this.subscribers.get(channelKey).delete(ws);
      if (this.subscribers.get(channelKey).size === 0) {
        this.subscribers.delete(channelKey);
      }
    };
  }

  // Broadcast message to subscribers
  broadcast(userId, channel, data) {
    const channelKey = `${userId}:${channel}`;

    if (this.subscribers.has(channelKey)) {
      const message = JSON.stringify({
        type: 'update',
        channel,
        data,
        timestamp: new Date(),
      });

      this.subscribers.get(channelKey).forEach((ws) => {
        if (ws.readyState === 1) {
          ws.send(message);
        }
      });
    }

    // Store in history
    this.addToHistory({
      channel,
      userId,
      data,
      timestamp: new Date(),
    });
  }

  // Send history to new client
  sendHistoryToClient(ws, channel) {
    const relevantHistory = this.eventHistory.filter((e) => e.channel === channel).slice(-50);

    const message = JSON.stringify({
      type: 'history',
      channel,
      data: relevantHistory,
    });

    if (ws.readyState === 1) {
      ws.send(message);
    }
  }

  // Add event to history
  addToHistory(event) {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  // Get active subscribers count
  getActiveSubscribers(userId, channel) {
    const channelKey = `${userId}:${channel}`;
    return this.subscribers.has(channelKey) ? this.subscribers.get(channelKey).size : 0;
  }

  // Get campaign metrics update
  async getCampaignMetrics(userId, campaignId) {
    try {
      const result = await pool.query(
        `SELECT * FROM campaigns WHERE id = $1 AND user_id = $2`,
        [campaignId, userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const campaign = result.rows[0];

      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        budget: campaign.budget,
        platform: campaign.platform,
        performanceData: campaign.performance_data,
        updatedAt: campaign.updated_at,
      };
    } catch (error) {
      logger.error('Get campaign metrics failed:', error.message);
      throw error;
    }
  }

  // Get content metrics update
  async getContentMetrics(userId, contentId) {
    try {
      const result = await pool.query(
        `SELECT c.*,
                COUNT(DISTINCT CASE WHEN a.type = 'content' AND a.entity_id = c.id THEN 1 END) as total_analytics
         FROM content c
         LEFT JOIN analytics a ON a.entity_id = c.id AND a.entity_type = 'content'
         WHERE c.id = $1 AND c.user_id = $2
         GROUP BY c.id`,
        [contentId, userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Get content metrics failed:', error.message);
      throw error;
    }
  }

  // Get agent execution status
  async getAgentExecutionStatus(userId, agentId) {
    try {
      // Get recent agent executions
      const result = await pool.query(
        `SELECT * FROM agent_executions
         WHERE user_id = $1 AND agent_id = $2
         ORDER BY created_at DESC
         LIMIT 10`,
        [userId, agentId]
      );

      return {
        agentId,
        recentExecutions: result.rows,
        status: result.rows.length > 0 ? result.rows[0].status : 'idle',
      };
    } catch (error) {
      logger.error('Get execution status failed:', error.message);
      return { agentId, status: 'unknown', recentExecutions: [] };
    }
  }

  // Get dashboard summary
  async getDashboardSummary(userId) {
    try {
      // Get content stats
      const contentResult = await pool.query(
        `SELECT COUNT(*) as total,
                COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft
         FROM content WHERE user_id = $1`,
        [userId]
      );

      // Get campaign stats
      const campaignResult = await pool.query(
        `SELECT COUNT(*) as total,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                SUM(budget) as total_budget
         FROM campaigns WHERE user_id = $1`,
        [userId]
      );

      // Get scheduled content
      const scheduledResult = await pool.query(
        `SELECT COUNT(*) as total,
                COUNT(CASE WHEN scheduled_time <= NOW() + INTERVAL '7 days' THEN 1 END) as upcoming_week
         FROM scheduled_content WHERE user_id = $1 AND status = 'pending'`,
        [userId]
      );

      return {
        content: contentResult.rows[0],
        campaigns: campaignResult.rows[0],
        scheduledContent: scheduledResult.rows[0],
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Get dashboard summary failed:', error.message);
      return {
        content: { total: 0, published: 0, draft: 0 },
        campaigns: { total: 0, active: 0, total_budget: 0 },
        scheduledContent: { total: 0, upcoming_week: 0 },
      };
    }
  }

  // Get analytics update
  async getAnalyticsUpdate(userId, startDate, endDate) {
    try {
      const result = await pool.query(
        `SELECT
           a.entity_type,
           SUM((a.metric_data->'clicks')::int) as total_clicks,
           SUM((a.metric_data->'impressions')::int) as total_impressions,
           SUM((a.metric_data->'conversions')::int) as total_conversions,
           AVG((a.metric_data->'engagement_rate')::float) as avg_engagement_rate
         FROM analytics a
         WHERE a.user_id = $1
         AND a.date >= $2::date
         AND a.date <= $3::date
         GROUP BY a.entity_type`,
        [userId, startDate, endDate]
      );

      return {
        byEntityType: result.rows,
        period: { startDate, endDate },
        updatedAt: new Date(),
      };
    } catch (error) {
      logger.error('Get analytics failed:', error.message);
      return { byEntityType: [], period: { startDate, endDate } };
    }
  }

  // Get team activity
  async getTeamActivity(teamId, limit = 50) {
    try {
      const result = await pool.query(
        `SELECT
           'content_created' as activity_type,
           u.email as user,
           c.title as details,
           c.created_at as timestamp
         FROM content c
         JOIN users u ON c.user_id = u.id
         WHERE c.user_id IN (
           SELECT user_id FROM team_members WHERE team_id = $1
         )
         UNION ALL
         SELECT
           'campaign_created' as activity_type,
           u.email as user,
           ca.name as details,
           ca.created_at as timestamp
         FROM campaigns ca
         JOIN users u ON ca.user_id = u.id
         WHERE ca.user_id IN (
           SELECT user_id FROM team_members WHERE team_id = $1
         )
         ORDER BY timestamp DESC
         LIMIT $2`,
        [teamId, limit]
      );

      return result.rows;
    } catch (error) {
      logger.error('Get team activity failed:', error.message);
      return [];
    }
  }

  // Emit agent status change
  emitAgentStatus(userId, agentId, status, details) {
    this.broadcast(userId, 'agents', {
      event: 'status_change',
      agentId,
      status,
      details,
    });
  }

  // Emit campaign update
  emitCampaignUpdate(userId, campaignId, update) {
    this.broadcast(userId, 'campaigns', {
      event: 'campaign_update',
      campaignId,
      ...update,
    });
  }

  // Emit content update
  emitContentUpdate(userId, contentId, update) {
    this.broadcast(userId, 'content', {
      event: 'content_update',
      contentId,
      ...update,
    });
  }

  // Emit analytics update
  emitAnalyticsUpdate(userId, analyticsData) {
    this.broadcast(userId, 'analytics', {
      event: 'metrics_update',
      data: analyticsData,
    });
  }

  // Emit team activity
  emitTeamActivity(teamId, activity) {
    // Broadcast to all team members
    this.broadcast(teamId, 'team-activity', {
      event: 'activity',
      ...activity,
    });
  }

  // Get live stats
  async getLiveStats(userId) {
    return {
      onlineUsers: Array.from(new Map([...this.subscribers.entries()]))
        .filter(([key]) => key.startsWith(userId))
        .reduce((sum, [, set]) => sum + set.size, 0),
      activeChannels: Array.from(this.subscribers.keys()).filter((key) =>
        key.startsWith(userId)
      ).length,
      eventsInHistory: this.eventHistory.filter((e) => e.userId === userId).length,
    };
  }

  // Clear old events
  clearOldEvents(daysOld = 7) {
    const cutoffTime = new Date();
    cutoffTime.setDate(cutoffTime.getDate() - daysOld);

    const initialLength = this.eventHistory.length;
    this.eventHistory = this.eventHistory.filter((e) => new Date(e.timestamp) > cutoffTime);

    logger.info(
      `Cleared ${initialLength - this.eventHistory.length} events older than ${daysOld} days`
    );
  }
}

export const realtimeDashboardService = new RealtimeDashboardService();
export default realtimeDashboardService;
