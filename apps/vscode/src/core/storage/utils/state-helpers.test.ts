import { afterEach, describe, expect, it, mock } from "bun:test"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { KerberoSecFileStorage } from "@shared/storage/KerberoSecFileStorage"

mock.module("../StateManager", () => ({ StateManager: {} }))

describe("readGlobalStateFromStorage terminal execution mode", () => {
	const temporaryDirectories: string[] = []

	afterEach(() => {
		for (const temporaryDirectory of temporaryDirectories.splice(0)) {
			fs.rmSync(temporaryDirectory, { force: true, recursive: true })
		}
	})

	async function readTerminalExecutionMode(storedValue?: "vscodeTerminal" | "backgroundExec") {
		const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "kerberosec-terminal-mode-"))
		temporaryDirectories.push(temporaryDirectory)
		const storage = new KerberoSecFileStorage(path.join(temporaryDirectory, "globalState.json"))
		if (storedValue !== undefined) {
			await storage.update("vscodeTerminalExecutionMode", storedValue)
		}

		const { readGlobalStateFromStorage } = await import("./state-helpers")
		const state = await readGlobalStateFromStorage(storage)
		return state.vscodeTerminalExecutionMode
	}

	it("uses the VS Code terminal when no preference is stored", async () => {
		expect(await readTerminalExecutionMode()).toBe("vscodeTerminal")
	})

	it.each(["vscodeTerminal", "backgroundExec"] as const)("preserves a stored %s preference", async (storedValue) => {
		expect(await readTerminalExecutionMode(storedValue)).toBe(storedValue)
	})
})
