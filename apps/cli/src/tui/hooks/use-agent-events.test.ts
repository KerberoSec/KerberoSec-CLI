import type { AgentEvent, TeamEvent } from "@kerberosec/core";
import { describe, expect, it, vi } from "vitest";
import type { ChatEntry, InlineStream } from "../types";
import { useAgentEventHandlers } from "./use-agent-events";

vi.mock("react", () => ({
	useRef: (initial: unknown) => ({ current: initial }),
	useCallback: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
}));

function useTestHandlers() {
	const entries: ChatEntry[] = [];
	const activeInlineStreamRef = { current: undefined as InlineStream };

	const appendEntry = vi.fn((entry: ChatEntry) => {
		entries.push(entry);
	});

	const updateLastEntry = vi.fn((updater: (prev: ChatEntry) => ChatEntry) => {
		const last = entries[entries.length - 1];
		if (last) {
			entries[entries.length - 1] = updater(last);
		}
	});

	const updateEntry = vi.fn((updater: (entry: ChatEntry) => ChatEntry) => {
		for (let i = 0; i < entries.length; i++) {
			const item = entries[i];
			if (item) {
				entries[i] = updater(item);
			}
		}
	});

	const closeInlineStream = vi.fn(() => {
		activeInlineStreamRef.current = undefined;
		for (const entry of entries) {
			if (
				(entry.kind === "assistant_text" ||
					entry.kind === "reasoning" ||
					entry.kind === "tool_call") &&
				entry.streaming
			) {
				entry.streaming = false;
			}
		}
	});

	const setIsRunning = vi.fn();
	const setIsStreaming = vi.fn();
	const addUsageDelta = vi.fn();
	const onTurnErrorReported = vi.fn();

	const handlers = useAgentEventHandlers({
		appendEntry,
		updateLastEntry,
		updateEntry,
		closeInlineStream,
		activeInlineStreamRef,
		setIsRunning,
		setIsStreaming,
		addUsageDelta,
		onTurnErrorReported,
		verbose: false,
		modelId: "test-model",
	});

	return {
		entries,
		activeInlineStreamRef,
		appendEntry,
		updateLastEntry,
		updateEntry,
		closeInlineStream,
		handlers,
	};
}

describe("useAgentEventHandlers pending side entries", () => {
	it("buffers team events during active reasoning streaming and flushes on content_end", () => {
		const { entries, activeInlineStreamRef, handlers, closeInlineStream } =
			useTestHandlers();

		handlers.handleAgentEvent({ type: "iteration_start" } as AgentEvent);

		// First reasoning chunk
		handlers.handleAgentEvent({
			type: "content_start",
			contentType: "reasoning",
			reasoning: "Thinking part 1",
		} as AgentEvent);

		expect(activeInlineStreamRef.current).toBe("reasoning");
		expect(entries).toHaveLength(1);
		expect(entries[0]).toMatchObject({
			kind: "reasoning",
			text: "Thinking part 1",
			streaming: true,
		});

		// Team event arrives mid-reasoning
		const teamEvent: TeamEvent = {
			type: "run_progress",
			run: {
				id: "run-1",
				agentId: "repo_mapper",
			} as unknown as TeamEvent extends {
				type: "run_progress";
				run: infer R;
			}
				? R
				: never,
			message: "analyzing ast",
		} as TeamEvent;

		closeInlineStream.mockClear();
		handlers.handleTeamEvent(teamEvent);

		// Must NOT close the inline stream or inject entry mid-thought
		expect(closeInlineStream).not.toHaveBeenCalled();
		expect(entries).toHaveLength(1);
		expect(activeInlineStreamRef.current).toBe("reasoning");

		// Second reasoning chunk continues in the same entry
		handlers.handleAgentEvent({
			type: "content_start",
			contentType: "reasoning",
			reasoning: " and part 2",
		} as AgentEvent);

		expect(entries).toHaveLength(1);
		expect(entries[0]).toMatchObject({
			kind: "reasoning",
			text: "Thinking part 1 and part 2",
			streaming: true,
		});

		// Reasoning finishes
		handlers.handleAgentEvent({
			type: "content_end",
			contentType: "reasoning",
			reasoning: "Thinking part 1 and part 2",
		} as AgentEvent);

		// Stream is closed and buffered team entry is flushed after the thought
		expect(activeInlineStreamRef.current).toBeUndefined();
		expect(entries).toHaveLength(2);
		expect(entries[0]).toMatchObject({
			kind: "reasoning",
			text: "Thinking part 1 and part 2",
			streaming: false,
		});
		expect(entries[1]).toMatchObject({
			kind: "team",
			text: "[team run] progress run-1: analyzing ast",
		});
	});

	it("buffers status notices during active assistant_text streaming and flushes on content_end", () => {
		const { entries, activeInlineStreamRef, handlers } = useTestHandlers();

		handlers.handleAgentEvent({ type: "iteration_start" } as AgentEvent);

		// First text chunk
		handlers.handleAgentEvent({
			type: "content_start",
			contentType: "text",
			text: "Hello ",
		} as AgentEvent);

		expect(activeInlineStreamRef.current).toBe("text");
		expect(entries).toHaveLength(1);

		// Non-compaction status notice arrives mid-stream
		handlers.handleAgentEvent({
			type: "notice",
			displayRole: "status",
			message: "Scanning workspace...",
		} as unknown as AgentEvent);

		// Notice must be buffered, not split the text
		expect(entries).toHaveLength(1);
		expect(activeInlineStreamRef.current).toBe("text");

		// Second text chunk
		handlers.handleAgentEvent({
			type: "content_start",
			contentType: "text",
			text: "world!",
		} as AgentEvent);

		expect(entries).toHaveLength(1);
		expect(entries[0]).toMatchObject({
			kind: "assistant_text",
			text: "Hello world!",
			streaming: true,
		});

		// Text completes
		handlers.handleAgentEvent({
			type: "content_end",
			contentType: "text",
			text: "Hello world!",
		} as AgentEvent);

		expect(activeInlineStreamRef.current).toBeUndefined();
		expect(entries).toHaveLength(2);
		expect(entries[0]).toMatchObject({
			kind: "assistant_text",
			text: "Hello world!",
			streaming: false,
		});
		expect(entries[1]).toMatchObject({
			kind: "status",
			text: "Scanning workspace...",
		});
	});
});
