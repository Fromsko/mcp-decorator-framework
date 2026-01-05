# Advanced Example

This example demonstrates advanced features including plugin lifecycle management, error handling, and custom validation.

## Features

### Plugin Lifecycle

- **init()**: Called before server starts, used for setup (e.g., database connections)
- **register()**: Returns command classes to register
- **destroy()**: Called on shutdown, used for cleanup

### Error Handling

- Commands can return error responses with `isError: true`
- Errors are caught and formatted automatically
- Custom error messages provide clear feedback

### Custom Validation

- Zod schema validation (e.g., `.email()`)
- Additional business logic validation
- Clear validation error messages

### Configuration

- HTTP server on custom port (3001)
- Custom base path (`/api`)
- Debug logging enabled
- Graceful shutdown handling

## Available Commands

- `db.query` - Execute database query (with DROP protection)
- `validate.email` - Validate email with domain whitelist

## Running the Example

```bash
# From the packages/core directory
bun run examples/advanced.ts
```

The server will start on `http://0.0.0.0:3001/api/mcp/*`

## Testing Commands

### Query Command

```bash
curl -X POST http://localhost:3001/api/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "executeCommand",
    "arguments": {
      "type": "db.query",
      "params": { "query": "SELECT * FROM users" }
    }
  }'
```

### Email Validation

```bash
curl -X POST http://localhost:3001/api/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "executeCommand",
    "arguments": {
      "type": "validate.email",
      "params": { "email": "user@example.com" }
    }
  }'
```

## Graceful Shutdown

Press `Ctrl+C` to trigger graceful shutdown. The DatabasePlugin's `destroy()` method will be called to clean up resources.

## Key Takeaways

1. **Lifecycle Hooks**: Use `init()` and `destroy()` for resource management
2. **Error Handling**: Return `isError: true` for error responses
3. **Validation**: Combine Zod schemas with custom business logic
4. **Configuration**: Customize server behavior with config options
5. **Production Ready**: Implement graceful shutdown for production deployments
