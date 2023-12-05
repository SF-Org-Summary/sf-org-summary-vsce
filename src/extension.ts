import * as vscode from 'vscode';
// imported locally
import { OrgSummary, summarizeOrg } from '/Users/rubenhalman/Projects/sf-org-summary-core/';
import { OverviewPanel } from './panels/OverviewPanel';
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
		// const orgSummary: OrgSummary = await summarizeOrg({ 'targetusername': 'hub', 'outputdirectorPy': '/Users/rubenhalman/Projects/test' });
		// console.debug(orgSummary);

		});

	context.subscriptions.push(disposable);

	// let disposable = vscode.commands.registerCommand('sf-org-summary.summarizeOrg', () => {
	// 	// OverviewPanel.createOrShow(context.extensionUri);
	// 	// const orgSummary: OrgSummary = await summarizeOrg({ 'targetusername': 'hub', 'outputdirectory': '/Users/rubenhalman/Projects/test' });
	// 		console.log('summarizeOrg');
	// 	  panel._view?.webview.postMessage({
	// 		type: "new-todo",
	// 		value: "text",
	// 	  });
	// 	// console.debug(orgSummary);

	// });

	// context.subscriptions.push(disposable);
}

// This method is called when the extension is deactivated
export function deactivate() { }
