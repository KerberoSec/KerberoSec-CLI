// ---------------------------------------------------------------------------
// Environment helpers for test setup.
//
// Usage:
//   test.use({ env: kerberosecEnv("default") });
//   test.use({ env: kerberosecEnv("claude-sonnet-4.6") });
//   test.use({ env: kerberosecEnv("/absolute/path/to/config") });
// ---------------------------------------------------------------------------

import { cpSync, mkdirSync, mkdtempSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const TEST_SUITE_ROOT = new URL("../", import.meta.url).pathname;

let envCounter = 0;

function createIsolatedKerberoSecDir(sourceDir: string): string {
	const tempRoot = mkdtempSync(path.join(os.tmpdir(), "kerberosec-tui-test-"));
	const targetDir = path.join(tempRoot, "kerberosec");
	cpSync(sourceDir, targetDir, {
		recursive: true,
		errorOnExist: false,
		force: true,
	});
	mkdirSync(path.join(targetDir, "home"), { recursive: true });
	return targetDir;
}

function nextHubPort(): string {
	envCounter += 1;
	const basePort = 30_000 + (process.pid % 10_000);
	return String(basePort + (envCounter % 10_000));
}

/**
 * Build the process environment for a kerberosec test.
 *
 * @param configDir - Named config under `configs/`, or an absolute path.
 * @param extra     - Additional env vars to merge in (override defaults).
 */
export function kerberosecEnv(
	configDir: string,
	extra: NodeJS.ProcessEnv = {},
): NodeJS.ProcessEnv {
	const kerberosecPath = path.isAbsolute(configDir)
		? configDir
		: path.join(TEST_SUITE_ROOT, "configs", configDir);
	const isolatedKerberoSecPath = createIsolatedKerberoSecDir(kerberosecPath);
	const dataDir = path.join(isolatedKerberoSecPath, "data");

	// Determine effective VCR mode: extra overrides > parent env > default "playback"
	const effectiveVcrMode =
		extra.KERBEROSEC_VCR ?? process.env.KERBEROSEC_VCR ?? "playback";

	// During recording, authenticated configs read real OAuth credentials from
	// ~/.kerberosec/data/settings/providers.json while keeping all other settings
	// (model, provider, global state) from the mock config directory.
	const isRecording = effectiveVcrMode === "record";
	const isAuthenticated = configDir !== "unauthenticated";
	const realProvidersFile =
		isRecording && isAuthenticated
			? path.join(
					os.homedir(),
					".kerberosec",
					"data",
					"settings",
					"providers.json",
				)
			: undefined;

	// Remove CI so terminal renderers treat the spawned process as interactive.
	// Remove VITEST so the spawned CLI binary doesn't skip initVcr().
	// cli/src/index.ts guards `initVcr` behind `process.env.VITEST !== "true"`,
	// so if the parent vitest process's VITEST=true leaks into the child, VCR
	// recording/playback is silently skipped.
	const { CI: _ci, VITEST: _vitest, ...cleanEnv } = process.env;
	if (!isAuthenticated) {
		delete cleanEnv.KERBEROSEC_API_KEY;
	}

	// Only enable VCR when a cassette path is provided (via extra or parent env),
	// otherwise tests without cassettes would trigger a spurious
	// "[VCR] No KERBEROSEC_VCR_CASSETTE" warning on every run.
	const hasCassette = !!(
		extra.KERBEROSEC_VCR_CASSETTE ?? process.env.KERBEROSEC_VCR_CASSETTE
	);
	const vcrDefaults = hasCassette
		? { KERBEROSEC_VCR: "playback", KERBEROSEC_VCR_FILTER: "" }
		: {};

	// the order of these env vars matter; later ones override earlier ones
	return {
		...vcrDefaults,
		...cleanEnv,
		...(realProvidersFile
			? { KERBEROSEC_PROVIDER_SETTINGS_PATH: realProvidersFile }
			: {}),
		KERBEROSEC_TELEMETRY_DISABLED: "1",
		HOME: path.join(isolatedKerberoSecPath, "home"),
		KERBEROSEC_DIR: isolatedKerberoSecPath,
		KERBEROSEC_DATA_DIR: dataDir,
		KERBEROSEC_DB_DATA_DIR: path.join(dataDir, "db"),
		KERBEROSEC_GLOBAL_SETTINGS_PATH: path.join(
			dataDir,
			"settings",
			"global-settings.json",
		),
		KERBEROSEC_HOOKS_LOG_PATH: path.join(dataDir, "logs", "hooks.jsonl"),
		KERBEROSEC_HUB_DISCOVERY_PATH: path.join(
			dataDir,
			"locks",
			"hub",
			"discovery.json",
		),
		KERBEROSEC_HUB_PORT: nextHubPort(),
		KERBEROSEC_MCP_SETTINGS_PATH: path.join(
			dataDir,
			"settings",
			"kerberosec_mcp_settings.json",
		),
		...(realProvidersFile
			? {}
			: {
					KERBEROSEC_PROVIDER_SETTINGS_PATH: path.join(
						dataDir,
						"settings",
						"providers.json",
					),
				}),
		KERBEROSEC_SESSION_DATA_DIR: path.join(dataDir, "sessions"),
		KERBEROSEC_TEAM_DATA_DIR: path.join(dataDir, "teams"),
		KERBEROSEC_DISABLE_KERBEROSEC_PASS_NOTICE: "1",
		NO_UPDATE_NOTIFIER: "1",
		KERBEROSEC_NO_AUTO_UPDATE: "1",
		...extra,
	};
}
