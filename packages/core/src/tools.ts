/**
 * MCP Tools Layer
 *
 * Provides executeCommand and help tools for MCP protocol integration
 */

import { z } from "zod";
import { getAllCommands, getCommand } from "./registry.js";

/**
 * MCP Response format
 */
export interface MCPResponse {
  content: Array<{
    type: "text" | "image" | "resource";
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

/**
 * Input schema for executeCommand tool
 */
export interface ExecuteCommandInput {
  type: string;
  params?: Record<string, unknown>;
}

/**
 * Execute a registered command by type
 *
 * @param input - Command type and parameters
 * @returns MCP-formatted response
 */
export async function executeCommand(
  input: ExecuteCommandInput
): Promise<MCPResponse> {
  const { type, params = {} } = input;

  try {
    // Lookup command in registry
    const command = getCommand(type);

    if (!command) {
      // Command not found - return error with available commands
      const availableCommands = getAllCommands()
        .map((cmd) => cmd.type)
        .join(", ");

      return {
        content: [
          {
            type: "text",
            text: `Command "${type}" not found. Available commands: ${availableCommands}`,
          },
        ],
        isError: true,
      };
    }

    // Build Zod schema from command params
    const schemaShape: Record<string, z.ZodTypeAny> = {};
    command.params.forEach((schema, paramName) => {
      schemaShape[paramName] = schema;
    });

    const paramsSchema = z.object(schemaShape);

    // Validate input params
    const validationResult = paramsSchema.safeParse(params);

    if (!validationResult.success) {
      // Parameter validation failed
      const errorMessages = validationResult.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");

      return {
        content: [
          {
            type: "text",
            text: `Parameter validation failed: ${errorMessages}`,
          },
        ],
        isError: true,
      };
    }

    // Call command handler with validated params
    const result = await command.handler(validationResult.data);

    // Format successful response
    return {
      content: [
        {
          type: "text",
          text: typeof result === "string" ? result : JSON.stringify(result),
        },
      ],
    };
  } catch (error) {
    // Handle command execution errors
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      content: [
        {
          type: "text",
          text: `Command execution error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Get help information for all registered commands
 *
 * @returns MCP-formatted help text
 */
export function help(): MCPResponse {
  const commands = getAllCommands();

  if (commands.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: "No commands registered.",
        },
      ],
    };
  }

  // Format command information
  const helpText = commands
    .map((cmd) => {
      let text = `**${cmd.type}**\n${cmd.description}\n`;

      // Add parameter information
      if (cmd.params.size > 0) {
        text += "\nParameters:\n";
        cmd.params.forEach((schema, paramName) => {
          // Extract schema description if available
          const schemaDesc = (schema as any).description || "No description";
          text += `  - ${paramName}: ${schemaDesc}\n`;
        });

        // Generate example usage
        const exampleParams: Record<string, string> = {};
        cmd.params.forEach((schema, paramName) => {
          // Generate example value based on schema type
          const zodType = (schema as any)._def?.typeName;
          switch (zodType) {
            case "ZodString":
              exampleParams[paramName] = '"example"';
              break;
            case "ZodNumber":
              exampleParams[paramName] = "42";
              break;
            case "ZodBoolean":
              exampleParams[paramName] = "true";
              break;
            default:
              exampleParams[paramName] = '"value"';
          }
        });

        text += `\nExample:\n\`\`\`json\n${JSON.stringify(
          { type: cmd.type, params: exampleParams },
          null,
          2
        )}\n\`\`\`\n`;
      } else {
        text += "\nNo parameters required.\n";
        text += `\nExample:\n\`\`\`json\n${JSON.stringify(
          { type: cmd.type },
          null,
          2
        )}\n\`\`\`\n`;
      }

      return text;
    })
    .join("\n---\n\n");

  return {
    content: [
      {
        type: "text",
        text: `# Available Commands\n\n${helpText}`,
      },
    ],
  };
}
