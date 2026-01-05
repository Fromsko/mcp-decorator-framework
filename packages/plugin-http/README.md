# @mcp-decorator/plugin-http

HTTP request operations plugin for MCP Decorator Framework.

## Installation

```bash
npm install @mcp-decorator/plugin-http
# or
pnpm add @mcp-decorator/plugin-http
# or
bun add @mcp-decorator/plugin-http
```

## Usage

```typescript
import { createStdioServer } from "@mcp-decorator/core";
import { HttpPlugin } from "@mcp-decorator/plugin-http";

createStdioServer({
  name: "my-server",
  plugins: [
    new HttpPlugin({
      timeout: 30000,
      headers: {
        "User-Agent": "MCP-Server/1.0",
      },
    }),
  ],
});
```

## Configuration

### HttpOptions

- `timeout` (number, optional): Request timeout in milliseconds. Default: 30000 (30 seconds)
- `headers` (Record<string, string>, optional): Default headers to include in all requests

## Available Commands

### http.get

Make a GET request.

**Parameters:**

- `url` (string): URL to request
- `headers` (object, optional): Request headers

**Example:**

```json
{
  "type": "http.get",
  "params": {
    "url": "https://api.example.com/data",
    "headers": {
      "Authorization": "Bearer token123"
    }
  }
}
```

**Response:**

```
Status: 200

Headers:
content-type: application/json
content-length: 1234

Body:
{"data": "..."}
```

### http.post

Make a POST request.

**Parameters:**

- `url` (string): URL to request
- `body` (string, optional): Request body
- `headers` (object, optional): Request headers

**Example:**

```json
{
  "type": "http.post",
  "params": {
    "url": "https://api.example.com/users",
    "body": "{\"name\": \"John\"}",
    "headers": {
      "Content-Type": "application/json"
    }
  }
}
```

**Response:**

```
Status: 201

Headers:
content-type: application/json

Body:
{"id": 123, "name": "John"}
```

### http.put

Make a PUT request.

**Parameters:**

- `url` (string): URL to request
- `body` (string, optional): Request body
- `headers` (object, optional): Request headers

**Example:**

```json
{
  "type": "http.put",
  "params": {
    "url": "https://api.example.com/users/123",
    "body": "{\"name\": \"Jane\"}",
    "headers": {
      "Content-Type": "application/json"
    }
  }
}
```

### http.delete

Make a DELETE request.

**Parameters:**

- `url` (string): URL to request
- `headers` (object, optional): Request headers

**Example:**

```json
{
  "type": "http.delete",
  "params": {
    "url": "https://api.example.com/users/123"
  }
}
```

## Timeout Handling

Requests that exceed the configured timeout will be aborted:

```json
{
  "type": "http.get",
  "params": { "url": "https://slow-api.example.com" }
}
```

**Error Response:**

```
Error making GET request: Request timeout after 30000ms
```

## Response Format

All successful requests return:

- **Status**: HTTP status code
- **Headers**: Response headers
- **Body**: Response body as text

## Error Handling

All commands return descriptive error messages:

- **Timeout**: "Request timeout after Xms"
- **Network errors**: "Error making GET request: Failed to fetch"
- **Invalid URL**: Zod validation error

## License

MIT
