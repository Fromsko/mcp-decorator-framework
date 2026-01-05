/**
 * SQLite Storage Backend
 */

import type { Database as DatabaseType } from "better-sqlite3";
import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import type { KeywordNode, MemoryEntry, StorageBackend } from "../types.js";

export class SQLiteStorage implements StorageBackend {
  private db: DatabaseType | null = null;

  constructor(private dbPath: string) {}

  async init(): Promise<void> {
    this.db = new Database(this.dbPath);
    this.db.pragma("journal_mode = WAL");

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
      
      CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
        content,
        keywords,
        content='memories',
        content_rowid='rowid'
      );
      
      CREATE TRIGGER IF NOT EXISTS memories_ai AFTER INSERT ON memories BEGIN
        INSERT INTO memories_fts(rowid, content, keywords) 
        VALUES (NEW.rowid, NEW.content, NEW.keywords);
      END;
      
      CREATE TRIGGER IF NOT EXISTS memories_ad AFTER DELETE ON memories BEGIN
        INSERT INTO memories_fts(memories_fts, rowid, content, keywords) 
        VALUES ('delete', OLD.rowid, OLD.content, OLD.keywords);
      END;
      
      CREATE TRIGGER IF NOT EXISTS memories_au AFTER UPDATE ON memories BEGIN
        INSERT INTO memories_fts(memories_fts, rowid, content, keywords) 
        VALUES ('delete', OLD.rowid, OLD.content, OLD.keywords);
        INSERT INTO memories_fts(rowid, content, keywords) 
        VALUES (NEW.rowid, NEW.content, NEW.keywords);
      END;
    `);
  }

  async close(): Promise<void> {
    this.db?.close();
    this.db = null;
  }

  private ensureDb(): DatabaseType {
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

    const transaction = db.transaction(() => {
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
    });

    transaction();
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
    const params: any[] = [];

    if (category) {
      sql += " WHERE category = ?";
      params.push(category);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = db.prepare(sql).all(...params);
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

    const transaction = db.transaction(() => {
      for (const [keyword, node] of Array.from(graph)) {
        upsert.run(
          keyword,
          node.weight,
          JSON.stringify(Object.fromEntries(node.connections))
        );
      }
    });

    transaction();
  }

  /** FTS 全文搜索 */
  searchFTS(query: string, limit: number = 20): MemoryEntry[] {
    const db = this.ensureDb();
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
  }
}
