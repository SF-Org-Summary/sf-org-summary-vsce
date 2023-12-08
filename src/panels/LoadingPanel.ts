import * as vscode from "vscode";
import { URI, Utils } from 'vscode-uri';
import { getNonce } from "../libs/getNonce";

export class LoadingPanel {

    public static currentPanel: LoadingPanel | undefined;
    public static readonly viewType = "report";
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (LoadingPanel.currentPanel) {
            LoadingPanel.currentPanel._panel.reveal(column);
            LoadingPanel.currentPanel._update();
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            LoadingPanel.viewType,
            "SF Org Summary",
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    Utils.joinPath(extensionUri, "media"),
                    Utils.joinPath(extensionUri, "out/compiled")
                ]
            }
        );
        LoadingPanel.currentPanel = new LoadingPanel(panel, extensionUri);
    }


    public static kill() {
        LoadingPanel.currentPanel?.dispose();
        LoadingPanel.currentPanel = undefined;
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public static updateStatus(value: any) {
        const column = vscode.window.activeTextEditor
          ? vscode.window.activeTextEditor.viewColumn
          : undefined;
    
        if (LoadingPanel.currentPanel) {
            LoadingPanel.currentPanel._panel.reveal(column);
    
            LoadingPanel.currentPanel._panel.webview.postMessage({
            command: "status",
            payload: { value: value },
          });
    
          return;
        }
      }

    public dispose() {
        LoadingPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
        webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "onError": {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showErrorMessage(data.value);
                    break;
                }
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(
            Utils.joinPath(this._extensionUri, "out/compiled", "LoadingPanel.js")
        );
        const cssUri = webview.asWebviewUri(
            Utils.joinPath(this._extensionUri, "out/compiled", "LoadingPanel.css")
        );
        const tabulatorStyles = webview.asWebviewUri(Utils.joinPath(
            this._extensionUri,
            "media",
            "tabulator.css"
        ));
        const stylesResetUri = webview.asWebviewUri(Utils.joinPath(
            this._extensionUri,
            "media",
            "reset.css"
        ));
        const stylesMainUri = webview.asWebviewUri(Utils.joinPath(
            this._extensionUri,
            "media",
            "vscode.css"
        ));
        const nonce = getNonce();
        return `
        <!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${tabulatorStyles}" rel="stylesheet">
        <link href="${stylesResetUri}" rel="stylesheet">
        <link href="${stylesMainUri}" rel="stylesheet">
        <link href="${cssUri}" rel="stylesheet">
        <script nonce="${nonce}">
        const tsvscode = acquireVsCodeApi();
        </script>
			</head>
      <body>
            <script src="${scriptUri}" nonce="${nonce}"></script>
			</body>
			</html>`;
    }

}
