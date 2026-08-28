// ---------------------------------------------------------------------------
// kerberosec auth - CLI flag and contract tests
//
// These tests cover the `kerberosec auth` subcommand behavior:
//   - Interactive auth screen navigation
//   - `kerberosec auth -p <provider> -k <apiKey> -m <modelId>` golden path
//   - Invalid provider / key / model error handling
//   - Partial-flag error handling (exit with failure)
//   - `kerberosec auth --help`
// ---------------------------------------------------------------------------

import { test } from "@microsoft/tui-test";
import {
	EXIT_CODE_FAIL,
	EXIT_CODE_SUCCESS,
	KERBEROSEC_BIN,
	TERMINAL_WIDE,
} from "../helpers/constants.js";
import { kerberosecEnv } from "../helpers/env.js";
import { waitForAuthScreen } from "../helpers/page-objects/auth.js";
import { expectExitCode, expectVisible } from "../helpers/terminal.js";

test.describe("kerberosec auth (interactive screen)", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["auth"] },
		...TERMINAL_WIDE,
		env: kerberosecEnv("unauthenticated"),
	});

	test("shows all auth options", async ({ terminal }) => {
		await waitForAuthScreen(terminal);
	});

	test("can navigate options with keyUp / keyDown", async ({ terminal }) => {
		await waitForAuthScreen(terminal);
		terminal.keyDown();
		terminal.keyUp();
		await expectVisible(terminal, "Sign in with KerberoSec");
	});
});

test.describe("kerberosec auth --help", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["auth", "--help"] },
		...TERMINAL_WIDE,
		env: kerberosecEnv("unauthenticated"),
	});

	test("shows auth help page", async ({ terminal }) => {
		await expectVisible(terminal, [
			"Usage:",
			"--provider",
			"--apikey",
			"--modelid",
			"--baseurl",
		]);
	});
});

// ---------------------------------------------------------------------------
// kerberosec auth with only partial flags -> exits with error
// ---------------------------------------------------------------------------
test.describe("kerberosec auth --provider only (partial flags)", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["auth", "--provider", "openai"] },
		...TERMINAL_WIDE,
		env: kerberosecEnv("unauthenticated"),
	});

	test("exits with failure", async ({ terminal }) => {
		await expectVisible(terminal, "error");
		await expectExitCode(terminal, EXIT_CODE_FAIL);
	});
});

test.describe("kerberosec auth --apikey only (partial flags)", () => {
	test.use({
		program: {
			file: KERBEROSEC_BIN,
			args: ["auth", "--apikey", "sk-test-key"],
		},
		...TERMINAL_WIDE,
		env: kerberosecEnv("unauthenticated"),
	});

	test("exits with error requiring --provider", async ({ terminal }) => {
		await expectVisible(terminal, "provider");
		await expectExitCode(terminal, EXIT_CODE_FAIL);
	});
});

test.describe("kerberosec auth --modelid only (partial flags)", () => {
	test.use({
		program: {
			file: KERBEROSEC_BIN,
			args: ["auth", "--modelid", "gpt-4o"],
		},
		...TERMINAL_WIDE,
		env: kerberosecEnv("unauthenticated"),
	});

	test("exits with error requiring --provider", async ({ terminal }) => {
		await expectVisible(terminal, "provider");
		await expectExitCode(terminal, EXIT_CODE_FAIL);
	});
});

test.describe("kerberosec auth --baseurl only (partial flags)", () => {
	test.use({
		program: {
			file: KERBEROSEC_BIN,
			args: ["auth", "--baseurl", "https://api.example.com"],
		},
		...TERMINAL_WIDE,
		env: kerberosecEnv("unauthenticated"),
	});

	test("exits with error requiring --provider", async ({ terminal }) => {
		await expectVisible(terminal, "provider");
		await expectExitCode(terminal, EXIT_CODE_FAIL);
	});
});

test.describe("kerberosec auth --verbose only", () => {
	test.use({
		program: {
			file: KERBEROSEC_BIN,
			args: ["auth", "--verbose"],
		},
		...TERMINAL_WIDE,
		env: kerberosecEnv("unauthenticated"),
	});

	test("accepts --verbose and shows interactive auth screen", async ({
		terminal,
	}) => {
		await waitForAuthScreen(terminal);
	});
});

test.describe("kerberosec auth --cwd", () => {
	test.use({
		program: {
			file: KERBEROSEC_BIN,
			args: ["auth", "--cwd", "/tmp"],
		},
		...TERMINAL_WIDE,
		env: kerberosecEnv("unauthenticated"),
	});

	test("accepts --cwd and shows interactive auth screen", async ({
		terminal,
	}) => {
		await waitForAuthScreen(terminal);
	});
});

test.describe("kerberosec auth --config", () => {
	test.use({
		program: {
			file: KERBEROSEC_BIN,
			args: ["auth", "--config", "configs/unauthenticated"],
		},
		...TERMINAL_WIDE,
		env: kerberosecEnv("unauthenticated"),
	});

	test("accepts --config and shows interactive auth screen", async ({
		terminal,
	}) => {
		await waitForAuthScreen(terminal);
	});
});

test.describe("kerberosec auth -p -k -m (golden path)", () => {
	test.use({
		program: {
			file: KERBEROSEC_BIN,
			args: [
				"auth",
				"--provider",
				"openai",
				"--apikey",
				"sk-test-key-12345",
				"--modelid",
				"gpt-4o",
			],
		},
		...TERMINAL_WIDE,
		env: kerberosecEnv("unauthenticated"),
	});

	test("exits successfully with valid provider, key, and model", async ({
		terminal,
	}) => {
		// Golden path: should not show interactive auth screen, should exit cleanly
		await expectExitCode(terminal, EXIT_CODE_SUCCESS);
	});
});

test.describe("kerberosec auth with invalid key (still exits 0)", () => {
	test.use({
		program: {
			file: KERBEROSEC_BIN,
			args: [
				"auth",
				"--provider",
				"openai",
				"--apikey",
				"invalid-key",
				"--modelid",
				"gpt-4o",
			],
		},
		...TERMINAL_WIDE,
		env: kerberosecEnv("unauthenticated"),
	});

	test("accepts invalid key without error at auth time", async ({
		terminal,
	}) => {
		await expectExitCode(terminal, EXIT_CODE_SUCCESS);
	});
});

test.describe("kerberosec auth -p -k -m -b (golden path with baseUrl)", () => {
	test.use({
		program: {
			file: KERBEROSEC_BIN,
			args: [
				"auth",
				"--provider",
				"openai-compatible",
				"--apikey",
				"sk-test-key-12345",
				"--modelid",
				"gpt-4o",
				"--baseurl",
				"https://api.example.com/v1",
			],
		},
		...TERMINAL_WIDE,
		env: kerberosecEnv("unauthenticated"),
	});

	test("exits successfully with baseUrl for OpenAI Compatible provider", async ({
		terminal,
	}) => {
		await expectExitCode(terminal, EXIT_CODE_SUCCESS);
	});
});

test.describe("kerberosec auth --baseurl with non-OpenAI-compatible provider", () => {
	test.use({
		program: {
			file: KERBEROSEC_BIN,
			args: [
				"auth",
				"--provider",
				"anthropic",
				"--apikey",
				"sk-ant-test",
				"--modelid",
				"claude-sonnet-4-20250514",
				"--baseurl",
				"https://api.example.com",
			],
		},
		...TERMINAL_WIDE,
		env: kerberosecEnv("unauthenticated"),
	});

	test("shows error for baseUrl with non-OpenAI provider", async ({
		terminal,
	}) => {
		await expectVisible(
			terminal,
			/only supported for openai|not supported|openai.compatible/i,
		);
	});
});

test.describe("kerberosec auth with invalid provider", () => {
	test.use({
		program: {
			file: KERBEROSEC_BIN,
			args: [
				"auth",
				"--provider",
				"not-a-real-provider",
				"--apikey",
				"sk-test",
				"--modelid",
				"gpt-4o",
			],
		},
		...TERMINAL_WIDE,
		env: kerberosecEnv("unauthenticated"),
	});

	test("shows invalid provider error", async ({ terminal }) => {
		await expectVisible(terminal, /invalid provider/i);
	});
});
