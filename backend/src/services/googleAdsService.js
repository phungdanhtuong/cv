import axios from 'axios';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export const googleAdsService = {
  // Helper to make Google Ads API calls
  async callGoogleAdsApi(endpoint, method = 'GET', data = null, accessToken) {
    try {
      const url = `https://googleads.googleapis.com/v14/${endpoint}`;

      const response = await axios({
        method,
        url,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'developer-token': config.google?.developerToken,
        },
        data,
        timeout: 30000,
      });

      return response.data;
    } catch (error) {
      logger.error(`Google Ads API error (${endpoint}):`, error.message);
      throw error;
    }
  },

  // Campaign management
  async createSearchCampaign(customerId, campaignConfig, accessToken) {
    try {
      logger.info(`Creating Search campaign for customer ${customerId}`);

      const result = await this.callGoogleAdsApi(
        `customers/${customerId}/googleAds:searchStream`,
        'POST',
        {
          query: `
            CREATE campaign
            FROM (
              name: "${campaignConfig.name}",
              status: ENABLED,
              advertiser_type: ADVERTISER,
              campaign_budget: (
                daily_budget_micros: ${campaignConfig.dailyBudgetMicros}
              )
            )
          `,
        },
        accessToken
      );

      logger.info('✓ Search campaign created');
      return result;
    } catch (error) {
      logger.error('Search campaign creation failed:', error.message);
      throw error;
    }
  },

  async createDisplayCampaign(customerId, campaignConfig, accessToken) {
    try {
      logger.info(`Creating Display campaign for customer ${customerId}`);

      const result = await this.callGoogleAdsApi(
        `customers/${customerId}/campaigns`,
        'POST',
        {
          campaign: {
            name: campaignConfig.name,
            status: 'ENABLED',
            advertising_channel_type: 'DISPLAY',
            campaign_budget: {
              daily_budget_micros: campaignConfig.dailyBudgetMicros,
            },
          },
        },
        accessToken
      );

      logger.info('✓ Display campaign created');
      return result;
    } catch (error) {
      logger.error('Display campaign creation failed:', error.message);
      throw error;
    }
  },

  async createPerformanceMaxCampaign(customerId, campaignConfig, accessToken) {
    try {
      logger.info(`Creating Performance Max campaign for customer ${customerId}`);

      const result = await this.callGoogleAdsApi(
        `customers/${customerId}/campaigns`,
        'POST',
        {
          campaign: {
            name: campaignConfig.name,
            status: 'ENABLED',
            advertising_channel_type: 'PERFORMANCE_MAX',
            campaign_budget: {
              daily_budget_micros: campaignConfig.dailyBudgetMicros,
            },
          },
        },
        accessToken
      );

      logger.info('✓ Performance Max campaign created');
      return result;
    } catch (error) {
      logger.error('Performance Max campaign creation failed:', error.message);
      throw error;
    }
  },

  // Keyword management
  async addKeywords(customerId, adGroupId, keywords, accessToken) {
    try {
      logger.info(`Adding ${keywords.length} keywords to ad group ${adGroupId}`);

      const operations = keywords.map((keyword) => ({
        create: {
          keyword_text: keyword.text,
          match_type: keyword.matchType || 'BROAD',
          bid_amount_micros: keyword.bidMicros || 1000000,
        },
      }));

      const result = await this.callGoogleAdsApi(
        `customers/${customerId}/keywords:mutate`,
        'POST',
        { operations },
        accessToken
      );

      logger.info(`✓ Added keywords`);
      return result;
    } catch (error) {
      logger.error('Add keywords failed:', error.message);
      throw error;
    }
  },

  // Bidding
  async updateBidStrategy(customerId, campaignId, bidStrategy, accessToken) {
    try {
      logger.info(`Updating bid strategy for campaign ${campaignId}`);

      const result = await this.callGoogleAdsApi(
        `customers/${customerId}/campaigns/${campaignId}:update`,
        'PATCH',
        {
          campaign: {
            bidding_strategy_type: bidStrategy.type, // TARGET_CPA, MAXIMIZE_CONVERSIONS, etc.
            bidding_strategy: {
              [bidStrategy.type]: bidStrategy.config,
            },
          },
        },
        accessToken
      );

      logger.info('✓ Bid strategy updated');
      return result;
    } catch (error) {
      logger.error('Update bid strategy failed:', error.message);
      throw error;
    }
  },

  // Performance metrics
  async getCampaignMetrics(customerId, campaignId, accessToken) {
    try {
      logger.info(`Getting metrics for campaign ${campaignId}`);

      const result = await this.callGoogleAdsApi(
        `customers/${customerId}/googleAds:search`,
        'POST',
        {
          query: `
            SELECT campaign.id, campaign.name, metrics.impressions,
                   metrics.clicks, metrics.cost_micros,
                   metrics.conversions, metrics.conversion_value
            FROM campaign
            WHERE campaign.id = '${campaignId}'
          `,
        },
        accessToken
      );

      return result;
    } catch (error) {
      logger.error('Get metrics failed:', error.message);
      throw error;
    }
  },

  // Pause underperforming campaigns
  async pauseCampaignIfUnderperforming(customerId, campaignId, thresholds, accessToken) {
    try {
      const metrics = await this.getCampaignMetrics(customerId, campaignId, accessToken);

      if (metrics.results && metrics.results.length > 0) {
        const campaign = metrics.results[0];
        const ctr = (campaign.metrics.clicks / campaign.metrics.impressions) * 100;
        const cpc = campaign.metrics.cost_micros / (campaign.metrics.clicks * 1000000);

        if (ctr < thresholds.minCTR || cpc > thresholds.maxCPC) {
          logger.warn(
            `Campaign ${campaignId} underperforming. CTR: ${ctr}%, CPC: $${cpc.toFixed(2)}`
          );

          // Pause campaign
          await this.callGoogleAdsApi(
            `customers/${customerId}/campaigns/${campaignId}:pause`,
            'POST',
            {},
            accessToken
          );

          logger.info('✓ Campaign paused due to underperformance');
          return { paused: true, reason: 'underperformance' };
        }
      }

      return { paused: false };
    } catch (error) {
      logger.error('Pause check failed:', error.message);
      throw error;
    }
  },
};

export default googleAdsService;
