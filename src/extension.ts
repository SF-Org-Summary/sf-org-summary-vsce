import * as vscode from 'vscode';
// imported locally
import { OrgSummary, summarizeOrg } from '/Users/rubenhalman/Projects/sf-org-summary-core/';
import { OverviewPanel } from './panels/OverviewPanel';

// This method is called the very first time a command is executed
export async function activate(context: vscode.ExtensionContext) {
	
	console.log('"sf-org-summary" is now active!');
	const orgSummary: OrgSummary = await summarizeOrg({'targetusername':'hub'});
	console.debug(orgSummary);
	
	let disposable = vscode.commands.registerCommand('sf-org-summary.summarizeOrg', () => {

		OverviewPanel.createOrShow(context.extensionUri);
	});

	context.subscriptions.push(disposable);
}

// This method is called when the extension is deactivated
export function deactivate() {}
