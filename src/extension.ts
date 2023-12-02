// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as core from '/Users/rubenhalman/IdeaProjects/sf-org-summary-core/';
import { OrgSummary, summarizeOrg } from '/Users/rubenhalman/IdeaProjects/sf-org-summary-core/';
import { OverviewPanel } from './panels/OverviewPanel';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "sf-org-summary" is now active!');
	const orgSummary: OrgSummary = await summarizeOrg({'targetusername':'hub'});
	
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	
	let disposable = vscode.commands.registerCommand('sf-org-summary.summarizeOrg', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		OverviewPanel.createOrShow();
		// vscode.window.showInformationMessage('Hello ' + orgSummary.Username + ' from sf-org-summary');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
