/**
 * Advanced Example
 *
 * Demonstrates plugin lifecycle, error handling, and configuration
 */

import "reflect-metadata";
import { z } from "zod";
import {
  Command,
  Param,
  createHttpServer,
  type MCPResponse,
  type Plugin,
} from "../src/index.js";

// Custom plugin with lifecycle hooks
class DatabasePlugin implements Plugin {
  name = "database";
  version = "1.0.0";
  private connection: any = null;

  async init() {
    console.log("DatabasePlugin: Initializing connection...");
    // Simulate database connection
    this.connection = { connected: true };
    console.log("DatabasePlugin: Connected!");
  }

  register() {
    return [QueryCommand];
  }

  async destroy() {
    console.log("DatabasePlugin: Closing connection...");
    this.connection = null;
    console.log("DatabasePlugin: Disconnected!");
  }
}

// Command with error handling
@Command("db.query", "Execute database query")
class QueryCommand {
  @Param(z.string().describe("SQL query to execute"))
  query!: string;

  async execute(params: { query: string }): Promise<MCPResponse> {
    try {
      // Simulate query execution
      if (params.query.toLowerCase().includes("drop")) {
        throw new Error("DROP statements are not allowed");
      }

      return {
        content: [
          {
            type: "text",
            text: `Query executed successfully: ${params.query}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Query failed: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

// Command with validation
@Command("validate.email", "Validate email address")
class ValidateEmailCommand {
  @Param(z.string().email().describe("Email address to validate"))
  email!: string;

  async execute(params: { email: string }): Promise<MCPResponse> {
    // Additional custom validation
    const domain = params.email.split("@")[1];
    const allowedDomains = ["example.com", "test.com"];

    if (!allowedDomains.includes(domain)) {
      return {
        content: [
          {
            type: "text",
            text: `Email domain "${domain}" is not in the allowed list: ${allowedDomains.join(
              ", "
            )}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Email "${params.email}" is valid!`,
        },
      ],
    };
  }
}

// Start server with advanced configuration
createHttpServer({
  name: "advanced-example-server",
  version: "1.0.0",
  port: 3001,
  host: "0.0.0.0",
  basePath: "/api",
  plugins: [new DatabasePlugin()],
  logLevel: "debug",
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  // Plugin destroy hooks will be called automatically
  process.exit(0);
});
