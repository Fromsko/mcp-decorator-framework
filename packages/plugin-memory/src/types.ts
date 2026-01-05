/**
 * Memory Plugin Type Definitions
 */

/** 记忆条目 */
export interface MemoryEntry {
  id: string;
  content: string;
  keywords: string[];
  category?: string;
  source?: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

/** 关键词节点 */
export interface KeywordNode {
  keyword: string;
  weight: number;
  connections: Map<string, number>; // keyword -> edge weight
}

/** 检索结果 */
export interface SearchResult {
  entry: MemoryEntry;
  score: number;
  matchedKeywords: string[];
}

/** 存储后端接口 */
export interface StorageBackend {
  init(): Promise<void>;
  close(): Promise<void>;

  // CRUD
  create(
    entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<MemoryEntry>;
  read(id: string): Promise<MemoryEntry | null>;
  update(
    id: string,
    entry: Partial<Omit<MemoryEntry, "id" | "createdAt">>
  ): Promise<MemoryEntry | null>;
  delete(id: string): Promise<boolean>;

  // 批量操作
  bulkCreate(
    entries: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">[]
  ): Promise<MemoryEntry[]>;
  list(options?: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<MemoryEntry[]>;

  // 关键词图谱
  getKeywordGraph(): Promise<Map<string, KeywordNode>>;
  updateKeywordGraph(graph: Map<string, KeywordNode>): Promise<void>;
}

/** 同步后端接口 */
export interface SyncBackend {
  init(): Promise<void>;
  push(data: Uint8Array): Promise<void>;
  pull(): Promise<Uint8Array | null>;
  getLastSyncTime(): Promise<number | null>;
}

/** 插件配置 */
export interface MemoryPluginOptions {
  /** SQLite 数据库路径 */
  dbPath?: string;

  /** WebDAV 同步配置 */
  webdav?: {
    url: string;
    username: string;
    password: string;
    remotePath?: string;
  };

  /** 检索配置 */
  search?: {
    maxResults?: number;
    minScore?: number;
    useGraphExpansion?: boolean;
  };

  /** 批量导入配置 */
  import?: {
    allowedExtensions?: string[];
    maxFileSize?: number;
  };
}
