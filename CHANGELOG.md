# Changelog

All notable changes to the "4D Documentation Viewer" extension will be documented in this file.

## [0.1.0] - 2025-11-01

### Added
- **VS Code Extension**: Transform project into a full VS Code extension
  - Smart command detection from selection, cursor position, or LSP hover
  - Two display modes: browser and integrated webview
  - Context menu integration for easy access
  - Command palette commands
- **Shared Documentation Service**: Refactored core functionality into reusable modules
  - `docService.ts`: Core documentation fetching and caching
  - `commandDetector.ts`: Intelligent 4D command name detection
  - `webviewProvider.ts`: Webview management with CSS styling
  - `extension.ts`: VS Code extension entry point
- **Webview Styling**: Integration with 4D's official CSS and VS Code themes
- **Development Tools**: 
  - Launch configurations for extension and MCP server debugging
  - Build tasks for TypeScript compilation
  - Extension packaging support with `.vscodeignore`
- **Documentation**: Updated README with both extension and MCP server usage

### Changed
- Refactored MCP server (`index.ts`) to use shared `docService.ts`
- Updated `package.json` with VS Code extension metadata
- Enhanced `tsconfig.json` with source maps and lib configuration
- Logo integration (`logo.png`) as extension icon

### Technical Details
- Maintains backward compatibility as MCP server
- Dual-mode operation: VS Code extension + MCP server
- Shared caching system across both modes
- TypeScript-based with full type safety
- Uses VS Code extension API for seamless integration

## [0.0.1] - Previous

### Initial Release
- Basic MCP server for 4D documentation
- Three MCP tools: get_4d_command_docs, clear_4d_docs_cache, open_4d_command_in_browser
- OS-specific caching system
- HTML parsing with Cheerio
