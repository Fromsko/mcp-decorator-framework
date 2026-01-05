# @mcp-decorator/core

Core framework for building Model Context Protocol (MCP) servers using TypeScript decorators.

## Features

- 🎨 **Decorator-based API**: Define commands using `@Command` and `@Param` decorators
- 🔌 **Plugin System**: Load pre-built plugins or create your own
- 🚀 **Dual Transport**: Support for both stdio and HTTP transports
- ✅ **Type Safety**: Full TypeScript support with Zod schema validation
- 📦 **Minimal Dependencies**: Only essential MCP and validation libraries

## Installation

```bash
npm install @mcp-decorator/core reflect-metadata zod
# or
pnpm add @mcp-decorator/core reflect-metadata zod
# or
bun add @mcp-decorator/core reflect-metadata zod
```

## Quick Start

### 1. Enable Decorators

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 2. Create a Command

```typescript
import "reflect-metadata";
import { Command, Param, createStdioServer } from "@mcp-decorator/core";
import { z } from "zod";

@Command("greet", "Greet a person by name")
class GreetCommand {
  @Param(z.string().describe("Name of the person to greet"))
  name!: string;

  async execute(params: { name: string }) {
    return {
      content: [
        {
          type: "text",
          text: `Hello, ${params.name}!`,
        },
      ],
    };
  }
}

// Start stdio server
createStdioServer({
  name: "my-mcp-server",
  version: "1.0.0",
});
```

### 3. Run Your Server

```bash
bun run server.ts
```

## API Reference

### Decorators

#### @Command(type, description)

Registers a class as an MCP command. Note: This decorator only stores metadata. The actual registration happens when `registerCommand()` is called (automatically by the plugin system).

```typescript
@Command("math.add", "Add two numbers")
class AddCommand {
  async execute(params: any) {
    // Implementation
  }
}
```

#### @Param(schema)

Defines a parameter with Zod schema validation.

```typescript
@Param(z.number().describe("First number"))
a!: number;
```

### Runtime Functions

#### createStdioServer(config)

Creates an MCP server using stdio transport.

```typescript
await createStdioServer({
  name: "my-server",
  version: "1.0.0",
  plugins: [],
  logLevel: "info",
});
```

#### createHttpServer(config)

Creates an MCP server using HTTP transport.

```typescript
await createHttpServer({
  name: "my-server",
  version: "1.0.0",
  port: 3000,
  host: "localhost",
  basePath: "",
  plugins: [],
  logLevel: "info",
});
```

### Plugin System

#### Creating a Plugin

```typescript
import { Plugin } from "@mcp-decorator/core";

export class MyPlugin implements Plugin {
  name = "my-plugin";
  version = "1.0.0";

  async init() {
    // Optional: Initialize resources
  }

  register() {
    // Return command classes
    return [MyCommand1, MyCommand2];
  }

  async destroy() {
    // Optional: Cleanup resources
  }
}
```

#### Using Plugins

```typescript
import { MathPlugin } from "@mcp-decorator/plugin-math";

createStdioServer({
  name: "my-server",
  plugins: [new MathPlugin()],
});
```

## Official Plugins

- **[@mcp-decorator/plugin-math](../plugin-math)**: Basic arithmetic operations
- **[@mcp-decorator/plugin-filesystem](../plugin-filesystem)**: File system operations
- **[@mcp-decorator/plugin-http](../plugin-http)**: HTTP request operations

## Examples

See the [examples](./examples) directory for:

- **Basic Example**: Simple stdio and HTTP servers
- **Plugin Example**: Using pre-built plugins
- **Advanced Example**: Lifecycle management and error handling

## TypeScript Configuration

Required `tsconfig.json` settings:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true
  }
}
```

## License

MIT
