# Basic Examples

This directory contains basic examples demonstrating how to use the MCP Decorator Framework.

## Stdio Example

The `stdio-example.ts` demonstrates how to create an MCP server using stdio transport, which is suitable for integration with tools like Claude Desktop.

### Running the Stdio Example

```bash
# From the packages/core directory
bun run examples/stdio-example.ts
```

The server will start and communicate via stdin/stdout using the MCP protocol.

## HTTP Example

The `http-example.ts` demonstrates how to create an MCP server using HTTP transport, which can be deployed as a web service.

### Running the HTTP Example

```bash
# From the packages/core directory
bun run examples/http-example.ts
```

The server will start on `http://localhost:3000` with MCP endpoints available at `/mcp/*`.

## Key Concepts

Both examples demonstrate:

1. **Decorator Usage**: Using `@Command` to register commands and `@Param` to define parameters with Zod schemas
2. **Command Implementation**: Creating command classes with `execute` methods
3. **Server Creation**: Using `createStdioServer()` or `createHttpServer()` to start the server

## Next Steps

- See the `with-plugins` example for using pre-built plugins
- See the `advanced` example for lifecycle management and error handling
