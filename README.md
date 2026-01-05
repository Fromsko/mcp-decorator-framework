# MCP Decorator Framework

使用 TypeScript 装饰器构建 Model Context Protocol (MCP) 服务器的轻量级框架。

[![npm version](https://badge.fury.io/js/@mcp-decorator%2Fcore.svg)](https://www.npmjs.com/package/@mcp-decorator/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 特性

- 🎨 **装饰器 API** - 使用 `@Command` 和 `@Param` 声明式定义命令
- 🔌 **插件系统** - 加载预构建插件或创建自定义插件
- 🚀 **双传输模式** - 支持 stdio 和 HTTP 传输
- ✅ **类型安全** - 完整的 TypeScript 支持和 Zod 模式验证
- 📦 **最小依赖** - 仅包含必要的 MCP 和验证库

## 快速开始

### 安装

```bash
npm install @mcp-decorator/core reflect-metadata zod
```

### 创建你的第一个 MCP 服务器

```typescript
import "reflect-metadata";
import { Command, Param, createStdioServer } from "@mcp-decorator/core";
import { z } from "zod";

@Command("greet", "向某人问候")
class GreetCommand {
  @Param(z.string().describe("要问候的人的名字"))
  name!: string;

  async execute(params: { name: string }) {
    return {
      content: [{ type: "text", text: `你好，${params.name}！` }],
    };
  }
}

createStdioServer({
  name: "my-mcp-server",
  version: "1.0.0",
});
```

### 配置 TypeScript

在 `tsconfig.json` 中添加：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## 使用场景

### 1. Claude Desktop 集成（stdio 模式）

适用于与 Claude Desktop 等 MCP 客户端集成：

```typescript
import { createStdioServer } from "@mcp-decorator/core";

createStdioServer({
  name: "my-server",
  version: "1.0.0",
});
```

**配置 Claude Desktop:**

在 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/your/server.js"]
    }
  }
}
```

### 2. Web 服务部署（HTTP 模式）

适用于部署为 Web 服务：

```typescript
import { createHttpServer } from "@mcp-decorator/core";

createHttpServer({
  name: "my-server",
  version: "1.0.0",
  port: 3000,
  host: "localhost",
});
```

服务将在 `http://localhost:3000/mcp/*` 提供 MCP 端点。

### 3. 使用插件

快速添加常用功能：

```typescript
import { MathPlugin } from "@mcp-decorator/plugin-math";
import { FilesystemPlugin } from "@mcp-decorator/plugin-filesystem";
import { HttpPlugin } from "@mcp-decorator/plugin-http";

createStdioServer({
  name: "my-server",
  plugins: [
    new MathPlugin(),
    new FilesystemPlugin({ basePath: process.cwd() }),
    new HttpPlugin({ timeout: 30000 }),
  ],
});
```

## 官方插件

| 插件                                                             | 描述          | 安装                                     |
| ---------------------------------------------------------------- | ------------- | ---------------------------------------- |
| [@mcp-decorator/plugin-math](./packages/plugin-math)             | 基础数学运算  | `npm i @mcp-decorator/plugin-math`       |
| [@mcp-decorator/plugin-filesystem](./packages/plugin-filesystem) | 文件系统操作  | `npm i @mcp-decorator/plugin-filesystem` |
| [@mcp-decorator/plugin-http](./packages/plugin-http)             | HTTP 请求操作 | `npm i @mcp-decorator/plugin-http`       |

## 多平台使用

### Bun

```bash
bun add @mcp-decorator/core reflect-metadata zod
bun run server.ts
```

### Node.js

```bash
npm install @mcp-decorator/core reflect-metadata zod
node server.js
```

### Deno

```typescript
import "npm:reflect-metadata";
import { createStdioServer } from "npm:@mcp-decorator/core";
```

## 文档

- [快速入门指南](./docs/GETTING_STARTED.md)
- [API 参考文档](./docs/API.md)
- [插件开发指南](./docs/plugin-development.md)
- [部署指南](./docs/deployment.md)
- [核心包文档](./packages/core/README.md)
- [示例代码](./packages/core/examples)

## 示例

查看 [examples](./packages/core/examples) 目录获取完整示例：

- **基础示例** - 简单的 stdio 和 HTTP 服务器
- **插件示例** - 使用预构建插件
- **高级示例** - 生命周期管理和错误处理

## 贡献

欢迎贡献！请查看我们的 [GitHub 仓库](https://github.com/fromsko/mcp-decorator-framework)。

## 许可证

MIT © [fromsko](https://github.com/fromsko)

## 相关链接

- [MCP 协议规范](https://modelcontextprotocol.io)
- [GitHub 仓库](https://github.com/fromsko/mcp-decorator-framework)
- [问题反馈](https://github.com/fromsko/mcp-decorator-framework/issues)
