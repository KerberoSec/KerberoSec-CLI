import { describe, expect, it } from "vitest";
import {
	buildReadFilesKeys,
	extractFullOutputText,
	parseEditorInput,
	parseReadFilesInput,
	parseRunCommandsInput,
	parseSearchInput,
	parseSpawnAgentInput,
} from "./tool-parsing";

describe("buildReadFilesKeys", () => {
	it("produces unique keys when the same path is read twice", () => {
		const info = parseReadFilesInput({
			files: [{ path: "/a/SKILL.md" }, { path: "/a/SKILL.md" }],
		});
		const keys = buildReadFilesKeys(info?.files ?? []);

		expect(keys).toHaveLength(2);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it("produces unique keys for duplicate paths from the file_paths shape", () => {
		const info = parseReadFilesInput({
			file_paths: ["/a/SKILL.md", "/a/SKILL.md", "/b/SKILL.md"],
		});
		const keys = buildReadFilesKeys(info?.files ?? []);

		expect(keys).toHaveLength(3);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it("keeps distinct paths in unique keys", () => {
		const keys = buildReadFilesKeys([{ path: "/a.ts" }, { path: "/b.ts" }]);

		expect(new Set(keys).size).toBe(2);
	});

	it("returns no keys for an empty list", () => {
		expect(buildReadFilesKeys([])).toEqual([]);
	});
});

describe("extractFullOutputText", () => {
	it("extracts text with real newlines from the MCP CallToolResult shape", () => {
		const raw = {
			content: [
				{ type: "text", text: "# Memory\n\nline one" },
				{ type: "text", text: "line two" },
			],
		};
		expect(extractFullOutputText(raw)).toBe("# Memory\n\nline one\nline two");
	});

	it("keeps binary payloads behind placeholders in mixed MCP content", () => {
		const raw = {
			content: [
				{ type: "text", text: "before" },
				{ type: "image", data: "aGVsbG8=", mimeType: "image/png" },
				{
					type: "resource",
					resource: { uri: "file:///a.md", blob: "d29ybGQ=" },
				},
				{ type: "resource_link", uri: "file:///b.md", name: "b.md" },
				{ type: "text", text: "after" },
			],
		};
		expect(extractFullOutputText(raw)).toBe(
			"before\n[image: image/png]\naGVsbG8=\n[resource: file:///a.md]\nd29ybGQ=\n[resource_link: file:///b.md]\nafter",
		);
	});

	it("chunks base64 payloads into 76-char lines so collapse stays compact", () => {
		const raw = {
			content: [
				{ type: "image", data: "A".repeat(160), mimeType: "image/png" },
			],
		};
		expect(extractFullOutputText(raw)?.split("\n")).toEqual([
			"[image: image/png]",
			"A".repeat(76),
			"A".repeat(76),
			"A".repeat(8),
		]);
	});

	it("extracts embedded resource text from MCP content", () => {
		const raw = {
			content: [
				{
					type: "resource",
					resource: { uri: "file:///memory.md", text: "resource body\nline 2" },
				},
			],
		};
		expect(extractFullOutputText(raw)).toBe("resource body\nline 2");
	});

	it("falls back to pretty JSON for objects without text content", () => {
		const raw = { structuredContent: { ok: true } };
		expect(extractFullOutputText(raw)).toBe(JSON.stringify(raw, null, 2));
	});
});

describe("tool input parsers", () => {
	it("parses various command input shapes", () => {
		expect(parseRunCommandsInput("whoami")).toEqual({ commands: ["whoami"] });
		expect(parseRunCommandsInput({ command: "whoami" })).toEqual({
			commands: ["whoami"],
		});
		expect(parseRunCommandsInput({ CommandLine: "echo test" })).toEqual({
			commands: ["echo test"],
		});
		expect(parseRunCommandsInput({ cmd: "ls -la" })).toEqual({
			commands: ["ls -la"],
		});
		expect(
			parseRunCommandsInput({ command: "git", args: ["status", "-s"] }),
		).toEqual({
			commands: ["git status -s"],
		});
		expect(
			parseRunCommandsInput({ commands: ["echo 1", { command: "echo 2" }] }),
		).toEqual({
			commands: ["echo 1", "echo 2"],
		});
	});

	it("parses various file read shapes", () => {
		expect(parseReadFilesInput("/path/to/file.ts")).toEqual({
			files: [{ path: "/path/to/file.ts" }],
		});
		expect(parseReadFilesInput({ AbsolutePath: "/path/to/file.ts" })).toEqual({
			files: [{ path: "/path/to/file.ts" }],
		});
		expect(
			parseReadFilesInput({
				file_path: "/path/to/file.ts",
				start_line: 10,
				end_line: 20,
			}),
		).toEqual({
			files: [{ path: "/path/to/file.ts", startLine: 10, endLine: 20 }],
		});
	});

	it("parses various editor shapes", () => {
		expect(
			parseEditorInput({ TargetFile: "main.ts", CodeContent: "const a = 1;" }),
		).toEqual({
			path: "main.ts",
			newText: "const a = 1;",
			oldText: undefined,
			insertLine: undefined,
		});
		expect(
			parseEditorInput({
				filePath: "main.ts",
				TargetContent: "old",
				ReplacementContent: "new",
			}),
		).toEqual({
			path: "main.ts",
			newText: "new",
			oldText: "old",
			insertLine: undefined,
		});
	});

	it("parses search and agent shapes", () => {
		expect(parseSearchInput({ Query: "findMe" })).toEqual({
			queries: ["findMe"],
		});
		expect(parseSpawnAgentInput({ Prompt: "do work" })).toEqual({
			task: "do work",
		});
		expect(
			parseSpawnAgentInput({
				Subagents: [{ Role: "Worker", Prompt: "build code" }],
			}),
		).toEqual({
			task: "Worker: build code",
		});
	});
});
