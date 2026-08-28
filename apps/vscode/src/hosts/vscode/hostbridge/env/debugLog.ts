import { Empty, StringRequest } from "@shared/proto/kerberosec/common"
import * as vscode from "vscode"

const KERBEROSEC_OUTPUT_CHANNEL = vscode.window.createOutputChannel("KerberoSec")

// Appends a log message to all KerberoSec output channels.
export async function debugLog(request: StringRequest): Promise<Empty> {
	KERBEROSEC_OUTPUT_CHANNEL.appendLine(request.value)
	return Empty.create({})
}

// Register the KerberoSec output channel within the VSCode extension context.
export function registerKerberoSecOutputChannel(context: vscode.ExtensionContext): vscode.OutputChannel {
	context.subscriptions.push(KERBEROSEC_OUTPUT_CHANNEL)
	return KERBEROSEC_OUTPUT_CHANNEL
}
