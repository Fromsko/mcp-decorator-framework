# @mcp-decorator/plugin-filesystem

Filesystem operations plugin for MCP Decorator Framework with security restrictions.

## Installation

```bash
npm install @mcp-decorator/plugin-filesystem
# or
pnpm add @mcp-decorator/plugin-filesystem
# or
bun add @mcp-decorator/plugin-filesystem
```

## Usage

```typescript
import { createStdioServer } from "@mcp-decorator/core";
import { FilesystemPlugin } from "@mcp-decorator/plugin-filesystem";

createStdioServer({
  name: "my-server",
  plugins: [
    new FilesystemPlugin({
      basePath: "/path/to/allowed/directory",
    }),
  ],
});
```

## Configuration

### FilesystemOptions

- `basePath` (string, required): Base directory for all file operations. All paths are restricted to this directory and its subdirectories.
- `allowedExtensions` (string[], optional): List of allowed file extensions (not yet implemented).

## Security

⚠️ **Important**: The `basePath` option is a security feature that restricts all file operations to the specified directory. Attempts to access files outside this directory will be rejected with an error.

**Example:**

```typescript
new FilesystemPlugin({ basePath: "/home/user/documents" });
```

With this configuration:

- ✅ `/home/user/documents/file.txt` - Allowed
- ✅ `/home/user/documents/subfolder/file.txt` - Allowed
- ❌ `/home/user/other/file.txt` - Rejected
- ❌ `../../../etc/passwd` - Rejected

## Available Commands

### fs.read

Read file content.

**Parameters:**

- `path` (string): File path relative to base path

**Example:**

```json
{
  "type": "fs.read",
  "params": { "path": "example.txt" }
}
```

**Response:**

```
(file content)
```

### fs.write

Write file content.

**Parameters:**

- `path` (string): File path relative to base path
- `content` (string): Content to write

**Example:**

```json
{
  "type": "fs.write",
  "params": {
    "path": "output.txt",
    "content": "Hello, World!"
  }
}
```

**Response:**

```
Successfully wrote to output.txt
```

### fs.list

List directory contents.

**Parameters:**

- `path` (string): Directory path relative to base path

**Example:**

```json
{
  "type": "fs.list",
  "params": { "path": "." }
}
```

**Response:**

```
[DIR] subfolder
[FILE] file1.txt
[FILE] file2.txt
```

### fs.delete

Delete a file.

**Parameters:**

- `path` (string): File path relative to base path

**Example:**

```json
{
  "type": "fs.delete",
  "params": { "path": "temp.txt" }
}
```

**Response:**

```
Successfully deleted temp.txt
```

## Error Handling

All commands return descriptive error messages:

- **Security violations**: "Security violation: Path is outside the allowed base path"
- **File not found**: "Error reading file: ENOENT: no such file or directory"
- **Permission denied**: "Error writing file: EACCES: permission denied"

## License

MIT
