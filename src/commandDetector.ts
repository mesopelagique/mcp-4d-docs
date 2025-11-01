import * as vscode from "vscode";

/**
 * Clean command name by removing parentheses and arguments
 * Examples:
 *   "CHANGE LICENSES()" -> "CHANGE LICENSES"
 *   "CHANGE LICENSES(arg1; arg2)" -> "CHANGE LICENSES"
 *   "QUERY" -> "QUERY"
 */
function cleanCommandName(text: string): string {
  // Remove anything from the first opening parenthesis onwards
  const parenIndex = text.indexOf('(');
  if (parenIndex !== -1) {
    text = text.substring(0, parenIndex);
  }
  
  return text.trim();
}

/**
 * Detect the 4D command name from the current editor position
 * Uses selection if available, otherwise tries to get the word/token at cursor
 */
export async function detectCommandName(editor: vscode.TextEditor): Promise<string | undefined> {
  const selection = editor.selection;
  
  // If there's a selection with text, use it
  if (!selection.isEmpty) {
    const selectedText = editor.document.getText(selection).trim();
    if (selectedText) {
      return cleanCommandName(selectedText);
    }
  }

  // If cursor is at a position, try to get the word at that position
  const position = selection.active;
  const wordRange = editor.document.getWordRangeAtPosition(position);
  
  if (wordRange) {
    const word = editor.document.getText(wordRange);
    if (word) {
      return cleanCommandName(word);
    }
  }

  // Try to use LSP to get the symbol at cursor
  try {
    const hover = await vscode.commands.executeCommand<vscode.Hover[]>(
      'vscode.executeHoverProvider',
      editor.document.uri,
      position
    );

    if (hover && hover.length > 0) {
      // Try to extract command name from hover content
      for (const item of hover) {
        for (const content of item.contents) {
          if (typeof content === 'string') {
            // Simple text content
            const match = content.match(/\b[A-Z][A-Z0-9_\s]+\b/);
            if (match) {
              return cleanCommandName(match[0].trim());
            }
          } else if ('value' in content) {
            // MarkdownString
            const match = content.value.match(/\b[A-Z][A-Z0-9_\s]+\b/);
            if (match) {
              return cleanCommandName(match[0].trim());
            }
          }
        }
      }
    }
  } catch (error) {
    // LSP might not be available, ignore
    console.error('Error executing hover provider:', error);
  }

  // Fallback: try to expand selection to get full uppercase word/command
  // 4D commands are typically all uppercase with spaces
  const line = editor.document.lineAt(position.line);
  const lineText = line.text;
  const cursorOffset = position.character;

  // Find boundaries of uppercase word with spaces
  let start = cursorOffset;
  let end = cursorOffset;

  // Expand left
  while (start > 0 && /[A-Z0-9\s_]/.test(lineText[start - 1])) {
    start--;
  }

  // Expand right
  while (end < lineText.length && /[A-Z0-9\s_]/.test(lineText[end])) {
    end++;
  }

  const detectedText = lineText.substring(start, end).trim();
  
  // Only return if it looks like a 4D command (all uppercase)
  if (detectedText && /^[A-Z][A-Z0-9\s_]+$/.test(detectedText)) {
    return cleanCommandName(detectedText);
  }

  return undefined;
}

/**
 * Prompt user to enter a command name
 */
export async function promptForCommandName(): Promise<string | undefined> {
  return await vscode.window.showInputBox({
    prompt: 'Enter 4D command name',
    placeHolder: 'e.g., ACTIVITY SNAPSHOT or ARRAY TO LIST',
    validateInput: (value: string) => {
      if (!value || value.trim().length === 0) {
        return 'Command name cannot be empty';
      }
      return null;
    }
  });
}
