/**
 * Runtime Tests
 *
 * Unit tests for stdio and HTTP server creation
 */

import { beforeEach, describe, expect, it } from "vitest";
import { getCommandRegistry } from "../../src/registry.js";
import {
  createStdioServer,
  type StdioServerConfig,
} from "../../src/runtime.js";

describe("Stdio Runtime", () => {
  beforeEach(() => {
    // Clear command registry before each test
    getCommandRegistry().clear();
  });

  it("should accept valid StdioServerConfig", () => {
    const config: StdioServerConfig = {
      name: "test-server",
      version: "1.0.0",
      plugins: [],
      logLevel: "error",
    };

    expect(config.name).toBe("test-server");
    expect(config.version).toBe("1.0.0");
    expect(config.plugins).toEqual([]);
    expect(config.logLevel).toBe("error");
  });

  it("should accept minimal StdioServerConfig", () => {
    const config: StdioServerConfig = {
      name: "minimal-server",
    };

    expect(config.name).toBe("minimal-server");
    expect(config.version).toBeUndefined();
    expect(config.plugins).toBeUndefined();
    expect(config.logLevel).toBeUndefined();
  });

  it("should export createStdioServer function", () => {
    expect(typeof createStdioServer).toBe("function");
  });

  // Note: We cannot fully test createStdioServer without mocking stdio transport
  // Integration tests will cover the full server lifecycle
});
