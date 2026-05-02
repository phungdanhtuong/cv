import { extractUserId } from '../middleware/auth.js';
import express from 'express';
import contentCalendarService from '../services/contentCalendarService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(extractUserId);

// Add content to calendar
router.post('/add', async (req, res) => {
  try {
    const { userId, contentId, scheduledTime, platforms, timezone } = req.body;

    if (!userId || !contentId || !scheduledTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await contentCalendarService.addToCalendar(
      userId,
      contentId,
      scheduledTime,
      platforms,
      timezone
    );

    res.status(201).json({
      success: true,
      event: result,
    });
  } catch (error) {
    logger.error('Add to calendar error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get calendar events for date range
router.get('/range', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const events = await contentCalendarService.getCalendarEvents(userId, startDate, endDate);

    res.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error) {
    logger.error('Get calendar events error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get calendar by month
router.get('/month/:userId/:year/:month', async (req, res) => {
  try {
    const { userId, year, month } = req.params;

    const events = await contentCalendarService.getCalendarByMonth(userId, year, month);

    res.json({
      success: true,
      month,
      year,
      events,
    });
  } catch (error) {
    logger.error('Get calendar by month error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get calendar by week
router.get('/week/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { weekStart } = req.query;

    if (!weekStart) {
      return res.status(400).json({ error: 'weekStart parameter required' });
    }

    const events = await contentCalendarService.getCalendarByWeek(userId, new Date(weekStart));

    res.json({
      success: true,
      weekStart,
      events,
    });
  } catch (error) {
    logger.error('Get calendar by week error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Reschedule content
router.post('/reschedule/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { scheduledTime } = req.body;

    if (!scheduledTime) {
      return res.status(400).json({ error: 'scheduledTime is required' });
    }

    const result = await contentCalendarService.rescheduleContent(scheduleId, scheduledTime);

    res.json({
      success: true,
      event: result,
    });
  } catch (error) {
    logger.error('Reschedule error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Drag-drop reschedule
router.post('/drag-drop/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { scheduledTime, platforms } = req.body;

    const result = await contentCalendarService.dragDropReschedule(
      scheduleId,
      scheduledTime,
      platforms
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Drag-drop error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete schedule
router.delete('/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const result = await contentCalendarService.deleteSchedule(scheduleId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Delete schedule error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming events
router.get('/upcoming/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { daysAhead } = req.query;

    const events = await contentCalendarService.getUpcomingEvents(
      userId,
      daysAhead ? parseInt(daysAhead) : 30
    );

    res.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error) {
    logger.error('Get upcoming events error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get past events
router.get('/past/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { daysBack } = req.query;

    const events = await contentCalendarService.getPastEvents(
      userId,
      daysBack ? parseInt(daysBack) : 30
    );

    res.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error) {
    logger.error('Get past events error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update publish status
router.post('/:scheduleId/status', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const result = await contentCalendarService.updatePublishStatus(scheduleId, status);

    res.json({
      success: true,
      event: result,
    });
  } catch (error) {
    logger.error('Update status error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Bulk reschedule
router.post('/bulk/reschedule', async (req, res) => {
  try {
    const { scheduleIds, daysOffset } = req.body;

    if (!scheduleIds || !Array.isArray(scheduleIds) || daysOffset === undefined) {
      return res.status(400).json({ error: 'scheduleIds array and daysOffset required' });
    }

    const result = await contentCalendarService.bulkReschedule(scheduleIds, daysOffset);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Bulk reschedule error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get calendar analytics
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate required' });
    }

    const analytics = await contentCalendarService.getCalendarAnalytics(
      userId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    logger.error('Get analytics error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
