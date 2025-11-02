# 4D Documentation Viewer

A VS Code extension and MCP (Model Context Protocol) server for browsing 4D command documentation.

## Overview

This project provides **two ways** to access 4D command documentation:

1. **VS Code Extension**: Browse documentation directly in VS Code with intelligent command detection
2. **MCP Server**: Use as a Model Context Protocol server with AI assistants like Claude

Both modes share the same caching system for improved performance.

## Features

### VS Code Extension Features

- **Smart Command Detection**: Automatically detects 4D commands from:
  - Selected text
  - Word at cursor position
  - LSP/hover information
  - Strips command numbers (e.g., `:C123` format) when getting command name
- **Two Display Modes**:
  - Open in browser (quick external reference)
  - Open in editor webview (integrated documentation with CSS styling)
- **Context Menu Integration**: Right-click commands for quick access
- **Automatic Caching**: Faster subsequent lookups

### MCP Server Features

- **Fetch 4D Command Documentation**: Retrieve HTML documentation for any 4D command
- **Smart Caching**: Automatically caches documentation in OS-specific cache directories
- **Cache Management**: Clear the cache when needed to fetch fresh documentation
- **Browser Integration**: Open documentation URLs directly in default browser

## Installation

### As a VS Code Extension

1. Build the extension:
```bash
npm install
npm run build
```

2. Install locally:
   - Press `F5` to run the extension in a new VS Code window (for development)
   - Or package and install:
```bash
npm run package
code --install-extension mcp-4d-docs-0.1.0.vsix
```

### As an MCP Server

```bash
# Clone or navigate to the project
cd mcp-4d-docs

# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

## Usage

### Using the VS Code Extension

1. Open a 4D code file (or any file)
2. Select a 4D command name or place cursor on it
3. Use one of these methods:
   - **Command Palette** (`Cmd+Shift+P`):
     - `4D: Open Command Documentation in Browser`
     - `4D: Open Command Documentation in Editor`
   - **Right-click Context Menu**:
     - Select command text, right-click, choose option
   - **Keyboard Shortcut**: (can be configured in VS Code)

If no command is detected, you'll be prompted to enter one manually.

### Using as MCP Server

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "4d-docs": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-4d-docs/build/index.js"]
    }
  }
}
```

For VS Code, add to `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "4d-docs": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-4d-docs/build/index.js"]
    }
  }
}
```

## Available MCP Tools

### get_4d_command_docs

Fetches documentation for a 4D command.

**Parameters:**
- `command_name` (string): The name of the 4D command (e.g., "ACTIVITY SNAPSHOT", "ARRAY TO LIST")

**Returns:**
- HTML documentation content extracted from the `<article>` tag within the `<main>` section

**Example:**
```javascript
// Fetches from https://developer.4d.com/docs/commands/activity-snapshot
get_4d_command_docs("ACTIVITY SNAPSHOT")
```

### clear_4d_docs_cache

Clears all cached documentation files.

**Returns:**
- A message indicating the number of files cleared

### open_4d_command_in_browser

Opens a 4D command documentation page in the default web browser.

**Parameters:**
- `command_name` (string): The name of the 4D command (e.g., "ACTIVITY SNAPSHOT", "ARRAY TO LIST")

**Returns:**
- A message confirming the URL was opened

**Example:**
```javascript
// Opens https://developer.4d.com/docs/commands/activity-snapshot in your browser
open_4d_command_in_browser("ACTIVITY SNAPSHOT")
```

## How It Works

1. **Command Detection** (VS Code Extension):
   - Checks for selected text first
   - Falls back to word at cursor position
   - Uses LSP hover information when available
   - Prompts for manual entry if needed

2. **URL Encoding**: Command names are converted to lowercase and spaces are replaced with hyphens
   - Example: "ACTIVITY SNAPSHOT" → "activity-snapshot"

3. **Documentation Fetching**: The server requests documentation from:
   - `https://developer.4d.com/docs/commands/<encoded-command-name>`

4. **HTML Extraction**: The server parses the HTML and extracts the `<article>` node from within the `<main>` tag

5. **Link Rewriting**: Relative `/docs/` links are converted to absolute URLs

6. **Caching**: Results are cached in the OS system cache directory:
   - **macOS**: `~/Library/Caches/mcp-4d-docs/`
   - **Windows**: `%LOCALAPPDATA%\mcp-4d-docs\`
   - **Linux**: `~/.cache/mcp-4d-docs/`

7. **Cache Key**: Each command is cached using an MD5 hash of its name as the filename

8. **Display** (VS Code Extension):
   - Browser mode: Opens URL directly
   - Webview mode: Displays cached HTML with 4D CSS styling and VS Code theme integration

## Development

### Project Structure

```
mcp-4d-docs/
├── src/
│   ├── index.ts              # MCP server implementation
│   ├── extension.ts          # VS Code extension entry point
│   ├── docService.ts         # Shared documentation service
│   ├── commandDetector.ts    # Command name detection logic
│   └── webviewProvider.ts    # Webview panel management
├── build/                    # Compiled JavaScript output
├── logo.png                  # Extension icon
├── package.json             # Project metadata & VS Code extension config
├── tsconfig.json            # TypeScript configuration
├── .vscodeignore            # Files excluded from extension package
└── README.md
```

### Building

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode for development
npm run watch

# Package extension
npm run package
```

### Testing the Extension

Press `F5` in VS Code to launch the Extension Development Host with the extension loaded.

### Testing the MCP Server

```bash
# Use MCP Inspector
npx @modelcontextprotocol/inspector node build/index.js
```

### Dependencies

- `@modelcontextprotocol/sdk` - Model Context Protocol SDK
- `cheerio` - HTML parsing
- `@types/vscode` - VS Code API types
- `@vscode/vsce` - VS Code extension packaging

## Configuration

### Extension Settings

The extension works out of the box with no configuration needed. It will:
- Activate when opening 4D files (`onLanguage:4d`)
- Be available via command palette for any file type
- Cache documentation in your system cache directory

### Custom Keybindings

You can add custom keyboard shortcuts in VS Code:

```json
{
  "key": "cmd+k cmd+d",
  "command": "4d-docs.openInWebview",
  "when": "editorTextFocus"
},
{
  "key": "cmd+k cmd+b",
  "command": "4d-docs.openInBrowser",
  "when": "editorTextFocus"
}
```

## Publishing

### For Personal Use

The extension is ready to use locally. After building and packaging:

```bash
npm run package
code --install-extension mcp-4d-docs-0.1.0.vsix
```

### For Distribution

Before publishing to the VS Code Marketplace:

1. **Update publisher name** in `package.json`:
   ```json
   "publisher": "your-actual-publisher-id"
   ```

2. **Add repository URL** in `package.json`:
   ```json
   "repository": {
     "type": "git",
     "url": "https://github.com/yourusername/mcp-4d-docs.git"
   }
   ```

3. **Add a LICENSE file** (e.g., LICENSE.txt with MIT license text)

4. **Publish to marketplace**:
   ```bash
   vsce publish
   ```

   Or create a VSIX for sharing:
   ```bash
   npm run package
   # Share the .vsix file
   ```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
