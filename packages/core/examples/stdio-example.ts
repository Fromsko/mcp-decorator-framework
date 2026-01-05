/**
 * Simple stdio server example
 *
 * This demonstrates how to create a basic MCP server using stdio transport
 */

import "reflect-metadata";
import { z } from "zod";
import { Command, Param, createStdioServer } from "../src/index.js";

// Define a simple greeting command
@Command("greet", "Greet a person by name")
class GreetCommand {
  @Param(z.string().describe("Name of the person to greet"))
  name!: string;

  async execute(params: { name: string }) {
    return `Hello, ${params.name}!`;
  }
}

// Define a simple math command
@Command("add", "Add two numbers")
class AddCommand {
  @Param(z.number().describe("First number"))
  a!: number;

  @Param(z.number().describe("Second number"))
  b!: number;

  async execute(params: { a: number; b: number }) {
    return { result: params.a + params.b };
  }
}

// Start the stdio server
createStdioServer({
  name: "example-stdio-server",
  version: "1.0.0",
  logLevel: "info",
}).catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
