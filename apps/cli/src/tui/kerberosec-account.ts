import {
	formatProviderOAuthApiKey,
	getPersistedProviderApiKey,
	getProviderOAuthCredentialsFromSettings,
	getValidKerberoSecCredentials,
	type KerberoSecAccountBalance,
	type KerberoSecAccountOrganization,
	type KerberoSecAccountOrganizationBalance,
	KerberoSecAccountService,
	type KerberoSecAccountUser,
	type KerberoSecSubscriptionPlan,
	type ProviderSettings,
	ProviderSettingsManager,
	saveLocalProviderOAuthCredentials,
	type UserCurrentPlan,
} from "@kerberosec/core";
import { getKerberoSecEnvironmentConfig } from "@kerberosec/shared";
import { formatCreditBalance, normalizeCreditBalance } from "../utils/output";
import { identifyTelemetryAccount } from "../utils/telemetry";
import type { Config } from "../utils/types";

export const KERBEROSEC_CREDITS_DASHBOARD_URL =
	"https://app.kerberosec.bot/dashboard/account?tab=credits";

type KerberoSecAccountConfig = Pick<Config, "apiKey" | "logger" | "providerId">;

const KERBEROSEC_PASS_PROVIDER_ID = "kerberosec-pass";

export interface KerberoSecAccountSnapshot {
	user: KerberoSecAccountUser;
	balance: KerberoSecAccountBalance;
	organizationBalance: KerberoSecAccountOrganizationBalance | null;
	organizations: KerberoSecAccountOrganization[];
	activeOrganization: KerberoSecAccountOrganization | null;
	displayedBalance: number;
}

export function formatKerberoSecCredits(value: number): string {
	return formatCreditBalance(normalizeCreditBalance(value));
}

// FIXME: These message checks are temporary until structured error types are
// passed through to the CLI instead of plain error strings.
export function isKerberoSecAccountAuthErrorMessage(message: string): boolean {
	const normalized = message.trim().toLowerCase();
	return (
		normalized === "no kerberosec account auth token found" ||
		normalized.includes("requires re-authentication")
	);
}

export function isKerberoSecAccountCreditsErrorMessage(
	message: string,
): boolean {
	const normalized = message.trim().toLowerCase();
	// The KerberoSec API's 402 response carries `code: "insufficient_credits"` and
	// the message "Not enough credits available". Depending on how much of the
	// payload survives error extraction, the CLI may see the raw JSON blob or
	// just the human-readable message, so match both. The
	// "insufficient balance" pair is an older backend phrasing kept for safety.
	return (
		normalized.includes("insufficient_credits") ||
		normalized.includes("not enough credits") ||
		(normalized.includes("insufficient balance") &&
			normalized.includes("kerberosec credits balance"))
	);
}

function resolveAccountApiBaseUrl(input: {
	kerberosecApiBaseUrl?: string;
	kerberosecProviderSettings?: ProviderSettings;
}): string {
	const settingsBaseUrl = input.kerberosecProviderSettings?.baseUrl?.trim();
	if (settingsBaseUrl) {
		return settingsBaseUrl;
	}
	const configuredBaseUrl = input.kerberosecApiBaseUrl?.trim();
	if (configuredBaseUrl) {
		return configuredBaseUrl;
	}
	return getKerberoSecEnvironmentConfig().apiBaseUrl;
}

function resolveKerberoSecAccountAuthToken(input: {
	config: KerberoSecAccountConfig;
	kerberosecProviderSettings?: ProviderSettings;
}): string | undefined {
	const configApiKey =
		input.config.providerId === "kerberosec" ? input.config.apiKey.trim() : "";
	return (
		getPersistedProviderApiKey(
			"kerberosec",
			input.kerberosecProviderSettings,
		) ||
		configApiKey ||
		undefined
	);
}

async function resolveValidKerberoSecAccountAuthToken(input: {
	config: KerberoSecAccountConfig;
	kerberosecProviderSettings?: ProviderSettings;
	manager: ProviderSettingsManager;
	apiBaseUrl: string;
}): Promise<string | undefined> {
	const settings = input.kerberosecProviderSettings;
	const credentials = settings
		? getProviderOAuthCredentialsFromSettings("kerberosec", settings)
		: null;
	if (settings && credentials) {
		const nextCredentials = await getValidKerberoSecCredentials(credentials, {
			apiBaseUrl: input.apiBaseUrl,
		});
		if (!nextCredentials) {
			throw new Error(
				"KerberoSec account requires re-authentication. Run kerberosec auth kerberosec.",
			);
		}
		const nextAccessToken = formatProviderOAuthApiKey(
			"kerberosec",
			nextCredentials,
		);
		if (nextCredentials !== credentials) {
			saveLocalProviderOAuthCredentials(
				input.manager,
				"kerberosec",
				settings,
				nextCredentials,
				{ setLastUsed: false },
			);
		}
		return nextAccessToken;
	}
	return resolveKerberoSecAccountAuthToken({
		config: input.config,
		kerberosecProviderSettings: settings,
	});
}

export async function createKerberoSecAccountService(input: {
	config: KerberoSecAccountConfig;
	kerberosecApiBaseUrl?: string;
	kerberosecProviderSettings?: ProviderSettings;
	providerSettingsManager?: ProviderSettingsManager;
}): Promise<KerberoSecAccountService | undefined> {
	const manager =
		input.providerSettingsManager ?? new ProviderSettingsManager();
	const settings =
		manager.getProviderSettings("kerberosec") ??
		input.kerberosecProviderSettings;
	const apiBaseUrl = resolveAccountApiBaseUrl({
		kerberosecApiBaseUrl: input.kerberosecApiBaseUrl,
		kerberosecProviderSettings: settings,
	});
	const authToken = await resolveValidKerberoSecAccountAuthToken({
		config: input.config,
		kerberosecProviderSettings: settings,
		manager,
		apiBaseUrl,
	});
	if (!authToken) {
		return undefined;
	}
	return new KerberoSecAccountService({
		apiBaseUrl,
		getAuthToken: async () => authToken,
	});
}

/**
 * Persist the active organization so headless runs and the hub daemon can
 * attach it to telemetry identity. Personal account clears stale org fields.
 */
function persistKerberoSecOrganizationContext(
	activeOrganization: KerberoSecAccountOrganization | null,
	userId: string,
): void {
	try {
		const manager = new ProviderSettingsManager();
		const persisted = manager.getProviderSettings("kerberosec");
		if (!persisted) {
			return;
		}
		manager.saveProviderSettings(
			{
				...persisted,
				auth: {
					...persisted.auth,
					accountId: persisted.auth?.accountId ?? userId,
					organizationId: activeOrganization?.organizationId,
					organizationName: activeOrganization?.name,
					memberId: activeOrganization?.memberId,
				},
			},
			{ setLastUsed: false },
		);
	} catch {
		// Best-effort only.
	}
}

export async function loadKerberoSecAccountSnapshot(input: {
	config: KerberoSecAccountConfig;
	kerberosecApiBaseUrl?: string;
	kerberosecProviderSettings?: ProviderSettings;
}): Promise<KerberoSecAccountSnapshot> {
	const service = await createKerberoSecAccountService(input);
	if (!service) {
		throw new Error("No KerberoSec account auth token found");
	}

	const user = await service.fetchMe();
	const organizations = user.organizations ?? [];
	const activeOrganization =
		organizations.find((organization) => organization.active) ?? null;
	const [balance, organizationBalance] = await Promise.all([
		service.fetchBalance(user.id),
		activeOrganization
			? service.fetchOrganizationBalance(activeOrganization.organizationId)
			: Promise.resolve(null),
	]);
	const displayedBalance = activeOrganization
		? (organizationBalance?.balance ?? balance.balance)
		: balance.balance;
	const accountContext = {
		id: user.id,
		email: user.email,
		provider: "kerberosec",
		organizationId: activeOrganization?.organizationId,
		organizationName: activeOrganization?.name,
		memberId: activeOrganization?.memberId,
	};
	identifyTelemetryAccount(accountContext, input.config.logger);
	persistKerberoSecOrganizationContext(activeOrganization, user.id);

	return {
		user,
		balance,
		organizationBalance,
		organizations,
		activeOrganization,
		displayedBalance,
	};
}

export async function switchKerberoSecAccount(input: {
	config: KerberoSecAccountConfig;
	organizationId?: string | null;
	kerberosecApiBaseUrl?: string;
	kerberosecProviderSettings?: ProviderSettings;
}): Promise<void> {
	const service = await createKerberoSecAccountService(input);
	if (!service) {
		throw new Error("No KerberoSec account auth token found");
	}
	await service.switchAccount(input.organizationId);
}

export async function loadIndividualSubscriptionPlans(input: {
	config: KerberoSecAccountConfig;
	kerberosecApiBaseUrl?: string;
	kerberosecProviderSettings?: ProviderSettings;
}): Promise<KerberoSecSubscriptionPlan[]> {
	const service = await createKerberoSecAccountService(input);
	if (!service) {
		throw new Error("No KerberoSec account auth token found");
	}
	return service.fetchAvailableSubscriptionPlans({ type: "individual" });
}

export async function loadCurrentUserPlan(input: {
	config: KerberoSecAccountConfig;
	kerberosecApiBaseUrl?: string;
	kerberosecProviderSettings?: ProviderSettings;
}): Promise<UserCurrentPlan | undefined> {
	const service = await createKerberoSecAccountService(input);
	if (!service) {
		throw new Error("No KerberoSec account auth token found");
	}
	return service.fetchCurrentUserPlan();
}

export async function loadCurrentUserPlanFromProviderSettings(input: {
	providerSettingsManager: ProviderSettingsManager;
	kerberosecApiBaseUrl?: string;
}): Promise<UserCurrentPlan | undefined> {
	const service = await createKerberoSecAccountService({
		config: { apiKey: "", logger: undefined, providerId: "kerberosec" },
		kerberosecApiBaseUrl: input.kerberosecApiBaseUrl,
		providerSettingsManager: input.providerSettingsManager,
	});
	if (!service) {
		throw new Error("No KerberoSec account auth token found");
	}
	return service.fetchCurrentUserPlan();
}

export async function loadIndividualSubscriptionPlansFromProviderSettings(input: {
	providerSettingsManager: ProviderSettingsManager;
	kerberosecApiBaseUrl?: string;
}): Promise<KerberoSecSubscriptionPlan[]> {
	const service = await createKerberoSecAccountService({
		config: { apiKey: "", logger: undefined, providerId: "kerberosec" },
		kerberosecApiBaseUrl: input.kerberosecApiBaseUrl,
		providerSettingsManager: input.providerSettingsManager,
	});
	if (!service) {
		throw new Error("No KerberoSec account auth token found");
	}
	return service.fetchAvailableSubscriptionPlans({ type: "individual" });
}

async function onChangeToKerberoSecPass(config: KerberoSecAccountConfig) {
	try {
		await switchKerberoSecAccount({
			config: config,
			organizationId: null,
		});
	} catch (error) {
		config.logger?.debug(
			"Failed to switch KerberoSecPass to personal account",
			{
				error,
			},
		);
	}
}

export async function onProviderChange(input: {
	config: KerberoSecAccountConfig;
	providerId: string;
}): Promise<void> {
	if (input.providerId === KERBEROSEC_PASS_PROVIDER_ID) {
		return onChangeToKerberoSecPass(input.config);
	}

	return;
}

export function logoutKerberoSecAccount(
	providerSettingsManager?: ProviderSettingsManager,
): void {
	const manager = providerSettingsManager ?? new ProviderSettingsManager();
	if (
		typeof manager.read === "function" &&
		typeof manager.write === "function"
	) {
		const stored = manager.read();
		const nextProviders = { ...stored.providers };
		for (const [id, entry] of Object.entries(nextProviders)) {
			if (entry?.settings) {
				nextProviders[id] = {
					...entry,
					settings: {
						...entry.settings,
						auth: undefined,
						apiKey: undefined,
					},
					tokenSource: "manual",
				};
			}
		}
		manager.write({
			...stored,
			providers: nextProviders,
			lastUsedProvider: undefined,
		});
	} else if (typeof manager.saveProviderSettings === "function") {
		const kerberosec = manager.getProviderSettings?.("kerberosec");
		if (kerberosec) {
			manager.saveProviderSettings(
				{
					...kerberosec,
					auth: undefined,
					apiKey: undefined,
				},
				{ setLastUsed: false },
			);
		}
		const pass = manager.getProviderSettings?.("kerberosec-pass");
		if (pass) {
			manager.saveProviderSettings(
				{
					...pass,
					auth: undefined,
					apiKey: undefined,
				},
				{ setLastUsed: false },
			);
		}
	}
}
