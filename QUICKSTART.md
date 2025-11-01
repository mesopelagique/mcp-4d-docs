# Quick Start Guide

## 🚀 Getting Started with 4D Documentation Viewer

This guide will help you quickly set up and use the 4D Documentation Viewer as either a VS Code extension or an MCP server.

## Option 1: VS Code Extension (Recommended for daily use)

### Installation

1. **Build the extension:**
   ```bash
   npm install
   npm run build
   ```

2. **Test in development mode:**
   - Open this project in VS Code
   - Press `F5` to launch Extension Development Host
   - The extension will be active in the new window

3. **Package and install permanently:**
   ```bash
   npm run package
   code --install-extension mcp-4d-docs-0.1.0.vsix
   ```

### Usage

1. **Open a 4D file** (or any text file)

2. **Access documentation:**
   
   **Method A: Select text**
   - Select a 4D command name (e.g., `ARRAY TO LIST`)
   - Right-click → Choose one of:
     - `4D: Open Command Documentation in Browser`
     - `4D: Open Command Documentation in Editor`
   
   **Method B: Cursor position**
   - Place cursor on/inside a 4D command
   - Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
   - Type "4D" and select desired command
   
   **Method C: Manual entry**
   - Run command without selection
   - Enter command name when prompted

3. **View modes:**
   - **Browser**: Opens official 4D docs in your default browser
   - **Editor**: Displays docs in VS Code with syntax highlighting and theme integration

### Example Workflow

```
1. Open a .4dm file
2. See "ACTIVITY SNAPSHOT" in your code
3. Place cursor on it
4. Press Cmd+Shift+P → "4D: Open Command Documentation in Editor"
5. Documentation appears in side panel with full styling
```

## Option 2: MCP Server (For AI assistants like Claude)

### Setup

1. **Build the server:**
   ```bash
   npm install
   npm run build
   ```

2. **Configure your MCP client:**
   
   For **Claude Desktop**, add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
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

3. **Restart Claude Desktop**

### Usage

Ask Claude to use the tools:
- "Use the 4d-docs server to get documentation for ARRAY TO LIST"
- "Open the documentation for ACTIVITY SNAPSHOT in my browser"
- "Clear the 4D documentation cache"

## Testing the MCP Server

Use the MCP Inspector for testing:

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

This opens a web interface where you can:
- See available tools
- Test tool calls
- View responses
- Debug issues

## Common 4D Commands to Try

- `ACTIVITY SNAPSHOT`
- `ARRAY TO LIST`
- `SET DATABASE PARAMETER`
- `QUERY`
- `RELATE MANY`
- `WEB SEND FILE`

## Troubleshooting

### Extension not activating
- Check if TypeScript compiled: `npm run build`
- Look for errors in Output → Extension Host

### No documentation found
- Verify command name is correct (case-insensitive)
- Check internet connection
- Try clearing cache: use `clear_4d_docs_cache` tool

### Webview not loading
- Check browser console in webview (right-click → Inspect)
- Verify CSS URL is accessible
- Try browser mode instead

### MCP Server not responding
- Check if server is running: `node build/index.js`
- Verify path in MCP client config
- Check server logs for errors

## Cache Location

Documentation is cached at:
- **macOS**: `~/Library/Caches/mcp-4d-docs/`
- **Windows**: `%LOCALAPPDATA%\mcp-4d-docs\`
- **Linux**: `~/.cache/mcp-4d-docs/`

Delete cache files to force fresh fetches.

## Development Tips

### Watch mode for development
```bash
npm run watch
```

### Debug the extension
1. Set breakpoints in `src/extension.ts`
2. Press `F5`
3. Trigger commands in Extension Development Host
4. Debugger will pause at breakpoints

### Debug the MCP server
1. Use launch configuration "Run MCP Server"
2. Set breakpoints in `src/index.ts`
3. Run from Debug panel

## Next Steps

- Add custom keybindings for quick access
- Configure for your specific 4D language files
- Share the extension with your team
- Contribute improvements via pull requests

## Support

- GitHub Issues: [Report bugs or request features]
- Documentation: See README.md for full details
- 4D Docs: https://developer.4d.com/docs/
