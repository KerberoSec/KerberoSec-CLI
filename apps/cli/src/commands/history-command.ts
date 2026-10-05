import type { Command } from "commander";
import type { TuiStartupTarget } from "../tui/types";
import type { CliOutputMode } from "../utils/types";

type HistoryCommandIo = {
	writeln: (text?: string) => void;
	writeErr: (text: string) => void;
};

type RegisterHistoryCommandOptions = {
	program: Command;
	io: HistoryCommandIo;
	setExitCode: (code: number) => void;
	setStartupTarget: (target: TuiStartupTarget) => void;
	isInteractiveTTY?: () => boolean;
};

function resolveHistoryOutputMode(
	program: Command,
	historyCmd: Command,
): CliOutputMode {
	return program.opts().json || historyCmd.opts().json ? "json" : "text";
}

function parsePositiveInteger(value: unknown): number | undefined {
	if (typeof value !== "string" || !/^\d+$/.test(value.trim())) {
		return undefined;
	}
	const parsed = Number(value);
	return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function registerHistoryCommand({
	program,
	io,
	setExitCode,
	setStartupTarget,
	isInteractiveTTY = () =>
		process.stdin.isTTY === true && process.stdout.isTTY === true,
}: RegisterHistoryCommandOptions): void {
	const historyCmd = program
		.command("history")
		.alias("h")
		.description("List session history or manage saved sessions")
		.option("--json", "Output as JSON")
		.option("--limit <count>", "Maximum number of sessions to show", "50")
		.option("--page <number>", "Page number for paginated results")
		.option("--config <dir>", "configuration directory")
		.action(async () => {
			const opts = historyCmd.opts();
			const limit = parsePositiveInteger(opts.limit);
			if (limit === undefined) {
				io.writeErr("--limit must be a positive whole number");
				setExitCode(1);
				return;
			}
			const page =
				opts.page === undefined ? 1 : parsePositiveInteger(opts.page);
			if (page === undefined) {
				io.writeErr("--page must be a positive whole number");
				setExitCode(1);
				return;
			}
			if (!Number.isSafeInteger(limit * page)) {
				io.writeErr("--page and --limit are too large");
				setExitCode(1);
				return;
			}
			const outputMode = resolveHistoryOutputMode(program, historyCmd);
			if (
				outputMode === "text" &&
				isInteractiveTTY() &&
				opts.page === undefined
			) {
				setStartupTarget("history");
				return;
			}
			const { runHistoryList } = await import("./history");
			setExitCode(
				await runHistoryList({
					limit,
					...(opts.page === undefined ? {} : { page }),
					outputMode,
					io,
				}),
			);
		});

	const historyDeleteCmd = historyCmd
		.command("delete")
		.description("Delete a session from history")
		.option("--session-id <id>", "Session ID to delete")
		.action(async () => {
			const opts = historyDeleteCmd.opts();
			if (!opts.sessionId) {
				io.writeErr("history delete requires --session-id <id>");
				setExitCode(1);
				return;
			}
			const outputMode = resolveHistoryOutputMode(program, historyCmd);
			const { runHistoryDelete } = await import("./history");
			setExitCode(await runHistoryDelete(opts.sessionId, outputMode, io));
		});

	const historyUpdateCmd = historyCmd
		.command("update")
		.description("Update a session in history")
		.option("--metadata <json>", "Metadata as JSON string")
		.option("--prompt <text>", "New prompt text")
		.option("--session-id <id>", "Session ID to update")
		.option("--title <text>", "New title")
		.action(async () => {
			const opts = historyUpdateCmd.opts();
			if (!opts.sessionId) {
				io.writeErr("history update requires --session-id <id>");
				setExitCode(1);
				return;
			}
			const outputMode = resolveHistoryOutputMode(program, historyCmd);
			const { runHistoryUpdate } = await import("./history");
			setExitCode(
				await runHistoryUpdate(
					opts.sessionId,
					opts.prompt,
					opts.title,
					opts.metadata,
					outputMode,
					io,
				),
			);
		});

	const historyExportCmd = historyCmd
		.command("export <sessionId>")
		.description("Export a session as a standalone HTML file")
		.option("-o, --output <path>", "Output HTML file path")
		.action(async (sessionId: string) => {
			const opts = historyExportCmd.opts();
			const outputMode = resolveHistoryOutputMode(program, historyCmd);
			const { runHistoryExport } = await import("./history");
			setExitCode(
				await runHistoryExport(sessionId, opts.output, outputMode, io),
			);
		});
}
