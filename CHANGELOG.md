# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-01-06

### Added

#### Core Package (@mcp-decorator/core)

- 🎨 Decorator-based API with `@Command` and `@Param` decorators
- 🔌 Plugin system for extensible functionality
- 🚀 Dual transport modes: stdio and HTTP
- ✅ Type-safe parameter validation with Zod schemas
- 📦 Minimal dependencies (MCP SDK, Hono, Zod)
- 🔄 Lifecycle hooks (init, destroy)
- 📝 Comprehensive error handling
- 🎯 Command registry system
- 🌐 HTTP server with Hono framework
- 📡 Stdio server for Claude Desktop integration

#### Plugin Packages

- **@mcp-decorator/plugin-math**: Basic math operations (add, subtract, multiply, divide)
- **@mcp-decorator/plugin-filesystem**: File system operations (read, write, list, delete) with security basePath
- **@mcp-decorator/plugin-http**: HTTP request operations (GET, POST, PUT, DELETE) with timeout handling

#### Documentation

- 📖 Comprehensive README with quick start guide
- 📚 Getting Started guide (docs/GETTING_STARTED.md)
- 📋 Complete API reference (docs/API.md)
- 🔧 Plugin development guide (docs/plugin-development.md)
- 🚀 Deployment guide (docs/deployment.md)
- 📦 NPM publishing guide (docs/PUBLISHING.md)
- ✅ Pre-publication checklist (PUBLISH_CHECKLIST.md)

#### Examples

- Basic example: Simple stdio and HTTP servers
- With-plugins example: Using pre-built plugins
- Advanced example: Lifecycle management and error handling

#### Testing

- ✅ 27 comprehensive tests covering all functionality
- 🧪 Unit tests for decorators, plugins, and runtime
- 🔍 Integration tests for server creation

### Technical Details

- TypeScript 5.3+ with strict mode
- ESM module format
- Reflect-metadata for decorator support
- Zod for schema validation
- Hono for HTTP server
- MCP SDK 1.25.1

### Package Information

- **Repository**: https://github.com/fromsko/mcp-decorator-framework
- **Author**: fromsko
- **License**: MIT
- **Node.js**: 18+ required
- **Package Manager**: pnpm (recommended), npm, or bun

### Breaking Changes

None (initial release)

### Migration Guide

Not applicable (initial release)

---

## Release Notes Template for Future Versions

### [X.Y.Z] - YYYY-MM-DD

#### Added

- New features

#### Changed

- Changes in existing functionality

#### Deprecated

- Soon-to-be removed features

#### Removed

- Removed features

#### Fixed

- Bug fixes

#### Security

- Security fixes

---

[Unreleased]: https://github.com/fromsko/mcp-decorator-framework/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/fromsko/mcp-decorator-framework/releases/tag/v0.1.0
