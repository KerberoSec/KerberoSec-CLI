// ---------------------------------------------------------------------------
// kerberosec config - CLI tests
//
// Covers:
//   - `kerberosec config --config <dir>` - shows config for specific directory
//   - `kerberosec config --help`         - help page
// ---------------------------------------------------------------------------

import { test } from "@microsoft/tui-test";
import { KERBEROSEC_BIN, TERMINAL_WIDE } from "../helpers/constants.js";
import { kerberosecEnv } from "../helpers/env.js";
import { expectVisible } from "../helpers/terminal.js";

test.describe("kerberosec config --help", () => {
	test.use({
		program: { file: KERBEROSEC_BIN, args: ["config", "--help"] },
		...TERMINAL_WIDE,
		env: kerberosecEnv("default"),
	});

	test("shows config help page", async ({ terminal }) => {
		await expectVisible(terminal, ["Usage:", "--config"]);
	});
});
