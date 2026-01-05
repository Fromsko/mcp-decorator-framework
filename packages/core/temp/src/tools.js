"use strict";
/**
 * MCP Tools Layer
 *
 * Provides executeCommand and help tools for MCP protocol integration
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
exports.executeCommand = executeCommand;
exports.help = help;
var zod_1 = require("zod");
var registry_js_1 = require("./registry.js");
/**
 * Execute a registered command by type
 *
 * @param input - Command type and parameters
 * @returns MCP-formatted response
 */
function executeCommand(input) {
    return __awaiter(this, void 0, void 0, function () {
        var type, _a, params, command, availableCommands, schemaShape_1, paramsSchema, validationResult, errorMessages, result, error_1, errorMessage;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    type = input.type, _a = input.params, params = _a === void 0 ? {} : _a;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    command = (0, registry_js_1.getCommand)(type);
                    if (!command) {
                        availableCommands = (0, registry_js_1.getAllCommands)()
                            .map(function (cmd) { return cmd.type; })
                            .join(", ");
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: "Command \"".concat(type, "\" not found. Available commands: ").concat(availableCommands),
                                    },
                                ],
                                isError: true,
                            }];
                    }
                    schemaShape_1 = {};
                    command.params.forEach(function (schema, paramName) {
                        schemaShape_1[paramName] = schema;
                    });
                    paramsSchema = zod_1.z.object(schemaShape_1);
                    validationResult = paramsSchema.safeParse(params);
                    if (!validationResult.success) {
                        errorMessages = validationResult.error.errors
                            .map(function (err) { return "".concat(err.path.join("."), ": ").concat(err.message); })
                            .join("; ");
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: "Parameter validation failed: ".concat(errorMessages),
                                    },
                                ],
                                isError: true,
                            }];
                    }
                    return [4 /*yield*/, command.handler(validationResult.data)];
                case 2:
                    result = _b.sent();
                    // Format successful response
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: typeof result === "string" ? result : JSON.stringify(result),
                                },
                            ],
                        }];
                case 3:
                    error_1 = _b.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "Command execution error: ".concat(errorMessage),
                                },
                            ],
                            isError: true,
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get help information for all registered commands
 *
 * @returns MCP-formatted help text
 */
function help() {
    var commands = (0, registry_js_1.getAllCommands)();
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
    var helpText = commands
        .map(function (cmd) {
        var text = "**".concat(cmd.type, "**\n").concat(cmd.description, "\n");
        // Add parameter information
        if (cmd.params.size > 0) {
            text += "\nParameters:\n";
            cmd.params.forEach(function (schema, paramName) {
                // Extract schema description if available
                var schemaDesc = schema.description || "No description";
                text += "  - ".concat(paramName, ": ").concat(schemaDesc, "\n");
            });
            // Generate example usage
            var exampleParams_1 = {};
            cmd.params.forEach(function (schema, paramName) {
                var _a;
                // Generate example value based on schema type
                var zodType = (_a = schema._def) === null || _a === void 0 ? void 0 : _a.typeName;
                switch (zodType) {
                    case "ZodString":
                        exampleParams_1[paramName] = '"example"';
                        break;
                    case "ZodNumber":
                        exampleParams_1[paramName] = "42";
                        break;
                    case "ZodBoolean":
                        exampleParams_1[paramName] = "true";
                        break;
                    default:
                        exampleParams_1[paramName] = '"value"';
                }
            });
            text += "\nExample:\n```json\n".concat(JSON.stringify({ type: cmd.type, params: exampleParams_1 }, null, 2), "\n```\n");
        }
        else {
            text += "\nNo parameters required.\n";
            text += "\nExample:\n```json\n".concat(JSON.stringify({ type: cmd.type }, null, 2), "\n```\n");
        }
        return text;
    })
        .join("\n---\n\n");
    return {
        content: [
            {
                type: "text",
                text: "# Available Commands\n\n".concat(helpText),
            },
        ],
    };
}
