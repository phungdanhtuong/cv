import { logger } from '../utils/logger.js';
import pool from '../config/database.js';

export const abTestingService = {
  // Create A/B test
  async createABTest(userId, campaignId, testConfig) {
    try {
      logger.info(`Creating A/B test for campaign ${campaignId}`);

      const result = await pool.query(
        `INSERT INTO ab_tests (user_id, campaign_id, variation_a_id, variation_b_id, status)
         VALUES ($1, $2, $3, $4, 'active')
         RETURNING *`,
        [userId, campaignId, testConfig.variationAId, testConfig.variationBId]
      );

      logger.info(`✓ A/B test created: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Create A/B test failed:', error.message);
      throw error;
    }
  },

  // Get A/B test details
  async getABTest(testId) {
    try {
      const result = await pool.query('SELECT * FROM ab_tests WHERE id = $1', [testId]);

      if (result.rows.length === 0) {
        throw new Error('A/B test not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Get A/B test failed:', error.message);
      throw error;
    }
  },

  // Record variation metrics
  async recordVariationMetrics(testId, variationId, metrics) {
    try {
      logger.info(`Recording metrics for variation ${variationId} in test ${testId}`);

      // Get current test
      const test = await this.getABTest(testId);

      // Determine which variation this is
      const isVariationA = variationId === test.variation_a_id;

      // Store metrics in JSONB field
      const metricsKey = isVariationA ? 'metrics_a' : 'metrics_b';
      const updateQuery = `
        UPDATE ab_tests
        SET ${metricsKey} = $1
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [JSON.stringify(metrics), testId]);

      logger.info(`✓ Metrics recorded for variation ${variationId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Record metrics failed:', error.message);
      throw error;
    }
  },

  // Analyze A/B test
  async analyzeABTest(testId) {
    try {
      logger.info(`Analyzing A/B test ${testId}`);

      const test = await this.getABTest(testId);

      // Parse metrics
      const metricsA = test.metrics_a || {};
      const metricsB = test.metrics_b || {};

      // Calculate statistics
      const analysis = {
        testId,
        variationA: {
          id: test.variation_a_id,
          metrics: metricsA,
          engagement: metricsA.engagements || 0,
          clicks: metricsA.clicks || 0,
          impressions: metricsA.impressions || 0,
          conversions: metricsA.conversions || 0,
        },
        variationB: {
          id: test.variation_b_id,
          metrics: metricsB,
          engagement: metricsB.engagements || 0,
          clicks: metricsB.clicks || 0,
          impressions: metricsB.impressions || 0,
          conversions: metricsB.conversions || 0,
        },
      };

      // Calculate rates
      const aClickRate = metricsA.clicks / metricsA.impressions || 0;
      const bClickRate = metricsB.clicks / metricsB.impressions || 0;
      const aConversionRate = metricsA.conversions / metricsA.clicks || 0;
      const bConversionRate = metricsB.conversions / metricsB.clicks || 0;

      analysis.comparison = {
        clickRateDifference: ((bClickRate - aClickRate) / aClickRate * 100).toFixed(2) + '%',
        conversionRateDifference:
          ((bConversionRate - aConversionRate) / aConversionRate * 100).toFixed(2) + '%',
        winner: bClickRate > aClickRate ? 'B' : aClickRate > bClickRate ? 'A' : 'TIE',
        confidence: this.calculateConfidence(analysis.variationA, analysis.variationB),
        recommendation: this.getRecommendation(analysis),
      };

      return analysis;
    } catch (error) {
      logger.error('Analyze A/B test failed:', error.message);
      throw error;
    }
  },

  // Declare winner
  async declareWinner(testId, winner) {
    try {
      logger.info(`Declaring winner for test ${testId}: ${winner}`);

      if (!['A', 'B'].includes(winner)) {
        throw new Error('Winner must be A or B');
      }

      const result = await pool.query(
        `UPDATE ab_tests
         SET winner = $1, status = 'completed', updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [winner, testId]
      );

      logger.info(`✓ Winner declared for test ${testId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Declare winner failed:', error.message);
      throw error;
    }
  },

  // Get active tests for campaign
  async getActiveCampaignTests(campaignId) {
    try {
      const result = await pool.query(
        `SELECT * FROM ab_tests
         WHERE campaign_id = $1 AND status = 'active'
         ORDER BY created_at DESC`,
        [campaignId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Get active tests failed:', error.message);
      throw error;
    }
  },

  // Get test history
  async getTestHistory(userId, limit = 20) {
    try {
      const result = await pool.query(
        `SELECT * FROM ab_tests
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
      );

      return result.rows;
    } catch (error) {
      logger.error('Get test history failed:', error.message);
      throw error;
    }
  },

  // Calculate confidence level
  calculateConfidence(varA, varB) {
    const aTotal = varA.impressions || 1;
    const bTotal = varB.impressions || 1;

    if (aTotal < 100 || bTotal < 100) {
      return 'Low (< 100 samples)';
    } else if (aTotal < 1000 || bTotal < 1000) {
      return 'Medium (100-1000 samples)';
    } else {
      return 'High (> 1000 samples)';
    }
  },

  // Get recommendation
  getRecommendation(analysis) {
    const aRate = (analysis.variationA.clicks / analysis.variationA.impressions) || 0;
    const bRate = (analysis.variationB.clicks / analysis.variationB.impressions) || 0;
    const difference = Math.abs(bRate - aRate) / (aRate || 0.001) * 100;

    if (difference < 5) {
      return 'Variations are too similar. Continue testing.';
    } else if (difference < 10) {
      return 'Variation B shows slight improvement. Monitor further.';
    } else {
      return 'Variation B shows significant improvement. Consider adopting.';
    }
  },

  // Run multivariate test
  async runMultivariateTest(userId, campaignId, variants) {
    try {
      logger.info(`Creating multivariate test for campaign ${campaignId}`);

      const testIds = [];

      // Create pairwise A/B tests
      for (let i = 0; i < variants.length; i++) {
        for (let j = i + 1; j < variants.length; j++) {
          const result = await pool.query(
            `INSERT INTO ab_tests (user_id, campaign_id, variation_a_id, variation_b_id, status)
             VALUES ($1, $2, $3, $4, 'active')
             RETURNING id`,
            [userId, campaignId, variants[i].id, variants[j].id]
          );

          testIds.push(result.rows[0].id);
        }
      }

      logger.info(`✓ Multivariate test created with ${testIds.length} comparisons`);
      return {
        testCount: testIds.length,
        testIds,
        variants: variants.length,
      };
    } catch (error) {
      logger.error('Run multivariate test failed:', error.message);
      throw error;
    }
  },

  // Get statistics summary
  async getStatisticsSummary(userId) {
    try {
      const result = await pool.query(
        `SELECT
           COUNT(*) as total_tests,
           COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tests,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tests
         FROM ab_tests
         WHERE user_id = $1`,
        [userId]
      );

      const stats = result.rows[0];

      // Calculate average improvement
      const improvementResult = await pool.query(
        `SELECT AVG(
           CASE
             WHEN winner = 'B' THEN 10
             WHEN winner = 'A' THEN -10
             ELSE 0
           END
         ) as avg_improvement
         FROM ab_tests
         WHERE user_id = $1 AND status = 'completed'`,
        [userId]
      );

      return {
        totalTests: parseInt(stats.total_tests),
        activeTests: parseInt(stats.active_tests),
        completedTests: parseInt(stats.completed_tests),
        averageImprovement: (improvementResult.rows[0]?.avg_improvement || 0).toFixed(2) + '%',
      };
    } catch (error) {
      logger.error('Get statistics summary failed:', error.message);
      throw error;
    }
  },
};

export default abTestingService;
