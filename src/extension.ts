import * as vscode from 'vscode';
import { SummarySidebar } from './panels/SummarySidebar';

// This method is called the very first time a command is executed
export async function activate(context: vscode.ExtensionContext) {

	const panel = new SummarySidebar(context.extensionUri);
	vscode.window.registerWebviewViewProvider("orgsummary", panel);
		let disposable = vscode.commands.registerCommand('sf-org-summary.summaryrefresh', async () => {
			await vscode.commands.executeCommand("workbench.action.closeSidebar");
			await vscode.commands.executeCommand("workbench.view.extension.orgsummary-view");
			setTimeout(() => {
				vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
			  }, 500);
		});
	context.subscriptions.push(disposable);
}

// This method is called when the extension is deactivated
export function deactivate() { }
