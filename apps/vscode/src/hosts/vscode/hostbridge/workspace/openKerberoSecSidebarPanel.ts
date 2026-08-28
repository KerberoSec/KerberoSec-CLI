import * as vscode from "vscode"
import { ExtensionRegistryInfo } from "@/registry"
import { OpenKerberoSecSidebarPanelRequest, OpenKerberoSecSidebarPanelResponse } from "@/shared/proto/index.host"

export async function openKerberoSecSidebarPanel(
	_: OpenKerberoSecSidebarPanelRequest,
): Promise<OpenKerberoSecSidebarPanelResponse> {
	await vscode.commands.executeCommand(`${ExtensionRegistryInfo.views.Sidebar}.focus`)
	return {}
}
