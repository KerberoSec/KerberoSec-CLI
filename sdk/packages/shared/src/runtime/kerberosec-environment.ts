export const KERBEROSEC_ENVIRONMENT_ENV = "KERBEROSEC_ENVIRONMENT";
export const KERBEROSEC_ENVIRONMENT_OVERRIDE_ENV =
	"KERBEROSEC_ENVIRONMENT_OVERRIDE";

export type KerberoSecEnvironment = "production" | "staging" | "local";

export interface KerberoSecEnvironmentConfig {
	readonly environment: KerberoSecEnvironment;
	readonly appBaseUrl: string;
	readonly apiBaseUrl: string;
	readonly mcpBaseUrl: string;
	readonly workOsClientId: string;
}

export const KERBEROSEC_ENVIRONMENTS: Readonly<
	Record<KerberoSecEnvironment, KerberoSecEnvironmentConfig>
> = {
	production: {
		environment: "production",
		appBaseUrl: "https://app.kerberosec.bot",
		apiBaseUrl: "https://api.kerberosec.bot",
		mcpBaseUrl: "https://api.kerberosec.bot/v1/mcp",
		workOsClientId: "client_01K3A541FN8TA3EPPHTD2325AR",
	},
	staging: {
		environment: "staging",
		appBaseUrl: "https://staging-app.kerberosec.bot",
		apiBaseUrl: "https://core-api.staging.int.kerberosec.bot",
		mcpBaseUrl: "https://core-api.staging.int.kerberosec.bot/v1/mcp",
		workOsClientId: "client_01K3A5415VF6QBQBG3XYCW91G6",
	},
	local: {
		environment: "local",
		appBaseUrl: "http://localhost:3000",
		apiBaseUrl: "http://localhost:7777",
		mcpBaseUrl: "http://localhost:7777/v1/mcp",
		workOsClientId: "client_01K6XQAY7JK6T5HXVSZW2S5VYK",
	},
};

export const DEFAULT_KERBEROSEC_ENVIRONMENT: KerberoSecEnvironment =
	"production";

export interface ResolveKerberoSecEnvironmentOptions {
	env?: Partial<NodeJS.ProcessEnv>;
}

function normalizeKerberoSecEnvironment(
	value: string | undefined,
): KerberoSecEnvironment | undefined {
	const normalized = value?.trim().toLowerCase();
	if (
		normalized === "production" ||
		normalized === "staging" ||
		normalized === "local"
	) {
		return normalized;
	}
	return undefined;
}

function readProcessEnv(): NodeJS.ProcessEnv {
	// `process` may be absent in browser-style runtimes (this module ships
	// from the browser entry of `@kerberosec/shared`). Treat its absence as "no
	// env vars set" so callers always get a deterministic default.
	if (typeof process === "undefined" || !process?.env) {
		return {};
	}
	return process.env;
}

export function resolveKerberoSecEnvironment(): KerberoSecEnvironment {
	const env = readProcessEnv();
	return (
		normalizeKerberoSecEnvironment(env[KERBEROSEC_ENVIRONMENT_OVERRIDE_ENV]) ??
		normalizeKerberoSecEnvironment(env[KERBEROSEC_ENVIRONMENT_ENV]) ??
		DEFAULT_KERBEROSEC_ENVIRONMENT
	);
}

function getEnvConfig(env?: KerberoSecEnvironment) {
	if (typeof env === "string") {
		return KERBEROSEC_ENVIRONMENTS[env];
	}
	return KERBEROSEC_ENVIRONMENTS[resolveKerberoSecEnvironment()];
}

function applyConfigOverrides(
	config: KerberoSecEnvironmentConfig,
	env: NodeJS.ProcessEnv,
): KerberoSecEnvironmentConfig {
	if (env.KERBEROSEC_API_BASE_URL) {
		config = {
			...config,
			apiBaseUrl: env.KERBEROSEC_API_BASE_URL,
			mcpBaseUrl: `${env.KERBEROSEC_API_BASE_URL}/v1/mcp`,
		};
	}

	return config;
}

export function getKerberoSecEnvironmentConfig(
	env?: KerberoSecEnvironment,
): KerberoSecEnvironmentConfig {
	const config = getEnvConfig(env);

	return applyConfigOverrides(config, readProcessEnv());
}
