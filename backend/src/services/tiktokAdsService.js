import axios from 'axios';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export const tiktokAdsService = {
  // Helper to make TikTok Ads API calls
  async callTikTokApi(endpoint, method = 'GET', data = null, accessToken) {
    try {
      const url = `https://ads.tiktok.com/open_api/v1.3/${endpoint}`;

      const response = await axios({
        method,
        url,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        data,
        timeout: 30000,
      });

      return response.data;
    } catch (error) {
      logger.error(`TikTok Ads API error (${endpoint}):`, error.response?.data || error.message);
      throw error;
    }
  },

  // Campaign management
  async createCampaign(advertiserId, campaignConfig, accessToken) {
    try {
      logger.info(`Creating TikTok campaign for advertiser ${advertiserId}`);

      const result = await this.callTikTokApi(
        'campaign/create/',
        'POST',
        {
          advertiser_id: advertiserId,
          campaign_name: campaignConfig.name,
          objective_type: campaignConfig.objective || 'TRAFFIC',
          budget_mode: 'BUDGET_MODE_DAY',
          budget: Math.floor(campaignConfig.dailyBudget * 100), // In cents
          start_time: Math.floor(Date.now() / 1000),
          end_time: Math.floor((Date.now() + campaignConfig.duration * 24 * 60 * 60 * 1000) / 1000),
          campaign_type: 'REGULAR_CAMPAIGN',
        },
        accessToken
      );

      logger.info(`✓ TikTok campaign created: ${result.data.campaign_id}`);
      return result.data;
    } catch (error) {
      logger.error('Campaign creation failed:', error.message);
      throw error;
    }
  },

  // Ad group management
  async createAdGroup(campaignId, adGroupConfig, accessToken) {
    try {
      logger.info(`Creating ad group for campaign ${campaignId}`);

      const result = await this.callTikTokApi(
        'adgroup/create/',
        'POST',
        {
          campaign_id: campaignId,
          adgroup_name: adGroupConfig.name,
          placement_type: adGroupConfig.placement || 'TK_PLACEMENT_GROUP_APP_LIST',
          bid_type: 'OCPC',
          bid: Math.floor(adGroupConfig.bidAmount * 100),
          daily_budget: Math.floor(adGroupConfig.dailyBudget * 100),
          targeting: this.formatTargeting(adGroupConfig.targeting),
        },
        accessToken
      );

      logger.info(`✓ Ad group created: ${result.data.adgroup_id}`);
      return result.data;
    } catch (error) {
      logger.error('Ad group creation failed:', error.message);
      throw error;
    }
  },

  // Creative/Ad management
  async uploadVideo(advertiserId, videoConfig, accessToken) {
    try {
      logger.info(`Uploading video for advertiser ${advertiserId}`);

      const result = await this.callTikTokApi(
        'file/video/ad/upload/',
        'POST',
        {
          advertiser_id: advertiserId,
          upload_type: 'UPLOAD_TYPE_URL',
          video_url: videoConfig.videoUrl,
          video_signature: videoConfig.videoSignature,
        },
        accessToken
      );

      logger.info(`✓ Video uploaded: ${result.data.video_id}`);
      return result.data;
    } catch (error) {
      logger.error('Video upload failed:', error.message);
      throw error;
    }
  },

  async createAd(adGroupId, adConfig, accessToken) {
    try {
      logger.info(`Creating ad for ad group ${adGroupId}`);

      const result = await this.callTikTokApi(
        'ad/create/',
        'POST',
        {
          adgroup_id: adGroupId,
          ad_name: adConfig.name,
          creative: {
            creative_type: 'SINGLE_VIDEO',
            creative_text: adConfig.description,
            video_id: adConfig.videoId,
            display_name: adConfig.displayName,
            call_to_action_id: adConfig.ctaId || 'LEARN_MORE',
            landing_page_url: adConfig.landingPageUrl,
          },
        },
        accessToken
      );

      logger.info(`✓ Ad created: ${result.data.ad_id}`);
      return result.data;
    } catch (error) {
      logger.error('Ad creation failed:', error.message);
      throw error;
    }
  },

  // Targeting
  formatTargeting(targeting) {
    return {
      placement_category: targeting.categories || [],
      language: targeting.languages || ['en'],
      gender: targeting.genders || ['GENDER_UNLIMITED'],
      age: targeting.ageRange || ['AGE_18_24', 'AGE_25_34'],
      interest_category: targeting.interests || [],
      behaviors: targeting.behaviors || [],
    };
  },

  // Performance metrics
  async getAdMetrics(adGroupId, accessToken) {
    try {
      logger.info(`Getting metrics for ad group ${adGroupId}`);

      const result = await this.callTikTokApi(
        `reports/integrated/get/?adgroup_ids=${adGroupId}`,
        'GET',
        null,
        accessToken
      );

      return result.data;
    } catch (error) {
      logger.error('Get metrics failed:', error.message);
      throw error;
    }
  },

  async getCampaignMetrics(campaignId, accessToken) {
    try {
      logger.info(`Getting metrics for campaign ${campaignId}`);

      const result = await this.callTikTokApi(
        `reports/integrated/get/?campaign_ids=${campaignId}`,
        'GET',
        null,
        accessToken
      );

      return result.data;
    } catch (error) {
      logger.error('Get campaign metrics failed:', error.message);
      throw error;
    }
  },

  // Pause underperforming
  async pauseAdGroupIfUnderperforming(adGroupId, thresholds, accessToken) {
    try {
      const metrics = await this.getAdMetrics(adGroupId, accessToken);

      if (metrics && metrics[0]) {
        const stat = metrics[0];
        const ctr = (stat.clicks / stat.impressions) * 100;
        const cpc = stat.spend / stat.clicks;

        if (ctr < thresholds.minCTR || cpc > thresholds.maxCPC) {
          logger.warn(`Ad group ${adGroupId} underperforming. CTR: ${ctr}%, CPC: $${cpc.toFixed(2)}`);

          // Pause ad group
          await this.callTikTokApi(
            'adgroup/update/',
            'POST',
            {
              adgroup_id: adGroupId,
              status: 'AD_GROUP_STATUS_PAUSED',
            },
            accessToken
          );

          logger.info('✓ Ad group paused due to underperformance');
          return { paused: true };
        }
      }

      return { paused: false };
    } catch (error) {
      logger.error('Pause check failed:', error.message);
      throw error;
    }
  },
};

export default tiktokAdsService;
