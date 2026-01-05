# Implementation Plan: MCP Decorator Framework

## Overview

This implementation plan breaks down the MCP Decorator Framework into discrete coding tasks. The framework will be built in phases: core decorator system, plugin system, runtime, and official plugins. Each task builds on previous work and includes testing sub-tasks. Only using bun.

## Tasks

- [x] 1. Setup project structure and core infrastructure

  - Create monorepo structure with packages/core and packages/plugin-\* directories
  - Configure TypeScript with experimentalDecorators and emitDecoratorMetadata
  - Setup build tooling (tsup or tsc)
  - Configure package.json for each package with proper exports
  - Install dependencies: reflect-metadata, zod, @modelcontextprotocol/sdk, hono, mcp-handler
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 11.4, 11.5_

- [x] 2. Implement decorator system

  - [x] 2.1 Create command registry

    - Implement commandRegistry as Map<string, CommandMetadata>
    - Implement getCommandRegistry(), getCommand(), getAllCommands() functions
    - Add type definitions for CommandMetadata and CommandHandler interfaces
    - _Requirements: 2.1, 2.3, 2.4_

  - [ ]\* 2.2 Write property test for command registry

    - **Property 3: Registry listing completeness**
    - **Validates: Requirements 2.4**

  - [x] 2.3 Implement @Command decorator

    - Create Command decorator function accepting type and description
    - Instantiate decorated class and extract parameter metadata
    - Register command in commandRegistry with type uniqueness check
    - Bind execute method as handler
    - _Requirements: 1.1, 1.3, 2.2_

  - [ ]\* 2.4 Write property test for @Command decorator

    - **Property 1: Command decorator registration**
    - **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.3**

  - [ ]\* 2.5 Write property test for command type uniqueness

    - **Property 2: Command type uniqueness**
    - **Validates: Requirements 2.2**

  - [x] 2.6 Implement @Param decorator

    - Create Param decorator function accepting Zod schema
    - Store schema in class metadata using reflect-metadata
    - Use metadata key "command:params"
    - _Requirements: 1.2_

  - [ ]\* 2.7 Write unit tests for decorator edge cases
    - Test command without parameters
    - Test command with optional parameters
    - Test parameter with complex Zod schemas (nested objects, arrays)
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Checkpoint - Ensure decorator tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement MCP tools layer

  - [x] 4.1 Implement executeCommand tool

    - Create executeCommandTool function that registers with MCP server
    - Implement command lookup by type
    - Build Zod schema from command params and validate input
    - Call command handler with validated params
    - Handle errors and format responses
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 12.1, 12.2, 12.3_

  - [ ]\* 4.2 Write property test for parameter validation

    - **Property 6: Parameter validation**
    - **Validates: Requirements 4.3, 6.5, 12.2**

  - [ ]\* 4.3 Write property test for unknown command error

    - **Property 11: Unknown command error**
    - **Validates: Requirements 6.3, 12.1**

  - [ ]\* 4.4 Write property test for error handling

    - **Property 16: Command execution error handling**
    - **Validates: Requirements 12.3**

  - [x] 4.5 Implement help tool

    - Create helpTool function that registers with MCP server
    - Extract all commands from registry
    - Format command information with types, descriptions, and parameter schemas
    - Generate example usage for each command
    - _Requirements: 6.4_

  - [ ]\* 4.6 Write property test for help tool completeness

    - **Property 10: Help tool completeness**
    - **Validates: Requirements 6.4**

  - [ ]\* 4.7 Write property test for MCP response format
    - **Property 7: MCP response format**
    - **Validates: Requirements 4.4, 4.5**

- [x] 5. Checkpoint - Ensure MCP tools tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [-] 6. Implement plugin system

  - [x] 6.1 Define plugin interface

    - Create Plugin interface with name, version, init, register, destroy
    - Create CommandHandler interface
    - Export plugin types
    - _Requirements: 3.3, 3.4, 3.5_

  - [x] 6.2 Implement plugin loader

    - Create loadPlugins function accepting Plugin array
    - Call plugin.init() if defined
    - Call plugin.register() to get command classes
    - Instantiate command classes to trigger @Command decorator
    - Store plugin references for lifecycle management
    - _Requirements: 3.1, 3.2, 3.6_

  - [ ]\* 6.3 Write property test for plugin command registration

    - **Property 4: Plugin command registration**
    - **Validates: Requirements 3.1, 3.2, 4.2**

  - [ ]\* 6.4 Write property test for plugin loading order

    - **Property 5: Plugin loading order preservation**
    - **Validates: Requirements 3.6**

  - [ ]\* 6.5 Write property test for plugin loading errors
    - **Property 17: Plugin loading error**
    - **Validates: Requirements 12.5**

- [x] 7. Implement stdio runtime

  - [x] 7.1 Create stdio server function

    - Implement createStdioServer accepting StdioServerConfig
    - Load plugins if provided
    - Create McpServer from @modelcontextprotocol/sdk
    - Register executeCommand and help tools
    - Create StdioServerTransport and connect
    - _Requirements: 4.1, 4.2, 13.1, 13.3_

  - [ ]\* 7.2 Write property test for plugin initialization order

    - **Property 18: Plugin initialization order**
    - **Validates: Requirements 13.3**

  - [ ]\* 7.3 Write integration test for stdio server
    - Test server starts successfully
    - Test commands are accessible
    - Test executeCommand works via stdio
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Implement HTTP runtime

  - [x] 8.1 Create HTTP server function

    - Implement createHttpServer accepting HttpServerConfig
    - Load plugins if provided
    - Create Hono app
    - Create MCP handler using mcp-handler
    - Register executeCommand and help tools in handler
    - Mount handler at basePath + /mcp/\*
    - Start server using @hono/node-server
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 13.2, 13.3_

  - [ ]\* 8.2 Write property test for HTTP routing

    - **Property 8: HTTP routing**
    - **Validates: Requirements 5.3**

  - [ ]\* 8.3 Write property test for HTTP server configuration

    - **Property 9: HTTP server configuration**
    - **Validates: Requirements 5.4**

  - [ ]\* 8.4 Write integration test for HTTP server
    - Test server starts on configured port
    - Test /mcp/\* endpoints are accessible
    - Test executeCommand works via HTTP
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 9. Checkpoint - Ensure runtime tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Create core package exports

  - [x] 10.1 Create index.ts with all exports

    - Export decorators: Command, Param
    - Export registry functions: getCommandRegistry, getCommand, getAllCommands
    - Export runtime functions: createStdioServer, createHttpServer
    - Export plugin interfaces: Plugin, CommandHandler
    - Export types: CommandMetadata, StdioServerConfig, HttpServerConfig, MCPResponse
    - _Requirements: 10.3_

  - [ ]\* 10.2 Write unit test for exports
    - Verify all expected exports are available
    - Verify types are exported correctly
    - _Requirements: 10.3_

- [x] 11. Implement Math plugin (reference implementation)

  - [x] 11.1 Create plugin package structure

    - Create packages/plugin-math directory
    - Setup package.json with @mcp-decorator/plugin-math name
    - Configure TypeScript and build
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.2, 10.4_

  - [x] 11.2 Implement math commands

    - Create AddCommand with @Command('math.add', 'Add two numbers')
    - Create SubtractCommand with @Command('math.subtract', 'Subtract two numbers')
    - Create MultiplyCommand with @Command('math.multiply', 'Multiply two numbers')
    - Create DivideCommand with @Command('math.divide', 'Divide two numbers')
    - Add division by zero error handling
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 11.3 Create MathPlugin class

    - Implement Plugin interface
    - Return all math commands from register()
    - Export MathPlugin
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]\* 11.4 Write unit tests for math commands
    - Test addition with known values
    - Test subtraction with known values
    - Test multiplication with known values
    - Test division with known values
    - Test division by zero returns error (edge case)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 12. Implement Filesystem plugin

  - [x] 12.1 Create plugin package structure

    - Create packages/plugin-filesystem directory
    - Setup package.json with @mcp-decorator/plugin-filesystem name
    - Configure TypeScript and build
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 10.2, 10.4_

  - [x] 12.2 Implement filesystem commands

    - Create ReadFileCommand with @Command('fs.read', 'Read file content')
    - Create WriteFileCommand with @Command('fs.write', 'Write file content')
    - Create ListFilesCommand with @Command('fs.list', 'List directory contents')
    - Create DeleteFileCommand with @Command('fs.delete', 'Delete file')
    - Implement basePath security check in all commands
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 12.3 Create FilesystemPlugin class

    - Implement Plugin interface
    - Accept FilesystemOptions with basePath and allowedExtensions
    - Return all filesystem commands from register()
    - Export FilesystemPlugin and FilesystemOptions
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]\* 12.4 Write property test for basePath restriction

    - **Property 12: Filesystem basePath restriction**
    - **Validates: Requirements 7.5**

  - [ ]\* 12.5 Write property test for filesystem error messages

    - **Property 13: Filesystem error messages**
    - **Validates: Requirements 7.6**

  - [ ]\* 12.6 Write unit tests for filesystem commands
    - Test reading existing file
    - Test writing file
    - Test listing directory
    - Test deleting file
    - Test operations outside basePath are rejected
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 13. Implement HTTP plugin

  - [x] 13.1 Create plugin package structure

    - Create packages/plugin-http directory
    - Setup package.json with @mcp-decorator/plugin-http name
    - Configure TypeScript and build
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 10.2, 10.4_

  - [x] 13.2 Implement HTTP commands

    - Create GetCommand with @Command('http.get', 'Make GET request')
    - Create PostCommand with @Command('http.post', 'Make POST request')
    - Create PutCommand with @Command('http.put', 'Make PUT request')
    - Create DeleteCommand with @Command('http.delete', 'Make DELETE request')
    - Implement timeout handling in all commands
    - Return status code, headers, and body in response
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 13.3 Create HttpPlugin class

    - Implement Plugin interface
    - Accept HttpOptions with timeout and headers
    - Return all HTTP commands from register()
    - Export HttpPlugin and HttpOptions
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]\* 13.4 Write property test for HTTP response structure

    - **Property 14: HTTP response structure**
    - **Validates: Requirements 8.5**

  - [ ]\* 13.5 Write property test for HTTP timeout

    - **Property 15: HTTP timeout enforcement**
    - **Validates: Requirements 8.6**

  - [ ]\* 13.6 Write unit tests for HTTP commands
    - Test GET request to mock server
    - Test POST request with body
    - Test PUT request with body
    - Test DELETE request
    - Test timeout enforcement
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 14. Checkpoint - Ensure all plugin tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Create example applications

  - [x] 15.1 Create basic example

    - Create examples/basic directory
    - Implement simple custom command
    - Show stdio server usage
    - Show HTTP server usage
    - Add README with instructions
    - _Requirements: 1.1, 1.2, 4.1, 5.1_

  - [x] 15.2 Create plugin example

    - Create examples/with-plugins directory
    - Show loading Math, Filesystem, and HTTP plugins
    - Show custom commands alongside plugins
    - Add README with instructions
    - _Requirements: 3.1, 3.2, 7.1, 8.1, 9.1_

  - [x] 15.3 Create advanced example
    - Create examples/advanced directory
    - Show plugin with init/destroy lifecycle
    - Show error handling
    - Show configuration options
    - Add README with instructions
    - _Requirements: 3.4, 3.5, 12.1, 12.3, 13.3_

- [x] 16. Create documentation

  - [x] 16.1 Write core package README

    - Document installation
    - Document decorator usage
    - Document runtime functions
    - Document plugin system
    - Add API reference
    - _Requirements: 1.1, 1.2, 3.1, 4.1, 5.1_

  - [x] 16.2 Write plugin READMEs

    - Document Math plugin usage
    - Document Filesystem plugin usage and security
    - Document HTTP plugin usage
    - Add configuration examples
    - _Requirements: 7.1, 8.1, 9.1_

  - [x] 16.3 Create getting started guide
    - Write quick start tutorial
    - Show creating first command
    - Show using plugins
    - Show deploying server
    - _Requirements: 1.1, 1.2, 3.1, 4.1, 5.1_

- [x] 17. Final integration and testing

  - [x] 17.1 Run full test suite

    - Run all unit tests
    - Run all property tests
    - Run all integration tests
    - Verify 100% of testable requirements covered
    - _Requirements: All_

  - [x] 17.2 Test example applications

    - Run basic example and verify it works
    - Run plugin example and verify all plugins work
    - Run advanced example and verify lifecycle works
    - _Requirements: All_

  - [x] 17.3 Build all packages
    - Build @mcp-decorator/core
    - Build @mcp-decorator/plugin-math
    - Build @mcp-decorator/plugin-filesystem
    - Build @mcp-decorator/plugin-http
    - Verify all packages have correct exports
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end functionality
