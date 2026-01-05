"use strict";
/**
 * Decorator System
 *
 * Provides @Command and @Param decorators for declarative command definition
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = Command;
exports.Param = Param;
require("reflect-metadata");
var registry_js_1 = require("./registry.js");
/**
 * Metadata key for storing parameter schemas
 */
var PARAMS_METADATA_KEY = "command:params";
/**
 * @Command decorator
 *
 * Registers a class as an MCP command
 *
 * @param type - Command type identifier (e.g., "math.add")
 * @param description - Human-readable description
 */
function Command(type, description) {
    return function (target) {
        // Get the command registry
        var registry = (0, registry_js_1.getCommandRegistry)();
        // Check for duplicate command type
        if (registry.has(type)) {
            throw new Error("Command type \"".concat(type, "\" is already registered"));
        }
        // Instantiate the class to access its methods
        var instance = new target();
        // Verify execute method exists
        if (typeof instance.execute !== "function") {
            throw new Error("Command class \"".concat(target.name, "\" must implement execute() method"));
        }
        // Extract parameter metadata
        var paramsMetadata = Reflect.getMetadata(PARAMS_METADATA_KEY, target.prototype) ||
            new Map();
        // Create command metadata
        var metadata = {
            type: type,
            description: description,
            params: paramsMetadata,
            handler: instance.execute.bind(instance),
        };
        // Register the command
        registry.set(type, metadata);
        return target;
    };
}
/**
 * @Param decorator
 *
 * Defines a parameter with Zod schema validation
 *
 * @param schema - Zod schema for parameter validation
 */
function Param(schema) {
    return function (target, propertyKey) {
        // Get existing params metadata or create new Map
        var existingParams = Reflect.getMetadata(PARAMS_METADATA_KEY, target) ||
            new Map();
        // Add this parameter's schema
        existingParams.set(propertyKey, schema);
        // Store updated metadata
        Reflect.defineMetadata(PARAMS_METADATA_KEY, existingParams, target);
    };
}
