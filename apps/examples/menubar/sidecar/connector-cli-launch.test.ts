import {
	KERBEROSEC_CONNECTOR_CLI_LAUNCH_ENV,
	readConnectorCliLaunchSpec,
} from "@kerberosec/shared";
import { describe, expect, it } from "vitest";
import {
	configureMenubarConnectorCliLaunch,
	resolveMenubarConnectorCliLaunchSpec,
} from "./connector-cli-launch";

describe("menubar connector CLI launch", () => {
	it("uses the workspace CLI source when it is available", () => {
		expect(
			resolveMenubarConnectorCliLaunchSpec("/repo", {
				env: {},
				execPath: "/usr/local/bin/bun",
				exists: (path) => path === "/repo/apps/cli/src/index.ts",
			}),
		).toEqual({
			launcher: "/usr/local/bin/bun",
			connectArgsPrefix: [
				"--conditions=development",
				"/repo/apps/cli/src/index.ts",
				"connect",
			],
			cwd: "/repo",
		});
	});

	it("honors an explicit installed CLI path", () => {
		expect(
			resolveMenubarConnectorCliLaunchSpec("/workspace", {
				env: { KERBEROSEC_CLI_PATH: "/Applications/KerberoSec/bin/kerberosec" },
				exists: () => false,
			}),
		).toEqual({
			launcher: "/Applications/KerberoSec/bin/kerberosec",
			connectArgsPrefix: ["connect"],
			cwd: "/workspace",
		});
	});

	it("registers the launch specification for the detached daemon", () => {
		const env: NodeJS.ProcessEnv = {};
		configureMenubarConnectorCliLaunch(
			"/workspace",
			{ env: {}, exists: () => false },
			env,
		);

		expect(env[KERBEROSEC_CONNECTOR_CLI_LAUNCH_ENV]).toBeDefined();
		expect(readConnectorCliLaunchSpec(env)).toEqual({
			launcher: "kerberosec",
			connectArgsPrefix: ["connect"],
			cwd: "/workspace",
		});
	});
});
