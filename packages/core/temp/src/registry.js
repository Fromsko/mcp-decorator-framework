"use strict";
/**
 * Command Registry
 *
 * Central registry for all MCP commands registered via decorators
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommandRegistry = getCommandRegistry;
exports.getCommand = getCommand;
exports.getAllCommands = getAllCommands;
/**
 * Global command registry
 */
var commandRegistry = new Map();
/**
 * Get the entire command registry
 */
function getCommandRegistry() {
    return commandRegistry;
}
/**
 * Get a specific command by type
 */
function getCommand(type) {
    return commandRegistry.get(type);
}
/**
 * Get all registered commands as an array
 */
function getAllCommands() {
    return Array.from(commandRegistry.values());
}
