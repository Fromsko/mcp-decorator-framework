/**
 * WebDAV Sync Backend
 */

import { createClient, type WebDAVClient } from "webdav";
import type { SyncBackend } from "../types.js";

export interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
  remotePath?: string;
}

export class WebDAVSync implements SyncBackend {
  private client: WebDAVClient | null = null;
  private remotePath: string;
  private metaPath: string;

  constructor(private config: WebDAVConfig) {
    this.remotePath = config.remotePath || "/memory-sync/data.db";
    this.metaPath = this.remotePath.replace(/\.db$/, ".meta.json");
  }

  async init(): Promise<void> {
    this.client = createClient(this.config.url, {
      username: this.config.username,
      password: this.config.password,
    });

    // 确保目录存在
    const dir = this.remotePath.substring(0, this.remotePath.lastIndexOf("/"));
    if (dir) {
      try {
        await this.client.createDirectory(dir, { recursive: true });
      } catch {
        // 目录可能已存在
      }
    }
  }

  private ensureClient(): WebDAVClient {
    if (!this.client) throw new Error("WebDAV client not initialized");
    return this.client;
  }

  async push(data: Uint8Array): Promise<void> {
    const client = this.ensureClient();

    // 上传数据
    await client.putFileContents(this.remotePath, Buffer.from(data));

    // 更新元数据
    const meta = { lastSync: Date.now() };
    await client.putFileContents(this.metaPath, JSON.stringify(meta));
  }

  async pull(): Promise<Uint8Array | null> {
    const client = this.ensureClient();

    try {
      const exists = await client.exists(this.remotePath);
      if (!exists) return null;

      const data = await client.getFileContents(this.remotePath);
      return data instanceof ArrayBuffer
        ? new Uint8Array(data)
        : new Uint8Array(Buffer.from(data as string));
    } catch {
      return null;
    }
  }

  async getLastSyncTime(): Promise<number | null> {
    const client = this.ensureClient();

    try {
      const exists = await client.exists(this.metaPath);
      if (!exists) return null;

      const content = await client.getFileContents(this.metaPath, {
        format: "text",
      });
      const meta = JSON.parse(content as string);
      return meta.lastSync || null;
    } catch {
      return null;
    }
  }
}
