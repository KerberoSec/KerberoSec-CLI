import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { getErrorCode, getErrorMessage } from "../parse/error";

export type SqliteStatement = {
	run: (...params: unknown[]) => {
		changes?: number;
		lastInsertRowid?: number | bigint;
	};
	get: (...params: unknown[]) => Record<string, unknown> | null;
	all: (...params: unknown[]) => Record<string, unknown>[];
	finalize?: () => void;
};

export type SqliteDb = {
	prepare: (sql: string) => SqliteStatement;
	exec: (sql: string) => void;
	close?: () => void;
};

const SQLITE_BUSY_RETRY_LIMIT = 3;
const SQLITE_BUSY_RETRY_BASE_DELAY_MS = 50;
const DEFAULT_STATEMENT_CACHE_CAPACITY = 100;

export interface SqlitePragmaOptions {
	cacheSizeKb?: number;
	mmapSizeBytes?: number;
	journalSizeLimitBytes?: number;
	busyTimeoutMs?: number;
}

export interface SqliteDbOptions extends SqlitePragmaOptions {
	maxStatements?: number;
}

export function nowIso(): string {
	return new Date().toISOString();
}

export function toBoolInt(value: boolean): number {
	return value ? 1 : 0;
}

export function asString(value: unknown): string {
	return typeof value === "string" ? value : "";
}

export function asOptionalString(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

export function asBool(value: unknown): boolean {
	return value === 1 || value === true;
}

function sleepMs(ms: number): void {
	if (ms <= 0) {
		return;
	}
	try {
		const shared = new SharedArrayBuffer(4);
		const array = new Int32Array(shared);
		Atomics.wait(array, 0, 0, ms);
	} catch {
		// Best-effort backoff; skip sleeping if the runtime does not support it.
	}
}

export function isSqliteBusyError(error: unknown): boolean {
	if (!error || typeof error !== "object") {
		return false;
	}
	const message = getErrorMessage(error);
	const code = getErrorCode(error);
	return (
		code === "SQLITE_BUSY" ||
		code === "SQLITE_LOCKED" ||
		message.includes("SQLITE_BUSY") ||
		message.includes("SQLITE_LOCKED") ||
		message.includes("database is locked")
	);
}

export function withSqliteBusyRetry<T>(operation: () => T): T {
	let attempt = 0;
	for (;;) {
		try {
			return operation();
		} catch (error) {
			if (!isSqliteBusyError(error) || attempt >= SQLITE_BUSY_RETRY_LIMIT) {
				throw error;
			}
			attempt += 1;
			sleepMs(SQLITE_BUSY_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
		}
	}
}

function wrapBunDb(
	db: {
		query: (sql: string) => {
			run: (...params: unknown[]) => {
				changes?: number;
				lastInsertRowid?: number | bigint;
			};
			get: (...params: unknown[]) => Record<string, unknown> | null;
			all: (...params: unknown[]) => Record<string, unknown>[];
			finalize?: () => void;
			isFinalized?: boolean;
		};
		exec: (sql: string) => void;
		close?: () => void;
	},
	maxStatements = DEFAULT_STATEMENT_CACHE_CAPACITY,
): SqliteDb {
	let isClosed = false;
	const statementCache = new Map<
		string,
		{
			run: (...params: unknown[]) => {
				changes?: number;
				lastInsertRowid?: number | bigint;
			};
			get: (...params: unknown[]) => Record<string, unknown> | null;
			all: (...params: unknown[]) => Record<string, unknown>[];
			finalize?: () => void;
			isFinalized?: boolean;
		}
	>();

	function getOrCompile(sql: string) {
		if (isClosed) {
			throw new Error("Cannot prepare statement: database is closed");
		}
		let stmt = statementCache.get(sql);
		if (stmt) {
			if (stmt.isFinalized) {
				statementCache.delete(sql);
			} else {
				statementCache.delete(sql);
				statementCache.set(sql, stmt);
				return stmt;
			}
		}
		if (statementCache.size >= maxStatements) {
			const oldest = statementCache.keys().next().value;
			if (oldest !== undefined) {
				const evicted = statementCache.get(oldest);
				statementCache.delete(oldest);
				try {
					evicted?.finalize?.();
				} catch {
					// Best-effort cleanup on eviction.
				}
			}
		}
		stmt = db.query(sql);
		statementCache.set(sql, stmt);
		return stmt;
	}

	return {
		prepare: (sql) => {
			return {
				run: (...params) =>
					withSqliteBusyRetry(() => getOrCompile(sql).run(...params)),
				get: (...params) =>
					withSqliteBusyRetry(() => getOrCompile(sql).get(...params)),
				all: (...params) =>
					withSqliteBusyRetry(() => getOrCompile(sql).all(...params)),
				finalize: () => {
					const stmt = statementCache.get(sql);
					if (stmt) {
						statementCache.delete(sql);
						try {
							stmt.finalize?.();
						} catch {
							// Ignore finalization error
						}
					}
				},
			};
		},
		exec: (sql) => {
			if (isClosed) {
				throw new Error("Cannot execute query: database is closed");
			}
			return withSqliteBusyRetry(() => db.exec(sql));
		},
		close: () => {
			if (isClosed) return;
			isClosed = true;
			for (const stmt of statementCache.values()) {
				try {
					stmt.finalize?.();
				} catch {
					// Best-effort cleanup
				}
			}
			statementCache.clear();
			try {
				db.close?.();
			} catch {
				// Best-effort cleanup
			}
		},
	};
}

function wrapNodeDb(
	db: {
		prepare: (sql: string) => {
			run: (...params: unknown[]) => { changes?: number };
			get: (...params: unknown[]) => Record<string, unknown> | undefined;
			all: (...params: unknown[]) => Record<string, unknown>[];
			finalize?: () => void;
		};
		exec: (sql: string) => void;
		close?: () => void;
	},
	maxStatements = DEFAULT_STATEMENT_CACHE_CAPACITY,
): SqliteDb {
	let isClosed = false;
	const statementCache = new Map<
		string,
		{
			run: (...params: unknown[]) => { changes?: number };
			get: (...params: unknown[]) => Record<string, unknown> | undefined;
			all: (...params: unknown[]) => Record<string, unknown>[];
			finalize?: () => void;
		}
	>();

	function getOrCompile(sql: string) {
		if (isClosed) {
			throw new Error("Cannot prepare statement: database is closed");
		}
		let stmt = statementCache.get(sql);
		if (stmt) {
			statementCache.delete(sql);
			statementCache.set(sql, stmt);
			return stmt;
		}
		if (statementCache.size >= maxStatements) {
			const oldest = statementCache.keys().next().value;
			if (oldest !== undefined) {
				const evicted = statementCache.get(oldest);
				statementCache.delete(oldest);
				try {
					evicted?.finalize?.();
				} catch {
					// Best-effort cleanup on eviction.
				}
			}
		}
		stmt = db.prepare(sql);
		statementCache.set(sql, stmt);
		return stmt;
	}

	return {
		prepare: (sql) => {
			return {
				run: (...params) =>
					withSqliteBusyRetry(() => getOrCompile(sql).run(...params)),
				get: (...params) =>
					withSqliteBusyRetry(() => getOrCompile(sql).get(...params) ?? null),
				all: (...params) =>
					withSqliteBusyRetry(() => getOrCompile(sql).all(...params)),
				finalize: () => {
					const stmt = statementCache.get(sql);
					if (stmt) {
						statementCache.delete(sql);
						try {
							stmt.finalize?.();
						} catch {
							// Ignore finalization error
						}
					}
				},
			};
		},
		exec: (sql) => {
			if (isClosed) {
				throw new Error("Cannot execute query: database is closed");
			}
			return withSqliteBusyRetry(() => db.exec(sql));
		},
		close: () => {
			if (isClosed) return;
			isClosed = true;
			for (const stmt of statementCache.values()) {
				try {
					stmt.finalize?.();
				} catch {
					// Best-effort cleanup
				}
			}
			statementCache.clear();
			try {
				db.close?.();
			} catch {
				// Best-effort cleanup
			}
		},
	};
}

export function applySqlitePragmas(
	db: SqliteDb | { exec: (sql: string) => void },
	options?: SqlitePragmaOptions,
): void {
	const cacheSize = -(options?.cacheSizeKb ?? 2000);
	const mmapSizeBytes = options?.mmapSizeBytes ?? 67108864;
	const journalSizeLimitBytes = options?.journalSizeLimitBytes ?? 16777216;
	const busyTimeoutMs = options?.busyTimeoutMs ?? 5000;

	db.exec("PRAGMA journal_mode = WAL;");
	db.exec("PRAGMA synchronous = NORMAL;");
	db.exec(`PRAGMA cache_size = ${cacheSize};`);
	db.exec("PRAGMA temp_store = MEMORY;");
	db.exec(`PRAGMA busy_timeout = ${busyTimeoutMs};`);
	db.exec(`PRAGMA mmap_size = ${mmapSizeBytes};`);
	db.exec(`PRAGMA journal_size_limit = ${journalSizeLimitBytes};`);
}

export function loadSqliteDb(
	filePath: string,
	options?: SqliteDbOptions,
): SqliteDb {
	mkdirSync(dirname(filePath), { recursive: true });
	const require = createRequire(import.meta.url);
	let db: SqliteDb;

	if (typeof (globalThis as { Bun?: unknown }).Bun !== "undefined") {
		const { Database } = require("bun:sqlite") as {
			Database: new (
				path: string,
				options?: { create?: boolean },
			) => {
				query: (sql: string) => {
					run: (...params: unknown[]) => {
						changes?: number;
						lastInsertRowid?: number | bigint;
					};
					get: (...params: unknown[]) => Record<string, unknown> | null;
					all: (...params: unknown[]) => Record<string, unknown>[];
					finalize?: () => void;
					isFinalized?: boolean;
				};
				exec: (sql: string) => void;
				close?: () => void;
			};
		};
		db = wrapBunDb(
			new Database(filePath, { create: true }),
			options?.maxStatements,
		);
	} else {
		// Suppress "ExperimentalWarning: SQLite is an experimental feature"
		const originalEmit = process.emitWarning;
		process.emitWarning = ((warning: string | Error, ...args: unknown[]) => {
			const msg =
				typeof warning === "string" ? warning : (warning?.message ?? "");
			if (msg.includes("SQLite")) return;
			return (originalEmit as (...args: unknown[]) => void).call(
				process,
				warning,
				...args,
			);
		}) as typeof process.emitWarning;

		try {
			const { DatabaseSync } = require(["node", ":sqlite"].join("")) as {
				DatabaseSync: new (
					path: string,
				) => {
					prepare: (sql: string) => {
						run: (...params: unknown[]) => { changes?: number };
						get: (...params: unknown[]) => Record<string, unknown> | undefined;
						all: (...params: unknown[]) => Record<string, unknown>[];
						finalize?: () => void;
					};
					exec: (sql: string) => void;
					close?: () => void;
				};
			};
			db = wrapNodeDb(new DatabaseSync(filePath), options?.maxStatements);
		} finally {
			process.emitWarning = originalEmit;
		}
	}

	applySqlitePragmas(db, options);
	return db;
}

export interface SessionSchemaOptions extends SqlitePragmaOptions {
	includeLegacyMigrations?: boolean;
}

const SCHEMA_STATEMENTS = [
	`CREATE TABLE IF NOT EXISTS sessions (
		session_id TEXT PRIMARY KEY,
		source TEXT NOT NULL,
		pid INTEGER NOT NULL,
		started_at TEXT NOT NULL,
		ended_at TEXT,
		exit_code INTEGER,
		status TEXT NOT NULL,
		status_lock INTEGER NOT NULL DEFAULT 0,
		interactive INTEGER NOT NULL,
		provider TEXT NOT NULL,
		model TEXT NOT NULL,
		cwd TEXT NOT NULL,
		workspace_root TEXT NOT NULL,
		team_name TEXT,
		enable_tools INTEGER NOT NULL,
		enable_spawn INTEGER NOT NULL,
		enable_teams INTEGER NOT NULL,
		parent_session_id TEXT,
		parent_agent_id TEXT,
		agent_id TEXT,
		conversation_id TEXT,
		is_subagent INTEGER NOT NULL DEFAULT 0,
		prompt TEXT,
		metadata_json TEXT,
		transcript_path TEXT NOT NULL DEFAULT '',
		hook_path TEXT NOT NULL,
		messages_path TEXT,
		updated_at TEXT NOT NULL
	);`,
	`CREATE TABLE IF NOT EXISTS subagent_spawn_queue (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		root_session_id TEXT NOT NULL,
		parent_agent_id TEXT NOT NULL,
		task TEXT,
		system_prompt TEXT,
		created_at TEXT NOT NULL,
		consumed_at TEXT
	);`,
	`CREATE TABLE IF NOT EXISTS schedules (
		schedule_id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		cron_pattern TEXT NOT NULL,
		prompt TEXT NOT NULL,
		provider TEXT NOT NULL,
		model TEXT NOT NULL,
		mode TEXT NOT NULL DEFAULT 'act',
		workspace_root TEXT,
		cwd TEXT,
		system_prompt TEXT,
		max_iterations INTEGER,
		timeout_seconds INTEGER,
		max_parallel INTEGER NOT NULL DEFAULT 1,
		enabled INTEGER NOT NULL DEFAULT 1,
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL,
		last_run_at TEXT,
		next_run_at TEXT,
		claim_token TEXT,
		claim_started_at TEXT,
		claim_until_at TEXT,
		created_by TEXT,
		tags TEXT,
		metadata_json TEXT
	);`,
	`CREATE TABLE IF NOT EXISTS schedule_executions (
		execution_id TEXT PRIMARY KEY,
		schedule_id TEXT NOT NULL,
		session_id TEXT,
		triggered_at TEXT NOT NULL,
		started_at TEXT,
		ended_at TEXT,
		status TEXT NOT NULL,
		exit_code INTEGER,
		error_message TEXT,
		iterations INTEGER,
		tokens_used INTEGER,
		cost_usd REAL,
		FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
		FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE SET NULL
	);`,
	`CREATE INDEX IF NOT EXISTS idx_schedule_executions_schedule
	ON schedule_executions(schedule_id, triggered_at DESC);`,
	`CREATE INDEX IF NOT EXISTS idx_schedules_next_run
	ON schedules(enabled, next_run_at);`,
];

const SESSION_INDEX_STATEMENTS = [
	`CREATE INDEX IF NOT EXISTS idx_sessions_started_at
	ON sessions(started_at DESC);`,
	`CREATE INDEX IF NOT EXISTS idx_sessions_parent
	ON sessions(parent_session_id);`,
];

const LEGACY_MIGRATIONS: Array<{
	table: string;
	column: string;
	sql: string;
}> = [
	{
		table: "sessions",
		column: "workspace_root",
		sql: "ALTER TABLE sessions ADD COLUMN workspace_root TEXT;",
	},
	{
		table: "sessions",
		column: "parent_session_id",
		sql: "ALTER TABLE sessions ADD COLUMN parent_session_id TEXT;",
	},
	{
		table: "sessions",
		column: "parent_agent_id",
		sql: "ALTER TABLE sessions ADD COLUMN parent_agent_id TEXT;",
	},
	{
		table: "sessions",
		column: "agent_id",
		sql: "ALTER TABLE sessions ADD COLUMN agent_id TEXT;",
	},
	{
		table: "sessions",
		column: "conversation_id",
		sql: "ALTER TABLE sessions ADD COLUMN conversation_id TEXT;",
	},
	{
		table: "sessions",
		column: "is_subagent",
		sql: "ALTER TABLE sessions ADD COLUMN is_subagent INTEGER NOT NULL DEFAULT 0;",
	},
	{
		table: "sessions",
		column: "messages_path",
		sql: "ALTER TABLE sessions ADD COLUMN messages_path TEXT;",
	},
	{
		table: "sessions",
		column: "metadata_json",
		sql: "ALTER TABLE sessions ADD COLUMN metadata_json TEXT;",
	},
	{
		table: "sessions",
		column: "transcript_path",
		sql: "ALTER TABLE sessions ADD COLUMN transcript_path TEXT NOT NULL DEFAULT '';",
	},
	{
		table: "schedules",
		column: "claim_token",
		sql: "ALTER TABLE schedules ADD COLUMN claim_token TEXT;",
	},
	{
		table: "schedules",
		column: "claim_started_at",
		sql: "ALTER TABLE schedules ADD COLUMN claim_started_at TEXT;",
	},
	{
		table: "schedules",
		column: "claim_until_at",
		sql: "ALTER TABLE schedules ADD COLUMN claim_until_at TEXT;",
	},
];

function getColumnNames(db: SqliteDb, table: string): Set<string> {
	return new Set(
		db
			.prepare(`PRAGMA table_info(${table});`)
			.all()
			.map((c) => c.name as string),
	);
}

export function ensureSessionSchema(
	db: SqliteDb,
	options: SessionSchemaOptions = {},
): void {
	applySqlitePragmas(db, options);
	for (const stmt of SCHEMA_STATEMENTS) {
		db.exec(stmt);
	}

	if (options.includeLegacyMigrations) {
		const columnCache = new Map<string, Set<string>>();
		const getColumns = (table: string) => {
			let cols = columnCache.get(table);
			if (!cols) {
				cols = getColumnNames(db, table);
				columnCache.set(table, cols);
			}
			return cols;
		};

		for (const migration of LEGACY_MIGRATIONS) {
			if (!getColumns(migration.table).has(migration.column)) {
				db.exec(migration.sql);
				if (migration.column === "workspace_root") {
					db.exec(
						"UPDATE sessions SET workspace_root = cwd WHERE workspace_root IS NULL OR workspace_root = '';",
					);
				}
				columnCache.delete(migration.table);
			}
		}
	}

	// These indexes include columns added by legacy migrations, so create them
	// only after those migrations have completed. If migration was explicitly
	// disabled for a legacy database, skip indexes for columns it does not have.
	const sessionColumns = getColumnNames(db, "sessions");
	if (sessionColumns.has("started_at")) {
		db.exec(SESSION_INDEX_STATEMENTS[0]);
	}
	if (sessionColumns.has("parent_session_id")) {
		db.exec(SESSION_INDEX_STATEMENTS[1]);
	}
}
