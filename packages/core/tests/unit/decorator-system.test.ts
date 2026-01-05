/**
 * Unit tests for decorator system
 */

import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import {
  Command,
  Param,
  getAllCommands,
  getCommand,
  getCommandRegistry,
} from "../../src/index.js";

describe("Decorator System", () => {
  beforeEach(() => {
    // Clear registry before each test
    getCommandRegistry().clear();
  });

  describe("Command Registry", () => {
    it("should register a command with @Command decorator", () => {
      @Command("test.simple", "A simple test command")
      class SimpleCommand {
        async execute() {
          return { result: "success" };
        }
      }

      const registry = getCommandRegistry();
      expect(registry.size).toBe(1);
      expect(registry.has("test.simple")).toBe(true);
    });

    it("should retrieve command metadata with getCommand", () => {
      @Command("test.retrieve", "Test retrieval")
      class RetrieveCommand {
        async execute() {
          return { result: "retrieved" };
        }
      }

      const command = getCommand("test.retrieve");
      expect(command).toBeDefined();
      expect(command?.type).toBe("test.retrieve");
      expect(command?.description).toBe("Test retrieval");
      expect(typeof command?.handler).toBe("function");
    });

    it("should list all commands with getAllCommands", () => {
      @Command("test.first", "First command")
      class FirstCommand {
        async execute() {
          return { result: "first" };
        }
      }

      @Command("test.second", "Second command")
      class SecondCommand {
        async execute() {
          return { result: "second" };
        }
      }

      const commands = getAllCommands();
      expect(commands).toHaveLength(2);
      expect(commands.map((c) => c.type)).toContain("test.first");
      expect(commands.map((c) => c.type)).toContain("test.second");
    });

    it("should throw error for duplicate command types", () => {
      @Command("test.duplicate", "First registration")
      class FirstDuplicate {
        async execute() {
          return { result: "first" };
        }
      }

      expect(() => {
        @Command("test.duplicate", "Second registration")
        class SecondDuplicate {
          async execute() {
            return { result: "second" };
          }
        }
      }).toThrow('Command type "test.duplicate" is already registered');
    });
  });

  describe("@Param Decorator", () => {
    it("should store parameter schemas in metadata", () => {
      @Command("test.params", "Command with parameters")
      class ParamCommand {
        @Param(z.string())
        name!: string;

        @Param(z.number())
        age!: number;

        async execute(params: any) {
          return { name: params.name, age: params.age };
        }
      }

      const command = getCommand("test.params");
      expect(command).toBeDefined();
      expect(command?.params.size).toBe(2);
      expect(command?.params.has("name")).toBe(true);
      expect(command?.params.has("age")).toBe(true);
    });

    it("should work with commands without parameters", () => {
      @Command("test.noparams", "Command without parameters")
      class NoParamCommand {
        async execute() {
          return { result: "no params" };
        }
      }

      const command = getCommand("test.noparams");
      expect(command).toBeDefined();
      expect(command?.params.size).toBe(0);
    });
  });

  describe("Command Execution", () => {
    it("should bind execute method correctly", async () => {
      @Command("test.execute", "Test execution")
      class ExecuteCommand {
        private value = 42;

        async execute() {
          return { value: this.value };
        }
      }

      const command = getCommand("test.execute");
      expect(command).toBeDefined();

      const result = await command!.handler({});
      expect(result).toEqual({ value: 42 });
    });

    it("should pass parameters to execute method", async () => {
      @Command("test.withparams", "Test with params")
      class WithParamsCommand {
        @Param(z.number())
        a!: number;

        @Param(z.number())
        b!: number;

        async execute(params: { a: number; b: number }) {
          return { sum: params.a + params.b };
        }
      }

      const command = getCommand("test.withparams");
      expect(command).toBeDefined();

      const result = await command!.handler({ a: 10, b: 20 });
      expect(result).toEqual({ sum: 30 });
    });
  });
});
