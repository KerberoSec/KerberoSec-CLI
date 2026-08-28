import { test } from "@microsoft/tui-test";
import { KERBEROSEC_BIN } from "./helpers/constants.js";
import { kerberosecEnv } from "./helpers/env.js";
import { expectVisible } from "./helpers/terminal.js";

// ---------------------------------------------------------------------------
// kerberosec --version  (root flag)
// ---------------------------------------------------------------------------
test.describe("kerberosec --version", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["--version"] },
		env: kerberosecEnv("claude-sonnet-4.6"),
	});

	test("prints the version string", async ({ terminal }) => {
		await expectVisible(terminal, /\d+\.\d+\.\d+/g);
	});
});

// ---------------------------------------------------------------------------
// kerberosec -V  (short flag)
// ---------------------------------------------------------------------------
test.describe("kerberosec -V", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["-V"] },
		env: kerberosecEnv("claude-sonnet-4.6"),
	});

	test("prints the version string with short flag", async ({ terminal }) => {
		await expectVisible(terminal, /\d+\.\d+\.\d+/g);
	});
});

// ---------------------------------------------------------------------------
// kerberosec version  (subcommand)
// ---------------------------------------------------------------------------
test.describe("kerberosec version subcommand", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["version"] },
		env: kerberosecEnv("claude-sonnet-4.6"),
	});

	test("prints 'KerberoSec CLI version:' message", async ({ terminal }) => {
		await expectVisible(terminal, /\d+\.\d+\.\d+/g);
	});
});
