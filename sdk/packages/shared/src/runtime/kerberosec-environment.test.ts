import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	DEFAULT_KERBEROSEC_ENVIRONMENT,
	getKerberoSecEnvironmentConfig,
	KERBEROSEC_ENVIRONMENT_ENV,
	KERBEROSEC_ENVIRONMENT_OVERRIDE_ENV,
	KERBEROSEC_ENVIRONMENTS,
	resolveKerberoSecEnvironment,
} from "./kerberosec-environment";

const ENV_KEYS = [
	KERBEROSEC_ENVIRONMENT_ENV,
	KERBEROSEC_ENVIRONMENT_OVERRIDE_ENV,
	"KERBEROSEC_API_BASE_URL",
] as const;

const originalEnvValues = Object.fromEntries(
	ENV_KEYS.map((key) => [key, process.env[key]]),
);

beforeEach(() => {
	vi.unstubAllGlobals();
	for (const key of ENV_KEYS) {
		delete process.env[key];
	}
});

afterEach(() => {
	vi.unstubAllGlobals();
	for (const key of ENV_KEYS) {
		const value = originalEnvValues[key];
		if (typeof value === "string") {
			process.env[key] = value;
		} else {
			delete process.env[key];
		}
	}
});

describe("resolveKerberoSecEnvironment", () => {
	it("defaults to production when no env var is set", () => {
		expect(resolveKerberoSecEnvironment()).toBe(DEFAULT_KERBEROSEC_ENVIRONMENT);
	});

	it("reads KERBEROSEC_ENVIRONMENT from process.env", () => {
		process.env[KERBEROSEC_ENVIRONMENT_ENV] = "staging";
		expect(resolveKerberoSecEnvironment()).toBe("staging");

		process.env[KERBEROSEC_ENVIRONMENT_ENV] = "local";
		expect(resolveKerberoSecEnvironment()).toBe("local");
	});

	it("prefers KERBEROSEC_ENVIRONMENT_OVERRIDE over KERBEROSEC_ENVIRONMENT", () => {
		process.env[KERBEROSEC_ENVIRONMENT_OVERRIDE_ENV] = "local";
		process.env[KERBEROSEC_ENVIRONMENT_ENV] = "staging";

		expect(resolveKerberoSecEnvironment()).toBe("local");
	});

	it("normalizes case and surrounding whitespace", () => {
		process.env[KERBEROSEC_ENVIRONMENT_ENV] = "  STAGING  ";

		expect(resolveKerberoSecEnvironment()).toBe("staging");
	});

	it("ignores unknown values and falls through to the next source", () => {
		process.env[KERBEROSEC_ENVIRONMENT_OVERRIDE_ENV] = "qa";
		process.env[KERBEROSEC_ENVIRONMENT_ENV] = "staging";
		expect(resolveKerberoSecEnvironment()).toBe("staging");

		delete process.env[KERBEROSEC_ENVIRONMENT_OVERRIDE_ENV];
		process.env[KERBEROSEC_ENVIRONMENT_ENV] = "qa";
		expect(resolveKerberoSecEnvironment()).toBe(DEFAULT_KERBEROSEC_ENVIRONMENT);
	});

	it("defaults to production when process is unavailable", () => {
		vi.stubGlobal("process", undefined);

		expect(resolveKerberoSecEnvironment()).toBe(DEFAULT_KERBEROSEC_ENVIRONMENT);
	});
});

describe("getKerberoSecEnvironmentConfig", () => {
	it("returns the config for an explicit environment", () => {
		expect(getKerberoSecEnvironmentConfig("staging")).toBe(
			KERBEROSEC_ENVIRONMENTS.staging,
		);
		expect(getKerberoSecEnvironmentConfig("local")).toBe(
			KERBEROSEC_ENVIRONMENTS.local,
		);
		expect(getKerberoSecEnvironmentConfig("production")).toBe(
			KERBEROSEC_ENVIRONMENTS.production,
		);
	});

	it("falls back to production by default", () => {
		expect(getKerberoSecEnvironmentConfig()).toBe(
			KERBEROSEC_ENVIRONMENTS.production,
		);
	});

	it("uses the resolved process.env environment when no explicit environment is provided", () => {
		process.env[KERBEROSEC_ENVIRONMENT_ENV] = "staging";

		expect(getKerberoSecEnvironmentConfig()).toBe(
			KERBEROSEC_ENVIRONMENTS.staging,
		);
	});

	it("applies KERBEROSEC_API_BASE_URL without mutating the catalog config", () => {
		process.env.KERBEROSEC_API_BASE_URL = "http://127.0.0.1:3000";

		expect(getKerberoSecEnvironmentConfig("local")).toEqual({
			...KERBEROSEC_ENVIRONMENTS.local,
			apiBaseUrl: "http://127.0.0.1:3000",
			mcpBaseUrl: "http://127.0.0.1:3000/v1/mcp",
		});
		expect(KERBEROSEC_ENVIRONMENTS.local.apiBaseUrl).toBe(
			"http://localhost:7777",
		);
	});

	it("defaults to production when process is unavailable", () => {
		vi.stubGlobal("process", undefined);

		expect(getKerberoSecEnvironmentConfig()).toBe(
			KERBEROSEC_ENVIRONMENTS.production,
		);
	});
});

describe("KERBEROSEC_ENVIRONMENTS catalog", () => {
	it("exposes an environment field that matches its key", () => {
		for (const [key, config] of Object.entries(KERBEROSEC_ENVIRONMENTS)) {
			expect(config.environment).toBe(key);
		}
	});

	it("populates appBaseUrl, apiBaseUrl, and mcpBaseUrl for every environment", () => {
		for (const config of Object.values(KERBEROSEC_ENVIRONMENTS)) {
			expect(config.appBaseUrl).toMatch(/^https?:\/\//);
			expect(config.apiBaseUrl).toMatch(/^https?:\/\//);
			expect(config.mcpBaseUrl).toMatch(/^https?:\/\//);
		}
	});
});
