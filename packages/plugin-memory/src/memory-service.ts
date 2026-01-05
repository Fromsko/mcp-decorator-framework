/**
 * Memory Service - 核心服务层
 */

import * as fs from "fs/promises";
import { KeywordGraph } from "./graph/keyword-graph.js";
import { FileImporter, type ImportOptions } from "./importer.js";
import { SQLiteStorage } from "./storage/sqlite.js";
import { WebDAVSync } from "./sync/webdav.js";
import type {
  MemoryEntry,
  MemoryPluginOptions,
  SearchResult,
  StorageBackend,
  SyncBackend,
} from "./types.js";

export class MemoryService {
  private storage: StorageBackend;
  private sync: SyncBackend | null = null;
  private graph: KeywordGraph;
  private initialized = false;

  constructor(private options: MemoryPluginOptions = {}) {
    const dbPath = options.dbPath || "./memory.db";
    this.storage = new SQLiteStorage(dbPath);
    this.graph = new KeywordGraph();

    if (options.webdav) {
      this.sync = new WebDAVSync(options.webdav);
    }
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    await this.storage.init();

    if (this.sync) {
      await this.sync.init();
    }

    // 加载关键词图谱
    const savedGraph = await this.storage.getKeywordGraph();
    if (savedGraph.size > 0) {
      this.graph = new KeywordGraph(savedGraph);
    } else {
      // 从现有数据构建
      const entries = await this.storage.list({ limit: 10000 });
      this.graph.buildFromEntries(entries);
    }

    this.initialized = true;
  }

  async close(): Promise<void> {
    // 保存图谱
    await this.storage.updateKeywordGraph(this.graph.export());
    await this.storage.close();
    this.initialized = false;
  }

  // ==================== CRUD ====================

  async create(
    entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<MemoryEntry> {
    const created = await this.storage.create(entry);
    this.graph.addEntry(created);
    return created;
  }

  async read(id: string): Promise<MemoryEntry | null> {
    return this.storage.read(id);
  }

  async update(
    id: string,
    entry: Partial<Omit<MemoryEntry, "id" | "createdAt">>
  ): Promise<MemoryEntry | null> {
    const existing = await this.storage.read(id);
    if (existing) {
      this.graph.removeEntry(existing);
    }

    const updated = await this.storage.update(id, entry);
    if (updated) {
      this.graph.addEntry(updated);
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.storage.read(id);
    if (existing) {
      this.graph.removeEntry(existing);
    }
    return this.storage.delete(id);
  }

  async list(options?: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<MemoryEntry[]> {
    return this.storage.list(options);
  }

  // ==================== 批量导入 ====================

  async importDirectory(
    dirPath: string,
    options?: ImportOptions
  ): Promise<{
    imported: number;
    errors: string[];
  }> {
    const importer = new FileImporter({
      ...this.options.import,
      ...options,
    });

    const { entries, errors } = await importer.importDirectory(dirPath);

    if (entries.length > 0) {
      const created = await this.storage.bulkCreate(entries);
      for (const entry of created) {
        this.graph.addEntry(entry);
      }
    }

    return { imported: entries.length, errors };
  }

  async importFile(
    filePath: string,
    options?: ImportOptions
  ): Promise<MemoryEntry | null> {
    const importer = new FileImporter({
      ...this.options.import,
      ...options,
    });

    const entry = await importer.importFile(filePath);
    if (entry) {
      return this.create(entry);
    }
    return null;
  }

  // ==================== 检索 ====================

  async search(
    query: string,
    options?: {
      maxResults?: number;
      minScore?: number;
      category?: string;
    }
  ): Promise<SearchResult[]> {
    const {
      maxResults = this.options.search?.maxResults || 20,
      minScore = this.options.search?.minScore || 0.1,
      category,
    } = options || {};

    // 分词（简单空格分割 + 中文字符）
    const keywords = query
      .toLowerCase()
      .split(/[\s,，。！？；：""''（）【】]+/)
      .filter((w) => w.length > 0);

    // 获取候选条目
    const entries = await this.storage.list({ category, limit: 1000 });

    // 图谱检索
    return this.graph.search(keywords, entries, {
      maxResults,
      minScore,
      useExpansion: this.options.search?.useGraphExpansion ?? true,
    });
  }

  /** 获取相关关键词 */
  getRelatedKeywords(
    keyword: string,
    limit?: number
  ): Array<{ keyword: string; score: number }> {
    return this.graph.getRelatedKeywords(keyword, limit);
  }

  /** 获取热门关键词 */
  getTopKeywords(
    limit?: number
  ): Array<{ keyword: string; weight: number; connections: number }> {
    return this.graph.getTopKeywords(limit);
  }

  /** 获取图谱统计 */
  getGraphStats(): { nodes: number; edges: number; avgConnections: number } {
    return this.graph.getStats();
  }

  // ==================== 同步 ====================

  async syncPush(): Promise<{ success: boolean; error?: string }> {
    if (!this.sync) {
      return { success: false, error: "WebDAV sync not configured" };
    }

    try {
      // 保存图谱
      await this.storage.updateKeywordGraph(this.graph.export());

      // 读取数据库文件
      const dbPath = this.options.dbPath || "./memory.db";
      const data = await fs.readFile(dbPath);

      await this.sync.push(new Uint8Array(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async syncPull(): Promise<{ success: boolean; error?: string }> {
    if (!this.sync) {
      return { success: false, error: "WebDAV sync not configured" };
    }

    try {
      const data = await this.sync.pull();
      if (!data) {
        return { success: false, error: "No remote data found" };
      }

      // 关闭当前连接
      await this.storage.close();

      // 写入数据库文件
      const dbPath = this.options.dbPath || "./memory.db";
      await fs.writeFile(dbPath, data);

      // 重新初始化
      this.initialized = false;
      await this.init();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getLastSyncTime(): Promise<number | null> {
    return this.sync?.getLastSyncTime() || null;
  }
}
