# API 参考文档

## 装饰器

### @Command(type, description)

注册一个类作为 MCP 命令。

**参数：**

- `type` (string): 命令类型标识符，如 `"math.add"`
- `description` (string): 命令的可读描述

**示例：**

```typescript
@Command("greet", "向某人问候")
class GreetCommand {
  async execute(params: any) {
    // 实现
  }
}
```

### @Param(schema)

使用 Zod 模式定义参数验证。

**参数：**

- `schema` (ZodTypeAny): Zod 验证模式

**示例：**

```typescript
@Param(z.string().describe("用户名"))
name!: string;

@Param(z.number().min(0).max(100).describe("年龄"))
age!: number;
```

## 运行时函数

### createStdioServer(config)

创建使用 stdio 传输的 MCP 服务器。

**参数：**

```typescript
interface StdioServerConfig {
  name: string; // 服务器名称
  version?: string; // 版本号
  plugins?: Plugin[]; // 插件列表
  logLevel?: "debug" | "info" | "error"; // 日志级别
}
```

**返回：** `Promise<void>`

**示例：**

```typescript
await createStdioServer({
  name: "my-server",
  version: "1.0.0",
  plugins: [new MathPlugin()],
  logLevel: "info",
});
```

### createHttpServer(config)

创建使用 HTTP 传输的 MCP 服务器。

**参数：**

```typescript
interface HttpServerConfig {
  name: string; // 服务器名称
  version?: string; // 版本号
  port?: number; // 端口号，默认 3000
  host?: string; // 主机地址，默认 "localhost"
  basePath?: string; // 基础路径，默认 ""
  plugins?: Plugin[]; // 插件列表
  logLevel?: "debug" | "info" | "error"; // 日志级别
}
```

**返回：** `Promise<void>`

**示例：**

```typescript
await createHttpServer({
  name: "my-server",
  version: "1.0.0",
  port: 3000,
  host: "0.0.0.0",
  basePath: "/api",
  plugins: [new MathPlugin()],
  logLevel: "info",
});
```

## 插件接口

### Plugin

插件必须实现的接口。

```typescript
interface Plugin {
  name: string; // 插件标识符
  version: string; // 语义化版本号

  // 可选：初始化钩子
  init?(options?: any): Promise<void>;

  // 必需：注册命令类
  register(): CommandClass[];

  // 可选：清理钩子
  destroy?(): Promise<void>;
}
```

**示例：**

```typescript
export class MyPlugin implements Plugin {
  name = "my-plugin";
  version = "1.0.0";

  async init() {
    // 初始化资源
  }

  register() {
    return [Command1, Command2];
  }

  async destroy() {
    // 清理资源
  }
}
```

## 类型定义

### MCPResponse

命令执行的响应格式。

```typescript
interface MCPResponse {
  content: Array<{
    type: "text" | "image" | "resource";
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}
```

**示例：**

```typescript
// 成功响应
return {
  content: [{ type: "text", text: "操作成功" }],
};

// 错误响应
return {
  content: [{ type: "text", text: "发生错误" }],
  isError: true,
};
```

### CommandMetadata

命令元数据。

```typescript
interface CommandMetadata {
  type: string; // 命令类型
  description: string; // 描述
  params: Map<string, z.ZodTypeAny>; // 参数模式
  handler: (params: any) => Promise<any>; // 处理函数
}
```

## 注册表函数

### getCommandRegistry()

获取完整的命令注册表。

**返回：** `Map<string, CommandMetadata>`

### getCommand(type)

根据类型获取特定命令。

**参数：**

- `type` (string): 命令类型

**返回：** `CommandMetadata | undefined`

### getAllCommands()

获取所有已注册命令的数组。

**返回：** `CommandMetadata[]`

### registerCommand(CommandClass)

手动注册一个命令类到注册表（延迟注册机制）。

**参数：**

- `CommandClass`: 使用 `@Command` 装饰的类

**说明：**

`@Command` 装饰器仅存储元数据，不会立即注册命令。需要调用 `registerCommand()` 完成实际注册。插件系统会自动调用此函数，通常不需要手动调用。

**示例：**

```typescript
@Command("my.command", "My command")
class MyCommand {
  async execute() {
    return { content: [{ type: "text", text: "done" }] };
  }
}

// 手动注册（通常由插件系统自动完成）
registerCommand(MyCommand);
```

## 工具函数

### executeCommand(input)

执行命令的内部工具函数。

**参数：**

```typescript
interface ExecuteCommandInput {
  type: string; // 命令类型
  params?: Record<string, unknown>; // 参数
}
```

**返回：** `Promise<MCPResponse>`

### help()

获取所有命令的帮助信息。

**返回：** `Promise<MCPResponse>`

## Zod 模式示例

### 基础类型

```typescript
z.string(); // 字符串
z.number(); // 数字
z.boolean(); // 布尔值
z.date(); // 日期
```

### 验证

```typescript
z.string().email(); // 邮箱
z.string().url(); // URL
z.string().min(3).max(20); // 长度限制
z.number().min(0).max(100); // 数值范围
z.number().int().positive(); // 正整数
```

### 复杂类型

```typescript
// 对象
z.object({
  name: z.string(),
  age: z.number(),
});

// 数组
z.array(z.string());

// 可选
z.string().optional();

// 默认值
z.string().default("默认值");

// 联合类型
z.union([z.string(), z.number()]);

// 记录
z.record(z.string());
```

## 错误处理

### 捕获和格式化错误

```typescript
async execute(params: any) {
  try {
    const result = await doSomething(params);
    return {
      content: [{ type: "text", text: result }],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `错误：${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
```

### 参数验证错误

参数验证失败时，框架会自动返回 Zod 验证错误信息。

## 生命周期

### 服务器启动流程

1. 加载插件
2. 调用所有插件的 `init()` 方法
3. 调用所有插件的 `register()` 方法获取命令类
4. 调用 `registerCommand()` 注册命令到注册表
5. 启动传输层（stdio 或 HTTP）
6. 开始接受请求

### 服务器关闭流程

1. 停止接受新请求
2. 调用所有插件的 `destroy()` 方法
3. 清理资源
4. 退出进程
