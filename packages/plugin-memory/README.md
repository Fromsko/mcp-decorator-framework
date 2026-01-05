# @mcp-decorator/plugin-memory

Memory storage plugin with SQLite backend, keyword graph indexing, and WebDAV sync.

## Features

- **SQLite Storage** - 本地持久化，支持 FTS5 全文搜索
- **Keyword Graph** - 关键词图谱索引，基于共现关系构建语义网络
- **Graph Expansion Search** - 从种子词扩散检索，避免精确匹配遗漏
- **Batch Import** - 批量导入文件夹，自动提取关键词
- **WebDAV Sync** - 可选的远程同步机制

## Installation

```bash
bun add @mcp-decorator/plugin-memory
```

## Usage

```typescript
import { createStdioServer } from "@mcp-decorator/core";
import { MemoryPlugin } from "@mcp-decorator/plugin-memory";

await createStdioServer({
  name: "memory-server",
  plugins: [
    new MemoryPlugin({
      dbPath: "./data/memory.db",

      // 可选：WebDAV 同步
      webdav: {
        url: "https://dav.example.com",
        username: "user",
        password: "pass",
        remotePath: "/memory/data.db",
      },

      // 检索配置
      search: {
        maxResults: 20,
        minScore: 0.1,
        useGraphExpansion: true,
      },

      // 导入配置
      import: {
        allowedExtensions: [".md", ".txt", ".json"],
        maxFileSize: 1024 * 1024,
      },
    }),
  ],
});
```

## Commands

### CRUD

| Command         | Description                    |
| --------------- | ------------------------------ |
| `memory.create` | 创建记忆条目                   |
| `memory.read`   | 读取单条记忆                   |
| `memory.update` | 更新记忆                       |
| `memory.delete` | 删除记忆                       |
| `memory.list`   | 列出记忆（支持分页、分类过滤） |

### Search

```typescript
// 基于关键词图谱的语义检索
executeCommand({
  type: "memory.search",
  params: {
    query: "TypeScript 类型系统",
    maxResults: 10,
    minScore: 0.2,
    category: "programming",
  },
});
```

### Import

```typescript
// 批量导入文件夹
executeCommand({
  type: "memory.import",
  params: {
    path: "./docs",
    extensions: [".md"],
    category: "documentation",
    recursive: true,
  },
});
```

### Keywords

```typescript
// 获取图谱统计和热门关键词
executeCommand({ type: "memory.keywords", params: {} });

// 获取相关关键词
executeCommand({
  type: "memory.keywords",
  params: { keyword: "typescript", limit: 10 },
});
```

### Sync

```typescript
// 推送到 WebDAV
executeCommand({ type: "memory.sync", params: { action: "push" } });

// 从 WebDAV 拉取
executeCommand({ type: "memory.sync", params: { action: "pull" } });

// 查看同步状态
executeCommand({ type: "memory.sync", params: { action: "status" } });
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MemoryPlugin                         │
├─────────────────────────────────────────────────────────┤
│  Commands: create/read/update/delete/list/search/...   │
├─────────────────────────────────────────────────────────┤
│                   MemoryService                         │
├──────────────────┬──────────────────┬──────────────────┤
│  SQLiteStorage   │   KeywordGraph   │   FileImporter   │
│  (better-sqlite3)│   (共现图谱)      │   (glob)         │
├──────────────────┴──────────────────┴──────────────────┤
│                   WebDAVSync (optional)                 │
└─────────────────────────────────────────────────────────┘
```

## Keyword Graph Algorithm

1. **构建阶段**

   - 从每条记忆的关键词构建共现边
   - 计算节点权重（IDF 变体）
   - 边权重 = 共现频率

2. **检索阶段**

   - 从查询词出发，BFS 扩展相关词
   - 距离衰减 + 边权重 + 节点权重 = 扩展词得分
   - 候选条目按匹配得分排序

3. **增量更新**
   - 新增/删除条目时实时更新图谱
   - 关闭时持久化到 SQLite

## License

MIT
