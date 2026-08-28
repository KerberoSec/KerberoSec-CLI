import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { ProviderSettingsManager } from "@kerberosec/core";
import { buildInviteUrl, resolveKerberoSecHubServerOptions } from "../options";
import type { BrowserConfig } from "./types";

export const options = resolveKerberoSecHubServerOptions();
export const { host, port, publicUrl, roomSecret, workspaceRoot } = options;
export const inviteUrl = buildInviteUrl(publicUrl, roomSecret);

const serverDir = dirname(fileURLToPath(import.meta.url));
/** server.ts lives one level up from this module, so resolve relative to it. */
export const appSrcDir = join(serverDir, "..");
export const webviewDistDir =
	process.env.KERBEROSEC_HUB_WEBVIEW_DIST_DIR?.trim() ||
	join(appSrcDir, "../dist/webview");
export const cliIndexPath = normalize(
	join(appSrcDir, "../../cli/src/index.ts"),
);

export const providerSettingsManager = new ProviderSettingsManager();

export const browserConfig: BrowserConfig = {
	inviteRequired: Boolean(roomSecret),
	publicUrl,
};
