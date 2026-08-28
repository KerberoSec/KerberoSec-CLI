import { beforeEach, describe, expect, it, vi } from "vitest";
import { isKerberoSecAccountNotAuthenticatedResult } from "../webview/lib/kerberosec-account-state";
import type { SidecarContext } from "./types";

const kerberosecAccountServiceCtorMock = vi.hoisted(() => vi.fn());
const executeKerberoSecAccountActionMock = vi.hoisted(() => vi.fn());
const getProviderSettingsMock = vi.hoisted(() => vi.fn());
const saveProviderSettingsMock = vi.hoisted(() => vi.fn());
const resolveProviderApiKeyMock = vi.hoisted(() => vi.fn());

vi.mock("@kerberosec/core", async () => {
	const actual =
		await vi.importActual<typeof import("@kerberosec/core")>(
			"@kerberosec/core",
		);
	return {
		...actual,
		KerberoSecAccountService: class {
			constructor(options: unknown) {
				kerberosecAccountServiceCtorMock(options);
			}
		},
		executeKerberoSecAccountAction: executeKerberoSecAccountActionMock,
		ProviderSettingsManager: class {
			getProviderSettings = getProviderSettingsMock;
		},
		saveLocalProviderSettings: saveProviderSettingsMock,
		RuntimeOAuthTokenManager: class {
			resolveProviderApiKey = resolveProviderApiKeyMock;
		},
	};
});

function createContext() {
	const capture = vi.fn();
	const ctx = {
		telemetry: { capture },
		logger: { debug: vi.fn(), log: vi.fn(), error: vi.fn() },
	} as unknown as SidecarContext;
	return { ctx, capture };
}

const FETCH_ME_ARGS = {
	action: "kerberosecAccount",
	operation: "fetchMe",
} as const;

async function runKerberoSecAccountCommand(ctx: SidecarContext) {
	const { handleCommand } = await import("./commands");
	return handleCommand(ctx, "kerberosec_account", { ...FETCH_ME_ARGS });
}

beforeEach(() => {
	kerberosecAccountServiceCtorMock.mockReset();
	executeKerberoSecAccountActionMock.mockReset();
	getProviderSettingsMock.mockReset();
	saveProviderSettingsMock.mockReset();
	resolveProviderApiKeyMock.mockReset();
});

describe("kerberosec_account command auth states", () => {
	it("returns a typed not-authenticated result when signed out, without telemetry or a thrown error", async () => {
		const { ctx, capture } = createContext();
		resolveProviderApiKeyMock.mockResolvedValue(null);
		getProviderSettingsMock.mockReturnValue(undefined);

		const result = await runKerberoSecAccountCommand(ctx);

		expect(result).toEqual({
			signedIn: false,
			code: "ACCOUNT_NOT_AUTHENTICATED",
		});
		expect(isKerberoSecAccountNotAuthenticatedResult(result)).toBe(true);
		expect(executeKerberoSecAccountActionMock).not.toHaveBeenCalled();
		expect(kerberosecAccountServiceCtorMock).not.toHaveBeenCalled();
		expect(capture).not.toHaveBeenCalled();
	});

	it("runs the account action unchanged when a fresh token resolves", async () => {
		const { ctx, capture } = createContext();
		resolveProviderApiKeyMock.mockResolvedValue({
			apiKey: "fresh-token",
			refreshed: true,
		});
		getProviderSettingsMock.mockReturnValue(undefined);
		const user = { id: "user-1", email: "beatrix@kerberosec.bot" };
		executeKerberoSecAccountActionMock.mockResolvedValue(user);

		const result = await runKerberoSecAccountCommand(ctx);

		expect(result).toBe(user);
		expect(executeKerberoSecAccountActionMock).toHaveBeenCalledWith(
			expect.objectContaining(FETCH_ME_ARGS),
			expect.anything(),
		);
		const serviceOptions = kerberosecAccountServiceCtorMock.mock
			.calls[0][0] as {
			getAuthToken: () => Promise<string | undefined>;
		};
		await expect(serviceOptions.getAuthToken()).resolves.toBe("fresh-token");
		expect(capture).not.toHaveBeenCalled();
	});

	it("falls back to the persisted token silently when the refresh fails", async () => {
		const { ctx, capture } = createContext();
		resolveProviderApiKeyMock.mockRejectedValue(
			new Error("Token refresh failed: 500"),
		);
		getProviderSettingsMock.mockReturnValue({
			auth: { accessToken: "persisted-token" },
		});
		executeKerberoSecAccountActionMock.mockResolvedValue({ id: "user-1" });

		await runKerberoSecAccountCommand(ctx);

		const serviceOptions = kerberosecAccountServiceCtorMock.mock
			.calls[0][0] as {
			getAuthToken: () => Promise<string | undefined>;
		};
		await expect(serviceOptions.getAuthToken()).resolves.toBe(
			"persisted-token",
		);
		expect(capture).not.toHaveBeenCalled();
	});

	it("reports one auth refresh soft-failure event when the refresh fails and no fallback token exists", async () => {
		const { ctx, capture } = createContext();
		const refreshError = new Error(
			'OAuth credentials for provider "kerberosec" are no longer valid. Re-run authentication for this provider.',
		);
		refreshError.name = "OAuthReauthRequiredError";
		resolveProviderApiKeyMock.mockRejectedValue(refreshError);
		getProviderSettingsMock.mockReturnValue(undefined);

		const result = await runKerberoSecAccountCommand(ctx);

		expect(isKerberoSecAccountNotAuthenticatedResult(result)).toBe(true);
		expect(executeKerberoSecAccountActionMock).not.toHaveBeenCalled();
		expect(capture).toHaveBeenCalledTimes(1);
		expect(capture).toHaveBeenCalledWith({
			event: "user.auth_refresh_soft_failure",
			properties: expect.objectContaining({
				provider: "kerberosec",
				errorName: "OAuthReauthRequiredError",
				errorCode: "desktop_refresh_failed_no_fallback_token",
			}),
		});
	});
});

/**
 * Feature-flag identity is otherwise resolved once at sidecar startup, so these
 * cover the mid-session transitions that would otherwise keep evaluating flags
 * against a stale account (or the device).
 */
describe("kerberosec_account keeps feature-flag identity in sync", () => {
	async function currentFlagsUserId(): Promise<string | undefined> {
		const { getDesktopFeatureFlagsContext } = await import("./feature-flags");
		return getDesktopFeatureFlagsContext().userId ?? undefined;
	}

	async function runOperation(ctx: SidecarContext, operation: string) {
		const { handleCommand } = await import("./commands");
		return handleCommand(ctx, "kerberosec_account", {
			action: "kerberosecAccount",
			operation,
		});
	}

	beforeEach(async () => {
		const { resetDesktopFeatureFlagsForTesting } = await import(
			"./feature-flags"
		);
		resetDesktopFeatureFlagsForTesting();
	});

	it("adopts the account identity on login", async () => {
		const { ctx } = createContext();
		resolveProviderApiKeyMock.mockResolvedValue({ apiKey: "token" });
		getProviderSettingsMock.mockReturnValue({});
		executeKerberoSecAccountActionMock.mockResolvedValue({
			id: "acct-1",
			email: "dev@example.com",
		});

		await runOperation(ctx, "fetchMe");

		expect(await currentFlagsUserId()).toBe("acct-1");
	});

	it("leaves the signed-in identity intact across an organization switch", async () => {
		const { ctx } = createContext();
		resolveProviderApiKeyMock.mockResolvedValue({ apiKey: "token" });
		getProviderSettingsMock.mockReturnValue({});
		executeKerberoSecAccountActionMock.mockResolvedValue({ id: "acct-1" });
		await runOperation(ctx, "fetchMe");
		expect(await currentFlagsUserId()).toBe("acct-1");

		executeKerberoSecAccountActionMock.mockResolvedValue(undefined);
		getProviderSettingsMock.mockReturnValue({
			auth: { accountId: "stale-acct" },
		});

		await runOperation(ctx, "switchAccount");

		expect(await currentFlagsUserId()).toBe("acct-1");
	});

	it("adopts the identity from the refetch that follows a switch", async () => {
		const { ctx } = createContext();
		resolveProviderApiKeyMock.mockResolvedValue({ apiKey: "token" });
		getProviderSettingsMock.mockReturnValue({});
		executeKerberoSecAccountActionMock.mockResolvedValue({ id: "acct-1" });
		await runOperation(ctx, "fetchMe");

		executeKerberoSecAccountActionMock.mockResolvedValue(undefined);
		await runOperation(ctx, "switchAccount");

		executeKerberoSecAccountActionMock.mockResolvedValue({ id: "acct-2" });
		await runOperation(ctx, "fetchMe");

		expect(await currentFlagsUserId()).toBe("acct-2");
	});

	it("clears the account identity on logout", async () => {
		const { ctx } = createContext();
		resolveProviderApiKeyMock.mockResolvedValue({ apiKey: "token" });
		getProviderSettingsMock.mockReturnValue({});
		executeKerberoSecAccountActionMock.mockResolvedValue({ id: "acct-1" });
		await runOperation(ctx, "fetchMe");
		expect(await currentFlagsUserId()).toBe("acct-1");

		// Signed out: no token resolves.
		resolveProviderApiKeyMock.mockResolvedValue(null);
		getProviderSettingsMock.mockReturnValue(undefined);

		await runOperation(ctx, "fetchMe");

		expect(await currentFlagsUserId()).toBeUndefined();
	});

	it("clears the identity when sign-out blanks the kerberosec auth settings", async () => {
		const { ctx } = createContext();
		resolveProviderApiKeyMock.mockResolvedValue({ apiKey: "token" });
		getProviderSettingsMock.mockReturnValue({});
		executeKerberoSecAccountActionMock.mockResolvedValue({ id: "acct-1" });
		await runOperation(ctx, "fetchMe");
		expect(await currentFlagsUserId()).toBe("acct-1");

		// What the Sign Out button actually sends: a settings write that blanks
		// the auth block. No account command is involved.
		getProviderSettingsMock.mockReturnValue({ auth: { accountId: "" } });
		saveProviderSettingsMock.mockReturnValue({
			providerId: "kerberosec",
			enabled: true,
			settingsPath: "/tmp/settings.json",
		});
		const { handleCommand } = await import("./commands");
		await handleCommand(ctx, "save_provider_settings", {
			provider: "kerberosec",
			api_key: "",
			settings: { auth: { accessToken: "", refreshToken: "", accountId: "" } },
		});

		expect(await currentFlagsUserId()).toBeUndefined();
	});

	it("ignores settings writes for other providers", async () => {
		const { ctx } = createContext();
		resolveProviderApiKeyMock.mockResolvedValue({ apiKey: "token" });
		getProviderSettingsMock.mockReturnValue({});
		executeKerberoSecAccountActionMock.mockResolvedValue({ id: "acct-1" });
		await runOperation(ctx, "fetchMe");

		saveProviderSettingsMock.mockReturnValue({
			providerId: "anthropic",
			enabled: true,
			settingsPath: "/tmp/settings.json",
		});
		const { handleCommand } = await import("./commands");
		await handleCommand(ctx, "save_provider_settings", {
			provider: "anthropic",
			api_key: "sk-test",
		});

		// Saving an unrelated provider must not disturb the KerberoSec identity.
		expect(await currentFlagsUserId()).toBe("acct-1");
	});

	it("falls back to the device distinct ID after logout", async () => {
		const { ctx } = createContext();
		const { getDesktopFeatureFlagsContext } = await import("./feature-flags");
		const deviceId = getDesktopFeatureFlagsContext().distinctId;

		resolveProviderApiKeyMock.mockResolvedValue({ apiKey: "token" });
		getProviderSettingsMock.mockReturnValue({});
		executeKerberoSecAccountActionMock.mockResolvedValue({ id: "acct-1" });
		await runOperation(ctx, "fetchMe");
		expect(getDesktopFeatureFlagsContext().distinctId).toBe("acct-1");

		resolveProviderApiKeyMock.mockResolvedValue(null);
		getProviderSettingsMock.mockReturnValue(undefined);
		await runOperation(ctx, "fetchMe");

		// Not left on the previous account's ID.
		expect(getDesktopFeatureFlagsContext().distinctId).toBe(deviceId);
	});
});
