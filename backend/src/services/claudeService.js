import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const client = new Anthropic({
  apiKey: config.claude.apiKey,
});

export const claudeService = {
  async sendMessage(messages, systemPrompt = null, maxTokens = 1024) {
    try {
      const response = await client.messages.create({
        model: config.claude.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      });

      return response.content[0].type === 'text' ? response.content[0].text : null;
    } catch (error) {
      logger.error('Claude API error:', error.message);
      throw error;
    }
  },

  async streamMessage(messages, systemPrompt = null, onChunk = null) {
    try {
      const stream = client.messages.stream({
        model: config.claude.model,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      });

      let fullText = '';

      stream.on('text', (text) => {
        fullText += text;
        if (onChunk) onChunk(text);
      });

      await stream.finalMessage();
      return fullText;
    } catch (error) {
      logger.error('Claude streaming error:', error.message);
      throw error;
    }
  },

  async executeAgent(agentPrompt, userInput, context = null) {
    const messages = [
      {
        role: 'user',
        content: `${context ? `Context: ${context}\n\n` : ''}${userInput}`,
      },
    ];

    return this.sendMessage(messages, agentPrompt, 2048);
  },
};

export default claudeService;
