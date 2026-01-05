/**
 * Unit tests for decorator system
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Decorator type checking issues in test files
import "reflect-metadata";
import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import {
  Command,
  Param,
  getAllCommands,
  getCommand,
  getCommandRegistry,
  registerCommand,
} from "../../src/index.js";

// Test classes with @Param must be defined at module level
@Command("test.params", "Command with parameters")
class ParamCommand {
  @Param(z.string())
  name!: string;

  @Param(z.number())
  age!: number;

  async execute(params: { name: string; age: number }) {
    return { name: params.name, age: params.age };
  }
}

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

describe("Decorator System", () => {
  beforeEach(() => {
    getCommandRegistry().clear();
  });

  describe("Command Registry", () => {
    it("should register a command with @Command decorator and registerCommand", () => {
      @Command("test.simple", "A simple test command")
      class SimpleCommand {
        async execute() {
          return { result: "success" };
        }
      }

      registerCommand(SimpleCommand);

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

      registerCommand(RetrieveCommand);

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

      registerCommand(FirstCommand);
      registerCommand(SecondCommand);

      const commands = getAllCommands();
      expect(commands).toHaveLength(2);
      expect(commands.map((c) => c.type)).toContain("test.first");
      expect(commands.map((c) => c.type)).toContain("test.second");
    });

    it("should skip duplicate registration silently", () => {
      @Command("test.duplicate", "First registration")
      class DuplicateCommand {
        async execute() {
          return { result: "first" };
        }
      }

      registerCommand(DuplicateCommand);
      registerCommand(DuplicateCommand);

      const registry = getCommandRegistry();
      expect(registry.size).toBe(1);
    });
  });

  describe("@Param Decorator", () => {
    it("should store parameter schemas in metadata", () => {
      registerCommand(ParamCommand);

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

      registerCommand(NoParamCommand);

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

      registerCommand(ExecuteCommand);

      const command = getCommand("test.execute");
      expect(command).toBeDefined();

      const result = await command!.handler({});
      expect(result).toEqual({ value: 42 });
    });

    it("should pass parameters to execute method", async () => {
      registerCommand(WithParamsCommand);

      const command = getCommand("test.withparams");
      expect(command).toBeDefined();

      const result = await command!.handler({ a: 10, b: 20 });
      expect(result).toEqual({ sum: 30 });
    });
  });
});
