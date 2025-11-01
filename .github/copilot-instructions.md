<!-- Use this file to provide workspace-specific custom instructions to Copilot. -->

## Project: mcp-4d-docs

This is a TypeScript-based Model Context Protocol (MCP) server that provides tools to fetch and cache 4D command documentation.

### Key Features
- Fetch 4D command documentation from https://developer.4d.com/docs/commands/
- Extract article content from HTML `<article>` tag within `<main>` tag
- Cache results in OS system cache for performance
- Open documentation URLs in default web browser
- Three tools: `get_4d_command_docs`, `clear_4d_docs_cache`, and `open_4d_command_in_browser`

### Development Guidelines
- Node.js 18+ and TypeScript required
- Uses MCP SDK for TypeScript
- Cheerio for HTML parsing
- Node built-in modules (fs, crypto, os, path) for caching
- System cache for documentation storage (macOS: ~/Library/Caches, Windows: %LOCALAPPDATA%, Linux: ~/.cache)

### Running the Server
```bash
# Build TypeScript
npm run build

# Run the server
node build/index.js

# Testing with MCP Inspector
npx @modelcontextprotocol/inspector node build/index.js
```

### URL Encoding
Command names are converted to lowercase with spaces replaced by hyphens:
- "ACTIVITY SNAPSHOT" → "activity-snapshot"
- "ARRAY TO LIST" → "array-to-list"
