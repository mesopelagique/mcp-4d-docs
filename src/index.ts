#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { clearCache, fetchDocumentation, openCommandInBrowser } from "./docService";

// Define available tools
const tools: Tool[] = [
  {
    name: "get_4d_command_docs",
    description:
      "Get documentation for a 4D command. Fetches the documentation from https://developer.4d.com/docs/commands/<command-name> and extracts the article content from the main tag. Results are cached locally for faster subsequent access.",
    inputSchema: {
      type: "object",
      properties: {
        command_name: {
          type: "string",
          description: 'The name of the 4D command (e.g., "ACTIVITY SNAPSHOT", "ARRAY TO LIST")',
        },
      },
      required: ["command_name"],
    },
  },
  {
    name: "clear_4d_docs_cache",
    description:
      "Clear the local cache of 4D documentation. This removes all cached documentation files, forcing fresh fetches on subsequent requests.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "open_4d_command_in_browser",
    description:
      "Open a 4D command documentation page in the default web browser. This opens the URL https://developer.4d.com/docs/commands/<command-name> directly in your browser.",
    inputSchema: {
      type: "object",
      properties: {
        command_name: {
          type: "string",
          description: 'The name of the 4D command (e.g., "ACTIVITY SNAPSHOT", "ARRAY TO LIST")',
        },
      },
      required: ["command_name"],
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: "mcp-4d-docs",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get_4d_command_docs") {
      const commandName = args?.command_name as string;
      
      if (!commandName) {
        throw new Error("command_name is required");
      }

      const docs = await fetchDocumentation(commandName);
      
      return {
        content: [
          {
            type: "text",
            text: docs,
          },
        ],
      };
    } else if (name === "clear_4d_docs_cache") {
      const count = clearCache();
      
      return {
        content: [
          {
            type: "text",
            text: `Cleared ${count} cached documentation file(s)`,
          },
        ],
      };
    } else if (name === "open_4d_command_in_browser") {
      const commandName = args?.command_name as string;
      
      if (!commandName) {
        throw new Error("command_name is required");
      }

      const result = await openCommandInBrowser(commandName);
      
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP 4D Docs server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
