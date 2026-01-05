/**
 * Decorator System
 *
 * Provides @Command and @Param decorators for declarative command definition
 */

import "reflect-metadata";
import type { z } from "zod";
import { getCommandRegistry } from "./registry.js";

/**
 * Metadata key for storing parameter schemas
 */
const PARAMS_METADATA_KEY = "command:params";

/**
 * Metadata key for storing command info on class
 */
const COMMAND_METADATA_KEY = "command:info";

/**
 * @Command decorator
 *
 * Marks a class as an MCP command (lazy registration)
 *
 * @param type - Command type identifier (e.g., "math.add")
 * @param description - Human-readable description
 */
export function Command(type: string, description: string): ClassDecorator {
  return function <T extends Function>(target: T): T {
    // Store command metadata on the class for later registration
    Reflect.defineMetadata(COMMAND_METADATA_KEY, { type, description }, target);
    return target;
  };
}

/**
 * Register a command class to the registry
 * Called when instantiating the class (via plugin.register())
 */
export function registerCommand(
  CommandClass: new (...args: any[]) => any
): void {
  const registry = getCommandRegistry();

  // Get stored metadata
  const meta = Reflect.getMetadata(COMMAND_METADATA_KEY, CommandClass);
  if (!meta) {
    throw new Error(
      `Class "${CommandClass.name}" is not decorated with @Command`
    );
  }

  const { type, description } = meta;

  // Skip if already registered
  if (registry.has(type)) {
    return;
  }

  // Instantiate to get handler
  const instance = new CommandClass();

  if (typeof instance.execute !== "function") {
    throw new Error(
      `Command class "${CommandClass.name}" must implement execute() method`
    );
  }

  // Extract parameter metadata
  const paramsMetadata =
    Reflect.getMetadata(PARAMS_METADATA_KEY, CommandClass.prototype) ||
    new Map<string, z.ZodTypeAny>();

  // Register the command
  registry.set(type, {
    type,
    description,
    params: paramsMetadata,
    handler: instance.execute.bind(instance),
  });
}

/**
 * @Param decorator
 *
 * Defines a parameter with Zod schema validation
 *
 * @param schema - Zod schema for parameter validation
 */
export function Param(
  schema: z.ZodTypeAny
): (target: object, propertyKey: string | symbol) => void {
  return function (target: object, propertyKey: string | symbol): void {
    // Get existing params metadata or create new Map
    const existingParams =
      Reflect.getMetadata(PARAMS_METADATA_KEY, target) ||
      new Map<string, z.ZodTypeAny>();

    // Add this parameter's schema
    existingParams.set(propertyKey as string, schema);

    // Store updated metadata
    Reflect.defineMetadata(PARAMS_METADATA_KEY, existingParams, target);
  };
}
