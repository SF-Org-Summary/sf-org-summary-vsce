import * as vscode from "vscode";
import { getNonce } from "../libs/getNonce";
import { OrgSummary, buildBaseSummary, summarizeOrg, } from '/Users/rubenhalman/Projects/sf-org-summary-core/';
import { LoadingPanel } from "./LoadingPanel";

export class SummarySidebar implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) { }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        case "summarize": {
          if (!data.value) {
            return;
          }
          const flags = data.value;
          LoadingPanel.createOrShow(this._extensionUri);

          let finalOrgSummary: OrgSummary = await buildBaseSummary(flags.targetusername);
          const relevantFlags = ['healthcheck', 'limits', 'codeanalysis', 'tests'];

          if (flags.outputdirectory) {
            let directory = await vscode.window.showOpenDialog({
              canSelectFiles: false,
              canSelectFolders: true,
              canSelectMany: false
            });
            flags.outputdirectory = directory[0].fsPath;
          }
          for (const flag of relevantFlags) {
            const flagObject = { 'targetusername': flags.targetusername };
            if (flags.hasOwnProperty(flag) && flags[flag] === true) {
              flagObject[flag] = true;
              flagObject['keepdata'] = flags.keepdata;
              if (typeof (flags.outputdirectory) === "string") {
                flagObject['outputdirectory'] = flags.outputdirectory;
              }
              flagObject['metadata'] = "";
              const orgSummary: OrgSummary = await summarizeOrg(flagObject, finalOrgSummary);
              console.log(`Summary for flag '${flag}': `, orgSummary);
              finalOrgSummary = { ...finalOrgSummary, ...orgSummary };
            }
          }
          console.log('metadata', flags.metadata);
          if (flags.metadata) {
              const flagObject = { 'targetusername': flags.targetusername };
              flagObject['keepdata'] = flags.keepdata;
              if (typeof (flags.outputdirectory) === "string") {
                flagObject['outputdirectory'] = flags.outputdirectory;
              }
              const orgSummary: OrgSummary = await summarizeOrg(flagObject, finalOrgSummary);
              console.log(`Summary for flag metadata: `, orgSummary);
              finalOrgSummary = { ...finalOrgSummary, ...orgSummary };
          }
          console.log('Final Org Summary: ', finalOrgSummary);
          const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
          vscode.window.showInformationMessage('Summary ' + finalOrgSummary.ResultState);
          // if summary was stored in the core.
          if (finalOrgSummary.OutputPath) {
            vscode.workspace.openTextDocument(finalOrgSummary.OutputPath + `/${finalOrgSummary.OrgId}/${finalOrgSummary.Timestamp}/orgsummary.json`).then(doc => {
              vscode.window.showTextDocument(doc);
            });
            LoadingPanel.kill();
          } else {
            const wsedit = new vscode.WorkspaceEdit();
            const filePath = vscode.Uri.file(wsPath + '/orgsummary.json');
            wsedit.createFile(filePath, { ignoreIfExists: true, contents: Buffer.from(JSON.stringify(finalOrgSummary)) });
            vscode.workspace.applyEdit(wsedit);
            vscode.workspace.openTextDocument(filePath).then(doc => {
              vscode.window.showTextDocument(doc);
            });
            LoadingPanel.kill();
          }
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/SummarySidebar.js")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/SummarySidebar.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource
      }; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <script nonce="${nonce}">
          const tsvscode = acquireVsCodeApi();
        </script>
			</head>
      <body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}