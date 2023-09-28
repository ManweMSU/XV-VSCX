import * as vscode from 'vscode';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    Executable,
    TransportKind,
    integer
} from 'vscode-languageclient/node';

let client: LanguageClient;

function escape(input: string): string {
    let s1 = input.replace("\'", "\'\'");
    return "\'" + s1 + "\'";
}
function make_command(argv: string[], powershell: boolean): string {
    var av = argv;
    let ws = (vscode.workspace.workspaceFolders != undefined && vscode.workspace.workspaceFolders.length > 0) ?
        vscode.workspace.workspaceFolders[0].uri.path : undefined;
    let fl = vscode.window.activeTextEditor?.document.fileName;
    let xv = vscode.workspace.getConfiguration().get("xV.semitaCompilatoris") as string;
    for (var i = 0; i < av.length; i++) {
        if (ws != undefined) av[i] = av[i].replace('$LAB$', ws);
        if (fl != undefined) av[i] = av[i].replace('$LIMA$', fl);
        if (xv != undefined) av[i] = av[i].replace('$XVC$', xv);
        av[i] = escape(av[i]);
        if (powershell && i == 0) av[0] = '&' + av[0];
    }
    return argv.join(' ');
}
function make_chain(desc: string, powershell: boolean): string {
    let cl = desc.split('\n');
    var cs: string[] = [];
    var ccs: integer = 0;
    for (let i = 0; i < cl.length + 1; i++) {
        if (i == cl.length || cl[i].length == 0) {
            if (i > ccs) {
                let cc = make_command(cl.slice(ccs, i), powershell);
                cs = cs.concat(cc);
            }
            ccs = i + 1;
        }
    }
    return cs.join(' && ');
}

export function activate(context: vscode.ExtensionContext) {
    const create_document = vscode.commands.registerCommand('engine.xv.crea', () => {
        let lines = [
            "importa canonicalis;", "",
            "auxilium attributum (meta.attributum_nomen_moduli) = \"NOMEN\";",
            "auxilium attributum (meta.attributum_creator_moduli) = \"CREATOR\";",
            "auxilium attributum (meta.attributum_iura_exempli) = \"© CREATOR. ANNUS\";",
            "auxilium attributum (meta.attributum_versio) = \"0.0.0.0\";", "",
            "functio nihil primus() introitus iacit {", "}"
        ];
        vscode.workspace.openTextDocument({ language: "xv", content: lines.join("\n") }).then((value: vscode.TextDocument) => {
            vscode.window.showTextDocument(value);
        });
	});
    const command_compile = vscode.commands.registerCommand('engine.xv.compile', () => {
        var term = vscode.window.terminals.find((value: vscode.Terminal, index: number, obj: readonly vscode.Terminal[]) => {
            if (value.name == "XV") return value;
        });
        if (term != null) term.dispose();
        term = vscode.window.createTerminal("XV");
        term.show(false);
        let file = vscode.window.activeTextEditor?.document.fileName;
        if (file != undefined) {
            let ls = vscode.workspace.getConfiguration().get("xV.imperataStruendi") as string;
            let cmd = make_chain(ls, file[0] != '/');
            term.sendText(cmd, true);
        }
	});
    const command_run = vscode.commands.registerCommand('engine.xv.exeque', () => {
		var term = vscode.window.terminals.find((value: vscode.Terminal, index: number, obj: readonly vscode.Terminal[]) => {
            if (value.name == "XV") return value;
        });
        if (term != null) term.dispose();
        term = vscode.window.createTerminal("XV");
        term.show(false);
        var file = vscode.window.activeTextEditor?.document.fileName;
        if (file != undefined) {
            let ls = vscode.workspace.getConfiguration().get("xV.imperataExequendi") as string;
            let cmd = make_chain(ls, file[0] != '/');
            term.sendText(cmd, true);
        }
	});

	context.subscriptions.push(command_compile);
    context.subscriptions.push(command_run);
    context.subscriptions.push(create_document);

    try {
        let num_threads = vscode.workspace.getConfiguration().get("xV.numerusFlumenorum") as string;
        let server_options: ServerOptions;
        if (vscode.workspace.getConfiguration().get("xV.modusActuarii")) {
            server_options = {
                command: vscode.workspace.getConfiguration().get("xV.semitaServusLinguae")!,
                args: [ "--opera", "--act", "--numerus", num_threads ]
            };
        } else {
            server_options = {
                command: vscode.workspace.getConfiguration().get("xV.semitaServusLinguae")!,
                args: [ "--opera", "--numerus", num_threads ]
            };
        }
        let client_options: LanguageClientOptions = {
            documentSelector: [{ scheme: 'file', language: 'xv' }]
        };
        client = new LanguageClient(
            'xvServusLinguae',
            'XV Servus Linguae',
            server_options,
            client_options
        );
        client.start();
    } catch {
        vscode.window.showErrorMessage("XV Servus Linguae nullus. Proba potiendum XV compilator aut conformandum extensionem.");
    }
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) { return undefined; }
    return client.stop();
}