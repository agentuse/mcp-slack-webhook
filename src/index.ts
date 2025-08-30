#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SlackWebhookClient } from './slack-client.js';
import { SlackBlock } from './types.js';

const blockSchema = z.object({
  type: z.string(),
}).passthrough();

const server = new McpServer({
  name: "mcp-slack-webhook",
  version: "1.0.0"
});

function validateEnvironment(): string {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    throw new Error("SLACK_WEBHOOK_URL environment variable is required");
  }
  
  if (!SlackWebhookClient.validateWebhookUrl(webhookUrl)) {
    throw new Error("Invalid SLACK_WEBHOOK_URL format. Expected format: https://hooks.slack.com/services/...");
  }
  
  return webhookUrl;
}

function initializeServer() {
  const webhookUrl = validateEnvironment();
  const slackClient = new SlackWebhookClient({ url: webhookUrl });

  server.registerTool(
    "send-message",
    {
      title: "Send Slack Message",
      description: "Send a message to Slack via webhook. Supports both simple text and rich Block Kit formatting.",
      inputSchema: {
        text: z.string().describe("The main message text (required). Used as fallback when blocks are provided."),
        blocks: z.array(blockSchema).optional().describe("Optional Block Kit blocks for rich formatting. Common block types: section (text), header, divider, context.")
      }
    },
    async ({ text, blocks }) => {
      try {
        const message = {
          text,
          ...(blocks && { blocks: blocks as SlackBlock[] })
        };

        const result = await slackClient.sendMessage(message);

        if (result.ok) {
          return {
            content: [{
              type: "text" as const,
              text: `Message sent successfully to Slack`
            }]
          };
        } else {
          return {
            content: [{
              type: "text" as const,
              text: `Failed to send message: ${result.error}`
            }],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text" as const,
            text: `Error sending message: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );
}

async function runServer() {
  initializeServer();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Slack Webhook Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});