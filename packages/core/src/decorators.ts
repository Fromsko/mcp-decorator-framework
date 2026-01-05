/**
 * Decorator System
 *
 * Provides @Command and @Param decorators for declarative command definition
 */

import "reflect-metadata";
import type { z } from "zod";
import { getCommandRegistry, type CommandMetadata } from "./registry.js";

/**
 * Metadata key for storing parameter schemas
 */
const PARAMS_METADATA_KEY = "command:params";

/**
 * @Command decorator
 *
 * Registers a class as an MCP command
 *
 * @param type - Command type identifier (e.g., "math.add")
 * @param description - Human-readable description
 */
export function Command(type: string, description: string): ClassDecorator {
  return function <T extends Function>(target: T): T {
    // Get the command registry
    const registry = getCommandRegistry();

    // Check for duplicate command type
    if (registry.has(type)) {
      throw new Error(`Command type "${type}" is already registered`);
    }

    // Instantiate the class to access its methods
    const instance = new (target as any)();

    // Verify execute method exists
    if (typeof instance.execute !== "function") {
      throw new Error(
        `Command class "${target.name}" must implement execute() method`
      );
    }

    // Extract parameter metadata
    const paramsMetadata =
      Reflect.getMetadata(PARAMS_METADATA_KEY, target.prototype) ||
      new Map<string, z.ZodTypeAny>();

    // Create command metadata
    const metadata: CommandMetadata = {
      type,
      description,
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
export function Param(schema: z.ZodTypeAny): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol): void {
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
