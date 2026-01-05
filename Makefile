.PHONY: help version up up-all build clean test publish

# Package paths
ROOT_PKG := package.json
CORE_PKG := packages/core/package.json
MATH_PKG := packages/plugin-math/package.json
FS_PKG := packages/plugin-filesystem/package.json
HTTP_PKG := packages/plugin-http/package.json

# Default target: show help and version info
help:
	@echo "================================================================"
	@echo "  MCP Decorator Framework - Version Manager"
	@echo "================================================================"
	@echo ""
	@echo "Current Versions:"
	@echo "  root       -> $$(node -p "require('./$(ROOT_PKG)').version")"
	@echo "  core       -> $$(node -p "require('./$(CORE_PKG)').version")"
	@echo "  math       -> $$(node -p "require('./$(MATH_PKG)').version")"
	@echo "  filesystem -> $$(node -p "require('./$(FS_PKG)').version")"
	@echo "  http       -> $$(node -p "require('./$(HTTP_PKG)').version")"
	@echo ""
	@echo "Available Commands:"
	@echo "  make version           - Show all package versions"
	@echo "  make up <pkg> [type]   - Bump package version"
	@echo "  make up-all [type]     - Bump all packages version"
	@echo "  make build             - Build all packages"
	@echo "  make test              - Run tests"
	@echo "  make clean             - Clean build artifacts"
	@echo "  make publish           - Publish all packages (requires version change)"
	@echo ""
	@echo "Examples:"
	@echo "  make up http           - Bump http plugin patch version (0.1.0 -> 0.1.1)"
	@echo "  make up core minor     - Bump core minor version (0.1.0 -> 0.2.0)"
	@echo "  make up math major     - Bump math major version (0.1.0 -> 1.0.0)"
	@echo "  make up root           - Bump root version"
	@echo "  make up-all            - Bump all packages patch version"
	@echo "  make up-all minor      - Bump all packages minor version"
	@echo ""
	@echo "Available Packages:"
	@echo "  root, core, math, filesystem, http"
	@echo ""
	@echo "Version Types:"
	@echo "  patch (default), minor, major"
	@echo "================================================================"

# Show version info
version:
	@echo "Package Versions:"
	@echo "  root       -> $$(node -p "require('./$(ROOT_PKG)').version")"
	@echo "  core       -> $$(node -p "require('./$(CORE_PKG)').version")"
	@echo "  math       -> $$(node -p "require('./$(MATH_PKG)').version")"
	@echo "  filesystem -> $$(node -p "require('./$(FS_PKG)').version")"
	@echo "  http       -> $$(node -p "require('./$(HTTP_PKG)').version")"

# Bump version
up:
	@if [ -z "$(filter-out $@,$(MAKECMDGOALS))" ]; then \
		echo "[!] Please specify package name"; \
		echo "Example: make up http"; \
		exit 1; \
	fi
	@node scripts/bump-version.js $(word 2,$(MAKECMDGOALS)) $(word 3,$(MAKECMDGOALS))

# Bump all packages version
up-all:
	@node scripts/bump-version.js all $(word 2,$(MAKECMDGOALS))

# Build all packages
build:
	@echo "Building all packages..."
	@bun run build
	@echo "[OK] Build complete"

# Run tests
test:
	@echo "Running tests..."
	@bun test
	@echo "[OK] Tests passed"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@bun run clean
	@echo "[OK] Clean complete"

# Publish all packages
publish: build test
	@echo "Preparing to publish..."
	@echo "[!] Make sure you've bumped version and committed"
	@echo "[!] Publishing will be done via GitHub Actions"
	@echo ""
	@echo "Run these commands to trigger publish:"
	@echo "  git add ."
	@echo "  git commit -m 'chore: bump version'"
	@echo "  git push"

# Capture extra arguments (avoid make errors)
%:
	@:
