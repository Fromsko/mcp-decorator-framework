/**
 * @mcp-decorator/core
 *
 * Core framework for building MCP servers with TypeScript decorators
 */

// Export decorators
export { Command, Param, registerCommand } from "./decorators.js";

// Export registry functions and types
export {
  getAllCommands,
  getCommand,
  getCommandRegistry,
  type CommandHandler,
  type CommandMetadata,
} from "./registry.js";

// Export MCP tools
export {
  executeCommand,
  help,
  type ExecuteCommandInput,
  type MCPResponse,
} from "./tools.js";

// Export plugin system
export {
  destroyPlugins,
  getLoadedPlugins,
  loadPlugins,
  type CommandClass,
  type Plugin,
} from "./plugin.js";

// Export runtime
export {
  createHttpServer,
  createMcpApp,
  createStdioServer,
  type HttpServerConfig,
  type McpAppConfig,
  type StdioServerConfig,
} from "./runtime.js";
