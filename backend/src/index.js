import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import pool from './config/database.js';
import setupWebSocketServer from './config/websocket.js';

const app = express();
const server = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontend.url,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'AI Social Media Agents Platform API',
    version: '0.1.0',
    status: 'running',
  });
});

// Routes
import authRoutes from './routes/auth.js';
import agentRoutes from './routes/agents.js';
import contentRoutes from './routes/content.js';
import adsRoutes from './routes/ads.js';
import analyticsRoutes from './routes/analytics.js';
import schedulingRoutes from './routes/scheduling.js';
import optimizationRoutes from './routes/optimization.js';
import agentManagementRoutes from './routes/agentManagement.js';
import abTestingRoutes from './routes/abTesting.js';
import contentCalendarRoutes from './routes/contentCalendar.js';
import teamCollaborationRoutes from './routes/teamCollaboration.js';
import dashboardRoutes from './routes/dashboard.js';

app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/optimization', optimizationRoutes);
app.use('/api/agent-management', agentManagementRoutes);
app.use('/api/ab-tests', abTestingRoutes);
app.use('/api/calendar', contentCalendarRoutes);
app.use('/api/team', teamCollaborationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Setup WebSocket
const wss = setupWebSocketServer(server);
logger.info('WebSocket server configured');

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Visit http://localhost:${PORT} to test`);
  logger.info(`WebSocket available at ws://localhost:${PORT}`);
});

export default app;
