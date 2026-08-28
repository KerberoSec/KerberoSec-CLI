import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { listUserInstructionConfigs } from "./user-instructions";

describe("listUserInstructionConfigs", () => {
	const tempRoots: string[] = [];
	const envSnapshot = {
		KERBEROSEC_GLOBAL_SETTINGS_PATH:
			process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH,
		KERBEROSEC_MCP_SETTINGS_PATH: process.env.KERBEROSEC_MCP_SETTINGS_PATH,
	};

	afterEach(async () => {
		if (envSnapshot.KERBEROSEC_GLOBAL_SETTINGS_PATH === undefined) {
			delete process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH;
		} else {
			process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH =
				envSnapshot.KERBEROSEC_GLOBAL_SETTINGS_PATH;
		}
		if (envSnapshot.KERBEROSEC_MCP_SETTINGS_PATH === undefined) {
			delete process.env.KERBEROSEC_MCP_SETTINGS_PATH;
		} else {
			process.env.KERBEROSEC_MCP_SETTINGS_PATH =
				envSnapshot.KERBEROSEC_MCP_SETTINGS_PATH;
		}
		await Promise.all(
			tempRoots.map((dir) => rm(dir, { recursive: true, force: true })),
		);
		tempRoots.length = 0;
	});

	it("uses the package name for package-backed plugin entries", async () => {
		const tempRoot = await mkdtemp(join(tmpdir(), "kerberosec-hub-config-"));
		tempRoots.push(tempRoot);
		process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH = join(
			tempRoot,
			"settings.json",
		);
		process.env.KERBEROSEC_MCP_SETTINGS_PATH = join(tempRoot, "mcp.json");
		const packageDir = join(
			tempRoot,
			".kerberosec",
			"plugins",
			"_installed",
			"git",
			"github.com",
			"demo",
			"package",
		);
		await mkdir(packageDir, { recursive: true });
		const pluginPath = join(packageDir, "index.ts");
		await writeFile(
			join(packageDir, "package.json"),
			JSON.stringify(
				{
					name: "kerberosec-sdk-portable-agents",
					kerberosec: {
						plugins: [{ paths: ["./index.ts"] }],
					},
				},
				null,
				2,
			),
		);
		await writeFile(pluginPath, "export default {};\n");

		const data = await listUserInstructionConfigs(tempRoot);
		const plugins = data.plugins as Array<{ name: string; path: string }>;
		const plugin = plugins.find((item) => item.path === pluginPath);

		expect(plugin?.name).toBe("kerberosec-sdk-portable-agents");
	});
});
