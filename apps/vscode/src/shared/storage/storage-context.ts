import fsSync from "node:fs"
import os from "node:os"
import path from "node:path"
import { KerberoSecFileStorage } from "./KerberoSecFileStorage"
import { KerberoSecMemento } from "./KerberoSecStorage"

/**
 * The storage backend context object used by StateManager and other components.
 * Global, workspace and secret key-value storage goes through this component.
 *
 * This replaces the previous pattern of passing VSCode's ExtensionContext around
 * for storage access. All platforms (VSCode, CLI, JetBrains) use the same
 * file-backed implementation.
 */
export interface StorageContext {
	/** Global state — settings, task history references, UI state, etc. */
	readonly globalState: KerberoSecMemento

	// TODO: Privatize this field after StorageContext becomes class with a reset method.
	/**
	 * The backing store for global state. Prefer `globalState` when possible.
	 *
	 * This split exists because CLI needs to intercept the KerberoSecMemento interface to global state,
	 * but state resets need to write through to the backing store.
	 */
	readonly globalStateBackingStore: KerberoSecFileStorage

	/** Secrets — API keys and other sensitive values. File uses restricted permissions (0o600). */
	readonly secrets: KerberoSecFileStorage<string>

	/** Workspace-scoped state — per-project toggles, rules, etc. */
	readonly workspaceState: KerberoSecFileStorage

	/** The resolved path to the data directory (~/.kerberosec/data) */
	readonly dataDir: string

	/** The resolved path to the workspace storage directory (contains workspaceState.json) */
	readonly workspaceStoragePath: string
}

export interface StorageContextOptions {
	/**
	 * Override the KerberoSec home directory. When set, the data directory is always
	 * `<kerberosecDir>/data`. Defaults to env-based resolution: KERBEROSEC_DATA_DIR, then
	 * KERBEROSEC_DIR + "/data", then ~/.kerberosec/data.
	 */
	kerberosecDir?: string

	/**
	 * The workspace/project directory path. Used to compute a hash-based
	 * workspace storage subdirectory. Defaults to process.cwd().
	 */
	workspacePath?: string

	/**
	 * Explicit workspace storage directory override.
	 * When set, this path is used directly instead of computing a hash.
	 * Used by JetBrains (via WORKSPACE_STORAGE_DIR env var).
	 *
	 * TODO: Unify JetBrains workspace path scheme with the hash-based approach
	 * once the JetBrains client side is cleaned up.
	 */
	workspaceStorageDir?: string
}

const SETTINGS_SUBFOLDER = "data"

/**
 * Create a short deterministic hash of a string for use in directory names.
 * Produces an up-to-8-character hex string.
 */
function hashString(str: string): string {
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash = hash & hash // Convert to 32-bit integer
	}
	return Math.abs(hash).toString(16).substring(0, 8)
}

/**
 * Resolve the KerberoSec data directory from the environment:
 * KERBEROSEC_DATA_DIR (trimmed) > KERBEROSEC_DIR + "/data" > ~/.kerberosec/data.
 *
 * Single source of truth shared by createStorageContext and the SDK adapter's
 * legacy-state-reader, matching the SDK's own resolveKerberoSecDataDir. Every
 * reader/writer of globalState.json, secrets.json, and providers.json must
 * resolve through the same rules — diverging resolvers split provider state
 * across directories, so requests can run on a provider the settings never
 * show (ENG-2332).
 */
export function resolveDataDirFromEnv(): string {
	const envDataDir = process.env.KERBEROSEC_DATA_DIR?.trim()
	if (envDataDir) {
		return envDataDir
	}
	const kerberosecDir = process.env.KERBEROSEC_DIR?.trim() || path.join(os.homedir(), ".kerberosec")
	return path.join(kerberosecDir, SETTINGS_SUBFOLDER)
}

/**
 * Creates a StorageContext backed by JSON files on disk.
 *
 * All path computation is contained here — callers should not
 * construct paths to these storage files themselves.
 *
 * File layout (under the resolved data directory, ~/.kerberosec/data by default):
 *   <dataDir>/globalState.json    — global state
 *   <dataDir>/secrets.json        — secrets (mode 0o600)
 *   <dataDir>/workspaces/<hash>/workspaceState.json — per-workspace state
 *
 * @param opts Configuration options for path resolution
 * @returns A StorageContext ready for use by StateManager
 */
export function createStorageContext(opts: StorageContextOptions = {}): StorageContext {
	const dataDir = opts.kerberosecDir ? path.join(opts.kerberosecDir, SETTINGS_SUBFOLDER) : resolveDataDirFromEnv()

	// Resolve workspace storage directory
	let workspaceDir: string
	if (opts.workspaceStorageDir) {
		// Explicit override (JetBrains via env var, or test overrides)
		workspaceDir = opts.workspaceStorageDir
	} else {
		// Hash-based workspace isolation (CLI, VSCode)
		const workspacePath = opts.workspacePath || process.cwd()
		const workspaceHash = hashString(workspacePath)
		workspaceDir = path.join(dataDir, "workspaces", workspaceHash)
	}

	// Ensure directories exist
	fsSync.mkdirSync(dataDir, { recursive: true })
	fsSync.mkdirSync(workspaceDir, { recursive: true })

	const globalState = new KerberoSecFileStorage(path.join(dataDir, "globalState.json"), "GlobalState")

	return {
		globalState,
		globalStateBackingStore: globalState,
		secrets: new KerberoSecFileStorage<string>(path.join(dataDir, "secrets.json"), "Secrets", {
			fileMode: 0o600, // Owner read/write only — protects API keys
		}),
		workspaceState: new KerberoSecFileStorage(path.join(workspaceDir, "workspaceState.json"), "WorkspaceState"),
		dataDir,
		workspaceStoragePath: workspaceDir,
	}
}
