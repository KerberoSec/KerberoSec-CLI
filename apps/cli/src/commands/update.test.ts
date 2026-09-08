import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const { mockSpawn } = vi.hoisted(() => ({
	mockSpawn: vi.fn(),
}));

vi.mock("node:child_process", async (importOriginal) => {
	const actual = await importOriginal<typeof import("node:child_process")>();
	return {
		...actual,
		spawn: mockSpawn,
	};
});

import {
	checkForUpdates,
	getInstallationInfo,
	PackageManager,
	resolveCliHubOwnerContext,
	withMinimumReleaseAgeBypass,
} from "./update";

const originalArgv = [...process.argv];
const originalBuildEnv = process.env.KERBEROSEC_BUILD_ENV;
const originalDataDir = process.env.KERBEROSEC_DATA_DIR;
const originalHubDiscoveryPath = process.env.KERBEROSEC_HUB_DISCOVERY_PATH;
const originalWrapperPath = process.env.KERBEROSEC_WRAPPER_PATH;
const originalGlobalSettingsPath = process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH;
const originalIsDev = process.env.IS_DEV;
const originalNoAutoUpdate = process.env.KERBEROSEC_NO_AUTO_UPDATE;
const tempDirs: string[] = [];

function createFile(path: string): string {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, "");
	return path;
}

function createTempFile(pathSuffix: string): string {
	const root = mkdtempSync(join(tmpdir(), "kerberosec-update-test-"));
	tempDirs.push(root);
	return createFile(join(root, pathSuffix));
}

describe("getInstallationInfo", () => {
	afterEach(() => {
		process.argv = [...originalArgv];
		if (originalBuildEnv === undefined) {
			delete process.env.KERBEROSEC_BUILD_ENV;
		} else {
			process.env.KERBEROSEC_BUILD_ENV = originalBuildEnv;
		}
		if (originalDataDir === undefined) {
			delete process.env.KERBEROSEC_DATA_DIR;
		} else {
			process.env.KERBEROSEC_DATA_DIR = originalDataDir;
		}
		if (originalHubDiscoveryPath === undefined) {
			delete process.env.KERBEROSEC_HUB_DISCOVERY_PATH;
		} else {
			process.env.KERBEROSEC_HUB_DISCOVERY_PATH = originalHubDiscoveryPath;
		}
		if (originalWrapperPath === undefined) {
			delete process.env.KERBEROSEC_WRAPPER_PATH;
		} else {
			process.env.KERBEROSEC_WRAPPER_PATH = originalWrapperPath;
		}
		if (originalGlobalSettingsPath === undefined) {
			delete process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH;
		} else {
			process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH = originalGlobalSettingsPath;
		}
		if (originalIsDev === undefined) {
			delete process.env.IS_DEV;
		} else {
			process.env.IS_DEV = originalIsDev;
		}
		if (originalNoAutoUpdate === undefined) {
			delete process.env.KERBEROSEC_NO_AUTO_UPDATE;
		} else {
			process.env.KERBEROSEC_NO_AUTO_UPDATE = originalNoAutoUpdate;
		}
		vi.restoreAllMocks();
		for (const dir of tempDirs.splice(0)) {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it("detects npm installs from the wrapper path passed to the compiled binary", () => {
		const wrapperPath = createTempFile(
			"lib/node_modules/kerberosec/bin/kerberosec",
		);
		process.env.KERBEROSEC_WRAPPER_PATH = wrapperPath;
		process.argv = ["bun", "/$bunfs/root/kerberosec", "update", "--verbose"];

		expect(getInstallationInfo("1.2.3")).toEqual({
			packageManager: PackageManager.NPM,
			packageName: "kerberosec",
			updateCommand: "npm update -g kerberosec --tag latest",
		});
	});

	it("uses the nightly tag when the current CLI version is nightly", () => {
		const wrapperPath = createTempFile(
			"lib/node_modules/kerberosec/bin/kerberosec",
		);
		process.env.KERBEROSEC_WRAPPER_PATH = wrapperPath;
		process.argv = ["bun", "/$bunfs/root/kerberosec", "update", "--verbose"];

		expect(getInstallationInfo("1.2.3-nightly.456")).toEqual({
			packageManager: PackageManager.NPM,
			packageName: "kerberosec",
			updateCommand: "npm update -g kerberosec --tag nightly",
		});
	});

	it("detects bun global installs from the resolved install path", () => {
		// bun symlinks ~/.bun/bin/kerberosec -> ~/.bun/install/global/node_modules/...,
		// and realpathSync resolves through the symlink before detection runs.
		const wrapperPath = createTempFile(
			".bun/install/global/node_modules/kerberosec/bin/kerberosec",
		);
		process.env.KERBEROSEC_WRAPPER_PATH = wrapperPath;
		process.argv = ["bun", "/$bunfs/root/kerberosec", "update", "--verbose"];

		expect(getInstallationInfo("1.2.3")).toEqual({
			packageManager: PackageManager.BUN,
			packageName: "kerberosec",
			updateCommand: "bun add -g kerberosec@latest",
		});
	});

	it("falls back to unknown when only Bun's virtual compiled path is available", () => {
		delete process.env.KERBEROSEC_WRAPPER_PATH;
		process.argv = ["bun", "/$bunfs/root/kerberosec", "update", "--verbose"];

		expect(getInstallationInfo("1.2.3")).toEqual({
			packageManager: PackageManager.UNKNOWN,
			packageName: "kerberosec",
		});
	});
});

describe("auto update settings", () => {
	afterEach(() => {
		process.argv = [...originalArgv];
		if (originalBuildEnv === undefined) {
			delete process.env.KERBEROSEC_BUILD_ENV;
		} else {
			process.env.KERBEROSEC_BUILD_ENV = originalBuildEnv;
		}
		if (originalDataDir === undefined) {
			delete process.env.KERBEROSEC_DATA_DIR;
		} else {
			process.env.KERBEROSEC_DATA_DIR = originalDataDir;
		}
		if (originalHubDiscoveryPath === undefined) {
			delete process.env.KERBEROSEC_HUB_DISCOVERY_PATH;
		} else {
			process.env.KERBEROSEC_HUB_DISCOVERY_PATH = originalHubDiscoveryPath;
		}
		if (originalWrapperPath === undefined) {
			delete process.env.KERBEROSEC_WRAPPER_PATH;
		} else {
			process.env.KERBEROSEC_WRAPPER_PATH = originalWrapperPath;
		}
		if (originalGlobalSettingsPath === undefined) {
			delete process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH;
		} else {
			process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH = originalGlobalSettingsPath;
		}
		if (originalIsDev === undefined) {
			delete process.env.IS_DEV;
		} else {
			process.env.IS_DEV = originalIsDev;
		}
		if (originalNoAutoUpdate === undefined) {
			delete process.env.KERBEROSEC_NO_AUTO_UPDATE;
		} else {
			process.env.KERBEROSEC_NO_AUTO_UPDATE = originalNoAutoUpdate;
		}
		vi.restoreAllMocks();
		for (const dir of tempDirs.splice(0)) {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it("runs manual update checks", async () => {
		const settingsPath = createTempFile("data/global-settings.json");
		writeFileSync(settingsPath, JSON.stringify({ telemetryOptOut: false }));
		process.env.KERBEROSEC_GLOBAL_SETTINGS_PATH = settingsPath;
		delete process.env.KERBEROSEC_NO_AUTO_UPDATE;
		const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({ version: "0.0.0" }),
		} as Response);

		await checkForUpdates({ includeKanban: false });

		expect(fetchSpy).toHaveBeenCalled();
	});
});

describe("hub restart owner selection", () => {
	afterEach(() => {
		if (originalBuildEnv === undefined) {
			delete process.env.KERBEROSEC_BUILD_ENV;
		} else {
			process.env.KERBEROSEC_BUILD_ENV = originalBuildEnv;
		}
		if (originalDataDir === undefined) {
			delete process.env.KERBEROSEC_DATA_DIR;
		} else {
			process.env.KERBEROSEC_DATA_DIR = originalDataDir;
		}
		if (originalHubDiscoveryPath === undefined) {
			delete process.env.KERBEROSEC_HUB_DISCOVERY_PATH;
		} else {
			process.env.KERBEROSEC_HUB_DISCOVERY_PATH = originalHubDiscoveryPath;
		}
	});

	it("uses the shared hub owner outside production builds", () => {
		process.env.KERBEROSEC_BUILD_ENV = "development";
		process.env.KERBEROSEC_DATA_DIR = "/tmp/kerberosec-update-test-data";
		delete process.env.KERBEROSEC_HUB_DISCOVERY_PATH;

		const owner = resolveCliHubOwnerContext();

		expect(owner.discoveryPath).toContain("/locks/hub/owners/");
		expect(owner.discoveryPath).not.toBe(
			"/tmp/kerberosec-update-test-data/locks/hub/production.json",
		);
	});
});

describe("withMinimumReleaseAgeBypass", () => {
	it("adds the package-manager-specific cooldown bypass", () => {
		expect(
			withMinimumReleaseAgeBypass(
				"npm update -g kerberosec --tag latest",
				PackageManager.NPM,
			).command,
		).toBe("npm update -g kerberosec --tag latest --min-release-age=0");
		expect(
			withMinimumReleaseAgeBypass(
				"bun add -g kerberosec@latest",
				PackageManager.BUN,
			).command,
		).toBe("bun add -g kerberosec@latest --minimum-release-age=0");
		expect(
			withMinimumReleaseAgeBypass(
				"yarn global add kerberosec@latest",
				PackageManager.YARN,
			).command,
		).toBe("yarn global add kerberosec@latest");
		expect(
			withMinimumReleaseAgeBypass(
				"yarn global add kerberosec@latest",
				PackageManager.YARN,
			).env?.YARN_NPM_MINIMAL_AGE_GATE,
		).toBe("0");

		expect(
			withMinimumReleaseAgeBypass(
				"pnpm add -g kerberosec@latest",
				PackageManager.PNPM,
			).env?.pnpm_config_minimum_release_age,
		).toBe("0");
	});
});
