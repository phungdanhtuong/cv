import { logger } from '../utils/logger.js';
import agentService from './agentService.js';
import metaAdsService from './metaAdsService.js';
import pool from '../config/database.js';

export const adsService = {
  async createAdCampaign(userId, campaignRequest) {
    try {
      logger.info(`Creating ad campaign for user ${userId}`);

      const {
        name,
        contentId,
        budget,
        currency = 'USD',
        platform = 'facebook',
        targetAudience,
        duration,
        adAccountId,
      } = campaignRequest;

      // Step 1: Get content
      const contentResult = await pool.query(
        'SELECT * FROM content WHERE id = $1 AND user_id = $2',
        [contentId, userId]
      );

      if (contentResult.rows.length === 0) {
        throw new Error('Content not found');
      }

      const content = contentResult.rows[0];

      // Step 2: Get Ads Manager agent to create strategy
      const adsManagerAgent = await agentService.loadAgent(3); // Ads Manager
      const adStrategy = await agentService.executeAgent(
        adsManagerAgent,
        `Create ad campaign strategy for: ${name}`,
        `Content: ${content.content}\nBudget: ${budget}\nAudience: ${JSON.stringify(targetAudience)}`
      );

      logger.info('✓ Ad strategy created');

      // Step 3: Get ad account details
      const adAccountResult = await pool.query(
        'SELECT * FROM ad_accounts WHERE id = $1 AND user_id = $2',
        [adAccountId, userId]
      );

      if (adAccountResult.rows.length === 0) {
        throw new Error('Ad account not found');
      }

      const adAccount = adAccountResult.rows[0];

      // Step 4: Create campaign via Meta Ads MCP
      let metaCampaignId = null;
      let metaAdSetId = null;

      try {
        const metaCampaign = await metaAdsService.createCampaign(
          adAccount.account_id,
          {
            name: name,
            objective: 'REACH',
            dailyBudget: Math.floor((budget / duration) * 100),
            status: 'PAUSED', // Start paused for review
          }
        );

        metaCampaignId = metaCampaign.campaign_id;

        // Create ad set
        const metaAdSet = await metaAdsService.createAdSet(metaCampaignId, {
          name: `${name} - Ad Set`,
          dailyBudget: Math.floor((budget / duration) * 100),
          targeting: this.convertTargetingFormat(targetAudience),
          startTime: new Date(),
          endTime: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        });

        metaAdSetId = metaAdSet.adset_id;

        logger.info('✓ Meta Ads campaign created');
      } catch (error) {
        logger.warn('Meta Ads campaign creation failed (may be sandbox):', error.message);
      }

      // Step 5: Save campaign to database
      const campaignResult = await pool.query(
        `INSERT INTO campaigns
         (user_id, ad_account_id, name, budget, currency, status, platform, start_date, end_date, performance_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + ($8 || ' days')::interval, $9)
         RETURNING *`,
        [
          userId,
          adAccountId,
          name,
          budget,
          currency,
          'draft',
          platform,
          duration,
          JSON.stringify({
            metaCampaignId,
            metaAdSetId,
            targetAudience,
            strategy: adStrategy,
          }),
        ]
      );

      logger.info(`✓ Campaign saved with ID: ${campaignResult.rows[0].id}`);

      return {
        success: true,
        campaignId: campaignResult.rows[0].id,
        metaCampaignId,
        strategy: adStrategy,
        campaign: campaignResult.rows[0],
      };
    } catch (error) {
      logger.error('Ad campaign creation failed:', error.message);
      throw error;
    }
  },

  async approveCampaign(userId, campaignId) {
    try {
      logger.info(`Approving campaign ${campaignId}`);

      const result = await pool.query(
        `UPDATE campaigns SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        ['approved', campaignId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Campaign not found');
      }

      // Activate on Meta if metaCampaignId exists
      const campaign = result.rows[0];
      if (campaign.performance_data?.metaCampaignId) {
        try {
          await metaAdsService.activateCampaign(campaign.performance_data.metaCampaignId);
          logger.info('✓ Campaign activated on Meta');
        } catch (error) {
          logger.warn('Could not activate on Meta:', error.message);
        }
      }

      return campaign;
    } catch (error) {
      logger.error('Campaign approval failed:', error.message);
      throw error;
    }
  },

  async pauseCampaign(userId, campaignId) {
    try {
      logger.info(`Pausing campaign ${campaignId}`);

      const result = await pool.query(
        `UPDATE campaigns SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        ['paused', campaignId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Campaign not found');
      }

      const campaign = result.rows[0];
      if (campaign.performance_data?.metaCampaignId) {
        try {
          await metaAdsService.pauseCampaign(campaign.performance_data.metaCampaignId);
        } catch (error) {
          logger.warn('Could not pause on Meta:', error.message);
        }
      }

      return campaign;
    } catch (error) {
      logger.error('Campaign pause failed:', error.message);
      throw error;
    }
  },

  async getCampaignMetrics(userId, campaignId) {
    try {
      logger.info(`Getting metrics for campaign ${campaignId}`);

      const campaignResult = await pool.query(
        'SELECT * FROM campaigns WHERE id = $1 AND user_id = $2',
        [campaignId, userId]
      );

      if (campaignResult.rows.length === 0) {
        throw new Error('Campaign not found');
      }

      const campaign = campaignResult.rows[0];

      // Fetch latest metrics from Meta if available
      if (campaign.performance_data?.metaCampaignId) {
        try {
          const metrics = await metaAdsService.getPerformanceMetrics(
            campaign.performance_data.metaCampaignId
          );

          return {
            campaign: campaign,
            metrics: metrics,
          };
        } catch (error) {
          logger.warn('Could not fetch Meta metrics:', error.message);
        }
      }

      return {
        campaign: campaign,
        metrics: campaign.performance_data || {},
      };
    } catch (error) {
      logger.error('Get metrics failed:', error.message);
      throw error;
    }
  },

  async getUserCampaigns(userId, platform = null, status = null) {
    try {
      let query = 'SELECT * FROM campaigns WHERE user_id = $1';
      const params = [userId];

      if (platform) {
        query += ` AND platform = $${params.length + 1}`;
        params.push(platform);
      }

      if (status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Get user campaigns failed:', error.message);
      throw error;
    }
  },

  convertTargetingFormat(targeting) {
    // Convert from our format to Meta Ads targeting format
    return {
      geo_locations: targeting.geoLocations || {},
      age_min: targeting.ageMin || 18,
      age_max: targeting.ageMax || 65,
      genders: targeting.genders || [1, 2],
      interests: targeting.interests || [],
      behaviors: targeting.behaviors || [],
      flexible_spec: targeting.flexibleSpec || [],
    };
  },
};

export default adsService;
