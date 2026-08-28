import { basename, extname } from "node:path";
import { hunkHeader } from "./diff";

const EXT_TO_LANGUAGE: Record<string, string> = {
	".ts": "typescript",
	".tsx": "tsx",
	".js": "javascript",
	".jsx": "jsx",
	".py": "python",
	".rb": "ruby",
	".rs": "rust",
	".go": "go",
	".java": "java",
	".kt": "kotlin",
	".swift": "swift",
	".c": "c",
	".cpp": "cpp",
	".h": "c",
	".hpp": "cpp",
	".cs": "csharp",
	".css": "css",
	".scss": "scss",
	".html": "html",
	".vue": "vue",
	".svelte": "svelte",
	".json": "json",
	".yaml": "yaml",
	".yml": "yaml",
	".toml": "toml",
	".md": "markdown",
	".sql": "sql",
	".sh": "bash",
	".bash": "bash",
	".zsh": "bash",
	".fish": "fish",
	".lua": "lua",
	".php": "php",
	".r": "r",
	".ex": "elixir",
	".exs": "elixir",
	".erl": "erlang",
	".zig": "zig",
	".dockerfile": "dockerfile",
	".xml": "xml",
	".graphql": "graphql",
	".proto": "protobuf",
};

export function detectLanguage(filePath: string): string | undefined {
	const ext = extname(filePath).toLowerCase();
	if (ext && EXT_TO_LANGUAGE[ext]) return EXT_TO_LANGUAGE[ext];
	const base = basename(filePath).toLowerCase();
	if (base === "dockerfile") return "dockerfile";
	if (base === "makefile") return "makefile";
	if (base === "cmakelists.txt") return "cmake";
	return undefined;
}

function isRecord(v: unknown): v is Record<string, unknown> {
	return !!v && typeof v === "object" && !Array.isArray(v);
}

export interface ReadFilesInfo {
	files: { path: string; startLine?: number; endLine?: number }[];
}

export function parseReadFilesInput(input: unknown): ReadFilesInfo | undefined {
	if (!input) return undefined;
	if (typeof input === "string") return { files: [{ path: input }] };
	if (!isRecord(input)) return undefined;

	if (Array.isArray(input.file_paths)) {
		return {
			files: input.file_paths
				.filter((p): p is string => typeof p === "string")
				.map((path) => ({ path })),
		};
	}

	if (Array.isArray(input.files)) {
		return {
			files: input.files
				.filter((f): f is Record<string, unknown> => isRecord(f))
				.map((f) => ({
					path: String(
						f.path ?? f.file_path ?? f.filePath ?? f.AbsolutePath ?? "",
					),
					startLine:
						typeof f.start_line === "number"
							? f.start_line
							: typeof f.StartLine === "number"
								? f.StartLine
								: undefined,
					endLine:
						typeof f.end_line === "number"
							? f.end_line
							: typeof f.EndLine === "number"
								? f.EndLine
								: undefined,
				})),
		};
	}

	const singlePath =
		input.path ??
		input.file_path ??
		input.filePath ??
		input.AbsolutePath ??
		input.file;
	if (typeof singlePath === "string" && singlePath.trim()) {
		return {
			files: [
				{
					path: singlePath,
					startLine:
						typeof input.start_line === "number"
							? input.start_line
							: typeof input.StartLine === "number"
								? input.StartLine
								: undefined,
					endLine:
						typeof input.end_line === "number"
							? input.end_line
							: typeof input.EndLine === "number"
								? input.EndLine
								: undefined,
				},
			],
		};
	}

	return undefined;
}

// A read_files call can list the same path more than once, so the raw path is
// not a unique React key. Prefix the array index to keep keys unique per row.
export function buildReadFilesKeys(files: { path: string }[]): string[] {
	return files.map((f, i) => `${i}:${f.path}`);
}

export interface RunCommandsInfo {
	commands: string[];
}

export function parseRunCommandsInput(
	input: unknown,
): RunCommandsInfo | undefined {
	if (!input) return undefined;
	if (typeof input === "string") return { commands: [input] };
	if (!isRecord(input)) return undefined;

	if (Array.isArray(input.commands)) {
		return {
			commands: input.commands.map((cmd) => {
				if (typeof cmd === "string") return cmd;
				if (isRecord(cmd) && typeof cmd.command === "string") {
					const args = Array.isArray(cmd.args) ? cmd.args.join(" ") : "";
					return args ? `${cmd.command} ${args}` : cmd.command;
				}
				return String(cmd);
			}),
		};
	}

	if (typeof input.command === "string") {
		const args = Array.isArray(input.args) ? input.args.join(" ") : "";
		return { commands: [args ? `${input.command} ${args}` : input.command] };
	}

	if (typeof input.CommandLine === "string") {
		return { commands: [input.CommandLine] };
	}

	if (typeof input.cmd === "string") {
		return { commands: [input.cmd] };
	}

	return undefined;
}

export interface EditorInfo {
	path: string;
	oldText?: string;
	newText: string;
	insertLine?: number;
}

export function parseEditorInput(input: unknown): EditorInfo | undefined {
	if (!isRecord(input)) return undefined;
	const path =
		input.path ??
		input.file_path ??
		input.filePath ??
		input.TargetFile ??
		input.file;
	if (typeof path !== "string" || !path.trim()) return undefined;

	const oldText =
		typeof input.old_text === "string"
			? input.old_text
			: typeof input.TargetContent === "string"
				? input.TargetContent
				: undefined;
	const newText =
		typeof input.new_text === "string"
			? input.new_text
			: typeof input.ReplacementContent === "string"
				? input.ReplacementContent
				: typeof input.CodeContent === "string"
					? input.CodeContent
					: typeof input.content === "string"
						? input.content
						: "";

	return {
		path,
		oldText,
		newText,
		insertLine:
			typeof input.insert_line === "number"
				? input.insert_line
				: typeof input.StartLine === "number"
					? input.StartLine
					: undefined,
	};
}

export interface SearchInfo {
	queries: string[];
}

export function parseSearchInput(input: unknown): SearchInfo | undefined {
	if (!input) return undefined;
	if (typeof input === "string") return { queries: [input] };
	if (!isRecord(input)) return undefined;
	if (Array.isArray(input.queries)) {
		return {
			queries: input.queries.filter((q): q is string => typeof q === "string"),
		};
	}
	const singleQuery =
		input.query ?? input.Query ?? input.Pattern ?? input.pattern;
	if (typeof singleQuery === "string" && singleQuery.trim()) {
		return { queries: [singleQuery] };
	}
	return undefined;
}

export interface WebFetchInfo {
	urls: string[];
}

export function parseWebFetchInput(input: unknown): WebFetchInfo | undefined {
	if (!input) return undefined;
	if (typeof input === "string") return { urls: [input] };
	if (!isRecord(input)) return undefined;
	if (Array.isArray(input.requests)) {
		return {
			urls: input.requests
				.filter((r): r is Record<string, unknown> => isRecord(r))
				.map((r) => String(r.url ?? r.Url ?? ""))
				.filter(Boolean),
		};
	}
	const singleUrl = input.url ?? input.Url;
	if (typeof singleUrl === "string" && singleUrl.trim()) {
		return { urls: [singleUrl] };
	}
	return undefined;
}

export interface SpawnAgentInfo {
	task: string;
}

export function parseSpawnAgentInput(
	input: unknown,
): SpawnAgentInfo | undefined {
	if (!input) return undefined;
	if (typeof input === "string") return { task: input };
	if (!isRecord(input)) return undefined;
	if (typeof input.task === "string") return { task: input.task };
	if (typeof input.Prompt === "string") return { task: input.Prompt };
	if (typeof input.prompt === "string") return { task: input.prompt };
	if (
		Array.isArray(input.Subagents) &&
		input.Subagents.length > 0 &&
		isRecord(input.Subagents[0])
	) {
		const role =
			typeof input.Subagents[0].Role === "string"
				? input.Subagents[0].Role
				: "";
		const prompt =
			typeof input.Subagents[0].Prompt === "string"
				? input.Subagents[0].Prompt
				: "";
		return { task: role ? `${role}: ${prompt}` : prompt };
	}
	return undefined;
}

// Base64 payloads are one giant line; chunk to MIME width so GenericOutput's
// line-based collapse stays compact and expand shows the full data.
function chunkBase64(data: string): string {
	return data.match(/.{1,76}/g)?.join("\n") ?? data;
}

export function extractFullOutputText(raw: unknown): string | undefined {
	if (raw === null || raw === undefined) return undefined;
	if (typeof raw === "string") return raw;

	if (Array.isArray(raw)) {
		const parts: string[] = [];
		for (const item of raw) {
			if (isRecord(item) && "result" in item) {
				const result = item.result;
				if (typeof result === "string") {
					parts.push(result);
				} else if (Array.isArray(result)) {
					for (const part of result) {
						if (
							isRecord(part) &&
							(part as { type?: string }).type === "text" &&
							"text" in part
						) {
							parts.push(String(part.text));
						}
					}
				}
			}
		}
		if (parts.length > 0) return parts.join("\n");
	}

	if (typeof raw === "object") {
		// MCP tools return {content: [{type: "text", text}, ...]}. Extract the
		// text so multi-line results keep real newlines instead of being
		// JSON-escaped into one giant line that floods the terminal (#13038).
		// Non-text blocks keep their identifying metadata plus their base64
		// payloads so mixed results are not silently truncated.
		const content = (raw as { content?: unknown }).content;
		if (Array.isArray(content)) {
			const parts = content
				.map((part) => {
					if (!isRecord(part)) return "";
					if (part.type === "text" && typeof part.text === "string") {
						return part.text;
					}
					if (part.type === "resource" && isRecord(part.resource)) {
						if (typeof part.resource.text === "string") {
							return part.resource.text;
						}
						if (typeof part.resource.blob === "string" && part.resource.blob) {
							const label =
								typeof part.resource.uri === "string"
									? `[resource: ${part.resource.uri}]`
									: "[resource]";
							return `${label}\n${chunkBase64(part.resource.blob)}`;
						}
						if (typeof part.resource.uri === "string") {
							return `[resource: ${part.resource.uri}]`;
						}
					}
					if (part.type === "resource_link" && typeof part.uri === "string") {
						return `[resource_link: ${part.uri}]`;
					}
					if (
						(part.type === "image" || part.type === "audio") &&
						typeof part.mimeType === "string"
					) {
						if (typeof part.data === "string" && part.data) {
							return `[${part.type}: ${part.mimeType}]\n${chunkBase64(part.data)}`;
						}
						return `[${part.type}: ${part.mimeType}]`;
					}
					return typeof part.type === "string" ? `[${part.type}]` : "";
				})
				.filter(Boolean);
			if (parts.length > 0) return parts.join("\n");
		}
		try {
			return JSON.stringify(raw, null, 2);
		} catch {
			return String(raw);
		}
	}

	return String(raw);
}

export interface AskQuestionInfo {
	question: string;
	options: string[];
}

export function parseAskQuestionInput(
	input: unknown,
): AskQuestionInfo | undefined {
	if (!isRecord(input)) return undefined;
	if (typeof input.question !== "string") return undefined;
	const options = Array.isArray(input.options)
		? input.options.filter((o): o is string => typeof o === "string")
		: [];
	return { question: input.question, options };
}

export interface ApplyPatchInfo {
	files: string[];
	additions: number;
	deletions: number;
	diff: string;
}

const FILE_ACTION_RE = /^\*\*\* (?:Add|Update|Delete) File: (.+)/;
const SKIP_LINES =
	/^(?:\*\*\* (?:Begin|End) Patch|%%bash|```|EOF|apply_patch\b|@@|\*\*\* (?:Move to:|End of File))/;

export function parseApplyPatchInput(
	input: unknown,
): ApplyPatchInfo | undefined {
	const raw =
		typeof input === "string"
			? input
			: isRecord(input) && typeof input.input === "string"
				? input.input
				: null;
	if (!raw) return undefined;

	const files: string[] = [];
	const out: string[] = [];
	let hunk: string[] = [];
	let additions = 0;
	let deletions = 0;

	const flush = () => {
		if (hunk.length === 0) return;
		out.push(hunkHeader(hunk), ...hunk);
		hunk = [];
	};

	for (const line of raw.split("\n")) {
		const fileMatch = FILE_ACTION_RE.exec(line);
		if (fileMatch) {
			flush();
			const path = fileMatch[1].trim();
			files.push(path);
			out.push(`--- a/${path}`, `+++ b/${path}`);
			continue;
		}
		if (SKIP_LINES.test(line.trim())) continue;

		if (line.startsWith("+")) additions++;
		else if (line.startsWith("-")) deletions++;

		if (line.startsWith("+") || line.startsWith("-") || line.startsWith(" ")) {
			hunk.push(line);
		} else {
			hunk.push(` ${line}`);
		}
	}
	flush();

	if (files.length === 0) return undefined;
	return { files, additions, deletions, diff: out.join("\n") };
}

export function shortenPath(filePath: string, maxLen = 50): string {
	if (filePath.length <= maxLen) return filePath;
	const parts = filePath.split("/");
	const fileName = parts.pop() ?? "";
	if (fileName.length >= maxLen - 4) return `.../${fileName}`;
	let result = fileName;
	for (let i = parts.length - 1; i >= 0; i--) {
		const candidate = `${parts[i]}/${result}`;
		if (candidate.length + 4 > maxLen) break;
		result = candidate;
	}
	return `.../${result}`;
}
