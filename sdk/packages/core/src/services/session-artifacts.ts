import {
	existsSync,
	lstatSync,
	mkdirSync,
	readdirSync,
	rmdirSync,
	rmSync,
	unlinkSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import {
	parseSubSessionId,
	parseTeamTaskSubSessionId,
} from "../session/models/session-graph";

export function nowIso(): string {
	return new Date().toISOString();
}

function assertSafeSessionToken(value: string): void {
	if (
		!value ||
		value === "." ||
		value === ".." ||
		!/^[A-Za-z0-9._-]+$/.test(value) ||
		basename(value) !== value
	) {
		throw new Error("session id contains an invalid path segment");
	}
}

export function unlinkIfExists(path: string | null | undefined): void {
	if (!path || !existsSync(path)) {
		return;
	}
	try {
		unlinkSync(path);
	} catch {
		// Best effort cleanup.
	}
}

export interface SessionArtifactPaths {
	messagesPath: string;
}

function childArtifactFileStem(sessionId: string): {
	rootSessionId: string;
	fileStem: string;
} {
	const teamTask = parseTeamTaskSubSessionId(sessionId);
	if (teamTask) {
		return {
			rootSessionId: teamTask.rootSessionId,
			fileStem: `${teamTask.agentId}__${teamTask.teamTaskId}`,
		};
	}

	const subagent = parseSubSessionId(sessionId);
	if (subagent) {
		return {
			rootSessionId: subagent.rootSessionId,
			fileStem: subagent.agentId,
		};
	}

	return {
		rootSessionId: sessionId,
		fileStem: sessionId,
	};
}

export class SessionArtifacts {
	constructor(private readonly ensureSessionsDir: () => string) {}

	public assertValidSessionId(sessionId: string): void {
		assertSafeSessionToken(sessionId);
	}

	public sessionArtifactsDir(sessionId: string): string {
		this.assertValidSessionId(sessionId);
		return join(this.ensureSessionsDir(), sessionId);
	}

	private existingSessionArtifactsDir(sessionId: string): string | undefined {
		const dir = this.sessionArtifactsDir(sessionId);
		try {
			const info = lstatSync(dir);
			if (!info.isDirectory() || info.isSymbolicLink()) return undefined;
			return dir;
		} catch {
			return undefined;
		}
	}

	public ensureSessionArtifactsDir(sessionId: string): string {
		const dir = this.sessionArtifactsDir(sessionId);
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
		return dir;
	}

	public sessionMessagesPath(sessionId: string): string {
		assertSafeSessionToken(sessionId);
		return join(
			this.sessionArtifactsDir(sessionId),
			`${sessionId}.messages.json`,
		);
	}

	public messagesArtifactPath(sessionId: string, isSubagent: boolean): string {
		if (!isSubagent) return this.sessionMessagesPath(sessionId);

		const { rootSessionId, fileStem } = childArtifactFileStem(sessionId);
		assertSafeSessionToken(rootSessionId);
		assertSafeSessionToken(fileStem);
		return join(
			this.sessionArtifactsDir(rootSessionId),
			`${fileStem}.messages.json`,
		);
	}

	/** Remove only the canonical messages artifact for this session. */
	public removeMessagesFile(sessionId: string, isSubagent: boolean): void {
		const path = this.messagesArtifactPath(sessionId, isSubagent);
		const rootSessionId = isSubagent
			? (parseTeamTaskSubSessionId(sessionId)?.rootSessionId ??
				parseSubSessionId(sessionId)?.rootSessionId)
			: sessionId;
		if (!rootSessionId || !this.existingSessionArtifactsDir(rootSessionId))
			return;
		try {
			// unlink removes a leaf symlink itself, so it cannot follow a malicious
			// messages-file symlink to delete its target.
			unlinkSync(path);
		} catch {
			// Best-effort cleanup.
		}
	}

	/** Remove a manifest only from its non-symlink session directory. */
	public removeManifestFile(sessionId: string): void {
		const dir = this.existingSessionArtifactsDir(sessionId);
		if (!dir) return;
		try {
			unlinkSync(join(dir, `${sessionId}.json`));
		} catch {
			// Best-effort cleanup.
		}
	}

	/** Remove the canonical compaction sidecar from its session directory. */
	public removeCompactionFile(sessionId: string): void {
		const dir = this.existingSessionArtifactsDir(sessionId);
		if (!dir) return;
		try {
			unlinkSync(join(dir, `${sessionId}.compaction.json`));
		} catch {
			// Best-effort cleanup.
		}
	}

	public sessionCompactionPath(sessionId: string): string {
		return join(
			this.sessionArtifactsDir(sessionId),
			`${sessionId}.compaction.json`,
		);
	}

	public sessionManifestPath(sessionId: string, ensureDir = false): string {
		const base = ensureDir
			? this.ensureSessionArtifactsDir(sessionId)
			: this.sessionArtifactsDir(sessionId);
		return join(base, `${sessionId}.json`);
	}

	public removeSessionDirIfEmpty(sessionId: string): void {
		let dir = resolve(this.sessionArtifactsDir(sessionId));
		const sessionsDir = resolve(this.ensureSessionsDir());
		if (dirname(dir) !== sessionsDir) return;
		while (dir !== sessionsDir) {
			if (!existsSync(dir)) {
				dir = dirname(dir);
				continue;
			}
			try {
				const info = lstatSync(dir);
				if (info.isSymbolicLink() || !info.isDirectory()) break;
				if (readdirSync(dir).length > 0) {
					break;
				}
				rmdirSync(dir);
			} catch {
				// Best-effort cleanup.
				break;
			}
			dir = dirname(dir);
		}
	}

	public removeSessionDir(sessionId: string): void {
		const dir = this.existingSessionArtifactsDir(sessionId);
		if (!dir) return;
		try {
			rmSync(dir, { recursive: true, force: true });
		} catch {
			// Best-effort cleanup.
		}
	}

	public removeDir(dir: string): void {
		const resolvedDir = resolve(dir);
		const sessionsDir = resolve(this.ensureSessionsDir());
		const sessionId = basename(resolvedDir);
		if (dirname(resolvedDir) !== sessionsDir) return;
		assertSafeSessionToken(sessionId);
		this.removeSessionDir(sessionId);
	}

	public subagentArtifactPaths(
		sessionId: string,
		subAgentId: string,
		activeTeamTaskSessionId?: string,
	): SessionArtifactPaths {
		void subAgentId;
		void activeTeamTaskSessionId;
		const { rootSessionId, fileStem } = childArtifactFileStem(sessionId);
		assertSafeSessionToken(rootSessionId);
		assertSafeSessionToken(fileStem);
		const dir = this.sessionArtifactsDir(rootSessionId);
		return {
			messagesPath: join(dir, `${fileStem}.messages.json`),
		};
	}
}
