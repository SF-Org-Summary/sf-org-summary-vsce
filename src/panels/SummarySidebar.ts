import * as vscode from "vscode";
import { getNonce } from "../libs/getNonce";
import { LoadingPanel } from "./LoadingPanel";
import { OrgSummary, buildBaseSummary, summarizeOrg } from "sf-org-summary-core";

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
          LoadingPanel.updateStatus('Getting Org Information...');
          let finalOrgSummary: OrgSummary = await buildBaseSummary(flags.targetusername);
          if (flags.outputdirectory) {
            let directory = await vscode.window.showOpenDialog({
              canSelectFiles: false,
              canSelectFolders: true,
              canSelectMany: false
            });
            flags.outputdirectory = directory[0].fsPath;
          }
          for (const flag of ['healthcheck', 'limits', 'codeanalysis', 'tests']) {
            const flagObject = { 'targetusername': flags.targetusername };
            if (flags.hasOwnProperty(flag) && flags[flag] === true) {
              flagObject[flag] = true;
              flagObject['keepdata'] = flags.keepdata;
              if (typeof (flags.outputdirectory) === "string") {
                flagObject['outputdirectory'] = flags.outputdirectory;
              }
              flagObject['metadata'] = "";
              LoadingPanel.updateStatus(this.getFlagMessage(flag, true));
              const orgSummary: OrgSummary = await summarizeOrg(flagObject, finalOrgSummary);
              finalOrgSummary = { ...finalOrgSummary, ...orgSummary };
              vscode.window.showInformationMessage(this.getFlagMessage(flag, false));
            }
          }
        
          if (flags.metadata) {
            const flagObject = { 'targetusername': flags.targetusername };
            flagObject['keepdata'] = flags.keepdata;
            if (typeof (flags.outputdirectory) === "string") {
              flagObject['outputdirectory'] = flags.outputdirectory;
            }
            LoadingPanel.updateStatus('Creating Metadata Overview...');
            const orgSummary: OrgSummary = await summarizeOrg(flagObject, finalOrgSummary);
            finalOrgSummary = { ...finalOrgSummary, ...orgSummary };
          }
          const resultStateMessage = this.getResultStateMessage(finalOrgSummary.ResultState);
          vscode.window.showInformationMessage(resultStateMessage);
          const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
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

  private getFlagMessage(flag: string, isRunning: boolean): string {
    const action = isRunning ? 'Running' : 'Completed';
  
    switch (flag) {
      case 'healthcheck':
        return `${action} Health Check...`;
      case 'limits':
        return `${action} Org Limits Check...`;
      case 'codeanalysis':
        return `${action} Code Analysis...`;
      case 'tests':
        return `${action} Apex Tests...`;
      default:
        return `${action} ${flag}...`;
    }
  }
  
  private getResultStateMessage(resultState: string): string {
    switch (resultState) {
      case 'Completed':
        return 'Summary processed successfully.';
      default:
        return `Error processing summary. ResultState: ${resultState}`;
    }
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