import { chmodSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setHomeDir, setKerberoSecDir } from "@kerberosec/shared/storage";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readGlobalSettings, writeGlobalSettings } from "./global-settings";
import { uninstallPlugin } from "./plugin-uninstall";

describe("plugin uninstall service", () => {
	let root = "";
	let home = "";
	let originalHome: string | undefined;
	let originalKerberoSecDir: string | undefined;
	let originalKerberoSecDataDir: string | undefined;
	let originalGlobalSettingsPath: string | undefined;
	let originalMcpSettingsPath: string | undefined;

	beforeEach(() => {
		root = mkdtempSync(join(tmpdir(), "core-plugin-uninstall-"));
		home = join(root, "home");
		originalHome = process.env.HOME;
		originalKerberoSecDir = process.env.KERBEROSEC_DIR;
		originalKerberoSecDataDir = process.env.KERBEROSEC_DATA_DIR;
		originalGlobalSettingsPath = process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH;
		originalMcpSettingsPath = process.env.KERBEROSEC_MCP_SETTINGS_PATH;
		process.env.HOME = home;
		process.env.KERBEROSEC_DIR = join(home, ".kerberosec");
		process.env.KERBEROSEC_DATA_DIR = join(home, ".kerberosec", "data");
		process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH = join(
			home,
			".kerberosec",
			"data",
			"settings",
			"global-settings.json",
		);
		setHomeDir(home);
		setKerberoSecDir(process.env.KERBEROSEC_DIR);
	});

	afterEach(() => {
		if (originalHome === undefined) {
			delete process.env.HOME;
		} else {
			process.env.HOME = originalHome;
		}
		if (originalKerberoSecDir === undefined) {
			delete process.env.KERBEROSEC_DIR;
		} else {
			process.env.KERBEROSEC_DIR = originalKerberoSecDir;
		}
		if (originalKerberoSecDataDir === undefined) {
			delete process.env.KERBEROSEC_DATA_DIR;
		} else {
			process.env.KERBEROSEC_DATA_DIR = originalKerberoSecDataDir;
		}
		if (originalGlobalSettingsPath === undefined) {
			delete process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH;
		} else {
			process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH = originalGlobalSettingsPath;
		}
		if (originalMcpSettingsPath === undefined) {
			delete process.env.KERBEROSEC_MCP_SETTINGS_PATH;
		} else {
			process.env.KERBEROSEC_MCP_SETTINGS_PATH = originalMcpSettingsPath;
		}
		rmSync(root, { recursive: true, force: true });
	});

	it("uninstalls an installed package plugin by package name", async () => {
		const installPath = join(
			home,
			".kerberosec",
			"plugins",
			"_installed",
			"local",
			"bundled-skills-demo-123456789abc",
		);
		const entryPath = join(installPath, "package", "index.ts");
		await mkdir(join(installPath, "package"), { recursive: true });
		await writeFile(
			join(installPath, "package.json"),
			JSON.stringify(
				{
					name: "kerberosec-installed-plugin-test",
					kerberosec: {
						plugins: [{ paths: ["./package/index.ts"] }],
					},
				},
				null,
				2,
			),
			"utf8",
		);
		await writeFile(
			join(installPath, "package", "package.json"),
			JSON.stringify(
				{ name: "kerberosec-internal-bundled-skills-demo" },
				null,
				2,
			),
			"utf8",
		);
		await writeFile(
			entryPath,
			"export default { name: 'demo', manifest: { capabilities: ['skills'] } };",
			"utf8",
		);
		writeGlobalSettings({
			disabledPlugins: [entryPath, "/tmp/other-plugin.ts"],
		});

		const result = await uninstallPlugin({
			name: "kerberosec-internal-bundled-skills-demo",
		});

		expect(result.installPath).toBe(installPath);
		expect(existsSync(installPath)).toBe(false);
		expect(readGlobalSettings()).toEqual({
			autoUpdateEnabled: true,
			disabledPlugins: ["/tmp/other-plugin.ts"],
			telemetryOptOut: false,
		});
	});

	it("uninstalls a direct plugin file by path", async () => {
		const pluginPath = join(home, ".kerberosec", "plugins", "direct-plugin.ts");
		await mkdir(join(home, ".kerberosec", "plugins"), { recursive: true });
		await writeFile(
			pluginPath,
			"export default { name: 'direct', manifest: { capabilities: ['tools'] } };",
			"utf8",
		);

		const result = await uninstallPlugin({ path: pluginPath });

		expect(result.installPath).toBe(pluginPath);
		expect(existsSync(pluginPath)).toBe(false);
	});

	it.skipIf(process.platform === "win32")(
		"keeps plugin files when MCP settings cleanup fails",
		async () => {
			const pluginPath = join(home, ".kerberosec", "plugins", "mcp-plugin.ts");
			const settingsPath = join(root, "kerberosec_mcp_settings.json");
			process.env.KERBEROSEC_MCP_SETTINGS_PATH = settingsPath;
			await mkdir(join(home, ".kerberosec", "plugins"), { recursive: true });
			await writeFile(
				pluginPath,
				"export default { name: 'mcp-plugin', manifest: { capabilities: ['mcp'] } };",
				"utf8",
			);
			await writeFile(
				settingsPath,
				JSON.stringify(
					{
						mcpServers: {
							smoke: {
								transport: {
									type: "stdio",
									command: process.execPath,
									args: ["-e", "process.exit(0)"],
								},
								metadata: {
									source: "plugin",
									pluginName: "mcp-plugin",
									pluginPath,
								},
							},
						},
					},
					null,
					2,
				),
				"utf8",
			);
			chmodSync(settingsPath, 0o444);

			try {
				await expect(uninstallPlugin({ path: pluginPath })).rejects.toThrow();
			} finally {
				chmodSync(settingsPath, 0o644);
			}

			expect(existsSync(pluginPath)).toBe(true);
		},
	);

	// chmod-based deletion failure cannot be simulated on Windows, where read-only
	// directory permissions do not prevent removing files inside them.
	it.skipIf(process.platform === "win32")(
		"keeps disabled plugin settings if file deletion fails",
		async () => {
			const pluginRoot = join(home, ".kerberosec", "plugins");
			const pluginPath = join(pluginRoot, "locked-plugin.ts");
			await mkdir(pluginRoot, { recursive: true });
			await writeFile(
				pluginPath,
				"export default { name: 'locked', manifest: { capabilities: ['tools'] } };",
				"utf8",
			);
			writeGlobalSettings({ disabledPlugins: [pluginPath] });
			chmodSync(pluginRoot, 0o555);

			try {
				await expect(uninstallPlugin({ path: pluginPath })).rejects.toThrow();
				expect(existsSync(pluginPath)).toBe(true);
				expect(readGlobalSettings()).toEqual({
					autoUpdateEnabled: true,
					disabledPlugins: [pluginPath],
					telemetryOptOut: false,
				});
			} finally {
				chmodSync(pluginRoot, 0o755);
			}
		},
	);

	it("reports unmatched names clearly", async () => {
		await expect(uninstallPlugin({ name: "missing-plugin" })).rejects.toThrow(
			/No plugin found matching "missing-plugin"/,
		);
	});
});
