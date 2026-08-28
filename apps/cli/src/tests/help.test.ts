import { test } from "@microsoft/tui-test";
import { KERBEROSEC_BIN } from "./helpers/constants.js";
import { kerberosecEnv } from "./helpers/env.js";
import { expectVisible } from "./helpers/terminal.js";

const HELP_TERMINAL = { columns: 120, rows: 50 };

// ===========================================================================
// kerberosec --help  (root help)
// ===========================================================================
test.describe("kerberosec --help", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["--help"] },
		env: kerberosecEnv("claude-sonnet-4.6"),
		...HELP_TERMINAL,
	});

	test("shows Usage line and lists all subcommands", async ({ terminal }) => {
		await expectVisible(terminal, [
			"Usage:",
			"history|h",
			"auth [options]",
			"version",
			"update [options]",
			"hub ",
		]);
	});

	test("shows all root-level option flags", async ({ terminal }) => {
		await expectVisible(terminal, [
			"--plan",
			"--timeout",
			"--model",
			"--verbose",
			"--cwd",
			"--config",
			"--thinking",
			"--retries",
			"--json",
			"--acp",
			"--update",
		]);
	});
});

// ===========================================================================
// kerberosec -h  (short help flag)
// ===========================================================================
test.describe("kerberosec -h", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["-h"] },
		env: kerberosecEnv("claude-sonnet-4.6"),
		...HELP_TERMINAL,
	});

	test("shows Usage line with short flag", async ({ terminal }) => {
		await expectVisible(terminal, "Usage:");
	});
});

// ===========================================================================
// kerberosec history --help
// ===========================================================================
test.describe("kerberosec history --help", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["history", "--help"] },
		env: kerberosecEnv("claude-sonnet-4.6"),
		...HELP_TERMINAL,
	});

	test("shows history usage and all flags", async ({ terminal }) => {
		await expectVisible(terminal, ["Usage:", "--limit", "--page", "--config"]);
	});
});

// ===========================================================================
// kerberosec h --help  (history alias)
// ===========================================================================
test.describe("kerberosec h --help (history alias)", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["h", "--help"] },
		env: kerberosecEnv("claude-sonnet-4.6"),
		...HELP_TERMINAL,
	});

	test("shows history usage and flags via alias", async ({ terminal }) => {
		await expectVisible(terminal, ["Usage:", "--limit"]);
	});
});

// ===========================================================================
// kerberosec config --help
// ===========================================================================
test.describe("kerberosec config --help", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["config", "--help"] },
		env: kerberosecEnv("claude-sonnet-4.6"),
		...HELP_TERMINAL,
	});

	test("shows config usage and --config flag", async ({ terminal }) => {
		await expectVisible(terminal, ["Usage:", "--config"]);
	});
});

// ===========================================================================
// kerberosec auth --help
// ===========================================================================
test.describe("kerberosec auth --help", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["auth", "--help"] },
		env: kerberosecEnv("claude-sonnet-4.6"),
		...HELP_TERMINAL,
	});

	test("shows auth usage and all flags", async ({ terminal }) => {
		await expectVisible(terminal, [
			"Usage:",
			"--provider",
			"--apikey",
			"--modelid",
			"--baseurl",
			"--config",
		]);
	});
});

// ===========================================================================
// kerberosec version --help
// ===========================================================================
test.describe("kerberosec version --help", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["version", "--help"] },
		env: kerberosecEnv("claude-sonnet-4.6"),
		...HELP_TERMINAL,
	});

	test("shows version command usage", async ({ terminal }) => {
		await expectVisible(terminal, "Usage:");
	});
});

// ===========================================================================
// kerberosec update --help
// ===========================================================================
test.describe("kerberosec update --help", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["update", "--help"] },
		env: kerberosecEnv("claude-sonnet-4.6"),
		...HELP_TERMINAL,
	});

	test("shows update usage and --verbose flag", async ({ terminal }) => {
		await expectVisible(terminal, ["Usage:", "--verbose"]);
	});
});

// ===========================================================================
// kerberosec doctor --help
// ===========================================================================
test.describe("kerberosec doctor --help", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["doctor", "--help"] },
		env: kerberosecEnv("claude-sonnet-4.6"),
		...HELP_TERMINAL,
	});

	test("shows doctor usage and lists fix and log subcommands", async ({
		terminal,
	}) => {
		await expectVisible(terminal, ["Usage:", "fix", "log"]);
	});
});
