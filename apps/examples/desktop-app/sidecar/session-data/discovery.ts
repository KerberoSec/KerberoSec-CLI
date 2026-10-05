import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { SqliteSessionStore } from "@kerberosec/core";
import { readSessionManifest, sharedSessionDataDir } from "../paths";
import type { JsonRecord } from "../types";
import {
	compareSessionRecordsByStartedAtDesc,
	derivePromptFromMessages,
	resolveSessionListTitle,
} from "./common";
import { readPersistedChatMessages } from "./messages";

/**
 * Minimal context shape required by discoverChatSessions so both the host
 * backend and the sidecar can call it without pulling in CLI-specific code.
 */
export type DiscoveryChatContext = {
	liveSessions: Map<
		string,
		{
			busy: boolean;
			prompt?: string;
			title?: string;
			messages: unknown[];
			status: string;
			config: JsonRecord;
			startedAt: number;
			endedAt?: number;
		}
	>;
};

type PersistedChatSessionCandidate = {
	record: JsonRecord;
	manifest: JsonRecord;
};

function trimKnownString(value: unknown): string | undefined {
	if (typeof value !== "string") {
		return undefined;
	}
	const trimmed = value.trim();
	if (!trimmed) {
		return undefined;
	}
	return trimmed.toLowerCase() === "unknown" ? undefined : trimmed;
}

export function discoverChatSessions(
	ctx: DiscoveryChatContext,
	limit = 300,
): unknown[] {
	const out: JsonRecord[] = [];
	const persistedCandidates: PersistedChatSessionCandidate[] = [];
	const seenSessionIds = new Set<string>();
	const store = new SqliteSessionStore();
	for (const [sessionId, session] of ctx.liveSessions.entries()) {
		if (!session.busy && !session.prompt && session.messages.length === 0) {
			continue;
		}
		const prompt = session.prompt ?? derivePromptFromMessages(session.messages);
		const resolvedTitle = resolveSessionListTitle({
			sessionId,
			metadata: session.title ? { title: session.title } : undefined,
			prompt,
			messages: session.messages,
		});
		const persistedMetadata = store.get(sessionId)?.metadata;
		out.push({
			sessionId,
			status: session.status,
			provider: session.config.provider ?? "",
			model: session.config.model ?? "",
			cwd: session.config.cwd ?? session.config.workspaceRoot ?? "",
			workspaceRoot: session.config.workspaceRoot ?? "",
			prompt,
			startedAt: String(session.startedAt),
			endedAt: session.endedAt ? String(session.endedAt) : undefined,
			metadata: {
				...(persistedMetadata ?? {}),
				title: resolvedTitle,
			},
		});
		seenSessionIds.add(sessionId);
	}

	const base = sharedSessionDataDir();
	if (existsSync(base)) {
		for (const entry of readdirSync(base, { withFileTypes: true })) {
			if (!entry.isDirectory()) {
				continue;
			}
			const sessionId = entry.name.trim();
			if (!sessionId || seenSessionIds.has(sessionId)) {
				continue;
			}
			// Skip subagent / team-task child sessions — they are shown
			// under their parent, not as top-level sidebar entries.
			if (sessionId.includes("__teamtask__") || sessionId.includes("__sub__")) {
				continue;
			}
			if (!store.get(sessionId)) {
				try {
					rmSync(join(base, sessionId), { recursive: true, force: true });
				} catch {
					// Ignore cleanup failures and keep orphaned artifacts hidden.
				}
				continue;
			}
			const manifest = readSessionManifest(sessionId) ?? {};
			// Skip sessions explicitly marked as subagent.
			if (manifest.source === "subagent") {
				continue;
			}
			const provider = trimKnownString(manifest.provider);
			const model = trimKnownString(manifest.model);
			if (!provider || !model) {
				continue;
			}
			const startedAt = String(
				manifest.started_at ?? manifest.startedAt ?? Date.now(),
			);
			persistedCandidates.push({
				record: {
					sessionId,
					status: "completed",
					provider,
					model,
					cwd: manifest.cwd ?? "",
					workspaceRoot:
						manifest.workspace_root ??
						manifest.workspaceRoot ??
						manifest.cwd ??
						"",
					startedAt,
					endedAt:
						(manifest.ended_at ?? manifest.endedAt)
							? String(manifest.ended_at ?? manifest.endedAt)
							: undefined,
				},
				manifest,
			});
			seenSessionIds.add(sessionId);
		}
	}

	// Persisted transcripts can contain large image payloads. Sort their small
	// metadata records together with live sessions first, then read messages only
	// for entries that can actually appear in the requested result page.
	const orderedEntries = [
		...out.map((record) => ({ record, manifest: undefined })),
		...persistedCandidates,
	].sort((left, right) =>
		compareSessionRecordsByStartedAtDesc(left.record, right.record),
	);
	const result: JsonRecord[] = [];
	const resultLimit = Number.isNaN(limit)
		? 300
		: Math.max(1, Math.floor(limit));
	for (const entry of orderedEntries) {
		if (!entry.manifest) {
			result.push(entry.record);
		} else {
			const sessionId = String(entry.record.sessionId);
			const messages = readPersistedChatMessages(sessionId) ?? [];
			if (messages.length === 0) {
				continue;
			}
			const metadata =
				entry.manifest.metadata && typeof entry.manifest.metadata === "object"
					? { ...(entry.manifest.metadata as JsonRecord) }
					: undefined;
			const prompt = derivePromptFromMessages(messages);
			const resolvedTitle = resolveSessionListTitle({
				sessionId,
				metadata,
				prompt,
				messages,
			});
			result.push({
				...entry.record,
				prompt,
				metadata: {
					...(metadata ?? {}),
					title: resolvedTitle,
				},
			});
		}
		if (result.length >= resultLimit) break;
	}

	return result;
}

export function mergeDiscoveredSessionLists(
	chat: unknown[],
	cli: unknown[],
	limit: number,
): unknown[] {
	const merged = new Map<string, unknown>();
	for (const item of [...chat, ...cli]) {
		if (!item || typeof item !== "object") {
			continue;
		}
		const sessionId = String(
			(item as JsonRecord).sessionId ?? (item as JsonRecord).session_id ?? "",
		).trim();
		if (!sessionId || merged.has(sessionId)) {
			continue;
		}
		const normalized = item as JsonRecord;
		merged.set(sessionId, {
			...normalized,
			sessionId,
			startedAt:
				normalized.startedAt ?? normalized.started_at ?? String(Date.now()),
			endedAt: normalized.endedAt ?? normalized.ended_at,
			workspaceRoot:
				normalized.workspaceRoot ??
				normalized.workspace_root ??
				normalized.cwd ??
				"",
		});
	}
	return Array.from(merged.values())
		.sort((left, right) =>
			compareSessionRecordsByStartedAtDesc(
				left as JsonRecord,
				right as JsonRecord,
			),
		)
		.slice(0, limit);
}
