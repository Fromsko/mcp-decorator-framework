/**
 * Runtime Layer
 *
 * Provides stdio and HTTP server implementations for MCP protocol
 */

import { serve } from "@hono/node-server";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Hono } from "hono";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { loadPlugins, type Plugin } from "./plugin.js";
import { executeCommand, help, type ExecuteCommandInput } from "./tools.js";

/**
 * Configuration for stdio server
 */
export interface StdioServerConfig {
  /** Server name */
  name: string;

  /** Server version (optional) */
  version?: string;

  /** Plugins to load (optional) */
  plugins?: Plugin[];

  /** Logging level (optional) */
  logLevel?: "debug" | "info" | "error";
}

/**
 * Create and start an MCP server using stdio transport
 *
 * @param config - Server configuration
 */
export async function createStdioServer(
  config: StdioServerConfig
): Promise<void> {
  const { name, version = "1.0.0", plugins = [], logLevel = "info" } = config;

  // Load plugins if provided
  if (plugins.length > 0) {
    await loadPlugins(plugins);
  }

  // Create MCP server
  const server = new Server(
    {
      name,
      version,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register list tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "executeCommand",
          description:
            "Execute a registered MCP command by type with optional parameters",
          inputSchema: {
            type: "object",
            properties: {
              type: {
                type: "string",
                description: "Command type identifier (e.g., 'math.add')",
              },
              params: {
                type: "object",
                description: "Command-specific parameters",
              },
            },
            required: ["type"],
          },
        },
        {
          name: "help",
          description:
            "Get help information for all registered commands with descriptions and parameter schemas",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
      ],
    };
  });

  // Register call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name: toolName, arguments: args } = request.params;

    try {
      if (toolName === "executeCommand") {
        // Validate and execute command
        const input: ExecuteCommandInput = {
          type: (args as any)?.type || "",
          params: (args as any)?.params,
        };
        const response = await executeCommand(input);

        return {
          content: response.content,
          isError: response.isError,
        };
      } else if (toolName === "help") {
        // Return help information
        const response = help();

        return {
          content: response.content,
        };
      } else {
        // Unknown tool
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${toolName}. Available tools: executeCommand, help`,
            },
          ],
          isError: true,
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        content: [
          {
            type: "text",
            text: `Tool execution error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Create stdio transport
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  // Log server start (if not in error-only mode)
  if (logLevel !== "error") {
    console.error(`MCP server "${name}" v${version} started on stdio`);
  }
}

/**
 * Configuration for HTTP server
 */
export interface HttpServerConfig {
  /** Server name */
  name: string;

  /** Server version (optional) */
  version?: string;

  /** Port to listen on (default: 3000) */
  port?: number;

  /** Host to bind to (default: "localhost") */
  host?: string;

  /** Base path for MCP endpoints (default: "") */
  basePath?: string;

  /** Plugins to load (optional) */
  plugins?: Plugin[];

  /** Logging level (optional) */
  logLevel?: "debug" | "info" | "error";
}

/**
 * Create and start an MCP server using HTTP transport
 *
 * @param config - Server configuration
 */
export async function createHttpServer(
  config: HttpServerConfig
): Promise<void> {
  const {
    name,
    version = "1.0.0",
    port = 3000,
    host = "localhost",
    basePath = "",
    plugins = [],
    logLevel = "info",
  } = config;

  // Load plugins if provided
  if (plugins.length > 0) {
    await loadPlugins(plugins);
  }

  // Create Hono app
  const app = new Hono();

  // Create MCP handler with tool registration callback
  const mcpHandler = createMcpHandler(
    (server: any) => {
      // Register executeCommand tool
      server.tool(
        "executeCommand",
        "Execute a registered MCP command by type with optional parameters",
        {
          type: z
            .string()
            .describe("Command type identifier (e.g., 'math.add')"),
          params: z
            .record(z.unknown())
            .optional()
            .describe("Command-specific parameters"),
        },
        async ({
          type,
          params = {},
        }: {
          type: string;
          params?: Record<string, unknown>;
        }) => {
          const input: ExecuteCommandInput = {
            type,
            params,
          };
          return await executeCommand(input);
        }
      );

      // Register help tool
      server.tool(
        "help",
        "Get help information for all registered commands with descriptions and parameter schemas",
        {},
        async () => {
          return help();
        }
      );
    },
    {},
    {
      basePath: basePath || "/",
      maxDuration: 60,
      verboseLogs: logLevel === "debug",
    }
  );

  // Mount MCP handler at basePath + /mcp/*
  const mcpPath = `${basePath}/mcp`;
  app.all(`${mcpPath}/*`, async (c: any) => {
    return await mcpHandler(c.req.raw);
  });

  // Start HTTP server
  serve({
    fetch: app.fetch,
    port,
    hostname: host,
  });

  // Log server start (if not in error-only mode)
  if (logLevel !== "error") {
    const serverUrl = `http://${host}:${port}`;
    const mcpEndpoint = `${serverUrl}${mcpPath}`;
    console.log(`MCP server "${name}" v${version} started`);
    console.log(`Server URL: ${serverUrl}`);
    console.log(`MCP endpoint: ${mcpEndpoint}`);
  }
}
