# Getting Started with MCP Decorator Framework

This guide will walk you through creating your first MCP server using the MCP Decorator Framework.

## Prerequisites

- Node.js 18+ or Bun
- TypeScript knowledge
- Basic understanding of decorators

## Step 1: Create a New Project

```bash
mkdir my-mcp-server
cd my-mcp-server
npm init -y
```

## Step 2: Install Dependencies

```bash
npm install @mcp-decorator/core reflect-metadata zod
npm install -D typescript @types/node
```

## Step 3: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

## Step 4: Create Your First Command

Create `src/server.ts`:

```typescript
import "reflect-metadata";
import { Command, Param, createStdioServer } from "@mcp-decorator/core";
import { z } from "zod";

// Define a greeting command
@Command("greet", "Greet a person by name")
class GreetCommand {
  @Param(z.string().describe("Name of the person to greet"))
  name!: string;

  async execute(params: { name: string }) {
    return {
      content: [
        {
          type: "text",
          text: `Hello, ${params.name}! Welcome to MCP!`,
        },
      ],
    };
  }
}

// Start the server
createStdioServer({
  name: "my-first-mcp-server",
  version: "1.0.0",
  logLevel: "info",
}).catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
```

## Step 5: Build and Run

```bash
# Build
npx tsc

# Run
node dist/server.js
```

## Step 6: Test Your Server

The server communicates via stdin/stdout using the MCP protocol. You can test it by:

1. **Using Claude Desktop**: Configure it to use your server
2. **Using MCP CLI tools**: Send MCP protocol messages
3. **Programmatically**: Connect via stdio

## Adding More Commands

Let's add a math command:

```typescript
@Command("math.add", "Add two numbers")
class AddCommand {
  @Param(z.number().describe("First number"))
  a!: number;

  @Param(z.number().describe("Second number"))
  b!: number;

  async execute(params: { a: number; b: number }) {
    const result = params.a + params.b;
    return {
      content: [
        {
          type: "text",
          text: `${params.a} + ${params.b} = ${result}`,
        },
      ],
    };
  }
}
```

## Using Plugins

Instead of writing all commands yourself, use pre-built plugins:

```typescript
import { MathPlugin } from "@mcp-decorator/plugin-math";
import { FilesystemPlugin } from "@mcp-decorator/plugin-filesystem";

createStdioServer({
  name: "my-server",
  plugins: [
    new MathPlugin(),
    new FilesystemPlugin({ basePath: process.cwd() }),
  ],
});
```

## Creating an HTTP Server

For web deployment, use HTTP transport:

```typescript
import { createHttpServer } from "@mcp-decorator/core";

createHttpServer({
  name: "my-http-server",
  version: "1.0.0",
  port: 3000,
  host: "localhost",
  basePath: "",
  logLevel: "info",
});
```

Access your server at `http://localhost:3000/mcp/*`

## Next Steps

- **Explore Examples**: Check the [examples](./packages/core/examples) directory
- **Read Plugin Docs**: Learn about [official plugins](./packages)
- **Create Custom Plugins**: Build reusable command packages
- **Deploy**: Deploy your HTTP server to production

## Common Issues

### Decorators Not Working

Make sure you have:

1. `"experimentalDecorators": true` in tsconfig.json
2. `"emitDecoratorMetadata": true` in tsconfig.json
3. `import "reflect-metadata"` at the top of your file

### Module Resolution Errors

Use `"moduleResolution": "node"` in tsconfig.json

### Type Errors with Zod

Make sure you're using compatible versions:

- zod: ^3.25.0
- @mcp-decorator/core: latest

## Resources

- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [Zod Documentation](https://zod.dev)

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/your-repo/issues)
- Examples: See working examples in the repository
