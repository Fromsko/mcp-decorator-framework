# Requirements Document

## Introduction

This document specifies the requirements for the MCP Decorator Framework, a TypeScript-based framework that enables developers to create Model Context Protocol (MCP) servers using a decorator-driven approach. The framework provides a plugin system for extensibility and supports both stdio and HTTP transport modes.

## Glossary

- **MCP**: Model Context Protocol - A protocol for communication between AI models and tools
- **Decorator**: TypeScript decorator pattern for declarative command definition
- **Command**: A unit of functionality that can be executed via MCP
- **Plugin**: A reusable package that provides pre-built commands
- **Transport**: Communication layer (stdio or HTTP)
- **Command_Registry**: Global registry storing all registered commands
- **Core_Package**: The main framework package (@mcp-decorator/core)
- **Plugin_Package**: Individual plugin packages (@mcp-decorator/plugin-\*)
- **Server**: The runtime that handles MCP protocol communication
- **Tool**: MCP protocol term for an executable function

## Requirements

### Requirement 1: Decorator System

**User Story:** As a developer, I want to define MCP commands using TypeScript decorators, so that I can write clean and declarative code.

#### Acceptance Criteria

1. WHEN a class is decorated with @Command, THE Command_Registry SHALL register the command with its type and description
2. WHEN a property is decorated with @Param, THE Command_Registry SHALL store the parameter schema with Zod validation
3. WHEN a command class implements execute method, THE Command_Registry SHALL bind the method as the command handler
4. THE @Command decorator SHALL accept a command type string and description string as parameters
5. THE @Param decorator SHALL accept a Zod schema for type validation and description

### Requirement 2: Command Registry

**User Story:** As a framework developer, I want a centralized command registry, so that all commands can be managed and executed uniformly.

#### Acceptance Criteria

1. THE Command_Registry SHALL store command metadata including type, description, parameters, and handler
2. WHEN a command is registered, THE Command_Registry SHALL validate that the command type is unique
3. WHEN retrieving a command, THE Command_Registry SHALL return the complete command metadata
4. THE Command_Registry SHALL support listing all registered commands
5. THE Command_Registry SHALL use reflect-metadata for storing decorator metadata

### Requirement 3: Plugin System

**User Story:** As a developer, I want to load pre-built plugins, so that I can quickly add common functionality without writing code.

#### Acceptance Criteria

1. WHEN a plugin is instantiated, THE Plugin SHALL provide a register method that returns command classes
2. WHEN a plugin is loaded, THE Core_Package SHALL automatically register all plugin commands
3. THE Plugin interface SHALL define name, version, and register methods
4. WHERE a plugin requires initialization, THE Plugin SHALL provide an optional init method
5. WHERE a plugin requires cleanup, THE Plugin SHALL provide an optional destroy method
6. WHEN multiple plugins are loaded, THE Core_Package SHALL register them in the order provided

### Requirement 4: Stdio Transport

**User Story:** As a developer, I want to run my MCP server in stdio mode, so that it can communicate with MCP clients like Claude Desktop.

#### Acceptance Criteria

1. WHEN createStdioServer is called, THE Server SHALL initialize an MCP server using @modelcontextprotocol/sdk
2. WHEN the stdio server starts, THE Server SHALL register all commands from the Command_Registry
3. WHEN a command is executed via stdio, THE Server SHALL validate parameters using Zod schemas
4. WHEN a command execution succeeds, THE Server SHALL return results in MCP protocol format
5. IF a command execution fails, THEN THE Server SHALL return error information in MCP protocol format

### Requirement 5: HTTP Transport

**User Story:** As a developer, I want to run my MCP server in HTTP mode, so that it can be deployed as a web service.

#### Acceptance Criteria

1. WHEN createHttpServer is called, THE Server SHALL initialize a Hono HTTP server
2. WHEN the HTTP server starts, THE Server SHALL expose MCP endpoints using mcp-handler
3. WHEN a request is received at /mcp/\*, THE Server SHALL route it to the MCP handler
4. THE HTTP server SHALL support configuration options including port and host
5. WHEN the HTTP server starts, THE Server SHALL log the server URL and MCP endpoint

### Requirement 6: Built-in MCP Tools

**User Story:** As a framework user, I want built-in executeCommand and help tools, so that I can interact with all registered commands uniformly.

#### Acceptance Criteria

1. THE executeCommand tool SHALL accept a type parameter to specify which command to execute
2. THE executeCommand tool SHALL accept a params parameter containing command-specific parameters
3. WHEN executeCommand is called with an unknown type, THE Tool SHALL return an error listing available commands
4. THE help tool SHALL return a list of all registered commands with their descriptions and parameter schemas
5. WHEN parameter validation fails, THE executeCommand tool SHALL return a descriptive error message

### Requirement 7: Filesystem Plugin

**User Story:** As a developer, I want a filesystem plugin, so that I can read and write files without implementing file operations myself.

#### Acceptance Criteria

1. THE Filesystem_Plugin SHALL provide fs.read command for reading file contents
2. THE Filesystem_Plugin SHALL provide fs.write command for writing file contents
3. THE Filesystem_Plugin SHALL provide fs.list command for listing directory contents
4. THE Filesystem_Plugin SHALL provide fs.delete command for deleting files
5. WHERE basePath is configured, THE Filesystem_Plugin SHALL restrict operations to that directory
6. WHEN a file operation fails, THE Filesystem_Plugin SHALL return a descriptive error message

### Requirement 8: HTTP Plugin

**User Story:** As a developer, I want an HTTP plugin, so that I can make HTTP requests from my MCP server.

#### Acceptance Criteria

1. THE HTTP_Plugin SHALL provide http.get command for GET requests
2. THE HTTP_Plugin SHALL provide http.post command for POST requests
3. THE HTTP_Plugin SHALL provide http.put command for PUT requests
4. THE HTTP_Plugin SHALL provide http.delete command for DELETE requests
5. WHEN an HTTP request is made, THE HTTP_Plugin SHALL return status code, headers, and body
6. WHERE timeout is configured, THE HTTP_Plugin SHALL abort requests exceeding the timeout

### Requirement 9: Math Plugin

**User Story:** As a developer, I want a math plugin as a reference implementation, so that I can understand how to create plugins.

#### Acceptance Criteria

1. THE Math_Plugin SHALL provide math.add command for addition
2. THE Math_Plugin SHALL provide math.subtract command for subtraction
3. THE Math_Plugin SHALL provide math.multiply command for multiplication
4. THE Math_Plugin SHALL provide math.divide command for division
5. WHEN dividing by zero, THE math.divide command SHALL return an error

### Requirement 10: Package Structure

**User Story:** As a developer, I want a well-organized package structure, so that I can easily find and use framework components.

#### Acceptance Criteria

1. THE Core_Package SHALL be published as @mcp-decorator/core
2. THE Plugin_Packages SHALL be published as @mcp-decorator/plugin-{name}
3. THE Core_Package SHALL export decorators, runtime functions, and plugin interfaces
4. THE Plugin_Packages SHALL export plugin classes and configuration types
5. THE Core_Package SHALL have minimal dependencies (only essential MCP and validation libraries)

### Requirement 11: TypeScript Support

**User Story:** As a developer, I want full TypeScript support, so that I get type safety and IDE autocompletion.

#### Acceptance Criteria

1. THE Core_Package SHALL provide TypeScript type definitions for all exports
2. THE Plugin_Packages SHALL provide TypeScript type definitions for plugin options
3. WHEN using decorators, THE Framework SHALL preserve type information for parameters
4. THE Framework SHALL require experimentalDecorators and emitDecoratorMetadata in tsconfig.json
5. THE Framework SHALL use strict TypeScript mode

### Requirement 12: Error Handling

**User Story:** As a developer, I want comprehensive error handling, so that I can debug issues easily.

#### Acceptance Criteria

1. WHEN a command is not found, THE Framework SHALL return a clear error message with available commands
2. WHEN parameter validation fails, THE Framework SHALL return Zod validation errors
3. WHEN a command execution throws an error, THE Framework SHALL catch and format the error
4. THE Framework SHALL log errors to console in development mode
5. WHEN a plugin fails to load, THE Framework SHALL throw an error with plugin name and reason

### Requirement 13: Configuration

**User Story:** As a developer, I want to configure server behavior, so that I can customize the framework for my needs.

#### Acceptance Criteria

1. THE createStdioServer function SHALL accept a configuration object with name and version
2. THE createHttpServer function SHALL accept a configuration object with port, host, and basePath
3. WHERE plugins are provided, THE Server SHALL load and initialize them before starting
4. THE Configuration SHALL support optional logging level (debug, info, error)
5. THE Configuration SHALL support optional middleware for request/response processing
