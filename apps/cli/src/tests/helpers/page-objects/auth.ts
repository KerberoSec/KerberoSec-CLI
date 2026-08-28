import type { Terminal } from "@microsoft/tui-test/lib/terminal/term";
import { expectVisible } from "../terminal.js";

export async function waitForAuthScreen(terminal: Terminal): Promise<void> {
	await expectVisible(terminal, [
		"Sign in with KerberoSec",
		"Sign in with ChatGPT",
		"Bring your own provider",
	]);
}
