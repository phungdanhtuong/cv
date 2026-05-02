import axios from 'axios';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export const platformService = {
  // LinkedIn
  async publishToLinkedIn(content, accessToken) {
    try {
      logger.info('Publishing to LinkedIn');

      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        {
          author: 'urn:li:person:YOUR_USER_ID',
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.PublishedContent': {
              shareContent: {
                shareCommentary: {
                  text: content.text,
                },
                shareMediaCategory: 'ARTICLE',
              },
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('✓ Published to LinkedIn');
      return { platform: 'linkedin', postId: response.data.id };
    } catch (error) {
      logger.error('LinkedIn publishing failed:', error.message);
      throw error;
    }
  },

  // Instagram (via Meta)
  async publishToInstagram(content, accessToken, instagramAccountId) {
    try {
      logger.info('Publishing to Instagram');

      // Instagram publishing requires media first, then captions
      const response = await axios.post(
        `https://graph.instagram.com/v18.0/${instagramAccountId}/media`,
        {
          media_type: 'CAROUSEL',
          children: content.mediaIds,
          caption: content.caption,
          access_token: accessToken,
        }
      );

      logger.info('✓ Published to Instagram');
      return { platform: 'instagram', postId: response.data.id };
    } catch (error) {
      logger.error('Instagram publishing failed:', error.message);
      throw error;
    }
  },

  // TikTok
  async publishToTikTok(content, accessToken) {
    try {
      logger.info('Publishing to TikTok');

      const response = await axios.post(
        'https://open.tiktok.com/v1/post/publish/action/upload/',
        {
          video: {
            source: content.videoUrl,
            cover_image_url: content.coverUrl,
          },
          post_info: {
            title: content.text,
            description: content.description,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      logger.info('✓ Published to TikTok');
      return { platform: 'tiktok', postId: response.data.data.video_id };
    } catch (error) {
      logger.error('TikTok publishing failed:', error.message);
      throw error;
    }
  },

  // YouTube
  async publishToYoutube(content, accessToken) {
    try {
      logger.info('Publishing to YouTube');

      const response = await axios.post(
        'https://www.googleapis.com/youtube/v3/videos?part=snippet,status',
        {
          snippet: {
            title: content.title,
            description: content.description,
            tags: content.tags,
            categoryId: content.categoryId || '22', // Video
          },
          status: {
            privacyStatus: content.privacyStatus || 'public',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('✓ Published to YouTube');
      return { platform: 'youtube', postId: response.data.id };
    } catch (error) {
      logger.error('YouTube publishing failed:', error.message);
      throw error;
    }
  },

  // Facebook (via Meta)
  async publishToFacebook(content, accessToken, pageId) {
    try {
      logger.info('Publishing to Facebook');

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          message: content.text,
          link: content.link,
          picture: content.imageUrl,
          access_token: accessToken,
        }
      );

      logger.info('✓ Published to Facebook');
      return { platform: 'facebook', postId: response.data.id };
    } catch (error) {
      logger.error('Facebook publishing failed:', error.message);
      throw error;
    }
  },

  // Unified publish (publish to multiple platforms)
  async publishToMultiplePlatforms(content, platforms, credentials) {
    const results = {};

    for (const platform of platforms) {
      try {
        const cred = credentials[platform];

        switch (platform) {
          case 'linkedin':
            results.linkedin = await this.publishToLinkedIn(content.linkedin, cred.accessToken);
            break;
          case 'instagram':
            results.instagram = await this.publishToInstagram(
              content.instagram,
              cred.accessToken,
              cred.accountId
            );
            break;
          case 'tiktok':
            results.tiktok = await this.publishToTikTok(content.tiktok, cred.accessToken);
            break;
          case 'youtube':
            results.youtube = await this.publishToYoutube(content.youtube, cred.accessToken);
            break;
          case 'facebook':
            results.facebook = await this.publishToFacebook(
              content.facebook,
              cred.accessToken,
              cred.pageId
            );
            break;
          default:
            logger.warn(`Unknown platform: ${platform}`);
        }
      } catch (error) {
        logger.error(`Failed to publish to ${platform}:`, error.message);
        results[platform] = { error: error.message };
      }
    }

    return results;
  },

  // Get platform access token
  async getAccessToken(userId, platform) {
    // This would fetch from database
    // Implementation in Phase 1.7
  },
};

export default platformService;
