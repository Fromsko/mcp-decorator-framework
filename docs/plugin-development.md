# 插件开发指南

本指南将教你如何为 MCP Decorator Framework 创建自定义插件。

## 插件结构

一个插件是一个实现了 `Plugin` 接口的类：

```typescript
import { Plugin } from "@mcp-decorator/core";

export class MyPlugin implements Plugin {
  name = "my-plugin";
  version = "1.0.0";

  // 可选：初始化钩子
  async init(options?: any) {
    // 在服务器启动前执行
  }

  // 必需：注册命令类
  register() {
    return [Command1, Command2];
  }

  // 可选：清理钩子
  async destroy() {
    // 在服务器关闭时执行
  }
}
```

## 创建命令

在插件中定义命令：

```typescript
import { Command, Param } from "@mcp-decorator/core";
import { z } from "zod";

@Command("myplugin.hello", "打招呼命令")
class HelloCommand {
  @Param(z.string().describe("名字"))
  name!: string;

  async execute(params: { name: string }) {
    return {
      content: [
        {
          type: "text",
          text: `你好，${params.name}！`,
        },
      ],
    };
  }
}
```

## 生命周期钩子

### init()

在服务器启动前调用，用于初始化资源：

```typescript
async init(options?: MyPluginOptions) {
  // 连接数据库
  this.db = await connectDatabase(options.dbUrl);

  // 初始化配置
  this.config = options;
}
```

### destroy()

在服务器关闭时调用，用于清理资源：

```typescript
async destroy() {
  // 关闭数据库连接
  await this.db.close();

  // 清理临时文件
  await cleanupTempFiles();
}
```

## 插件配置

通过构造函数接收配置：

```typescript
export interface MyPluginOptions {
  apiKey: string;
  timeout?: number;
}

export class MyPlugin implements Plugin {
  name = "my-plugin";
  version = "1.0.0";

  constructor(private options: MyPluginOptions) {}

  async init() {
    // 使用 this.options
  }

  register() {
    return [MyCommand];
  }
}
```

使用时：

```typescript
new MyPlugin({
  apiKey: "your-api-key",
  timeout: 5000,
});
```

## 错误处理

在命令中返回错误：

```typescript
async execute(params: any) {
  try {
    // 执行操作
    const result = await doSomething(params);

    return {
      content: [{ type: "text", text: result }],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `错误：${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
```

## 参数验证

使用 Zod 进行复杂验证：

```typescript
@Param(
  z.object({
    email: z.string().email(),
    age: z.number().min(18).max(120),
  }).describe("用户信息")
)
user!: { email: string; age: number };
```

## 发布插件

### 1. 创建包结构

```
my-plugin/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 2. package.json

```json
{
  "name": "@mcp-decorator/plugin-myname",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "dependencies": {
    "@mcp-decorator/core": "^0.1.0",
    "zod": "^3.25.0"
  }
}
```

### 3. 构建和发布

```bash
npm run build
npm publish
```

## 最佳实践

1. **命名约定**：使用 `pluginname.command` 格式命名命令
2. **错误处理**：始终捕获并格式化错误
3. **类型安全**：充分利用 TypeScript 和 Zod
4. **文档**：为每个命令提供清晰的描述
5. **测试**：编写单元测试和集成测试

## 示例插件

查看官方插件源码作为参考：

- [Math Plugin](../packages/plugin-math/src/index.ts)
- [Filesystem Plugin](../packages/plugin-filesystem/src/index.ts)
- [HTTP Plugin](../packages/plugin-http/src/index.ts)
- [Memory Plugin](../packages/plugin-memory/src/index.ts) - 记忆存储，含关键词图谱检索

## 社区插件

欢迎提交你的插件到 [awesome-mcp-decorator](https://github.com/fromsko/awesome-mcp-decorator) 列表！
