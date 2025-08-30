# MCP Slack Webhook Server

A Model Context Protocol (MCP) server that enables AI assistants to send messages to Slack via webhooks.

## Features

- **Single flexible tool**: `send-message` supports both simple text and rich Block Kit formatting
- **Environment-based configuration**: Webhook URL configured via environment variable
- **Retry mechanism**: Built-in retry logic for failed requests
- **Error handling**: Comprehensive error handling and validation
- **TypeScript**: Full type safety and modern ES modules

## Installation

### Using npx (Recommended)

No installation required - use directly with npx:

```bash
npx -y @agentuse/mcp-slack-webhook
```

### From Source

```bash
cd packages/mcp-slack-webhook
pnpm install
pnpm run build
```

## Configuration

1. Create a Slack app and enable incoming webhooks:
   - Go to [Slack API](https://api.slack.com/apps)
   - Create a new app or select existing one
   - Navigate to "Incoming Webhooks" and activate it
   - Create a webhook for your desired channel

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and set your webhook URL
   ```

3. Set the `SLACK_WEBHOOK_URL` environment variable:
   ```bash
   export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
   ```

## Usage

### Using as MCP Server

This server is designed to be used with MCP clients like Claude Code or other AI applications that support the Model Context Protocol.

#### With Claude Code

1. Build the server:
   ```bash
   pnpm run build
   ```

2. Add to your Claude Code MCP configuration (usually `~/.config/claude-code/mcp.json`):
   
   **Using npx (recommended):**
   ```json
   {
     "mcpServers": {
       "slack-webhook": {
         "command": "npx",
         "args": ["-y", "@agentuse/mcp-slack-webhook"],
         "env": {
           "SLACK_WEBHOOK_URL": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
         }
       }
     }
   }
   ```
   
   **If installed from source:**
   ```json
   {
     "mcpServers": {
       "slack-webhook": {
         "command": "node",
         "args": ["/path/to/packages/mcp-slack-webhook/dist/index.js"],
         "env": {
           "SLACK_WEBHOOK_URL": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
         }
       }
     }
   }
   ```

3. Restart Claude Code to load the MCP server

#### With Other MCP Clients

The server uses stdio transport and can be integrated with any MCP client:

```bash
# Set environment variable
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Run the server with npx
npx -y @agentuse/mcp-slack-webhook
```

#### Running Standalone (Development/Testing)

```bash
# Development mode
pnpm run dev

# Production mode
pnpm run build
pnpm start
```

### Tool: `send-message`

Send messages to Slack with optional Block Kit formatting.

#### Parameters

- `text` (required): The main message text. Used as fallback when blocks are provided.
- `blocks` (optional): Array of Block Kit blocks for rich formatting.

#### Examples

**Simple text message:**
```json
{
  "text": "Hello from MCP!"
}
```

**Message with Block Kit formatting:**
```json
{
  "text": "System Alert",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🚨 System Alert"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*CPU usage is high*\nServer: production-01\nUsage: 85%"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "Alert generated at <!date^1234567890^{date_short_pretty} at {time}|fallback>"
        }
      ]
    }
  ]
}
```

**Message with fields:**
```json
{
  "text": "Deployment Status",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Deployment Complete*"
      },
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Environment:*\nProduction"
        },
        {
          "type": "mrkdwn",
          "text": "*Version:*\nv1.2.3"
        },
        {
          "type": "mrkdwn",
          "text": "*Status:*\n✅ Success"
        },
        {
          "type": "mrkdwn",
          "text": "*Duration:*\n2m 15s"
        }
      ]
    }
  ]
}
```

## Common Block Types

- **header**: Large header text
- **section**: Text with optional fields
- **divider**: Visual separator
- **context**: Small, muted text (timestamps, metadata)

## Error Handling

The server includes comprehensive error handling:

- **Invalid webhook URL**: Validates URL format on startup
- **Network failures**: Automatic retry with exponential backoff
- **Slack API errors**: Detailed error messages returned
- **Invalid block format**: Zod schema validation

## Integration with Claude

This MCP server is designed to work seamlessly with AI assistants like Claude. The single `send-message` tool makes it easy for LLMs to:

1. Send simple notifications: `{text: "Task completed"}`
2. Create rich formatted alerts with blocks
3. Generate status reports with structured data

## Available Tools

Once connected as an MCP server, this provides the following tool:

### `send-message`
- **Purpose**: Send messages to Slack via webhook
- **Parameters**: 
  - `text` (required): Main message text
  - `blocks` (optional): Block Kit blocks for rich formatting
- **Returns**: Success confirmation or error details

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm run dev

# Build for production
pnpm run build

# Type checking
npx tsc --noEmit
```

## Troubleshooting

**Server won't start:**
- Check that `SLACK_WEBHOOK_URL` is set and valid
- Ensure the webhook URL format: `https://hooks.slack.com/services/...`

**Messages not appearing in Slack:**
- Verify webhook URL is correct
- Check that the Slack app has permission to post to the target channel
- Review server logs for error messages

## Publishing to npm

### For Maintainers

To publish a new version to npm:

1. **Update version**:
   ```bash
   cd packages/mcp-slack-webhook
   npm version patch  # or minor, major
   ```

2. **Test the package**:
   ```bash
   pnpm run publish:dry-run
   ```

3. **Login to npm** (first time only):
   ```bash
   npm login
   ```

4. **Publish**:
   ```bash
   pnpm run publish:npm
   ```

### Package Contents

The published package includes:
- `dist/` - Compiled JavaScript and TypeScript definitions
- `README.md` - Documentation
- `LICENSE` - MIT license
- `.env.example` - Environment variable template

Source files and development dependencies are excluded via `.npmignore`.

## License

MIT