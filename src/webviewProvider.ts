import * as vscode from "vscode";
import { fetchDocumentation } from "./docService";

/**
 * Manages webview panels for displaying 4D documentation
 */
export class DocWebviewProvider {
  private static currentPanel: vscode.WebviewPanel | undefined;

  /**
   * Show documentation in a webview panel
   */
  public static async show(commandName: string, extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (DocWebviewProvider.currentPanel) {
      DocWebviewProvider.currentPanel.reveal(column);
    } else {
      // Create a new panel
      DocWebviewProvider.currentPanel = vscode.window.createWebviewPanel(
        '4dDocs',
        `4D: ${commandName}`,
        column || vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      // Reset when the current panel is closed
      DocWebviewProvider.currentPanel.onDidDispose(
        () => {
          DocWebviewProvider.currentPanel = undefined;
        },
        null
      );
    }

    // Update panel title and content
    DocWebviewProvider.currentPanel.title = `4D: ${commandName}`;
    
    try {
      // Show loading message
      DocWebviewProvider.currentPanel.webview.html = DocWebviewProvider.getLoadingHtml(commandName);
      
      // Fetch documentation
      const articleHtml = await fetchDocumentation(commandName);
      
      // Update webview with documentation
      DocWebviewProvider.currentPanel.webview.html = DocWebviewProvider.getWebviewHtml(
        commandName,
        articleHtml
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      DocWebviewProvider.currentPanel.webview.html = DocWebviewProvider.getErrorHtml(
        commandName,
        errorMessage
      );
      vscode.window.showErrorMessage(`Failed to load documentation for ${commandName}: ${errorMessage}`);
    }
  }

  /**
   * Generate loading HTML
   */
  private static getLoadingHtml(commandName: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>4D: ${commandName}</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      padding: 20px;
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
    }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="loading">Loading documentation for ${commandName}...</div>
</body>
</html>`;
  }

  /**
   * Generate error HTML
   */
  private static getErrorHtml(commandName: string, errorMessage: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>4D: ${commandName}</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      padding: 20px;
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
    }
    .error {
      color: var(--vscode-errorForeground);
      background-color: var(--vscode-inputValidation-errorBackground);
      border: 1px solid var(--vscode-inputValidation-errorBorder);
      padding: 15px;
      border-radius: 4px;
    }
    h2 {
      margin-top: 0;
    }
  </style>
</head>
<body>
  <div class="error">
    <h2>Error Loading Documentation</h2>
    <p><strong>Command:</strong> ${commandName}</p>
    <p><strong>Error:</strong> ${errorMessage}</p>
  </div>
</body>
</html>`;
  }

  /**
   * Generate webview HTML with documentation
   */
  private static getWebviewHtml(commandName: string, articleHtml: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>4D: ${commandName}</title>
  <link rel="stylesheet" href="https://developer.4d.com/docs/assets/css/styles.ae3169d2.css">
  <style>
    body {
      font-family: var(--vscode-font-family);
      padding: 20px;
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      line-height: 1.6;
    }
    
    /* Override some 4D styles to work better in VS Code */
    article {
      max-width: 100%;
      background-color: var(--vscode-editor-background);
    }
    
    a {
      color: var(--vscode-textLink-foreground);
    }
    
    a:hover {
      color: var(--vscode-textLink-activeForeground);
    }
    
    code {
      background-color: var(--vscode-textCodeBlock-background);
      color: var(--vscode-textPreformat-foreground);
      padding: 2px 4px;
      border-radius: 3px;
    }
    
    pre {
      background-color: var(--vscode-textCodeBlock-background);
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    
    pre code {
      background-color: transparent;
      padding: 0;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: var(--vscode-foreground);
      border-bottom: 1px solid var(--vscode-panel-border);
      padding-bottom: 0.3em;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    
    table th,
    table td {
      border: 1px solid var(--vscode-panel-border);
      padding: 8px;
      text-align: left;
    }
    
    table th {
      background-color: var(--vscode-editor-inactiveSelectionBackground);
      font-weight: bold;
    }
    
    blockquote {
      border-left: 4px solid var(--vscode-textBlockQuote-border);
      background-color: var(--vscode-textBlockQuote-background);
      padding: 10px 15px;
      margin: 1em 0;
    }
    
    /* Ensure images are responsive */
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <h1>${commandName}</h1>
  ${articleHtml}
</body>
</html>`;
  }
}
