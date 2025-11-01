# Test File for 4D Documentation Viewer Extension

## Sample 4D Commands

Try these commands to test the extension:

1. **Select any command below and right-click to open documentation**

ACTIVITY SNAPSHOT
ARRAY TO LIST
SET DATABASE PARAMETER
QUERY
RELATE MANY
WEB SEND FILE
SEND PACKET
RECEIVE PACKET
CREATE RECORD
SAVE RECORD

## How to Test

### Method 1: Selection
1. Select one of the commands above (e.g., `ACTIVITY SNAPSHOT`)
2. Right-click
3. Choose "4D: Open Command Documentation in Browser" or "4D: Open Command Documentation in Editor"

### Method 2: Cursor Position
1. Place cursor inside a command word (e.g., in the middle of "QUERY")
2. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
3. Type "4D"
4. Select "4D: Open Command Documentation in Browser" or "4D: Open Command Documentation in Editor"

### Method 3: Manual Entry
1. Run command without selection/cursor on command
2. Enter command name when prompted

## Expected Results

**Browser Mode:**
- Opens https://developer.4d.com/docs/commands/[command-name] in your default browser

**Editor Mode:**
- Opens a new webview panel in VS Code
- Shows formatted documentation with 4D CSS styling
- Theme-aware (matches your VS Code theme)
- Clickable links to related documentation

## Test Commands

Here are some more commands to try:

```
QUERY BY FORMULA
CREATE INDEX
SET QUERY LIMIT
SELECTION TO ARRAY
ARRAY TO SELECTION
GET SELECTED TEXT
SET TEXT TO PASTEBOARD
```

Inline: You can also test with commands like QUERY or SAVE RECORD in sentences.

## Cache Testing

1. First lookup - fetches from web (slower)
2. Subsequent lookups - uses cache (instant)
3. Clear cache via MCP server to test fresh fetches
