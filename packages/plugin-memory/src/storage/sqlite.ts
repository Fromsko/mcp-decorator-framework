/**
 * SQLite Storage Backend
 * 支持 Node.js (better-sqlite3) 和 Bun (bun:sqlite) 双运行时
 */

import { randomUUID } from "crypto";
import { mkdir } from "fs/promises";
import { dirname } from "path";
import type { KeywordNode, MemoryEntry, StorageBackend } from "../types.js";

// 运行时检测
const isBun = typeof (globalThis as any).Bun !== "undefined";

// 统一的数据库接口
interface DBAdapter {
  exec(sql: string): void;
  prepare(sql: string): StatementAdapter;
  close(): void;
}

interface StatementAdapter {
  run(...params: unknown[]): { changes: number };
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
}

// Bun SQLite 适配器
async function createBunAdapter(dbPath: string): Promise<DBAdapter> {
  // @ts-ignore - bun:sqlite 仅在 Bun 运行时可用
  const { Database } = await import("bun:sqlite");
  const db = new Database(dbPath);
  db.exec("PRAGMA journal_mode = WAL");

  return {
    exec: (sql: string) => db.exec(sql),
    prepare: (sql: string) => {
      const stmt = db.prepare(sql);
      return {
        run: (...params: unknown[]) => {
          stmt.run(...params);
          return { changes: db.changes };
        },
        get: (...params: unknown[]) => stmt.get(...params),
        all: (...params: unknown[]) => stmt.all(...params),
      };
    },
    close: () => db.close(),
  };
}

// Node.js better-sqlite3 适配器
async function createNodeAdapter(dbPath: string): Promise<DBAdapter> {
  const Database = (await import("better-sqlite3")).default;
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  return {
    exec: (sql: string) => db.exec(sql),
    prepare: (sql: string) => {
      const stmt = db.prepare(sql);
      return {
        run: (...params: unknown[]) =>
          stmt.run(...params) as { changes: number },
        get: (...params: unknown[]) => stmt.get(...params),
        all: (...params: unknown[]) => stmt.all(...params),
      };
    },
    close: () => db.close(),
  };
}

export class SQLiteStorage implements StorageBackend {
  private db: DBAdapter | null = null;

  constructor(private dbPath: string) {}

  async init(): Promise<void> {
    // 确保目录存在
    const dir = dirname(this.dbPath);
    if (dir && dir !== ".") {
      await mkdir(dir, { recursive: true });
    }

    // 根据运行时选择适配器
    this.db = isBun
      ? await createBunAdapter(this.dbPath)
      : await createNodeAdapter(this.dbPath);

    // 创建表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        keywords TEXT NOT NULL,
        category TEXT,
        source TEXT,
        metadata TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
      CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at);
      
      CREATE TABLE IF NOT EXISTS keyword_graph (
        keyword TEXT PRIMARY KEY,
        weight REAL NOT NULL,
        connections TEXT NOT NULL
      );
    `);

    // FTS5 仅在支持时创建（Bun 和 Node 都支持）
    try {
      this.db.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
          content,
          keywords,
          content='memories',
          content_rowid='rowid'
        );
      `);
    } catch {
      // FTS5 不可用时跳过
      console.warn("[memory] FTS5 not available, full-text search disabled");
    }
  }

  async close(): Promise<void> {
    this.db?.close();
    this.db = null;
  }

  private ensureDb(): DBAdapter {
    if (!this.db) throw new Error("Database not initialized");
    return this.db;
  }

  private rowToEntry(row: any): MemoryEntry {
    return {
      id: row.id,
      content: row.content,
      keywords: JSON.parse(row.keywords),
      category: row.category || undefined,
      source: row.source || undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async create(
    entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<MemoryEntry> {
    const db = this.ensureDb();
    const id = randomUUID();
    const now = Date.now();

    db.prepare(
      `
      INSERT INTO memories (id, content, keywords, category, source, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      id,
      entry.content,
      JSON.stringify(entry.keywords),
      entry.category || null,
      entry.source || null,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
      now,
      now
    );

    return { ...entry, id, createdAt: now, updatedAt: now };
  }

  async read(id: string): Promise<MemoryEntry | null> {
    const db = this.ensureDb();
    const row = db.prepare("SELECT * FROM memories WHERE id = ?").get(id);
    return row ? this.rowToEntry(row) : null;
  }

  async update(
    id: string,
    entry: Partial<Omit<MemoryEntry, "id" | "createdAt">>
  ): Promise<MemoryEntry | null> {
    const db = this.ensureDb();
    const existing = await this.read(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...entry,
      updatedAt: Date.now(),
    };

    db.prepare(
      `
      UPDATE memories SET content = ?, keywords = ?, category = ?, source = ?, metadata = ?, updated_at = ?
      WHERE id = ?
    `
    ).run(
      updated.content,
      JSON.stringify(updated.keywords),
      updated.category || null,
      updated.source || null,
      updated.metadata ? JSON.stringify(updated.metadata) : null,
      updated.updatedAt,
      id
    );

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const db = this.ensureDb();
    const result = db.prepare("DELETE FROM memories WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async bulkCreate(
    entries: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">[]
  ): Promise<MemoryEntry[]> {
    const db = this.ensureDb();
    const now = Date.now();
    const results: MemoryEntry[] = [];

    const insert = db.prepare(`
      INSERT INTO memories (id, content, keywords, category, source, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const entry of entries) {
      const id = randomUUID();
      insert.run(
        id,
        entry.content,
        JSON.stringify(entry.keywords),
        entry.category || null,
        entry.source || null,
        entry.metadata ? JSON.stringify(entry.metadata) : null,
        now,
        now
      );
      results.push({ ...entry, id, createdAt: now, updatedAt: now });
    }

    return results;
  }

  async list(options?: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<MemoryEntry[]> {
    const db = this.ensureDb();
    const { category, limit = 100, offset = 0 } = options || {};

    let sql = "SELECT * FROM memories";
    const params: unknown[] = [];

    if (category) {
      sql += " WHERE category = ?";
      params.push(category);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = db.prepare(sql).all(...params) as any[];
    return rows.map((row) => this.rowToEntry(row));
  }

  async getKeywordGraph(): Promise<Map<string, KeywordNode>> {
    const db = this.ensureDb();
    const rows = db.prepare("SELECT * FROM keyword_graph").all() as any[];

    const graph = new Map<string, KeywordNode>();
    for (const row of rows) {
      graph.set(row.keyword, {
        keyword: row.keyword,
        weight: row.weight,
        connections: new Map(Object.entries(JSON.parse(row.connections))),
      });
    }
    return graph;
  }

  async updateKeywordGraph(graph: Map<string, KeywordNode>): Promise<void> {
    const db = this.ensureDb();

    const upsert = db.prepare(`
      INSERT OR REPLACE INTO keyword_graph (keyword, weight, connections)
      VALUES (?, ?, ?)
    `);

    for (const [keyword, node] of Array.from(graph)) {
      upsert.run(
        keyword,
        node.weight,
        JSON.stringify(Object.fromEntries(node.connections))
      );
    }
  }

  /** FTS 全文搜索 */
  searchFTS(query: string, limit: number = 20): MemoryEntry[] {
    const db = this.ensureDb();
    try {
      const rows = db
        .prepare(
          `
        SELECT m.* FROM memories m
        JOIN memories_fts fts ON m.rowid = fts.rowid
        WHERE memories_fts MATCH ?
        ORDER BY rank
        LIMIT ?
      `
        )
        .all(query, limit) as any[];

      return rows.map((row) => this.rowToEntry(row));
    } catch {
      // FTS 不可用时返回空
      return [];
    }
  }
}
