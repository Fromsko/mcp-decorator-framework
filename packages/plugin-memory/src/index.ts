/**
 * @mcp-decorator/plugin-memory
 *
 * Memory storage plugin with SQLite backend, keyword graph indexing, and WebDAV sync
 */

import {
  Command,
  Param,
  type MCPResponse,
  type Plugin,
} from "@mcp-decorator/core";
import { z } from "zod";
import { MemoryService } from "./memory-service.js";
import type { MemoryPluginOptions } from "./types.js";

// 全局服务实例
let memoryService: MemoryService | null = null;

function getService(): MemoryService {
  if (!memoryService) throw new Error("Memory service not initialized");
  return memoryService;
}

// ==================== Commands ====================

@Command("memory.create", "Create a new memory entry")
class CreateMemoryCommand {
  @Param(z.string().describe("Memory content"))
  content!: string;

  @Param(z.array(z.string()).describe("Keywords for indexing"))
  keywords!: string[];

  @Param(z.string().optional().describe("Category name"))
  category?: string;

  @Param(z.record(z.unknown()).optional().describe("Additional metadata"))
  metadata?: Record<string, unknown>;

  async execute(params: {
    content: string;
    keywords: string[];
    category?: string;
    metadata?: Record<string, unknown>;
  }): Promise<MCPResponse> {
    try {
      const entry = await getService().create({
        content: params.content,
        keywords: params.keywords,
        category: params.category,
        metadata: params.metadata,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

@Command("memory.read", "Read a memory entry by ID")
class ReadMemoryCommand {
  @Param(z.string().describe("Memory entry ID"))
  id!: string;

  async execute(params: { id: string }): Promise<MCPResponse> {
    try {
      const entry = await getService().read(params.id);
      if (!entry) {
        return {
          content: [{ type: "text", text: "Memory not found" }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

@Command("memory.update", "Update a memory entry")
class UpdateMemoryCommand {
  @Param(z.string().describe("Memory entry ID"))
  id!: string;

  @Param(z.string().optional().describe("New content"))
  content?: string;

  @Param(z.array(z.string()).optional().describe("New keywords"))
  keywords?: string[];

  @Param(z.string().optional().describe("New category"))
  category?: string;

  async execute(params: {
    id: string;
    content?: string;
    keywords?: string[];
    category?: string;
  }): Promise<MCPResponse> {
    try {
      const { id, ...updates } = params;
      const entry = await getService().update(id, updates);

      if (!entry) {
        return {
          content: [{ type: "text", text: "Memory not found" }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

@Command("memory.delete", "Delete a memory entry")
class DeleteMemoryCommand {
  @Param(z.string().describe("Memory entry ID"))
  id!: string;

  async execute(params: { id: string }): Promise<MCPResponse> {
    try {
      const deleted = await getService().delete(params.id);
      return {
        content: [
          {
            type: "text",
            text: deleted ? "Deleted successfully" : "Memory not found",
          },
        ],
        isError: !deleted,
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

@Command("memory.list", "List memory entries")
class ListMemoryCommand {
  @Param(z.string().optional().describe("Filter by category"))
  category?: string;

  @Param(z.number().optional().describe("Maximum results"))
  limit?: number;

  @Param(z.number().optional().describe("Offset for pagination"))
  offset?: number;

  async execute(params: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<MCPResponse> {
    try {
      const entries = await getService().list(params);
      return {
        content: [{ type: "text", text: JSON.stringify(entries, null, 2) }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

@Command("memory.search", "Search memories using keyword graph")
class SearchMemoryCommand {
  @Param(z.string().describe("Search query"))
  query!: string;

  @Param(z.number().optional().describe("Maximum results"))
  maxResults?: number;

  @Param(z.number().optional().describe("Minimum score threshold"))
  minScore?: number;

  @Param(z.string().optional().describe("Filter by category"))
  category?: string;

  async execute(params: {
    query: string;
    maxResults?: number;
    minScore?: number;
    category?: string;
  }): Promise<MCPResponse> {
    try {
      const results = await getService().search(params.query, {
        maxResults: params.maxResults,
        minScore: params.minScore,
        category: params.category,
      });

      const formatted = results.map((r) => ({
        id: r.entry.id,
        score: r.score.toFixed(3),
        matchedKeywords: r.matchedKeywords,
        content:
          r.entry.content.slice(0, 200) +
          (r.entry.content.length > 200 ? "..." : ""),
        category: r.entry.category,
      }));

      return {
        content: [{ type: "text", text: JSON.stringify(formatted, null, 2) }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

@Command("memory.import", "Import files from a directory")
class ImportMemoryCommand {
  @Param(z.string().describe("Directory path to import"))
  path!: string;

  @Param(z.array(z.string()).optional().describe("Allowed file extensions"))
  extensions?: string[];

  @Param(z.string().optional().describe("Category for imported files"))
  category?: string;

  @Param(z.boolean().optional().describe("Recursive scan"))
  recursive?: boolean;

  async execute(params: {
    path: string;
    extensions?: string[];
    category?: string;
    recursive?: boolean;
  }): Promise<MCPResponse> {
    try {
      const result = await getService().importDirectory(params.path, {
        extensions: params.extensions,
        category: params.category,
        recursive: params.recursive,
      });

      return {
        content: [
          {
            type: "text",
            text:
              `Imported ${result.imported} files` +
              (result.errors.length > 0
                ? `\nErrors:\n${result.errors.join("\n")}`
                : ""),
          },
        ],
        isError: result.errors.length > 0 && result.imported === 0,
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

@Command("memory.keywords", "Get keyword graph information")
class KeywordsCommand {
  @Param(
    z.string().optional().describe("Get related keywords for this keyword")
  )
  keyword?: string;

  @Param(z.number().optional().describe("Limit results"))
  limit?: number;

  async execute(params: {
    keyword?: string;
    limit?: number;
  }): Promise<MCPResponse> {
    try {
      const service = getService();

      if (params.keyword) {
        const related = service.getRelatedKeywords(
          params.keyword,
          params.limit
        );
        return {
          content: [{ type: "text", text: JSON.stringify(related, null, 2) }],
        };
      }

      const top = service.getTopKeywords(params.limit);
      const stats = service.getGraphStats();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ stats, topKeywords: top }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

@Command("memory.sync", "Sync with WebDAV remote")
class SyncCommand {
  @Param(z.enum(["push", "pull", "status"]).describe("Sync action"))
  action!: "push" | "pull" | "status";

  async execute(params: {
    action: "push" | "pull" | "status";
  }): Promise<MCPResponse> {
    try {
      const service = getService();

      if (params.action === "status") {
        const lastSync = await service.getLastSyncTime();
        return {
          content: [
            {
              type: "text",
              text: lastSync
                ? `Last sync: ${new Date(lastSync).toISOString()}`
                : "Never synced",
            },
          ],
        };
      }

      const result =
        params.action === "push"
          ? await service.syncPush()
          : await service.syncPull();

      return {
        content: [
          {
            type: "text",
            text: result.success
              ? `${params.action} completed`
              : `Failed: ${result.error}`,
          },
        ],
        isError: !result.success,
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

// ==================== Plugin ====================

export class MemoryPlugin implements Plugin {
  name = "memory";
  version = "0.1.0";

  constructor(private options?: MemoryPluginOptions) {}

  async init(): Promise<void> {
    memoryService = new MemoryService(this.options);
    await memoryService.init();
  }

  register() {
    return [
      CreateMemoryCommand,
      ReadMemoryCommand,
      UpdateMemoryCommand,
      DeleteMemoryCommand,
      ListMemoryCommand,
      SearchMemoryCommand,
      ImportMemoryCommand,
      KeywordsCommand,
      SyncCommand,
    ];
  }

  async destroy(): Promise<void> {
    if (memoryService) {
      await memoryService.close();
      memoryService = null;
    }
  }
}

// Re-exports
export { KeywordGraph } from "./graph/keyword-graph.js";
export { FileImporter, type ImportOptions } from "./importer.js";
export { MemoryService } from "./memory-service.js";
export type {
  KeywordNode,
  MemoryEntry,
  MemoryPluginOptions,
  SearchResult,
} from "./types.js";
