import axios from 'axios';
import { logger } from '../utils/logger.js';

export const linkedinAdsService = {
  // Helper to make LinkedIn API calls
  async callLinkedInApi(endpoint, method = 'GET', data = null, accessToken) {
    try {
      const url = `https://api.linkedin.com/v2/${endpoint}`;

      const response = await axios({
        method,
        url,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'LinkedIn-Version': '202404',
        },
        data,
        timeout: 30000,
      });

      return response.data;
    } catch (error) {
      logger.error(`LinkedIn API error (${endpoint}):`, error.response?.data || error.message);
      throw error;
    }
  },

  // Campaign management
  async createCampaign(accountId, campaignConfig, accessToken) {
    try {
      logger.info(`Creating LinkedIn campaign for account ${accountId}`);

      const result = await this.callLinkedInApi(
        'adCampaignsV2',
        'POST',
        {
          account: `urn:li:sponsoredAccount:${accountId}`,
          name: campaignConfig.name,
          objective: campaignConfig.objective || 'AWARENESS',
          type: 'SPONSORED_CONTENT',
          status: 'DRAFT',
          dailyBudget: {
            currencyCode: 'USD',
            amount: campaignConfig.dailyBudget * 100, // Convert to cents
          },
          unitCost: {
            currencyCode: 'USD',
            amount: 500000, // Default $5 CPM
          },
          runSchedule: {
            start: Math.floor(Date.now() / 1000),
            end: Math.floor((Date.now() + campaignConfig.duration * 24 * 60 * 60 * 1000) / 1000),
          },
        },
        accessToken
      );

      logger.info(`✓ LinkedIn campaign created: ${result.id}`);
      return result;
    } catch (error) {
      logger.error('Campaign creation failed:', error.message);
      throw error;
    }
  },

  // Creative management
  async createSponsoredContent(accountId, campaignId, contentConfig, accessToken) {
    try {
      logger.info(`Creating sponsored content for campaign ${campaignId}`);

      const result = await this.callLinkedInApi(
        `adCreativesV2`,
        'POST',
        {
          account: `urn:li:sponsoredAccount:${accountId}`,
          campaign: `urn:li:sponsoredCampaign:${campaignId}`,
          type: 'SPONSORED_TEXT_AD',
          content: {
            title: contentConfig.title,
            description: contentConfig.description,
            landingPageUrl: contentConfig.landingPageUrl,
            media: {
              title: contentConfig.mediaTitle,
              description: contentConfig.mediaDescription,
              thumbnailUrl: contentConfig.thumbnailUrl,
            },
          },
        },
        accessToken
      );

      logger.info(`✓ Sponsored content created: ${result.id}`);
      return result;
    } catch (error) {
      logger.error('Sponsored content creation failed:', error.message);
      throw error;
    }
  },

  // Targeting
  async updateTargeting(accountId, campaignId, targeting, accessToken) {
    try {
      logger.info(`Updating targeting for campaign ${campaignId}`);

      const result = await this.callLinkedInApi(
        `adTargetingsV2`,
        'POST',
        {
          account: `urn:li:sponsoredAccount:${accountId}`,
          campaign: `urn:li:sponsoredCampaign:${campaignId}`,
          geoTargeting: {
            locations: targeting.locations || [],
          },
          industries: targeting.industries || [],
          jobTitles: targeting.jobTitles || [],
          seniorities: targeting.seniorities || [],
          skills: targeting.skills || [],
        },
        accessToken
      );

      logger.info('✓ Targeting updated');
      return result;
    } catch (error) {
      logger.error('Targeting update failed:', error.message);
      throw error;
    }
  },

  // Performance metrics
  async getCampaignAnalytics(campaignId, accessToken) {
    try {
      logger.info(`Getting analytics for campaign ${campaignId}`);

      const result = await this.callLinkedInApi(
        `adAnalyticsV2?campaigns=List(urn:li:sponsoredCampaign:${campaignId})&dateRange=(start:${Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)},end:${Math.floor(Date.now() / 1000)})`,
        'GET',
        null,
        accessToken
      );

      return result;
    } catch (error) {
      logger.error('Get analytics failed:', error.message);
      throw error;
    }
  },

  // Lead gen forms
  async createLeadGenForm(accountId, formConfig, accessToken) {
    try {
      logger.info(`Creating lead gen form for account ${accountId}`);

      const result = await this.callLinkedInApi(
        'leadgenForms',
        'POST',
        {
          name: formConfig.name,
          headline: formConfig.headline,
          description: formConfig.description,
          questions: formConfig.questions || [
            {
              type: 'EMAIL',
              required: true,
            },
            {
              type: 'FULL_NAME',
              required: true,
            },
          ],
        },
        accessToken
      );

      logger.info(`✓ Lead gen form created: ${result.id}`);
      return result;
    } catch (error) {
      logger.error('Lead gen form creation failed:', error.message);
      throw error;
    }
  },

  // Conversion tracking
  async setupConversionTracking(accountId, conversionConfig, accessToken) {
    try {
      logger.info(`Setting up conversion tracking for account ${accountId}`);

      const result = await this.callLinkedInApi(
        'conversionTrackers',
        'POST',
        {
          account: `urn:li:sponsoredAccount:${accountId}`,
          name: conversionConfig.name,
          attribution_type: 'LAST_CLICK',
          conversion_value: conversionConfig.value,
          post_click_window_days: conversionConfig.windowDays || 30,
        },
        accessToken
      );

      logger.info(`✓ Conversion tracking setup: ${result.id}`);
      return result;
    } catch (error) {
      logger.error('Conversion tracking setup failed:', error.message);
      throw error;
    }
  },
};

export default linkedinAdsService;
