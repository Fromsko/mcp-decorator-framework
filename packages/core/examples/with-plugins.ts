/**
 * Plugin Example
 *
 * Demonstrates how to use pre-built plugins alongside custom commands
 */

import "reflect-metadata";
import { z } from "zod";
import { FilesystemPlugin } from "../../plugin-filesystem/src/index.js";
import { HttpPlugin } from "../../plugin-http/src/index.js";
import { MathPlugin } from "../../plugin-math/src/index.js";
import { Command, Param, createStdioServer } from "../src/index.js";

// Define a custom command alongside plugins
@Command("custom.hello", "Custom greeting command")
class CustomHelloCommand {
  @Param(z.string().describe("Name to greet"))
  name!: string;

  async execute(params: { name: string }) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Hello ${params.name}! This is a custom command running alongside plugins.`,
        },
      ],
    };
  }
}

// Start server with plugins
createStdioServer({
  name: "plugin-example-server",
  version: "1.0.0",
  plugins: [
    new MathPlugin(),
    new FilesystemPlugin({ basePath: process.cwd() }),
    new HttpPlugin({ timeout: 10000 }),
  ],
  logLevel: "info",
}).catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
