import { SlackMessage, SlackWebhookConfig, SlackWebhookResponse } from './types.js';

export class SlackWebhookClient {
  private config: SlackWebhookConfig;

  constructor(config: SlackWebhookConfig) {
    this.config = {
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };
  }

  async sendMessage(message: SlackMessage): Promise<SlackWebhookResponse> {
    const payload = {
      text: message.text,
      ...(message.blocks && { blocks: message.blocks })
    };

    return this.sendWithRetry(payload);
  }

  private async sendWithRetry(payload: any, attempt = 1): Promise<SlackWebhookResponse> {
    try {
      const response = await fetch(this.config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return { ok: true };
      }

      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (attempt < (this.config.retryAttempts || 3)) {
        await this.delay(this.config.retryDelay || 1000);
        return this.sendWithRetry(payload, attempt + 1);
      }

      return {
        ok: false,
        error: `Failed to send message after ${this.config.retryAttempts} attempts: ${errorMessage}`
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static validateWebhookUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.hostname === 'hooks.slack.com' && 
             parsed.pathname.startsWith('/services/');
    } catch {
      return false;
    }
  }
}