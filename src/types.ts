export interface SlackMessage {
  text: string;
  blocks?: SlackBlock[];
}

export interface SlackBlock {
  type: string;
  [key: string]: any;
}

export interface SlackTextBlock {
  type: "section";
  text: {
    type: "mrkdwn" | "plain_text";
    text: string;
  };
}

export interface SlackDividerBlock {
  type: "divider";
}

export interface SlackHeaderBlock {
  type: "header";
  text: {
    type: "plain_text";
    text: string;
  };
}

export interface SlackContextBlock {
  type: "context";
  elements: Array<{
    type: "mrkdwn" | "plain_text";
    text: string;
  }>;
}

export interface SlackFieldsBlock {
  type: "section";
  fields: Array<{
    type: "mrkdwn" | "plain_text";
    text: string;
  }>;
}

export interface SlackWebhookResponse {
  ok: boolean;
  error?: string;
}

export interface SlackWebhookConfig {
  url: string;
  retryAttempts?: number;
  retryDelay?: number;
}