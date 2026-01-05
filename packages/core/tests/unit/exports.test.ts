/**
 * Test: Core package exports
 *
 * Verifies all expected exports are available from @mcp-decorator/core
 */

import { describe, expect, it } from "vitest";
import * as core from "../../src/index.js";

describe("Core Package Exports", () => {
  it("should export decorators", () => {
    expect(core.Command).toBeDefined();
    expect(core.Param).toBeDefined();
    expect(typeof core.Command).toBe("function");
    expect(typeof core.Param).toBe("function");
  });

  it("should export registry functions", () => {
    expect(core.getCommandRegistry).toBeDefined();
    expect(core.getCommand).toBeDefined();
    expect(core.getAllCommands).toBeDefined();
    expect(typeof core.getCommandRegistry).toBe("function");
    expect(typeof core.getCommand).toBe("function");
    expect(typeof core.getAllCommands).toBe("function");
  });

  it("should export runtime functions", () => {
    expect(core.createStdioServer).toBeDefined();
    expect(core.createHttpServer).toBeDefined();
    expect(typeof core.createStdioServer).toBe("function");
    expect(typeof core.createHttpServer).toBe("function");
  });

  it("should export MCP tools", () => {
    expect(core.executeCommand).toBeDefined();
    expect(core.help).toBeDefined();
    expect(typeof core.executeCommand).toBe("function");
    expect(typeof core.help).toBe("function");
  });

  it("should export plugin functions", () => {
    expect(core.loadPlugins).toBeDefined();
    expect(core.getLoadedPlugins).toBeDefined();
    expect(core.destroyPlugins).toBeDefined();
    expect(typeof core.loadPlugins).toBe("function");
    expect(typeof core.getLoadedPlugins).toBe("function");
    expect(typeof core.destroyPlugins).toBe("function");
  });
});
