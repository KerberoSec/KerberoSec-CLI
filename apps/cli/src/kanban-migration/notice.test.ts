import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
	getKerberoSecCliMigrationNotice,
	markKerberoSecCliMigrationNoticeShown,
	resolveCliNoticeStatePath,
	shouldSuppressKerberoSecCliMigrationNoticeForActiveProvider,
} from "./notice";

const tempDirs: string[] = [];

function createTempDataDir(): string {
	const dir = mkdtempSync(join(tmpdir(), "kerberosec-cli-notice-"));
	tempDirs.push(dir);
	return dir;
}

describe("migration notice", () => {
	afterEach(() => {
		for (const dir of tempDirs.splice(0)) {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it("returns the notice for a fresh data dir", () => {
		const dataDir = createTempDataDir();

		expect(getKerberoSecCliMigrationNotice(dataDir)?.title).toBe(
			"Connect with Developer",
		);
	});

	it("shows when only the old Kanban notice was marked as shown", () => {
		const dataDir = createTempDataDir();
		const noticePath = resolveCliNoticeStatePath(dataDir);
		mkdirSync(dirname(noticePath), { recursive: true, mode: 0o700 });
		writeFileSync(
			noticePath,
			`${JSON.stringify(
				{ shown: { "kerberosec-cli-tui-default": true } },
				null,
				2,
			)}\n`,
			"utf8",
		);

		expect(getKerberoSecCliMigrationNotice(dataDir)?.id).toBe(
			"kerberosec-cli-kerberosec-pass-intro",
		);
	});

	it("does not show after the notice is marked as shown", () => {
		const dataDir = createTempDataDir();

		markKerberoSecCliMigrationNoticeShown(dataDir);

		expect(getKerberoSecCliMigrationNotice(dataDir)).toBeUndefined();
	});

	it("shows after the notice is marked as shown when forced", () => {
		const dataDir = createTempDataDir();

		markKerberoSecCliMigrationNoticeShown(dataDir);

		expect(
			getKerberoSecCliMigrationNotice(dataDir, {
				KERBEROSEC_FORCE_KERBEROSEC_PASS_NOTICE: "1",
			}),
		).toBeDefined();
	});

	it("does not show when disabled through the environment", () => {
		const dataDir = createTempDataDir();

		expect(
			getKerberoSecCliMigrationNotice(dataDir, {
				KERBEROSEC_DISABLE_KERBEROSEC_PASS_NOTICE: "1",
			}),
		).toBeUndefined();
	});

	it("does not show when KerberoSecPass is already the active provider", () => {
		const dataDir = createTempDataDir();

		expect(
			getKerberoSecCliMigrationNotice(
				dataDir,
				{},
				{ activeProviderId: "kerberosec-pass" },
			),
		).toBeUndefined();
	});

	it("suppresses the active KerberoSecPass provider even when the provider id has surrounding whitespace", () => {
		expect(
			shouldSuppressKerberoSecCliMigrationNoticeForActiveProvider(
				" kerberosec-pass ",
			),
		).toBe(true);
	});

	it("does not suppress the active KerberoSecPass provider when forced", () => {
		expect(
			shouldSuppressKerberoSecCliMigrationNoticeForActiveProvider(
				"kerberosec-pass",
				{
					KERBEROSEC_FORCE_KERBEROSEC_PASS_NOTICE: "1",
				},
			),
		).toBe(false);
	});

	it("shows for the active KerberoSecPass provider when forced", () => {
		const dataDir = createTempDataDir();

		expect(
			getKerberoSecCliMigrationNotice(
				dataDir,
				{ KERBEROSEC_FORCE_KERBEROSEC_PASS_NOTICE: "1" },
				{ activeProviderId: "kerberosec-pass" },
			),
		).toBeDefined();
	});

	it("shows when forced even if disabled through the environment", () => {
		const dataDir = createTempDataDir();

		expect(
			getKerberoSecCliMigrationNotice(dataDir, {
				KERBEROSEC_DISABLE_KERBEROSEC_PASS_NOTICE: "1",
				KERBEROSEC_FORCE_KERBEROSEC_PASS_NOTICE: "1",
			}),
		).toBeDefined();
	});

	it("marks the notice as shown", () => {
		const dataDir = createTempDataDir();

		markKerberoSecCliMigrationNoticeShown(dataDir);

		const rawState = readFileSync(resolveCliNoticeStatePath(dataDir), "utf8");
		expect(rawState).toContain("kerberosec-cli-kerberosec-pass-intro");
		expect(getKerberoSecCliMigrationNotice(dataDir)).toBeUndefined();
	});
});
