import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import pool from './config/database.js';

const app = express();

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
import agentRoutes from './routes/agents.js';
import contentRoutes from './routes/content.js';
import adsRoutes from './routes/ads.js';
import analyticsRoutes from './routes/analytics.js';
import schedulingRoutes from './routes/scheduling.js';
import optimizationRoutes from './routes/optimization.js';
import agentManagementRoutes from './routes/agentManagement.js';

app.use('/api/agents', agentRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/optimization', optimizationRoutes);
app.use('/api/agent-management', agentManagementRoutes);

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

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Visit http://localhost:${PORT} to test`);
});

export default app;
