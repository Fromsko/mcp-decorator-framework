/**
 * Unit tests for MCP tools layer
 */

import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import {
  Command,
  Param,
  executeCommand,
  getCommandRegistry,
  help,
} from "../../src/index.js";

describe("MCP Tools Layer", () => {
  beforeEach(() => {
    // Clear registry before each test
    getCommandRegistry().clear();
  });

  describe("executeCommand", () => {
    it("should execute a command successfully", async () => {
      @Command("test.add", "Add two numbers")
      class AddCommand {
        @Param(z.number())
        a!: number;

        @Param(z.number())
        b!: number;

        async execute(params: { a: number; b: number }) {
          return { result: params.a + params.b };
        }
      }

      const response = await executeCommand({
        type: "test.add",
        params: { a: 5, b: 3 },
      });

      expect(response.isError).toBeUndefined();
      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe("text");
      expect(response.content[0].text).toContain("8");
    });

    it("should return error for unknown command", async () => {
      @Command("test.known", "A known command")
      class KnownCommand {
        async execute() {
          return { result: "success" };
        }
      }

      const response = await executeCommand({
        type: "test.unknown",
        params: {},
      });

      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain(
        'Command "test.unknown" not found'
      );
      expect(response.content[0].text).toContain("test.known");
    });

    it("should validate parameters with Zod schema", async () => {
      @Command("test.validate", "Test validation")
      class ValidateCommand {
        @Param(z.string())
        name!: string;

        @Param(z.number())
        age!: number;

        async execute(params: { name: string; age: number }) {
          return { name: params.name, age: params.age };
        }
      }

      const response = await executeCommand({
        type: "test.validate",
        params: { name: "John", age: "not a number" },
      });

      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain("Parameter validation failed");
      expect(response.content[0].text).toContain("age");
    });

    it("should handle command execution errors", async () => {
      @Command("test.error", "Command that throws error")
      class ErrorCommand {
        async execute() {
          throw new Error("Something went wrong");
        }
      }

      const response = await executeCommand({
        type: "test.error",
        params: {},
      });

      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain("Command execution error");
      expect(response.content[0].text).toContain("Something went wrong");
    });

    it("should work with commands without parameters", async () => {
      @Command("test.noparams", "Command without params")
      class NoParamsCommand {
        async execute() {
          return { message: "success" };
        }
      }

      const response = await executeCommand({
        type: "test.noparams",
      });

      expect(response.isError).toBeUndefined();
      expect(response.content[0].text).toContain("success");
    });

    it("should handle string return values", async () => {
      @Command("test.string", "Returns a string")
      class StringCommand {
        async execute() {
          return "Hello, World!";
        }
      }

      const response = await executeCommand({
        type: "test.string",
        params: {},
      });

      expect(response.isError).toBeUndefined();
      expect(response.content[0].text).toBe("Hello, World!");
    });
  });

  describe("help", () => {
    it("should return help for all registered commands", () => {
      @Command("test.first", "First test command")
      class FirstCommand {
        @Param(z.string())
        input!: string;

        async execute(params: { input: string }) {
          return { result: params.input };
        }
      }

      @Command("test.second", "Second test command")
      class SecondCommand {
        async execute() {
          return { result: "second" };
        }
      }

      const response = help();

      expect(response.isError).toBeUndefined();
      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe("text");

      const helpText = response.content[0].text!;
      expect(helpText).toContain("test.first");
      expect(helpText).toContain("First test command");
      expect(helpText).toContain("test.second");
      expect(helpText).toContain("Second test command");
      expect(helpText).toContain("Parameters:");
      expect(helpText).toContain("input");
    });

    it("should handle empty registry", () => {
      const response = help();

      expect(response.isError).toBeUndefined();
      expect(response.content[0].text).toBe("No commands registered.");
    });

    it("should generate example usage", () => {
      @Command("test.example", "Example command")
      class ExampleCommand {
        @Param(z.string())
        name!: string;

        @Param(z.number())
        count!: number;

        async execute(params: { name: string; count: number }) {
          return { name: params.name, count: params.count };
        }
      }

      const response = help();
      const helpText = response.content[0].text!;

      expect(helpText).toContain("Example:");
      expect(helpText).toContain("test.example");
      expect(helpText).toContain("name");
      expect(helpText).toContain("count");
    });

    it("should show commands without parameters", () => {
      @Command("test.simple", "Simple command")
      class SimpleCommand {
        async execute() {
          return { result: "simple" };
        }
      }

      const response = help();
      const helpText = response.content[0].text!;

      expect(helpText).toContain("test.simple");
      expect(helpText).toContain("No parameters required");
    });
  });
});
