import * as vscode from "vscode";
import { detectCommandName, promptForCommandName } from "./commandDetector";
import { openCommandInBrowser } from "./docService";
import { DocWebviewProvider } from "./webviewProvider";
import * as path from "path";

/**
 * MCP Server Definition Provider to make the 4D docs MCP server available to Copilot
 */
class FourDDocsMcpProvider implements vscode.McpServerDefinitionProvider<vscode.McpStdioServerDefinition> {
  provideMcpServerDefinitions(): vscode.ProviderResult<vscode.McpStdioServerDefinition[]> {
    const extensionPath = vscode.extensions.getExtension('mesopelagique.mcp-4d-docs')?.extensionPath;
    if (!extensionPath) {
      return [];
    }

    const serverPath = path.join(extensionPath, 'build', 'index.js');
    
    const serverDef = new vscode.McpStdioServerDefinition(
      '4D Documentation',
      'node',
      [serverPath],
      {},
      '0.1.0'
    );
    
    // Set the id property
    (serverDef as any).id = '4d-docs';
    
    return [serverDef];
  }
}

/**
 * This method is called when the extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('4D Documentation Viewer extension is now active');

  // Register MCP server definition provider
  try {
    const mcpProvider = new FourDDocsMcpProvider();
    const mcpDisposable = vscode.lm.registerMcpServerDefinitionProvider('4d-docs', mcpProvider);
    context.subscriptions.push(mcpDisposable);
    console.log('MCP server registered successfully for 4D Documentation');
  } catch (error) {
    console.error('Failed to register MCP server:', error);
    vscode.window.showErrorMessage(`Failed to register 4D Docs MCP server: ${error}`);
  }

  // Test command to verify extension is working
  const testCommand = vscode.commands.registerCommand('4d-docs.test', () => {
    vscode.window.showInformationMessage('4D Documentation Viewer extension is working!');
  });

  // Register command: Open in Browser
  const openInBrowserCommand = vscode.commands.registerCommand(
    '4d-docs.openInBrowser',
    async () => {
      const editor = vscode.window.activeTextEditor;
      
      if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
      }

      // Try to detect command name
      let commandName = await detectCommandName(editor);

      // If detection failed, prompt user
      if (!commandName) {
        commandName = await promptForCommandName();
      }

      if (!commandName) {
        return; // User cancelled
      }

      try {
        await openCommandInBrowser(commandName);
        vscode.window.showInformationMessage(`Opened documentation for ${commandName}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to open documentation: ${errorMessage}`);
      }
    }
  );

  // Register command: Open in Webview
  const openInWebviewCommand = vscode.commands.registerCommand(
    '4d-docs.openInWebview',
    async () => {
      const editor = vscode.window.activeTextEditor;
      
      if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
      }

      // Try to detect command name
      let commandName = await detectCommandName(editor);

      // If detection failed, prompt user
      if (!commandName) {
        commandName = await promptForCommandName();
      }

      if (!commandName) {
        return; // User cancelled
      }

      try {
        await DocWebviewProvider.show(commandName, context.extensionUri);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to load documentation: ${errorMessage}`);
      }
    }
  );

  context.subscriptions.push(testCommand, openInBrowserCommand, openInWebviewCommand);
}

/**
 * This method is called when the extension is deactivated
 */
export function deactivate() {
  console.log('4D Documentation Viewer extension is now deactivated');
}
