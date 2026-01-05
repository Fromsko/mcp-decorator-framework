/**
 * HTTP Server Example
 *
 * Demonstrates how to create an MCP server using HTTP transport
 */

import "reflect-metadata";
import { z } from "zod";
import { Command, Param, createHttpServer } from "../src/index.js";

// Define a simple greeting command
@Command("greet", "Greet a person by name")
class GreetCommand {
  @Param(z.string().describe("Name of the person to greet"))
  name!: string;

  async execute(params: { name: string }) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Hello, ${params.name}! Welcome to the MCP HTTP server.`,
        },
      ],
    };
  }
}

// Define a math command
@Command("math.add", "Add two numbers")
class AddCommand {
  @Param(z.number().describe("First number"))
  a!: number;

  @Param(z.number().describe("Second number"))
  b!: number;

  async execute(params: { a: number; b: number }) {
    const result = params.a + params.b;
    return {
      content: [
        {
          type: "text" as const,
          text: `${params.a} + ${params.b} = ${result}`,
        },
      ],
    };
  }
}

// Start the HTTP server
createHttpServer({
  name: "example-http-server",
  version: "1.0.0",
  port: 3000,
  host: "localhost",
  basePath: "",
  logLevel: "info",
});
