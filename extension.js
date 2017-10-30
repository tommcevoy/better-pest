const vscode = require('vscode');

var previousFileName;
var previousFilterString;

function activate(context) {
    let provider = vscode.workspace.registerTaskProvider('phpunit', {
        provideTasks: () => {
            const rootDirectory = vscode.workspace.rootPath;
            const fileName = vscode.window.activeTextEditor.document.fileName;
            const methodName = getMethodName(vscode.window.activeTextEditor.selection.active.line);

            let filterString = methodName ? `--filter '/^.*::${methodName}$/'` : '';

            const tasks = [
                new vscode.Task(
                    { type: "phpunit", task: "run" },
                    "run",
                    'phpunit',
                    new vscode.ShellExecution(`${rootDirectory}/vendor/bin/phpunit ${fileName} ${filterString}`),
                    '$phpunit'
                ),
                new vscode.Task(
                    { type: "phpunit", task: "run previous" },
                    "run previous",
                    'phpunit',
                    new vscode.ShellExecution(`${rootDirectory}/vendor/bin/phpunit ${previousFileName} ${previousFilterString}`),
                    '$phpunit'
                ),
            ];

            previousFileName = fileName;
            previousFilterString = filterString;

            return tasks;
        },
        resolveTask(task) {
            return undefined;
        }
    });

    context.subscriptions.push(provider);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;

function getMethodName(lineNumber) {
    let methodName;
    let line = lineNumber;

    while (line > 0) {
        const lineText = vscode.window.activeTextEditor.document.lineAt(line).text;
        const match = lineText.match(/^\s*(?:public|private|protected)?\s*function\s*(\w+)\s*\(.*$/);
        if (match) {
            methodName = match[1];
            break;
        }
        line = line - 1;
    }

    return methodName;
}