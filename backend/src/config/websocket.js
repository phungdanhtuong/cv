import { WebSocketServer } from 'ws';
import { logger } from '../utils/logger.js';
import realtimeDashboardService from '../services/realtimeDashboardService.js';

export function setupWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    logger.info('New WebSocket client connected');

    let userId = null;
    let unsubscribes = [];

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);

        switch (data.type) {
          case 'auth':
            userId = data.userId;
            logger.info(`Client authenticated as user ${userId}`);
            ws.send(
              JSON.stringify({
                type: 'auth_success',
                userId,
              })
            );
            break;

          case 'subscribe':
            if (!userId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
              break;
            }

            const unsubscribe = realtimeDashboardService.subscribe(userId, data.channel, ws);
            unsubscribes.push(unsubscribe);

            ws.send(
              JSON.stringify({
                type: 'subscribed',
                channel: data.channel,
              })
            );

            logger.info(`User ${userId} subscribed to ${data.channel}`);
            break;

          case 'unsubscribe':
            logger.info(`User ${userId} unsubscribed from ${data.channel}`);
            break;

          case 'get_summary':
            if (!userId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
              break;
            }

            const summary = await realtimeDashboardService.getDashboardSummary(userId);
            ws.send(
              JSON.stringify({
                type: 'dashboard_summary',
                data: summary,
              })
            );
            break;

          case 'get_metrics':
            if (!userId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
              break;
            }

            if (data.campaignId) {
              const metrics = await realtimeDashboardService.getCampaignMetrics(
                userId,
                data.campaignId
              );
              ws.send(
                JSON.stringify({
                  type: 'campaign_metrics',
                  data: metrics,
                })
              );
            } else if (data.contentId) {
              const metrics = await realtimeDashboardService.getContentMetrics(userId, data.contentId);
              ws.send(
                JSON.stringify({
                  type: 'content_metrics',
                  data: metrics,
                })
              );
            }
            break;

          case 'get_analytics':
            if (!userId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
              break;
            }

            const analytics = await realtimeDashboardService.getAnalyticsUpdate(
              userId,
              data.startDate,
              data.endDate
            );
            ws.send(
              JSON.stringify({
                type: 'analytics_update',
                data: analytics,
              })
            );
            break;

          case 'get_live_stats':
            if (!userId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
              break;
            }

            const stats = await realtimeDashboardService.getLiveStats(userId);
            ws.send(
              JSON.stringify({
                type: 'live_stats',
                data: stats,
              })
            );
            break;

          case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
            break;

          default:
            logger.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        logger.error('WebSocket error:', error.message);
        ws.send(
          JSON.stringify({
            type: 'error',
            message: error.message,
          })
        );
      }
    });

    ws.on('close', () => {
      // Unsubscribe from all channels
      unsubscribes.forEach((unsub) => unsub());
      logger.info(`User ${userId} disconnected`);
    });

    ws.on('error', (error) => {
      logger.error('WebSocket error:', error.message);
    });
  });

  return wss;
}

export default setupWebSocketServer;
