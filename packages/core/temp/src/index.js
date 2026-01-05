"use strict";
/**
 * @mcp-decorator/core
 *
 * Core framework for building MCP servers with TypeScript decorators
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStdioServer = exports.createHttpServer = exports.loadPlugins = exports.getLoadedPlugins = exports.destroyPlugins = exports.help = exports.executeCommand = exports.getCommandRegistry = exports.getCommand = exports.getAllCommands = exports.Param = exports.Command = void 0;
// Export decorators
var decorators_js_1 = require("./decorators.js");
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return decorators_js_1.Command; } });
Object.defineProperty(exports, "Param", { enumerable: true, get: function () { return decorators_js_1.Param; } });
// Export registry functions and types
var registry_js_1 = require("./registry.js");
Object.defineProperty(exports, "getAllCommands", { enumerable: true, get: function () { return registry_js_1.getAllCommands; } });
Object.defineProperty(exports, "getCommand", { enumerable: true, get: function () { return registry_js_1.getCommand; } });
Object.defineProperty(exports, "getCommandRegistry", { enumerable: true, get: function () { return registry_js_1.getCommandRegistry; } });
// Export MCP tools
var tools_js_1 = require("./tools.js");
Object.defineProperty(exports, "executeCommand", { enumerable: true, get: function () { return tools_js_1.executeCommand; } });
Object.defineProperty(exports, "help", { enumerable: true, get: function () { return tools_js_1.help; } });
// Export plugin system
var plugin_js_1 = require("./plugin.js");
Object.defineProperty(exports, "destroyPlugins", { enumerable: true, get: function () { return plugin_js_1.destroyPlugins; } });
Object.defineProperty(exports, "getLoadedPlugins", { enumerable: true, get: function () { return plugin_js_1.getLoadedPlugins; } });
Object.defineProperty(exports, "loadPlugins", { enumerable: true, get: function () { return plugin_js_1.loadPlugins; } });
// Export runtime
var runtime_js_1 = require("./runtime.js");
Object.defineProperty(exports, "createHttpServer", { enumerable: true, get: function () { return runtime_js_1.createHttpServer; } });
Object.defineProperty(exports, "createStdioServer", { enumerable: true, get: function () { return runtime_js_1.createStdioServer; } });
