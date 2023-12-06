import * as vscode from "vscode";
import { getNonce } from "../libs/getNonce";
import { OrgSummary, summarizeOrg } from '/Users/rubenhalman/Projects/sf-org-summary-core/';
import { LoadingPanel } from "./LoadingPanel";

export class SummarySidebar implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

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
          if(flags.outputdirectory) {
            let directory = await vscode.window.showOpenDialog({
              canSelectFiles: false,
              canSelectFolders: true,
              canSelectMany: false
            });
            flags.outputdirectory = directory[0].fsPath;
          }
          const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
          LoadingPanel.createOrShow(this._extensionUri);
		      const orgSummary: OrgSummary = await summarizeOrg(
           flags
          );
          vscode.window.showInformationMessage('Summary ' + orgSummary.ResultState);
          // if summary was stored in the core.
          if(orgSummary.OutputPath){
            vscode.workspace.openTextDocument(orgSummary.OutputPath+`/${orgSummary.OrgId}/${orgSummary.Timestamp}/orgsummary.json`).then(doc => {
              vscode.window.showTextDocument(doc);
            });
            LoadingPanel.kill();
          } else {
            const wsedit = new vscode.WorkspaceEdit();
            const filePath = vscode.Uri.file(wsPath + '/orgsummary.json');
            wsedit.createFile(filePath, { ignoreIfExists: true, contents: Buffer.from(JSON.stringify(orgSummary))});
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
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${
          webview.cspSource
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