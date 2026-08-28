import { existsSync } from "node:fs";
import { basename, join, normalize } from "node:path";
import process from "node:process";
import {
	type ConnectorCliLaunchSpec,
	setConnectorCliLaunchSpec,
} from "@kerberosec/shared";

const KERBEROSEC_CLI_PATH_ENV = "KERBEROSEC_CLI_PATH";

type MenubarConnectorCliLaunchOptions = {
	env?: NodeJS.ProcessEnv;
	execPath?: string;
	exists?: (path: string) => boolean;
};

export function resolveMenubarConnectorCliLaunchSpec(
	workspaceRoot: string,
	options: MenubarConnectorCliLaunchOptions = {},
): ConnectorCliLaunchSpec {
	const env = options.env ?? process.env;
	const explicitCliPath = env[KERBEROSEC_CLI_PATH_ENV]?.trim();
	if (explicitCliPath) {
		return {
			launcher: explicitCliPath,
			connectArgsPrefix: ["connect"],
			cwd: workspaceRoot,
		};
	}

	const exists = options.exists ?? existsSync;
	const sourcePath = [
		join(workspaceRoot, "apps/cli/src/index.ts"),
		join(workspaceRoot, "sdk/apps/cli/src/index.ts"),
	]
		.map(normalize)
		.find(exists);
	if (sourcePath) {
		const execPath = options.execPath ?? process.execPath;
		const launcher = basename(execPath).toLowerCase().includes("bun")
			? execPath
			: "bun";
		return {
			launcher,
			connectArgsPrefix: ["--conditions=development", sourcePath, "connect"],
			cwd: workspaceRoot,
		};
	}

	return {
		launcher: "kerberosec",
		connectArgsPrefix: ["connect"],
		cwd: workspaceRoot,
	};
}

export function configureMenubarConnectorCliLaunch(
	workspaceRoot: string,
	options: MenubarConnectorCliLaunchOptions = {},
	targetEnv: NodeJS.ProcessEnv = process.env,
): void {
	setConnectorCliLaunchSpec(
		resolveMenubarConnectorCliLaunchSpec(workspaceRoot, options),
		targetEnv,
	);
}
