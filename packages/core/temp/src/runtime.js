"use strict";
/**
 * Runtime Layer
 *
 * Provides stdio and HTTP server implementations for MCP protocol
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStdioServer = createStdioServer;
exports.createHttpServer = createHttpServer;
var node_server_1 = require("@hono/node-server");
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var hono_1 = require("hono");
var mcp_handler_1 = require("mcp-handler");
var zod_1 = require("zod");
var plugin_js_1 = require("./plugin.js");
var tools_js_1 = require("./tools.js");
/**
 * Create and start an MCP server using stdio transport
 *
 * @param config - Server configuration
 */
function createStdioServer(config) {
    return __awaiter(this, void 0, void 0, function () {
        var name, _a, version, _b, plugins, _c, logLevel, server, transport;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    name = config.name, _a = config.version, version = _a === void 0 ? "1.0.0" : _a, _b = config.plugins, plugins = _b === void 0 ? [] : _b, _c = config.logLevel, logLevel = _c === void 0 ? "info" : _c;
                    if (!(plugins.length > 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, plugin_js_1.loadPlugins)(plugins)];
                case 1:
                    _d.sent();
                    _d.label = 2;
                case 2:
                    server = new index_js_1.Server({
                        name: name,
                        version: version,
                    }, {
                        capabilities: {
                            tools: {},
                        },
                    });
                    // Register list tools handler
                    server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, {
                                    tools: [
                                        {
                                            name: "executeCommand",
                                            description: "Execute a registered MCP command by type with optional parameters",
                                            inputSchema: {
                                                type: "object",
                                                properties: {
                                                    type: {
                                                        type: "string",
                                                        description: "Command type identifier (e.g., 'math.add')",
                                                    },
                                                    params: {
                                                        type: "object",
                                                        description: "Command-specific parameters",
                                                    },
                                                },
                                                required: ["type"],
                                            },
                                        },
                                        {
                                            name: "help",
                                            description: "Get help information for all registered commands with descriptions and parameter schemas",
                                            inputSchema: {
                                                type: "object",
                                                properties: {},
                                            },
                                        },
                                    ],
                                }];
                        });
                    }); });
                    // Register call tool handler
                    server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, toolName, args, input, response, response, error_1, errorMessage;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = request.params, toolName = _a.name, args = _a.arguments;
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 5, , 6]);
                                    if (!(toolName === "executeCommand")) return [3 /*break*/, 3];
                                    input = {
                                        type: (args === null || args === void 0 ? void 0 : args.type) || "",
                                        params: args === null || args === void 0 ? void 0 : args.params,
                                    };
                                    return [4 /*yield*/, (0, tools_js_1.executeCommand)(input)];
                                case 2:
                                    response = _b.sent();
                                    return [2 /*return*/, {
                                            content: response.content,
                                            isError: response.isError,
                                        }];
                                case 3:
                                    if (toolName === "help") {
                                        response = (0, tools_js_1.help)();
                                        return [2 /*return*/, {
                                                content: response.content,
                                            }];
                                    }
                                    else {
                                        // Unknown tool
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: "Unknown tool: ".concat(toolName, ". Available tools: executeCommand, help"),
                                                    },
                                                ],
                                                isError: true,
                                            }];
                                    }
                                    _b.label = 4;
                                case 4: return [3 /*break*/, 6];
                                case 5:
                                    error_1 = _b.sent();
                                    errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Tool execution error: ".concat(errorMessage),
                                                },
                                            ],
                                            isError: true,
                                        }];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); });
                    transport = new stdio_js_1.StdioServerTransport();
                    // Connect server to transport
                    return [4 /*yield*/, server.connect(transport)];
                case 3:
                    // Connect server to transport
                    _d.sent();
                    // Log server start (if not in error-only mode)
                    if (logLevel !== "error") {
                        console.error("MCP server \"".concat(name, "\" v").concat(version, " started on stdio"));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Create and start an MCP server using HTTP transport
 *
 * @param config - Server configuration
 */
function createHttpServer(config) {
    return __awaiter(this, void 0, void 0, function () {
        var name, _a, version, _b, port, _c, host, _d, basePath, _e, plugins, _f, logLevel, app, mcpHandler, mcpPath, serverUrl, mcpEndpoint;
        var _this = this;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    name = config.name, _a = config.version, version = _a === void 0 ? "1.0.0" : _a, _b = config.port, port = _b === void 0 ? 3000 : _b, _c = config.host, host = _c === void 0 ? "localhost" : _c, _d = config.basePath, basePath = _d === void 0 ? "" : _d, _e = config.plugins, plugins = _e === void 0 ? [] : _e, _f = config.logLevel, logLevel = _f === void 0 ? "info" : _f;
                    if (!(plugins.length > 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, plugin_js_1.loadPlugins)(plugins)];
                case 1:
                    _g.sent();
                    _g.label = 2;
                case 2:
                    app = new hono_1.Hono();
                    mcpHandler = (0, mcp_handler_1.createMcpHandler)(function (server) {
                        // Register executeCommand tool
                        server.tool("executeCommand", "Execute a registered MCP command by type with optional parameters", {
                            type: zod_1.z
                                .string()
                                .describe("Command type identifier (e.g., 'math.add')"),
                            params: zod_1.z
                                .record(zod_1.z.unknown())
                                .optional()
                                .describe("Command-specific parameters"),
                        }, function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var input;
                            var type = _b.type, _c = _b.params, params = _c === void 0 ? {} : _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        input = {
                                            type: type,
                                            params: params,
                                        };
                                        return [4 /*yield*/, (0, tools_js_1.executeCommand)(input)];
                                    case 1: return [2 /*return*/, _d.sent()];
                                }
                            });
                        }); });
                        // Register help tool
                        server.tool("help", "Get help information for all registered commands with descriptions and parameter schemas", {}, function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, (0, tools_js_1.help)()];
                            });
                        }); });
                    }, {}, {
                        basePath: basePath || "/",
                        maxDuration: 60,
                        verboseLogs: logLevel === "debug",
                    });
                    mcpPath = "".concat(basePath, "/mcp");
                    app.all("".concat(mcpPath, "/*"), function (c) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, mcpHandler(c.req.raw)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); });
                    // Start HTTP server
                    (0, node_server_1.serve)({
                        fetch: app.fetch,
                        port: port,
                        hostname: host,
                    });
                    // Log server start (if not in error-only mode)
                    if (logLevel !== "error") {
                        serverUrl = "http://".concat(host, ":").concat(port);
                        mcpEndpoint = "".concat(serverUrl).concat(mcpPath);
                        console.log("MCP server \"".concat(name, "\" v").concat(version, " started"));
                        console.log("Server URL: ".concat(serverUrl));
                        console.log("MCP endpoint: ".concat(mcpEndpoint));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
