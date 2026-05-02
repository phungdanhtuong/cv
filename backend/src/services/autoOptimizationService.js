import { logger } from '../utils/logger.js';
import pool from '../config/database.js';
import metaAdsService from './metaAdsService.js';
import googleAdsService from './googleAdsService.js';
import linkedinAdsService from './linkedinAdsService.js';
import tiktokAdsService from './tiktokAdsService.js';

export const autoOptimizationService = {
  // Main optimization loop
  async runOptimizations() {
    try {
      logger.info('Starting auto-optimization cycle...');

      // Get all active campaigns
      const campaigns = await pool.query(
        `SELECT * FROM campaigns
         WHERE status = 'active' AND platform IN ('facebook', 'google', 'linkedin', 'tiktok')`
      );

      logger.info(`Running optimizations for ${campaigns.rows.length} campaigns`);

      const results = {
        total: campaigns.rows.length,
        optimized: 0,
        failures: [],
      };

      for (const campaign of campaigns.rows) {
        try {
          await this.optimizeCampaign(campaign);
          results.optimized++;
        } catch (error) {
          logger.error(`Optimization failed for campaign ${campaign.id}:`, error.message);
          results.failures.push({ campaignId: campaign.id, error: error.message });
        }
      }

      logger.info(`✓ Optimization cycle complete: ${results.optimized} successful`);
      return results;
    } catch (error) {
      logger.error('Auto-optimization failed:', error.message);
      throw error;
    }
  },

  async optimizeCampaign(campaign) {
    try {
      logger.info(`Optimizing campaign ${campaign.id} (${campaign.platform})`);

      // Get metrics
      const metrics = await this.getCampaignMetrics(campaign);

      // Analyze performance
      const analysis = this.analyzePerformance(metrics, campaign);

      // Generate recommendations
      const recommendations = this.generateRecommendations(analysis, campaign);

      // Apply optimizations
      if (recommendations.shouldOptimize) {
        await this.applyOptimizations(campaign, recommendations);
      }

      // Log optimization
      await pool.query(
        `INSERT INTO optimization_history (campaign_id, action, before_metrics, after_metrics, timestamp)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [
          campaign.id,
          JSON.stringify(recommendations.actions),
          JSON.stringify(metrics),
          JSON.stringify(analysis),
        ]
      );

      logger.info(`✓ Campaign ${campaign.id} optimized`);
      return { campaign: campaign.id, recommendations };
    } catch (error) {
      logger.error('Campaign optimization failed:', error.message);
      throw error;
    }
  },

  async getCampaignMetrics(campaign) {
    try {
      const metaData = campaign.performance_data || {};

      switch (campaign.platform) {
        case 'facebook':
          if (metaData.metaCampaignId) {
            return await metaAdsService.getPerformanceMetrics(metaData.metaCampaignId);
          }
          break;
        case 'google':
          // Placeholder - would need actual implementation
          return { impressions: 1000, clicks: 50, spend: 100 };
        case 'linkedin':
          // Placeholder
          return { impressions: 500, clicks: 25, spend: 50 };
        case 'tiktok':
          // Placeholder
          return { impressions: 2000, clicks: 100, spend: 80 };
      }

      return {};
    } catch (error) {
      logger.error('Get metrics failed:', error.message);
      return {};
    }
  },

  analyzePerformance(metrics, campaign) {
    // Calculate KPIs
    const impressions = metrics.impressions || 0;
    const clicks = metrics.clicks || 0;
    const spend = (metrics.spend || 0) / 100; // Convert cents to dollars
    const conversions = metrics.conversions || 0;

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpa = conversions > 0 ? spend / conversions : 0;

    const roi = spend > 0 ? ((metrics.revenue || 0) - spend) / spend * 100 : 0;

    return {
      ctr,
      cpc,
      cpa,
      roi,
      impressions,
      clicks,
      conversions,
      spend,
      quality_score: this.calculateQualityScore({ ctr, cpc, roi }),
    };
  },

  calculateQualityScore(metrics) {
    // Score out of 100
    let score = 50;

    // CTR impact
    if (metrics.ctr > 5) score += 20;
    else if (metrics.ctr > 2) score += 10;
    else if (metrics.ctr < 0.5) score -= 20;

    // CPC impact
    if (metrics.cpc < 0.5) score += 15;
    else if (metrics.cpc > 2) score -= 15;

    // ROI impact
    if (metrics.roi > 100) score += 15;
    else if (metrics.roi < 0) score -= 20;

    return Math.max(0, Math.min(100, score));
  },

  generateRecommendations(analysis, campaign) {
    const recommendations = {
      shouldOptimize: false,
      actions: [],
      confidence: 0,
    };

    // Low CTR - pause or reduce budget
    if (analysis.ctr < 1) {
      recommendations.actions.push({
        type: 'PAUSE_OR_REDUCE',
        reason: 'Low CTR',
        value: 'pause_if_negative_roi',
      });
      recommendations.shouldOptimize = true;
      recommendations.confidence += 30;
    }

    // High CPC - increase bid or improve targeting
    if (analysis.cpc > 1.5) {
      recommendations.actions.push({
        type: 'IMPROVE_TARGETING',
        reason: 'High CPC',
        value: 'refine_audience',
      });
      recommendations.shouldOptimize = true;
      recommendations.confidence += 25;
    }

    // Good ROI - increase budget
    if (analysis.roi > 50 && analysis.ctr > 2) {
      recommendations.actions.push({
        type: 'INCREASE_BUDGET',
        reason: 'Strong performance',
        percentage: 20,
      });
      recommendations.shouldOptimize = true;
      recommendations.confidence += 40;
    }

    // Quality score is good - maintain
    if (analysis.quality_score > 75) {
      recommendations.actions.push({
        type: 'MAINTAIN',
        reason: 'Strong quality score',
      });
    }

    return recommendations;
  },

  async applyOptimizations(campaign, recommendations) {
    try {
      logger.info(`Applying ${recommendations.actions.length} optimizations to campaign ${campaign.id}`);

      for (const action of recommendations.actions) {
        switch (action.type) {
          case 'PAUSE_OR_REDUCE':
            if (recommendations.confidence > 75) {
              await this.pauseCampaign(campaign);
              logger.info('✓ Campaign paused due to poor performance');
            }
            break;

          case 'IMPROVE_TARGETING':
            logger.info('✓ Targeting improvement recommended (manual review needed)');
            break;

          case 'INCREASE_BUDGET':
            await this.increaseBudget(campaign, action.percentage);
            logger.info(`✓ Budget increased by ${action.percentage}%`);
            break;

          case 'MAINTAIN':
            logger.info('✓ Campaign maintaining current settings');
            break;
        }
      }
    } catch (error) {
      logger.error('Apply optimizations failed:', error.message);
      throw error;
    }
  },

  async pauseCampaign(campaign) {
    try {
      await pool.query(
        `UPDATE campaigns SET status = $1 WHERE id = $2`,
        ['paused', campaign.id]
      );

      // Also pause on platform
      if (campaign.performance_data?.metaCampaignId && campaign.platform === 'facebook') {
        await metaAdsService.pauseCampaign(campaign.performance_data.metaCampaignId);
      }
    } catch (error) {
      logger.error('Pause campaign failed:', error.message);
    }
  },

  async increaseBudget(campaign, percentageIncrease) {
    try {
      const newBudget = campaign.budget * (1 + percentageIncrease / 100);

      await pool.query(
        `UPDATE campaigns SET budget = $1 WHERE id = $2`,
        [newBudget, campaign.id]
      );

      logger.info(`Budget increased from $${campaign.budget} to $${newBudget.toFixed(2)}`);
    } catch (error) {
      logger.error('Increase budget failed:', error.message);
    }
  },

  // Generate predictive insights
  async generatePredictions(userId) {
    try {
      logger.info(`Generating predictions for user ${userId}`);

      const campaigns = await pool.query(
        'SELECT * FROM campaigns WHERE user_id = $1 AND status = "active"',
        [userId]
      );

      const predictions = [];

      for (const campaign of campaigns.rows) {
        const metrics = await this.getCampaignMetrics(campaign);
        const analysis = this.analyzePerformance(metrics, campaign);

        // Simple trend prediction
        const prediction = {
          campaignId: campaign.id,
          nextWeekROI: this.predictROI(analysis),
          riskLevel: analysis.quality_score > 75 ? 'LOW' : analysis.quality_score > 50 ? 'MEDIUM' : 'HIGH',
          recommendation: this.getTopRecommendation(analysis),
        };

        predictions.push(prediction);
      }

      return predictions;
    } catch (error) {
      logger.error('Generate predictions failed:', error.message);
      throw error;
    }
  },

  predictROI(analysis) {
    // Simple linear prediction based on current trend
    const baseROI = analysis.roi || 0;
    const trend = analysis.quality_score > 75 ? 1.1 : analysis.quality_score > 50 ? 0.95 : 0.8;
    return Math.round(baseROI * trend);
  },

  getTopRecommendation(analysis) {
    if (analysis.quality_score > 75) return 'Increase budget - strong performance';
    if (analysis.roi < 0) return 'Pause campaign - negative ROI';
    if (analysis.ctr < 1) return 'Improve targeting or creative';
    return 'Maintain current settings';
  },
};

export default autoOptimizationService;
