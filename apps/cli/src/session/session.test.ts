import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";

const createCore = vi.fn();
const getCliTelemetryService = vi.fn(() => undefined);
const resolveSessionBackend = vi.fn();
const listSessionHistoryFromBackend = vi.fn();
const featureFlagsPoll = vi.fn(async () => {});
const featureFlagsDispose = vi.fn(async () => {});

vi.mock("@kerberosec/core", async () => {
	const actual =
		await vi.importActual<typeof import("@kerberosec/core")>(
			"@kerberosec/core",
		);
	return {
		...actual,
		KerberoSecCore: {
			create: createCore,
		},
		resolveSessionBackend,
		listSessionHistoryFromBackend,
	};
});

vi.mock("../utils/telemetry", () => ({
	getCliTelemetryService,
}));

describe("createCliCore", () => {
	let sessionModule: typeof import("./session");
	const envSnapshot = {
		KERBEROSEC_RPC_ADDRESS: process.env.KERBEROSEC_RPC_ADDRESS,
		KERBEROSEC_SESSION_BACKEND_MODE:
			process.env.KERBEROSEC_SESSION_BACKEND_MODE,
		KERBEROSEC_VCR: process.env.KERBEROSEC_VCR,
	};

	beforeAll(async () => {
		sessionModule = await import("./session");
	});

	beforeEach(() => {
		createCore.mockReset();
		resolveSessionBackend.mockReset();
		resolveSessionBackend.mockResolvedValue({ kind: "backend" });
		listSessionHistoryFromBackend.mockReset();
		createCore.mockResolvedValue({
			runtimeAddress: "127.0.0.1:25463",
			featureFlags: {
				poll: featureFlagsPoll,
				dispose: featureFlagsDispose,
			},
			start: vi.fn(),
			send: vi.fn(),
			getAccumulatedUsage: vi.fn(),
			abort: vi.fn(),
			stop: vi.fn(),
			dispose: vi.fn(),
			get: vi.fn(),
			list: vi.fn(),
			delete: vi.fn(),
			update: vi.fn(),
			readMessages: vi.fn(),
			readTranscript: vi.fn(),
			ingestHookEvent: vi.fn(),
			subscribe: vi.fn(),
			updateSessionModel: vi.fn(),
		});
		delete process.env.KERBEROSEC_RPC_ADDRESS;
		delete process.env.KERBEROSEC_SESSION_BACKEND_MODE;
		delete process.env.KERBEROSEC_VCR;
		featureFlagsPoll.mockClear();
		featureFlagsDispose.mockClear();
	});

	afterEach(() => {
		process.env.KERBEROSEC_RPC_ADDRESS = envSnapshot.KERBEROSEC_RPC_ADDRESS;
		process.env.KERBEROSEC_SESSION_BACKEND_MODE =
			envSnapshot.KERBEROSEC_SESSION_BACKEND_MODE;
		process.env.KERBEROSEC_VCR = envSnapshot.KERBEROSEC_VCR;
	});

	it("passes hub client metadata through without forcing hub mode", async () => {
		process.env.KERBEROSEC_RPC_ADDRESS = "127.0.0.1:5001";

		await sessionModule.createCliCore();

		expect(createCore).toHaveBeenCalledWith(
			expect.objectContaining({
				hub: expect.objectContaining({
					clientType: "cli",
					displayName: "KerberoSec CLI",
				}),
			}),
		);
	});

	it("lets core choose the backend by default", async () => {
		await sessionModule.createCliCore();

		expect(createCore).toHaveBeenCalledWith(
			expect.objectContaining({
				hub: expect.objectContaining({
					clientType: "cli",
					displayName: "KerberoSec CLI",
				}),
			}),
		);
		expect(createCore).toHaveBeenCalledWith(
			expect.not.objectContaining({
				backendMode: expect.anything(),
			}),
		);
		expect(featureFlagsPoll).toHaveBeenCalledTimes(1);
	});

	it("forces the local backend when requested by the caller", async () => {
		await sessionModule.createCliCore({ forceLocalBackend: true });

		expect(createCore).toHaveBeenCalledWith(
			expect.objectContaining({
				backendMode: "local",
			}),
		);
	});

	it("passes an explicit hub backend through to core", async () => {
		await sessionModule.createCliCore({ backendMode: "hub" });

		expect(createCore).toHaveBeenCalledWith(
			expect.objectContaining({
				backendMode: "hub",
				hub: expect.objectContaining({
					clientType: "cli",
					displayName: "KerberoSec CLI",
				}),
			}),
		);
	});

	it("keeps forceLocalBackend as the strongest local override", async () => {
		await sessionModule.createCliCore({
			backendMode: "hub",
			forceLocalBackend: true,
		});

		expect(createCore).toHaveBeenCalledWith(
			expect.objectContaining({
				backendMode: "local",
			}),
		);
		expect(createCore).toHaveBeenCalledWith(
			expect.not.objectContaining({
				hub: expect.anything(),
			}),
		);
	});

	it("keeps hub client metadata when runtime capabilities are provided", async () => {
		const submit = vi.fn();
		await sessionModule.createCliCore({
			capabilities: {
				toolExecutors: { submit },
			},
		});

		expect(createCore).toHaveBeenCalledWith(
			expect.objectContaining({
				capabilities: expect.objectContaining({
					toolExecutors: { submit },
				}),
				hub: expect.objectContaining({
					clientType: "cli",
					displayName: "KerberoSec CLI",
				}),
			}),
		);
	});

	it("passes env-managed routing through to core when local is requested via env", async () => {
		process.env.KERBEROSEC_SESSION_BACKEND_MODE = "local";

		await sessionModule.createCliCore();

		expect(createCore).toHaveBeenCalledWith(
			expect.not.objectContaining({
				backendMode: expect.anything(),
			}),
		);
	});

	it("passes env-managed routing through to core when vcr is enabled", async () => {
		process.env.KERBEROSEC_VCR = "1";

		await sessionModule.createCliCore();

		expect(createCore).toHaveBeenCalledWith(
			expect.not.objectContaining({
				backendMode: expect.anything(),
			}),
		);
	});

	it("logs the selected backend through the injected logger", async () => {
		const logger = {
			debug: vi.fn(),
			log: vi.fn(),
			error: vi.fn(),
		};

		await sessionModule.createCliCore({ logger });

		expect(logger.log).toHaveBeenCalledWith(
			"CLI core runtime routing selected",
			{
				backendMode: "env-managed",
				rpcAddress: "127.0.0.1:25463",
				forceLocalBackend: false,
			},
		);
	});

	it("lists sessions through core history with manifest fallback enabled", async () => {
		listSessionHistoryFromBackend.mockResolvedValueOnce([
			{
				sessionId: "sess_1",
				workspaceRoot: "/tmp/workspace",
			},
			{
				sessionId: "sess_2",
				workspaceRoot: "/tmp/other-workspace",
			},
		]);

		const rows = await sessionModule.listSessions(25, {
			workspaceRoot: "/tmp/workspace",
		});

		expect(resolveSessionBackend).toHaveBeenCalledWith({
			telemetry: undefined,
		});
		expect(listSessionHistoryFromBackend).toHaveBeenCalledWith(
			{ kind: "backend" },
			{
				limit: 25,
				includeManifestFallback: true,
				hydrate: false,
				includeSubagents: false,
			},
		);
		expect(createCore).not.toHaveBeenCalled();
		expect(rows).toEqual([
			{
				sessionId: "sess_1",
				workspaceRoot: "/tmp/workspace",
			},
			{
				sessionId: "sess_2",
				workspaceRoot: "/tmp/other-workspace",
			},
		]);
	});

	it("filters out empty and unreadable sessions", async () => {
		listSessionHistoryFromBackend.mockResolvedValueOnce([
			{ sessionId: "sess_full", workspaceRoot: "/tmp/workspace" },
		]);

		const rows = await sessionModule.listSessions(25, {
			workspaceRoot: "/tmp/workspace",
		});

		expect(listSessionHistoryFromBackend).toHaveBeenCalledWith(
			{ kind: "backend" },
			{
				limit: 25,
				includeManifestFallback: true,
				hydrate: false,
				includeSubagents: false,
			},
		);
		expect(rows).toEqual([
			{ sessionId: "sess_full", workspaceRoot: "/tmp/workspace" },
		]);
	});
});
