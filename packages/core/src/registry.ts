/**
 * Command Registry
 *
 * Central registry for all MCP commands registered via decorators
 */

import type { z } from "zod";

/**
 * Handler function for command execution
 */
export type CommandHandler = (params: any) => Promise<any>;

/**
 * Metadata for a registered command
 */
export interface CommandMetadata {
  /** Command type identifier (e.g., "math.add") */
  type: string;
  /** Human-readable description */
  description: string;
  /** Map of parameter names to their Zod schemas */
  params: Map<string, z.ZodTypeAny>;
  /** Bound handler function */
  handler: CommandHandler;
}

/**
 * Global command registry
 */
const commandRegistry = new Map<string, CommandMetadata>();

/**
 * Get the entire command registry
 */
export function getCommandRegistry(): Map<string, CommandMetadata> {
  return commandRegistry;
}

/**
 * Get a specific command by type
 */
export function getCommand(type: string): CommandMetadata | undefined {
  return commandRegistry.get(type);
}

/**
 * Get all registered commands as an array
 */
export function getAllCommands(): CommandMetadata[] {
  return Array.from(commandRegistry.values());
}
