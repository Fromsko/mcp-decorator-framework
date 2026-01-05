/**
 * File Importer - 批量导入文件到记忆库
 */

import * as fs from "fs/promises";
import { glob } from "glob";
import * as path from "path";
import type { MemoryEntry } from "./types.js";

export interface ImportOptions {
  /** 允许的文件扩展名 */
  extensions?: string[];
  /** 最大文件大小（字节） */
  maxFileSize?: number;
  /** 分类名称 */
  category?: string;
  /** 递归扫描 */
  recursive?: boolean;
  /** 关键词提取器 */
  keywordExtractor?: (content: string, filename: string) => string[];
}

const DEFAULT_EXTENSIONS = [".md", ".txt", ".json", ".yaml", ".yml"];
const DEFAULT_MAX_SIZE = 1024 * 1024; // 1MB

/** 默认关键词提取器 */
function defaultKeywordExtractor(content: string, filename: string): string[] {
  const keywords = new Set<string>();

  // 从文件名提取
  const basename = path.basename(filename, path.extname(filename));
  basename.split(/[-_\s]+/).forEach((w) => {
    if (w.length > 2) keywords.add(w.toLowerCase());
  });

  // 从内容提取（简单的词频统计）
  const words = content
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && w.length < 20);

  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  // 取频率最高的词
  const sorted = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  for (const [word] of sorted) {
    keywords.add(word);
  }

  // 提取 Markdown 标题
  const headings = content.match(/^#+\s+(.+)$/gm);
  if (headings) {
    for (const h of headings.slice(0, 5)) {
      const text = h.replace(/^#+\s+/, "").trim();
      if (text.length > 2 && text.length < 50) {
        keywords.add(text.toLowerCase());
      }
    }
  }

  return Array.from(keywords).slice(0, 15);
}

export class FileImporter {
  private options: Required<ImportOptions>;

  constructor(options: ImportOptions = {}) {
    this.options = {
      extensions: options.extensions || DEFAULT_EXTENSIONS,
      maxFileSize: options.maxFileSize || DEFAULT_MAX_SIZE,
      category: options.category || "imported",
      recursive: options.recursive ?? true,
      keywordExtractor: options.keywordExtractor || defaultKeywordExtractor,
    };
  }

  /**
   * 扫描目录并导入文件
   */
  async importDirectory(
    dirPath: string
  ): Promise<{
    entries: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">[];
    errors: string[];
  }> {
    const entries: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">[] = [];
    const errors: string[] = [];

    // 构建 glob 模式
    const patterns = this.options.extensions.map((ext) => {
      const extPattern = ext.startsWith(".") ? `*${ext}` : `*.${ext}`;
      return this.options.recursive ? `**/${extPattern}` : extPattern;
    });

    const files = await glob(patterns, {
      cwd: dirPath,
      absolute: true,
      nodir: true,
    });

    for (const filePath of files) {
      try {
        const entry = await this.importFile(filePath);
        if (entry) {
          entries.push(entry);
        }
      } catch (error) {
        errors.push(
          `${filePath}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    return { entries, errors };
  }

  /**
   * 导入单个文件
   */
  async importFile(
    filePath: string
  ): Promise<Omit<MemoryEntry, "id" | "createdAt" | "updatedAt"> | null> {
    // 检查扩展名
    const ext = path.extname(filePath).toLowerCase();
    if (!this.options.extensions.includes(ext)) {
      return null;
    }

    // 检查文件大小
    const stat = await fs.stat(filePath);
    if (stat.size > this.options.maxFileSize) {
      throw new Error(
        `File too large: ${stat.size} bytes (max: ${this.options.maxFileSize})`
      );
    }

    // 读取内容
    const content = await fs.readFile(filePath, "utf-8");
    const filename = path.basename(filePath);

    // 提取关键词
    const keywords = this.options.keywordExtractor(content, filename);

    return {
      content,
      keywords,
      category: this.options.category,
      source: filePath,
      metadata: {
        filename,
        extension: ext,
        size: stat.size,
        importedAt: Date.now(),
      },
    };
  }
}
