# Design Document

## Overview

The MCP Decorator Framework is a TypeScript-based framework that enables developers to create Model Context Protocol (MCP) servers using decorators. The framework consists of three main layers:

1. **Decorator System**: Provides @Command and @Param decorators for declarative command definition
2. **Plugin System**: Enables loading pre-built command packages
3. **Transport Layer**: Supports stdio and HTTP communication modes

The design follows a modular architecture where the core package provides the foundation, and plugin packages extend functionality.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Application                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  User Commands (decorated classes)                     │ │
│  │  + Loaded Plugins                                      │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              @mcp-decorator/core                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Decorator System                                      │ │
│  │  - @Command: Class decorator for command registration │ │
│  │  - @Param: Property decorator for parameter schema    │ │
│  │  - Command Registry: Global Map<string, CommandMeta>  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Plugin System                                         │ │
│  │  - Plugin Interface                                    │ │
│  │  - Plugin Loader                                       │ │
│  │  - Lifecycle Management                                │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  MCP Tools                                             │ │
│  │  - executeCommand: Unified command execution          │ │
│  │  - help: List all commands                            │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Runtime                                               │ │
│  │  - createStdioServer()                                 │ │
│  │  - createHttpServer()                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────┬──────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│  stdio Transport │          │  HTTP Transport  │
│  (MCP SDK)       │          │  (Hono + mcp-    │
│                  │          │   handler)       │
└──────────────────┘          └──────────────────┘
```

## Components and Interfaces

### 1. Decorator System

#### Command Decorator

```typescript
function Command(type: string, description: string): ClassDecorator;

interface CommandMetadata {
  type: string;
  description: string;
  params: Map<string, z.ZodTypeAny>;
  handler: (params: any) => Promise<any>;
}
```

**Behavior**:

- Instantiates the decorated class
- Extracts parameter metadata from reflect-metadata
- Registers command in global commandRegistry
- Binds execute method as handler

#### Param Decorator

```typescript
function Param(schema: z.ZodTypeAny): PropertyDecorator;
```

**Behavior**:

- Stores Zod schema in class metadata using reflect-metadata
- Associates schema with property name
- Metadata key: "command:params"

#### Command Registry

```typescript
const commandRegistry: Map<string, CommandMetadata>;

function getCommandRegistry(): Map<string, CommandMetadata>;
function getCommand(type: string): CommandMetadata | undefined;
function getAllCommands(): CommandMetadata[];
```

### 2. Plugin System

#### Plugin Interface

```typescript
interface Plugin {
  name: string;
  version: string;
  init?(options: any): Promise<void>;
  register(): Array<new (...args: any[]) => CommandHandler>;
  destroy?(): Promise<void>;
}

interface CommandHandler {
  execute(params: any): Promise<MCPResponse>;
}
```

#### Plugin Loader

```typescript
async function loadPlugins(plugins: Plugin[]): Promise<void>;
```

**Behavior**:

1. Iterate through plugins array
2. Call plugin.init() if defined
3. Call plugin.register() to get command classes
4. Import each command class (triggers @Command decorator)
5. Store plugin reference for lifecycle management

### 3. MCP Tools

#### executeCommand Tool

```typescript
interface ExecuteCommandInput {
  type: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}
```

**Behavior**:

1. Lookup command in registry by type
2. If not found, return error with available commands
3. Build Zod schema from command params
4. Validate input params against schema
5. If validation fails, return Zod error
6. Call command handler with validated params
7. Return handler result

#### help Tool

**Behavior**:

1. Get all commands from registry
2. For each command, extract type, description, and param schemas
3. Format as markdown with examples
4. Return formatted help text

### 4. Runtime

#### Stdio Server

```typescript
interface StdioServerConfig {
  name: string;
  version?: string;
  plugins?: Plugin[];
  logLevel?: "debug" | "info" | "error";
}

async function createStdioServer(config: StdioServerConfig): Promise<void>;
```

**Behavior**:

1. Load plugins if provided
2. Create McpServer from @modelcontextprotocol/sdk
3. Register executeCommand and help tools
4. Create StdioServerTransport
5. Connect server to transport
6. Server runs until process exits

#### HTTP Server

```typescript
interface HttpServerConfig {
  name: string;
  version?: string;
  port?: number;
  host?: string;
  basePath?: string;
  plugins?: Plugin[];
  logLevel?: "debug" | "info" | "error";
}

async function createHttpServer(config: HttpServerConfig): Promise<void>;
```

**Behavior**:

1. Load plugins if provided
2. Create Hono app
3. Create MCP handler using mcp-handler
4. Register executeCommand and help tools in handler
5. Mount handler at basePath + /mcp/\*
6. Start HTTP server using @hono/node-server
7. Log server URL

## Data Models

### CommandMetadata

```typescript
interface CommandMetadata {
  type: string; // e.g., "math.add"
  description: string; // e.g., "Add two numbers"
  params: Map<string, z.ZodTypeAny>; // Parameter schemas
  handler: (params: any) => Promise<MCPResponse>;
}
```

### Plugin

```typescript
interface Plugin {
  name: string; // Plugin identifier
  version: string; // Semantic version
  init?(options: any): Promise<void>; // Optional initialization
  register(): CommandClass[]; // Returns command classes
  destroy?(): Promise<void>; // Optional cleanup
}

type CommandClass = new (...args: any[]) => CommandHandler;
```

### MCPResponse

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

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

After analyzing all acceptance criteria, I identified the following potential redundancies:

1. **Command Registration Properties (1.1, 2.1, 2.3)**: These all test aspects of command registration. Property 1 (Command decorator registers metadata) subsumes the others since it tests the complete registration process.

2. **Plugin Command Registration (3.2, 4.2)**: Both test that commands are registered after plugin loading. These can be combined into one property about plugin loading.

3. **Error Message Properties (6.3, 12.1)**: Both test error messages for unknown commands. These are the same requirement and can be combined.

4. **Parameter Validation (4.3, 6.5, 12.2)**: All three test parameter validation and error messages. These can be combined into one comprehensive property.

5. **MCP Response Format (4.4, 4.5)**: Both test MCP response format for success and error cases. These can be combined into one property about response format.

After reflection, I'll write non-redundant properties that provide unique validation value.

### Correctness Properties

Property 1: Command decorator registration
_For any_ class decorated with @Command, the command should appear in the Command_Registry with correct type, description, parameter schemas, and bound execute method
**Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.3**

Property 2: Command type uniqueness
_For any_ two commands with the same type, attempting to register both should result in an error or the second registration being rejected
**Validates: Requirements 2.2**

Property 3: Registry listing completeness
_For any_ set of registered commands, calling getAllCommands() should return all of them
**Validates: Requirements 2.4**

Property 4: Plugin command registration
_For any_ plugin with N commands, after loading the plugin, all N commands should be registered in the Command_Registry
**Validates: Requirements 3.1, 3.2, 4.2**

Property 5: Plugin loading order preservation
_For any_ ordered list of plugins [P1, P2, ..., Pn], the commands should be registered in the order the plugins appear in the list
**Validates: Requirements 3.6**

Property 6: Parameter validation
_For any_ command with Zod parameter schemas, providing invalid parameters should result in a descriptive Zod validation error
**Validates: Requirements 4.3, 6.5, 12.2**

Property 7: MCP response format
_For any_ command execution (success or failure), the response should conform to MCP protocol format with content array and optional isError flag
**Validates: Requirements 4.4, 4.5**

Property 8: HTTP routing
_For any_ request to /mcp/\*, the HTTP server should route it to the MCP handler
**Validates: Requirements 5.3**

Property 9: HTTP server configuration
_For any_ valid port and host configuration, the HTTP server should start and be accessible at that address
**Validates: Requirements 5.4**

Property 10: Help tool completeness
_For any_ set of registered commands, the help tool output should include all commands with their descriptions and parameter schemas
**Validates: Requirements 6.4**

Property 11: Unknown command error
_For any_ command type not in the registry, executeCommand should return an error listing all available command types
**Validates: Requirements 6.3, 12.1**

Property 12: Filesystem basePath restriction
_For any_ file path outside the configured basePath, filesystem operations should be rejected with an error
**Validates: Requirements 7.5**

Property 13: Filesystem error messages
_For any_ failed file operation, the error message should describe what went wrong
**Validates: Requirements 7.6**

Property 14: HTTP response structure
_For any_ HTTP request made via the HTTP plugin, the response should contain status code, headers, and body
**Validates: Requirements 8.5**

Property 15: HTTP timeout enforcement
_For any_ HTTP request that exceeds the configured timeout, the request should be aborted
**Validates: Requirements 8.6**

Property 16: Command execution error handling
_For any_ command that throws an error during execution, the framework should catch the error and return a formatted error response
**Validates: Requirements 12.3**

Property 17: Plugin loading error
_For any_ plugin that fails to load, the error message should include the plugin name and failure reason
**Validates: Requirements 12.5**

Property 18: Plugin initialization order
_For any_ set of plugins, all plugins should be initialized (init() called) before the server starts accepting requests
**Validates: Requirements 13.3**

## Error Handling

### Error Categories

1. **Command Not Found**

   - Occurs when executeCommand is called with unknown type
   - Response includes list of available commands
   - HTTP status: 400 (if via HTTP)

2. **Parameter Validation Error**

   - Occurs when parameters don't match Zod schema
   - Response includes Zod validation error details
   - HTTP status: 400 (if via HTTP)

3. **Command Execution Error**

   - Occurs when command handler throws error
   - Response includes error message and stack trace (in dev mode)
   - HTTP status: 500 (if via HTTP)

4. **Plugin Loading Error**

   - Occurs when plugin fails to initialize
   - Throws error with plugin name and reason
   - Prevents server startup

5. **Filesystem Security Error**
   - Occurs when file path is outside basePath
   - Response includes security violation message
   - HTTP status: 403 (if via HTTP)

### Error Response Format

All errors follow MCP protocol format:

```typescript
{
  content: [{
    type: 'text',
    text: 'Error message with details'
  }],
  isError: true
}
```

### Error Handling Strategy

1. **Decorator Errors**: Throw immediately during class loading
2. **Validation Errors**: Return formatted error response
3. **Execution Errors**: Catch, log, and return formatted error
4. **Plugin Errors**: Throw during server initialization
5. **Transport Errors**: Handle at transport layer (stdio/HTTP)

## Testing Strategy

### Dual Testing Approach

The framework will use both unit tests and property-based tests:

- **Unit tests**: Verify specific examples, edge cases, and integration points
- **Property tests**: Verify universal properties across all inputs

### Property-Based Testing

We will use **fast-check** (TypeScript property-based testing library) with minimum 100 iterations per test.

Each property test will be tagged with:

```typescript
// Feature: mcp-decorator-framework, Property 1: Command decorator registration
```

### Unit Testing Focus

Unit tests will cover:

- Specific command examples (math.add with known inputs)
- Edge cases (division by zero, empty file paths)
- Integration between components (decorator → registry → executor)
- Plugin loading scenarios
- Error conditions

### Property Testing Focus

Property tests will cover:

- Command registration with random types and descriptions
- Parameter validation with random invalid inputs
- Plugin loading with random command sets
- Error handling with random error conditions
- Response format validation across all commands

### Test Organization

```
tests/
├── unit/
│   ├── decorators.test.ts
│   ├── registry.test.ts
│   ├── plugins.test.ts
│   ├── runtime.test.ts
│   └── tools.test.ts
├── property/
│   ├── command-registration.property.ts
│   ├── parameter-validation.property.ts
│   ├── plugin-loading.property.ts
│   └── error-handling.property.ts
└── integration/
    ├── stdio-server.test.ts
    └── http-server.test.ts
```

### Testing Dependencies

- **Vitest**: Test runner
- **fast-check**: Property-based testing
- **@types/node**: Node.js types for testing

### Test Configuration

Each property test will run with:

- Minimum 100 iterations
- Seed for reproducibility
- Verbose output on failure
- Shrinking enabled for minimal counterexamples
