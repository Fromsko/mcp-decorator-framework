# Plugin Example

This example demonstrates how to use pre-built plugins alongside custom commands.

## Features

This example shows:

1. **Loading Multiple Plugins**: Math, Filesystem, and HTTP plugins
2. **Plugin Configuration**: Passing options to plugins (basePath, timeout)
3. **Custom Commands**: Defining custom commands that work alongside plugin commands
4. **Plugin Integration**: How plugins seamlessly integrate with the framework

## Available Commands

### From MathPlugin

- `math.add` - Add two numbers
- `math.subtract` - Subtract two numbers
- `math.multiply` - Multiply two numbers
- `math.divide` - Divide two numbers

### From FilesystemPlugin

- `fs.read` - Read file content
- `fs.write` - Write file content
- `fs.list` - List directory contents
- `fs.delete` - Delete file

### From HttpPlugin

- `http.get` - Make GET request
- `http.post` - Make POST request
- `http.put` - Make PUT request
- `http.delete` - Make DELETE request

### Custom Commands

- `custom.hello` - Custom greeting command

## Running the Example

```bash
# From the packages/core directory
bun run examples/with-plugins.ts
```

## Configuration

The example shows how to configure plugins:

```typescript
new FilesystemPlugin({ basePath: process.cwd() }); // Restrict to current directory
new HttpPlugin({ timeout: 10000 }); // 10 second timeout
```

## Security Note

The FilesystemPlugin is configured with `basePath: process.cwd()`, which restricts all file operations to the current working directory and its subdirectories. This is a security feature to prevent unauthorized file access.
