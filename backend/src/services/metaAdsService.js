import axios from 'axios';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

const MCP_ENDPOINT = config.metaAdsMcp.endpoint;

export const metaAdsService = {
  // Helper to make MCP calls
  async callMcpTool(toolName, params) {
    try {
      const response = await axios.post(`${MCP_ENDPOINT}/tools/${toolName}`, params, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      return response.data;
    } catch (error) {
      logger.error(`MCP tool ${toolName} failed:`, error.message);
      throw error;
    }
  },

  // Campaign management
  async createCampaign(adAccountId, campaignConfig) {
    try {
      logger.info(`Creating campaign for account ${adAccountId}`);

      const result = await this.callMcpTool('create_campaign', {
        ad_account_id: adAccountId,
        name: campaignConfig.name,
        objective: campaignConfig.objective || 'REACH',
        status: campaignConfig.status || 'PAUSED',
        daily_budget: campaignConfig.dailyBudget,
        lifetime_budget: campaignConfig.lifetimeBudget,
      });

      logger.info(`✓ Campaign created: ${result.campaign_id}`);
      return result;
    } catch (error) {
      logger.error('Campaign creation failed:', error.message);
      throw error;
    }
  },

  async updateCampaign(campaignId, updates) {
    try {
      logger.info(`Updating campaign ${campaignId}`);

      const result = await this.callMcpTool('update_campaign', {
        campaign_id: campaignId,
        ...updates,
      });

      logger.info(`✓ Campaign updated`);
      return result;
    } catch (error) {
      logger.error('Campaign update failed:', error.message);
      throw error;
    }
  },

  async pauseCampaign(campaignId) {
    return this.updateCampaign(campaignId, { status: 'PAUSED' });
  },

  async activateCampaign(campaignId) {
    return this.updateCampaign(campaignId, { status: 'ACTIVE' });
  },

  // Ad set management
  async createAdSet(campaignId, adSetConfig) {
    try {
      logger.info(`Creating ad set for campaign ${campaignId}`);

      const result = await this.callMcpTool('create_ad_set', {
        campaign_id: campaignId,
        name: adSetConfig.name,
        optimization_goal: adSetConfig.optimizationGoal || 'REACH',
        billing_event: adSetConfig.billingEvent || 'IMPRESSIONS',
        daily_budget: adSetConfig.dailyBudget,
        targeting: adSetConfig.targeting,
        start_time: adSetConfig.startTime,
        end_time: adSetConfig.endTime,
      });

      logger.info(`✓ Ad set created: ${result.adset_id}`);
      return result;
    } catch (error) {
      logger.error('Ad set creation failed:', error.message);
      throw error;
    }
  },

  // Creative management
  async uploadCreative(adAccountId, creativeConfig) {
    try {
      logger.info(`Uploading creative for account ${adAccountId}`);

      const result = await this.callMcpTool('upload_creative', {
        ad_account_id: adAccountId,
        image_url: creativeConfig.imageUrl,
        title: creativeConfig.title,
        body: creativeConfig.body,
        call_to_action_type: creativeConfig.ctaType || 'LEARN_MORE',
        destination_url: creativeConfig.destinationUrl,
      });

      logger.info(`✓ Creative uploaded: ${result.creative_id}`);
      return result;
    } catch (error) {
      logger.error('Creative upload failed:', error.message);
      throw error;
    }
  },

  // Targeting
  async getAudiences(adAccountId) {
    try {
      logger.info(`Getting audiences for account ${adAccountId}`);

      const result = await this.callMcpTool('get_audiences', {
        ad_account_id: adAccountId,
      });

      return result;
    } catch (error) {
      logger.error('Get audiences failed:', error.message);
      throw error;
    }
  },

  async searchTargeting(query, targetingType = 'interests') {
    try {
      logger.info(`Searching for ${targetingType}: ${query}`);

      const result = await this.callMcpTool('search_targeting', {
        q: query,
        type: targetingType,
      });

      return result;
    } catch (error) {
      logger.error('Targeting search failed:', error.message);
      throw error;
    }
  },

  // Performance metrics
  async getPerformanceMetrics(campaignId, fields = ['spend', 'impressions', 'clicks', 'ctr', 'cpc']) {
    try {
      logger.info(`Getting metrics for campaign ${campaignId}`);

      const result = await this.callMcpTool('get_campaign_metrics', {
        campaign_id: campaignId,
        fields: fields,
      });

      return result;
    } catch (error) {
      logger.error('Get metrics failed:', error.message);
      throw error;
    }
  },

  // A/B Testing
  async createAbTest(campaignId, variations) {
    try {
      logger.info(`Creating A/B test for campaign ${campaignId}`);

      const result = await this.callMcpTool('create_ab_test', {
        campaign_id: campaignId,
        variations: variations,
        test_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      logger.info(`✓ A/B test created`);
      return result;
    } catch (error) {
      logger.error('A/B test creation failed:', error.message);
      throw error;
    }
  },

  // Optimization suggestions
  async getOptimizationSuggestions(campaignId) {
    try {
      logger.info(`Getting optimization suggestions for campaign ${campaignId}`);

      const result = await this.callMcpTool('get_optimization_suggestions', {
        campaign_id: campaignId,
      });

      return result;
    } catch (error) {
      logger.error('Get suggestions failed:', error.message);
      throw error;
    }
  },

  // Budget recommendations
  async getBudgetRecommendations(adAccountId, objective) {
    try {
      logger.info(`Getting budget recommendations for objective: ${objective}`);

      const result = await this.callMcpTool('get_budget_recommendations', {
        ad_account_id: adAccountId,
        objective: objective,
      });

      return result;
    } catch (error) {
      logger.error('Get budget recommendations failed:', error.message);
      throw error;
    }
  },
};

export default metaAdsService;
