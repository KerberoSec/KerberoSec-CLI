import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
	AGENT_CONFIG_DIRECTORY_NAME,
	discoverPluginModulePaths,
	getPluginDisplayName,
	HOOKS_CONFIG_DIRECTORY_NAME,
	isAgentPluginDirectory,
	isChatWorkspacePath,
	KERBEROSEC_CHAT_WORKSPACE_DIRECTORY_NAME,
	KERBEROSEC_CONNECTOR_SETTINGS_FILE_NAME,
	KERBEROSEC_MCP_SETTINGS_FILE_NAME,
	KERBEROSEC_WORKSPACES_DIRECTORY_NAME,
	RULES_CONFIG_DIRECTORY_NAME,
	resolveAgentsConfigDirPath,
	resolveChatWorkspacePath,
	resolveConfiguredPluginModulePaths,
	resolveConnectorDataDir,
	resolveConnectorSettingsPath,
	resolveDbDataDir,
	resolveGlobalAgentsRulesPath,
	resolveGlobalSettingsPath,
	resolveHooksConfigSearchPaths,
	resolveKerberoSecDataDir,
	resolveMcpSettingsPath,
	resolvePluginModuleEntries,
	resolveProviderSettingsPath,
	resolveRulesConfigSearchPaths,
	resolveSessionDataDir,
	resolveTeamDataDir,
	resolveWorkflowsConfigSearchPaths,
} from "./paths";

type EnvSnapshot = {
	KERBEROSEC_DIR: string | undefined;
	KERBEROSEC_DATA_DIR: string | undefined;
	KERBEROSEC_CONNECTOR_DATA_DIR: string | undefined;
	KERBEROSEC_CONNECTOR_SETTINGS_PATH: string | undefined;
	KERBEROSEC_DB_DATA_DIR: string | undefined;
	KERBEROSEC_GLOBAL_SETTINGS_PATH: string | undefined;
	KERBEROSEC_MCP_SETTINGS_PATH: string | undefined;
	KERBEROSEC_PROVIDER_SETTINGS_PATH: string | undefined;
	KERBEROSEC_SESSION_DATA_DIR: string | undefined;
	KERBEROSEC_TEAM_DATA_DIR: string | undefined;
};

function captureEnv(): EnvSnapshot {
	return {
		KERBEROSEC_DIR: process.env.KERBEROSEC_DIR,
		KERBEROSEC_DATA_DIR: process.env.KERBEROSEC_DATA_DIR,
		KERBEROSEC_CONNECTOR_DATA_DIR: process.env.KERBEROSEC_CONNECTOR_DATA_DIR,
		KERBEROSEC_CONNECTOR_SETTINGS_PATH:
			process.env.KERBEROSEC_CONNECTOR_SETTINGS_PATH,
		KERBEROSEC_DB_DATA_DIR: process.env.KERBEROSEC_DB_DATA_DIR,
		KERBEROSEC_GLOBAL_SETTINGS_PATH:
			process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH,
		KERBEROSEC_MCP_SETTINGS_PATH: process.env.KERBEROSEC_MCP_SETTINGS_PATH,
		KERBEROSEC_PROVIDER_SETTINGS_PATH:
			process.env.KERBEROSEC_PROVIDER_SETTINGS_PATH,
		KERBEROSEC_SESSION_DATA_DIR: process.env.KERBEROSEC_SESSION_DATA_DIR,
		KERBEROSEC_TEAM_DATA_DIR: process.env.KERBEROSEC_TEAM_DATA_DIR,
	};
}

function restoreEnv(snapshot: EnvSnapshot): void {
	process.env.KERBEROSEC_DATA_DIR = snapshot.KERBEROSEC_DATA_DIR;
	process.env.KERBEROSEC_CONNECTOR_DATA_DIR =
		snapshot.KERBEROSEC_CONNECTOR_DATA_DIR;
	process.env.KERBEROSEC_CONNECTOR_SETTINGS_PATH =
		snapshot.KERBEROSEC_CONNECTOR_SETTINGS_PATH;
	process.env.KERBEROSEC_DIR = snapshot.KERBEROSEC_DIR;
	process.env.KERBEROSEC_DB_DATA_DIR = snapshot.KERBEROSEC_DB_DATA_DIR;
	process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH =
		snapshot.KERBEROSEC_GLOBAL_SETTINGS_PATH;
	process.env.KERBEROSEC_MCP_SETTINGS_PATH =
		snapshot.KERBEROSEC_MCP_SETTINGS_PATH;
	process.env.KERBEROSEC_PROVIDER_SETTINGS_PATH =
		snapshot.KERBEROSEC_PROVIDER_SETTINGS_PATH;
	process.env.KERBEROSEC_SESSION_DATA_DIR =
		snapshot.KERBEROSEC_SESSION_DATA_DIR;
	process.env.KERBEROSEC_TEAM_DATA_DIR = snapshot.KERBEROSEC_TEAM_DATA_DIR;
}

describe("storage path resolution", () => {
	let snapshot: EnvSnapshot = captureEnv();

	afterEach(() => {
		restoreEnv(snapshot);
	});

	it("uses KERBEROSEC_DATA_DIR as-is when set", () => {
		snapshot = captureEnv();
		process.env.KERBEROSEC_DATA_DIR = "/tmp/kerberosec-data";

		expect(resolveKerberoSecDataDir()).toBe("/tmp/kerberosec-data");
	});

	it("falls back to KERBEROSEC_DATA_DIR/sessions for session storage", () => {
		snapshot = captureEnv();
		delete process.env.KERBEROSEC_SESSION_DATA_DIR;
		process.env.KERBEROSEC_DATA_DIR = "/tmp/kerberosec-data";

		expect(resolveSessionDataDir()).toBe(
			join("/tmp/kerberosec-data", "sessions"),
		);
	});

	it("falls back to KERBEROSEC_DATA_DIR/teams for team storage", () => {
		snapshot = captureEnv();
		delete process.env.KERBEROSEC_TEAM_DATA_DIR;
		process.env.KERBEROSEC_DATA_DIR = "/tmp/kerberosec-data";

		expect(resolveTeamDataDir()).toBe(join("/tmp/kerberosec-data", "teams"));
	});

	it("falls back to KERBEROSEC_DATA_DIR/connectors for connector storage", () => {
		snapshot = captureEnv();
		delete process.env.KERBEROSEC_CONNECTOR_DATA_DIR;
		process.env.KERBEROSEC_DATA_DIR = "/tmp/kerberosec-data";

		expect(resolveConnectorDataDir()).toBe(
			join("/tmp/kerberosec-data", "connectors"),
		);
	});

	it("falls back to KERBEROSEC_DATA_DIR/connectors/settings.json for connector settings", () => {
		snapshot = captureEnv();
		delete process.env.KERBEROSEC_CONNECTOR_DATA_DIR;
		delete process.env.KERBEROSEC_CONNECTOR_SETTINGS_PATH;
		process.env.KERBEROSEC_DATA_DIR = "/tmp/kerberosec-data";

		expect(resolveConnectorSettingsPath()).toBe(
			join(
				"/tmp/kerberosec-data",
				"connectors",
				KERBEROSEC_CONNECTOR_SETTINGS_FILE_NAME,
			),
		);
	});

	it("uses KERBEROSEC_CONNECTOR_SETTINGS_PATH as-is when set", () => {
		snapshot = captureEnv();
		process.env.KERBEROSEC_CONNECTOR_SETTINGS_PATH =
			"/tmp/kerberosec-connectors/custom-settings.json";

		expect(resolveConnectorSettingsPath()).toBe(
			"/tmp/kerberosec-connectors/custom-settings.json",
		);
	});

	it("falls back to KERBEROSEC_DATA_DIR/db for sqlite storage", () => {
		snapshot = captureEnv();
		delete process.env.KERBEROSEC_DB_DATA_DIR;
		process.env.KERBEROSEC_DATA_DIR = "/tmp/kerberosec-data";

		expect(resolveDbDataDir()).toBe(join("/tmp/kerberosec-data", "db"));
	});

	it("falls back to KERBEROSEC_DATA_DIR/settings/providers.json for provider settings", () => {
		snapshot = captureEnv();
		delete process.env.KERBEROSEC_PROVIDER_SETTINGS_PATH;
		process.env.KERBEROSEC_DATA_DIR = "/tmp/kerberosec-data";

		expect(resolveProviderSettingsPath()).toBe(
			join("/tmp/kerberosec-data", "settings", "providers.json"),
		);
	});

	it("falls back to KERBEROSEC_DATA_DIR/settings/global-settings.json for global settings", () => {
		snapshot = captureEnv();
		delete process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH;
		process.env.KERBEROSEC_DATA_DIR = "/tmp/kerberosec-data";

		expect(resolveGlobalSettingsPath()).toBe(
			join("/tmp/kerberosec-data", "settings", "global-settings.json"),
		);
	});

	it("falls back to KERBEROSEC_DATA_DIR/settings/kerberosec_mcp_settings.json for MCP settings", () => {
		snapshot = captureEnv();
		delete process.env.KERBEROSEC_MCP_SETTINGS_PATH;
		process.env.KERBEROSEC_DATA_DIR = "/tmp/kerberosec-data";

		expect(resolveMcpSettingsPath()).toBe(
			join(
				"/tmp/kerberosec-data",
				"settings",
				KERBEROSEC_MCP_SETTINGS_FILE_NAME,
			),
		);
	});

	it("falls back to ~/.kerberosec/.agents for agent configs", () => {
		snapshot = captureEnv();
		process.env.KERBEROSEC_DIR = "/tmp/home/.kerberosec";

		expect(resolveAgentsConfigDirPath()).toBe(
			join("/tmp/home", ".kerberosec", AGENT_CONFIG_DIRECTORY_NAME),
		);
	});

	it("resolves global hooks from ~/.kerberosec", () => {
		snapshot = captureEnv();
		process.env.KERBEROSEC_DIR = "/tmp/home/.kerberosec";
		process.env.KERBEROSEC_DATA_DIR = "/tmp/home/.kerberosec/data";

		expect(resolveHooksConfigSearchPaths()).toEqual(
			expect.arrayContaining([
				join("/tmp/home", ".kerberosec", HOOKS_CONFIG_DIRECTORY_NAME),
			]),
		);
		expect(resolveHooksConfigSearchPaths()).not.toContain(
			join("/tmp/home", ".kerberosec", "data", HOOKS_CONFIG_DIRECTORY_NAME),
		);
	});

	it("resolves global rules from ~/.kerberosec", () => {
		snapshot = captureEnv();
		process.env.KERBEROSEC_DIR = "/tmp/home/.kerberosec";
		process.env.KERBEROSEC_DATA_DIR = "/tmp/home/.kerberosec/data";

		expect(resolveRulesConfigSearchPaths()).toEqual(
			expect.arrayContaining([
				resolveGlobalAgentsRulesPath(),
				join("/tmp/home", ".kerberosec", RULES_CONFIG_DIRECTORY_NAME),
				// xdg-user-dir's unconfigured Documents fallback (kerberosec/kerberosec#13542)
				join(
					dirname(dirname(resolveGlobalAgentsRulesPath())),
					"KerberoSec",
					"Rules",
				),
			]),
		);
		expect(resolveRulesConfigSearchPaths()).not.toContain(
			join("/tmp/home", ".kerberosec", "data", RULES_CONFIG_DIRECTORY_NAME),
		);
	});

	it("resolves legacy and new workflow paths, with .kerberosec paths later for duplicate-name precedence", () => {
		snapshot = captureEnv();
		process.env.KERBEROSEC_DIR = "/tmp/home/.kerberosec";
		const workspacePath = "/repo/demo";

		const paths = resolveWorkflowsConfigSearchPaths(workspacePath);

		expect(paths).toEqual([
			join(workspacePath, ".kerberosecrules", "workflows"),
			expect.stringContaining(join("Documents", "KerberoSec", "Workflows")),
			join("/tmp/home", ".kerberosec", "workflows"),
			join(workspacePath, ".kerberosec", "workflows"),
		]);
	});
});

describe("chat workspace paths", () => {
	let snapshot: EnvSnapshot = captureEnv();

	afterEach(() => {
		restoreEnv(snapshot);
	});

	it("exports the canonical path segments", () => {
		expect(KERBEROSEC_WORKSPACES_DIRECTORY_NAME).toBe("workspaces");
		expect(KERBEROSEC_CHAT_WORKSPACE_DIRECTORY_NAME).toBe("chat");
	});

	it("resolves the shared chat workspace under the kerberosec data dir", () => {
		snapshot = captureEnv();
		delete process.env.KERBEROSEC_DATA_DIR;
		process.env.KERBEROSEC_DIR = "/tmp/home/.kerberosec";

		expect(resolveChatWorkspacePath()).toBe(
			join("/tmp/home/.kerberosec", "data", "workspaces", "chat"),
		);
	});

	it("honors the KERBEROSEC_DATA_DIR override", () => {
		snapshot = captureEnv();
		process.env.KERBEROSEC_DATA_DIR = "/tmp/kerberosec-data";

		expect(resolveChatWorkspacePath()).toBe(
			join("/tmp/kerberosec-data", "workspaces", "chat"),
		);
	});

	it.each([
		"/home/user/.kerberosec/data/workspaces/chat",
		"//home//user//.kerberosec//data//workspaces//chat//",
		"C:\\Users\\dev\\.kerberosec\\data\\workspaces\\chat\\",
		"\\\\server\\share\\.kerberosec\\data\\workspaces\\chat",
	])("recognizes chat workspace root %s", (path) => {
		expect(isChatWorkspacePath(path)).toBe(true);
	});

	it.each([
		".kerberosec/data/workspaces/chat",
		"/tmp/chat",
		"/tmp/kerberosec/sessions/session-a1b2c3-temp/project",
		"/home/user/kerberosec/data/workspaces/chat",
		"/home/user/.kerberosec/workspaces/chat",
		"/home/user/.kerberosec/data/other/chat",
		"/home/user/.kerberosec/data/workspaces/Chat",
		"/home/user/.kerberosec/data/workspaces/chat/my-app",
		"/home/user/.kerberosec/data/workspaces",
	])("rejects non-chat workspace path %s", (path) => {
		expect(isChatWorkspacePath(path)).toBe(false);
	});
});

describe("getPluginDisplayName", () => {
	const tempRoots: string[] = [];

	function createTempRoot(): string {
		const root = mkdtempSync(join(tmpdir(), "kerberosec-plugin-name-"));
		tempRoots.push(root);
		return root;
	}

	afterEach(() => {
		for (const root of tempRoots.splice(0)) {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("uses the package name for package-backed installed plugin entries", () => {
		const root = createTempRoot();
		const packageDir = join(
			root,
			"_installed",
			"local",
			"agents-squad-057fda0dd505",
			"package",
		);
		mkdirSync(packageDir, { recursive: true });
		writeFileSync(
			join(packageDir, "package.json"),
			JSON.stringify({ name: "kerberosec-agents-squad-plugin" }),
		);
		const entryPath = join(packageDir, "index.ts");
		writeFileSync(entryPath, "export default {};");

		expect(getPluginDisplayName(entryPath, root)).toBe(
			"kerberosec-agents-squad-plugin",
		);
	});

	it("finds the package name in an ancestor directory within the search root", () => {
		const root = createTempRoot();
		const packageDir = join(root, "my-plugin");
		const srcDir = join(packageDir, "src");
		mkdirSync(srcDir, { recursive: true });
		writeFileSync(
			join(packageDir, "package.json"),
			JSON.stringify({ name: "my-plugin" }),
		);
		const entryPath = join(srcDir, "index.ts");
		writeFileSync(entryPath, "export default {};");

		expect(getPluginDisplayName(entryPath, root)).toBe("my-plugin");
	});

	it("falls back to the file basename when package.json has no usable name", () => {
		const root = createTempRoot();
		const packageDir = join(root, "unnamed", "package");
		mkdirSync(packageDir, { recursive: true });
		writeFileSync(join(packageDir, "package.json"), JSON.stringify({}));
		const entryPath = join(packageDir, "index.ts");
		writeFileSync(entryPath, "export default {};");

		expect(getPluginDisplayName(entryPath, root)).toBe("index");
	});

	it("falls back to the file basename for bare plugin modules", () => {
		const root = createTempRoot();
		const entryPath = join(root, "x-poster.js");
		writeFileSync(entryPath, "module.exports = {};");

		expect(getPluginDisplayName(entryPath, root)).toBe("x-poster");
	});

	it("does not read package.json files above the search root", () => {
		const outer = createTempRoot();
		writeFileSync(
			join(outer, "package.json"),
			JSON.stringify({ name: "outer-package" }),
		);
		const root = join(outer, "plugins");
		mkdirSync(root, { recursive: true });
		const entryPath = join(root, "index.ts");
		writeFileSync(entryPath, "export default {};");

		expect(getPluginDisplayName(entryPath, root)).toBe("index");
	});
});

describe("KerberoSec plugin discovery boundary", () => {
	const tempRoots: string[] = [];

	function createTempRoot(): string {
		const root = mkdtempSync(join(tmpdir(), "kerberosec-plugin-boundary-"));
		tempRoots.push(root);
		return root;
	}

	function writeFile(path: string, contents: string): string {
		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(path, contents);
		return path;
	}

	/**
	 * A minimal conformant Agent Plugin: a skill with an executable script, a
	 * second vendor's extension directory, and a vendored dependency. None of it
	 * is a KerberoSec plugin module.
	 */
	function writeAgentPlugin(pluginRoot: string): void {
		writeFile(
			join(pluginRoot, "plugin.json"),
			JSON.stringify({
				$schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
				name: "summarizer",
			}),
		);
		writeFile(
			join(pluginRoot, "mcp.json"),
			JSON.stringify({
				$schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
				mcpServers: {},
			}),
		);
		writeFile(
			join(pluginRoot, "skills", "summarize", "SKILL.md"),
			"---\nname: summarize\n---\n",
		);
		writeFile(
			join(pluginRoot, "skills", "summarize", "scripts", "fetch.js"),
			"throw new Error('skill script must never be imported');",
		);
		writeFile(
			join(pluginRoot, "skills", "summarize", "scripts", "build.ts"),
			"export const helper = 1;",
		);
		writeFile(
			join(pluginRoot, "com.example.client", "setup.js"),
			"throw new Error('another vendor namespace must never be imported');",
		);
		writeFile(
			join(pluginRoot, "node_modules", "left-pad", "package.json"),
			JSON.stringify({ name: "left-pad", main: "index.js" }),
		);
		writeFile(
			join(pluginRoot, "node_modules", "left-pad", "index.js"),
			"module.exports = () => {};",
		);
	}

	afterEach(() => {
		for (const root of tempRoots.splice(0)) {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("claims nothing from an Agent Plugin dropped into a KerberoSec plugin root", () => {
		const root = createTempRoot();
		writeAgentPlugin(join(root, "summarizer"));

		expect(discoverPluginModulePaths(root)).toEqual([]);
	});

	it("claims nothing when the scan root is itself an Agent Plugin", () => {
		const root = createTempRoot();
		writeAgentPlugin(root);

		expect(discoverPluginModulePaths(root)).toEqual([]);
	});

	it("never descends into node_modules", () => {
		const root = createTempRoot();
		const entryPath = writeFile(
			join(root, "my-plugin", "index.ts"),
			"export default {};",
		);
		writeFile(
			join(root, "my-plugin", "node_modules", "dep", "index.js"),
			"module.exports = {};",
		);

		expect(discoverPluginModulePaths(root)).toEqual([entryPath]);
	});

	it("never descends into dot directories", () => {
		const root = createTempRoot();
		const entryPath = writeFile(join(root, "plugin.ts"), "export default {};");
		writeFile(
			join(root, ".git", "hooks", "pre-commit.js"),
			"module.exports={};",
		);

		expect(discoverPluginModulePaths(root)).toEqual([entryPath]);
	});

	it("still discovers bare KerberoSec plugin modules", () => {
		const root = createTempRoot();
		const first = writeFile(join(root, "alpha.ts"), "export default {};");
		const second = writeFile(
			join(root, "nested", "beta.js"),
			"export default {};",
		);

		expect(discoverPluginModulePaths(root)).toEqual([first, second]);
	});

	it("still honors package.json-declared KerberoSec plugin entries", () => {
		const root = createTempRoot();
		const packageDir = join(root, "declared");
		writeFile(
			join(packageDir, "package.json"),
			JSON.stringify({ kerberosec: { plugins: [{ paths: ["entry.ts"] }] } }),
		);
		const entryPath = writeFile(
			join(packageDir, "entry.ts"),
			"export default {};",
		);
		writeFile(join(packageDir, "helper.ts"), "export const helper = 1;");

		expect(discoverPluginModulePaths(root)).toEqual([entryPath]);
	});

	it("resolves no module entries for an Agent Plugin directory", () => {
		const root = createTempRoot();
		writeAgentPlugin(root);
		// An index.ts at the root would otherwise be claimed as the KerberoSec plugin
		// entry point, so this asserts the manifest wins over the index fallback.
		writeFile(join(root, "index.ts"), "export default {};");

		expect(resolvePluginModuleEntries(root)).toBeNull();
	});

	it("resolves no modules for an explicitly configured Agent Plugin path", () => {
		const root = createTempRoot();
		writeAgentPlugin(join(root, "summarizer"));

		expect(resolveConfiguredPluginModulePaths(["summarizer"], root)).toEqual(
			[],
		);
	});

	it("detects an Agent Plugin manifest only when it is a regular file", () => {
		const root = createTempRoot();
		expect(isAgentPluginDirectory(root)).toBe(false);

		mkdirSync(join(root, "plugin.json"), { recursive: true });
		expect(isAgentPluginDirectory(root)).toBe(false);

		rmSync(join(root, "plugin.json"), { recursive: true, force: true });
		writeFileSync(join(root, "plugin.json"), "{}");
		expect(isAgentPluginDirectory(root)).toBe(true);
	});
});
