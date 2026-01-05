/**
 * @mcp-decorator/plugin-math
 *
 * Math operations plugin for MCP Decorator Framework
 */

import {
  Command,
  Param,
  type MCPResponse,
  type Plugin,
} from "@mcp-decorator/core";
import { z } from "zod";

/**
 * Add two numbers
 */
@Command("math.add", "Add two numbers")
class AddCommand {
  @Param(z.number().describe("First number"))
  a!: number;

  @Param(z.number().describe("Second number"))
  b!: number;

  async execute(params: { a: number; b: number }): Promise<MCPResponse> {
    const result = params.a + params.b;
    return {
      content: [
        {
          type: "text",
          text: `${params.a} + ${params.b} = ${result}`,
        },
      ],
    };
  }
}

/**
 * Subtract two numbers
 */
@Command("math.subtract", "Subtract two numbers")
class SubtractCommand {
  @Param(z.number().describe("First number"))
  a!: number;

  @Param(z.number().describe("Second number"))
  b!: number;

  async execute(params: { a: number; b: number }): Promise<MCPResponse> {
    const result = params.a - params.b;
    return {
      content: [
        {
          type: "text",
          text: `${params.a} - ${params.b} = ${result}`,
        },
      ],
    };
  }
}

/**
 * Multiply two numbers
 */
@Command("math.multiply", "Multiply two numbers")
class MultiplyCommand {
  @Param(z.number().describe("First number"))
  a!: number;

  @Param(z.number().describe("Second number"))
  b!: number;

  async execute(params: { a: number; b: number }): Promise<MCPResponse> {
    const result = params.a * params.b;
    return {
      content: [
        {
          type: "text",
          text: `${params.a} × ${params.b} = ${result}`,
        },
      ],
    };
  }
}

/**
 * Divide two numbers
 */
@Command("math.divide", "Divide two numbers")
class DivideCommand {
  @Param(z.number().describe("Numerator"))
  a!: number;

  @Param(z.number().describe("Denominator"))
  b!: number;

  async execute(params: { a: number; b: number }): Promise<MCPResponse> {
    // Handle division by zero
    if (params.b === 0) {
      return {
        content: [
          {
            type: "text",
            text: "Error: Division by zero is not allowed",
          },
        ],
        isError: true,
      };
    }

    const result = params.a / params.b;
    return {
      content: [
        {
          type: "text",
          text: `${params.a} ÷ ${params.b} = ${result}`,
        },
      ],
    };
  }
}

/**
 * Math Plugin
 *
 * Provides basic arithmetic operations
 */
export class MathPlugin implements Plugin {
  name = "math";
  version = "0.1.0";

  register() {
    return [AddCommand, SubtractCommand, MultiplyCommand, DivideCommand];
  }
}
