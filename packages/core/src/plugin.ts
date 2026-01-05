/**
 * Plugin System
 *
 * Interfaces and loader for MCP command plugins
 */

import { registerCommand } from "./decorators";

/**
 * Command class constructor type
 */
export type CommandClass = new (...args: any[]) => {
  execute(params: any): Promise<any>;
};

/**
 * Plugin interface
 *
 * Plugins provide reusable command packages that can be loaded into the framework
 */
export interface Plugin {
  /** Plugin identifier */
  name: string;

  /** Semantic version */
  version: string;

  /**
   * Optional initialization hook
   * Called before commands are registered
   */
  init?(options?: any): Promise<void>;

  /**
   * Register command classes
   * Returns array of command class constructors
   */
  register(): CommandClass[];

  /**
   * Optional cleanup hook
   * Called when plugin is being unloaded
   */
  destroy?(): Promise<void>;
}

/**
 * Loaded plugin references for lifecycle management
 */
const loadedPlugins: Plugin[] = [];

/**
 * Load and register plugins
 *
 * @param plugins - Array of plugin instances to load
 * @throws Error if plugin fails to load
 */
export async function loadPlugins(plugins: Plugin[]): Promise<void> {
  for (const plugin of plugins) {
    try {
      // Call init hook if defined
      if (plugin.init) {
        await plugin.init();
      }

      // Get command classes from plugin
      const commandClasses = plugin.register();

      // Register each command class (lazy registration)
      for (const CommandClass of commandClasses) {
        registerCommand(CommandClass);
      }

      // Store plugin reference for lifecycle management
      loadedPlugins.push(plugin);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to load plugin "${plugin.name}": ${errorMessage}`
      );
    }
  }
}

/**
 * Get all loaded plugins
 */
export function getLoadedPlugins(): Plugin[] {
  return [...loadedPlugins];
}

/**
 * Destroy all loaded plugins
 */
export async function destroyPlugins(): Promise<void> {
  for (const plugin of loadedPlugins) {
    if (plugin.destroy) {
      await plugin.destroy();
    }
  }
  loadedPlugins.length = 0;
}
