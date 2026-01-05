/**
 * @mcp-decorator/plugin-filesystem
 *
 * Filesystem operations plugin for MCP Decorator Framework
 */

import {
  Command,
  Param,
  type MCPResponse,
  type Plugin,
} from "@mcp-decorator/core";
import * as fs from "fs/promises";
import * as path from "path";
import { z } from "zod";

/**
 * Filesystem plugin options
 */
export interface FilesystemOptions {
  /** Base directory for file operations (security restriction) */
  basePath: string;
  /** Allowed file extensions (optional) */
  allowedExtensions?: string[];
}

let filesystemOptions: FilesystemOptions = {
  basePath: process.cwd(),
};

/**
 * Validate that a file path is within the base path
 */
function validatePath(filePath: string): {
  valid: boolean;
  error?: string;
  resolvedPath?: string;
} {
  const resolvedPath = path.resolve(filesystemOptions.basePath, filePath);
  const basePath = path.resolve(filesystemOptions.basePath);

  if (!resolvedPath.startsWith(basePath)) {
    return {
      valid: false,
      error: `Security violation: Path "${filePath}" is outside the allowed base path`,
    };
  }

  return { valid: true, resolvedPath };
}

/**
 * Read file content
 */
@Command("fs.read", "Read file content")
class ReadFileCommand {
  @Param(z.string().describe("File path relative to base path"))
  path!: string;

  async execute(params: { path: string }): Promise<MCPResponse> {
    const validation = validatePath(params.path);
    if (!validation.valid) {
      return {
        content: [{ type: "text", text: validation.error! }],
        isError: true,
      };
    }

    try {
      const content = await fs.readFile(validation.resolvedPath!, "utf-8");
      return {
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error reading file: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

/**
 * Write file content
 */
@Command("fs.write", "Write file content")
class WriteFileCommand {
  @Param(z.string().describe("File path relative to base path"))
  path!: string;

  @Param(z.string().describe("Content to write"))
  content!: string;

  async execute(params: {
    path: string;
    content: string;
  }): Promise<MCPResponse> {
    const validation = validatePath(params.path);
    if (!validation.valid) {
      return {
        content: [{ type: "text", text: validation.error! }],
        isError: true,
      };
    }

    try {
      await fs.writeFile(validation.resolvedPath!, params.content, "utf-8");
      return {
        content: [
          {
            type: "text",
            text: `Successfully wrote to ${params.path}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error writing file: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

/**
 * List directory contents
 */
@Command("fs.list", "List directory contents")
class ListFilesCommand {
  @Param(z.string().describe("Directory path relative to base path"))
  path!: string;

  async execute(params: { path: string }): Promise<MCPResponse> {
    const validation = validatePath(params.path);
    if (!validation.valid) {
      return {
        content: [{ type: "text", text: validation.error! }],
        isError: true,
      };
    }

    try {
      const entries = await fs.readdir(validation.resolvedPath!, {
        withFileTypes: true,
      });
      const formatted = entries
        .map(
          (entry) => `${entry.isDirectory() ? "[DIR]" : "[FILE]"} ${entry.name}`
        )
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: formatted || "(empty directory)",
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing directory: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

/**
 * Delete file
 */
@Command("fs.delete", "Delete file")
class DeleteFileCommand {
  @Param(z.string().describe("File path relative to base path"))
  path!: string;

  async execute(params: { path: string }): Promise<MCPResponse> {
    const validation = validatePath(params.path);
    if (!validation.valid) {
      return {
        content: [{ type: "text", text: validation.error! }],
        isError: true,
      };
    }

    try {
      await fs.unlink(validation.resolvedPath!);
      return {
        content: [
          {
            type: "text",
            text: `Successfully deleted ${params.path}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error deleting file: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

/**
 * Filesystem Plugin
 *
 * Provides file system operations with security restrictions
 */
export class FilesystemPlugin implements Plugin {
  name = "filesystem";
  version = "0.1.0";

  constructor(private options?: FilesystemOptions) {}

  async init() {
    if (this.options) {
      filesystemOptions = this.options;
    }
  }

  register() {
    return [
      ReadFileCommand,
      WriteFileCommand,
      ListFilesCommand,
      DeleteFileCommand,
    ];
  }
}
