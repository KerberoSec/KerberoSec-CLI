export const KERBEROSEC_WORKSPACES_DIRECTORY_NAME = "workspaces";
export const KERBEROSEC_CHAT_WORKSPACE_DIRECTORY_NAME = "chat";

// Default data-dir anchors for the structural check below. The Node resolver
// derives the real location from resolveKerberoSecDataDir(), which defaults to
// `~/.kerberosec/data`.
const KERBEROSEC_CONFIG_DIRECTORY_NAME = ".kerberosec";
const KERBEROSEC_DATA_DIRECTORY_NAME = "data";

/**
 * Browser-safe structural check for the shared chat workspace that hosts
 * sessions started without a project: `.kerberosec/data/workspaces/chat`. Matches
 * the directory itself only — project folders created inside it are regular
 * workspaces. Matches the default data-dir layout; explicit `KERBEROSEC_DATA_DIR`
 * overrides are not detectable from a bare path string.
 */
export function isChatWorkspacePath(path: string): boolean {
	const normalizedPath = path.trim();
	const isWindowsAbsolute =
		/^[A-Za-z]:[\\/]/.test(normalizedPath) || normalizedPath.startsWith("\\\\");
	const isPosixAbsolute = normalizedPath.startsWith("/");
	if (!isWindowsAbsolute && !isPosixAbsolute) {
		return false;
	}
	const segments = normalizedPath
		.split(isWindowsAbsolute ? /[\\/]+/ : /\/+/)
		.filter(Boolean);
	const chatDirectory = segments.at(-1) ?? "";
	const workspacesDirectory = segments.at(-2) ?? "";
	const dataDirectory = segments.at(-3) ?? "";
	const configDirectory = segments.at(-4) ?? "";
	return (
		configDirectory === KERBEROSEC_CONFIG_DIRECTORY_NAME &&
		dataDirectory === KERBEROSEC_DATA_DIRECTORY_NAME &&
		workspacesDirectory === KERBEROSEC_WORKSPACES_DIRECTORY_NAME &&
		chatDirectory === KERBEROSEC_CHAT_WORKSPACE_DIRECTORY_NAME
	);
}
