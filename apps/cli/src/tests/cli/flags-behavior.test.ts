// ---------------------------------------------------------------------------
// CLI flag behavioral tests
//
// These tests verify the runtime behavior of each CLI flag, not just that
// the flag appears in --help output (that's covered in tests/flags.test.ts),
// but that the flag actually changes what kerberosec does.
//
// Tests marked in the spec reflect known gaps where the flag is accepted
// but currently has no observable effect. They are still written so the
// behavior can be asserted once the implementation catches up.
// ---------------------------------------------------------------------------

import { test } from "@microsoft/tui-test";
import { KERBEROSEC_BIN, TERMINAL_WIDE } from "../helpers/constants.js";
import { kerberosecEnv } from "../helpers/env.js";
import { waitForChatReady } from "../helpers/page-objects/chat.js";
import { expectVisible } from "../helpers/terminal.js";

test.describe("kerberosec --model (interactive mode, flag ignored)", () => {
	test.use({
		program: {
			file: KERBEROSEC_BIN,
			args: ["--model", "openai/gpt-5.3-codex"],
		},
		...TERMINAL_WIDE,
		env: kerberosecEnv("default"),
	});

	test("starts interactive mode", async ({ terminal }) => {
		await waitForChatReady(terminal);
		await expectVisible(terminal, "GPT-5.3 Codex");
	});
});

test.describe("kerberosec --cwd <dir>", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["--cwd", "/tmp"] },
		...TERMINAL_WIDE,
		env: kerberosecEnv("default"),
	});

	test("starts interactive mode with --cwd flag", async ({ terminal }) => {
		await waitForChatReady(terminal);
		await expectVisible(terminal, "tmp");
	});
});

test.describe("kerberosec -c <dir> (short alias)", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["-c", "/tmp"] },
		...TERMINAL_WIDE,
		env: kerberosecEnv("default"),
	});

	test("starts interactive mode with -c flag", async ({ terminal }) => {
		await waitForChatReady(terminal);
		await expectVisible(terminal, "tmp");
	});
});

test.describe("kerberosec --config (claude-sonnet-4.6)", () => {
	test.use({
		program: {
			file: KERBEROSEC_BIN,
			args: ["--config", "configs/claude-sonnet-4.6"],
		},
		...TERMINAL_WIDE,
		env: kerberosecEnv("claude-sonnet-4.6"),
	});

	test("starts interactive mode with custom config directory", async ({
		terminal,
	}) => {
		await expectVisible(terminal, "Claude Sonnet 4.6");
	});
});

// ---------------------------------------------------------------------------
// kerberosec --json --yolo "prompt"
// Starts kerberosec in headless yolo mode with all output conforming to JSON
// ---------------------------------------------------------------------------
test.describe("kerberosec --json (headless yolo mode)", () => {
	test.use({
		program: {
			file: KERBEROSEC_BIN,
			args: ["--json", "--yolo", "tell me a joke"],
		},
		...TERMINAL_WIDE,
		env: kerberosecEnv("unauthenticated"),
	});

	test("starts in headless yolo mode with JSON output", async ({
		terminal,
	}) => {
		// Explicit yolo with --json should produce a JSON error line.
		await expectVisible(terminal, /Unauthorized|Missing API key/i);
	});
});
