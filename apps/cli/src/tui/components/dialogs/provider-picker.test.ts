import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProviderSettingsManager } from "@kerberosec/core";
import { afterEach, describe, expect, it } from "vitest";
import {
	getPersistedProviderApiKey,
	isProviderConfigured,
} from "../../../utils/provider-auth";
import {
	buildKerberoSecPassSubscriptionPageUrl,
	resolveOAuthWaitKeyAction,
	saveManualProviderApiKey,
} from "./provider-picker-helpers";

describe("resolveOAuthWaitKeyAction", () => {
	it("switches to manual API key entry on K when the fallback is available", () => {
		expect(resolveOAuthWaitKeyAction({ name: "k" }, true)).toBe("use_api_key");
	});

	it("cancels on K when the fallback is not available", () => {
		expect(resolveOAuthWaitKeyAction({ name: "k" }, false)).toBe("cancel");
	});

	it("cancels on any other unmodified key so users are never stuck waiting on a browser flow", () => {
		for (const name of ["escape", "q", "return", "space", "up", "x"]) {
			expect(resolveOAuthWaitKeyAction({ name }, true)).toBe("cancel");
			expect(resolveOAuthWaitKeyAction({ name }, false)).toBe("cancel");
		}
	});

	it("ignores modifier-held keys so holding Cmd/Ctrl to click the auth link never cancels", () => {
		expect(resolveOAuthWaitKeyAction({ name: "k", ctrl: true }, true)).toBe(
			"ignore",
		);
		expect(resolveOAuthWaitKeyAction({ name: "c", ctrl: true }, false)).toBe(
			"ignore",
		);
		expect(resolveOAuthWaitKeyAction({ name: "x", meta: true }, true)).toBe(
			"ignore",
		);
		expect(resolveOAuthWaitKeyAction({ name: "x", super: true }, false)).toBe(
			"ignore",
		);
		// A bare modifier press (empty name) is ignored, not a cancel.
		expect(resolveOAuthWaitKeyAction({ name: "" }, true)).toBe("ignore");
	});
});

describe("buildKerberoSecPassSubscriptionPageUrl", () => {
	it("opens the personal subscription page on production by default", () => {
		expect(
			buildKerberoSecPassSubscriptionPageUrl(undefined).startsWith(
				"https://app.kerberosec.bot/dashboard/subscription?personal=true",
			),
		).toBe(true);
	});

	it("keeps the configured app base URL", () => {
		expect(
			buildKerberoSecPassSubscriptionPageUrl(
				"https://staging-app.kerberosec.bot",
			).startsWith(
				"https://staging-app.kerberosec.bot/dashboard/subscription?personal=true",
			),
		).toBe(true);
	});
});

describe("saveManualProviderApiKey", () => {
	const tempDirs: string[] = [];

	afterEach(() => {
		for (const dir of tempDirs.splice(0)) {
			rmSync(dir, { force: true, recursive: true });
		}
	});

	function createManager(): ProviderSettingsManager {
		const dir = mkdtempSync(join(tmpdir(), "kerberosec-cli-provider-picker-"));
		tempDirs.push(dir);
		return new ProviderSettingsManager({
			filePath: join(dir, "providers.json"),
		});
	}

	it("clears stored OAuth tokens so the manual key takes effect", () => {
		const manager = createManager();
		manager.saveProviderSettings({
			provider: "kerberosec",
			auth: {
				accessToken: "stale-access-token",
				refreshToken: "stale-refresh-token",
				accountId: "acct_123",
			},
		});

		saveManualProviderApiKey(manager, "kerberosec", "manual-api-key");

		const settings = manager.getProviderSettings("kerberosec");
		expect(settings?.apiKey).toBe("manual-api-key");
		expect(settings?.auth?.accessToken).toBeUndefined();
		expect(settings?.auth?.refreshToken).toBeUndefined();
		expect(settings?.auth?.accountId).toBe("acct_123");
		expect(getPersistedProviderApiKey("kerberosec", settings)).toBe(
			"manual-api-key",
		);
		expect(isProviderConfigured("kerberosec", settings)).toBe(true);
	});

	it("saves kerberosec-pass keys to the shared kerberosec auth storage entry", () => {
		const manager = createManager();
		manager.saveProviderSettings({
			provider: "kerberosec",
			auth: {
				accessToken: "stale-access-token",
				refreshToken: "stale-refresh-token",
			},
		});

		saveManualProviderApiKey(manager, "kerberosec-pass", "manual-api-key");

		// kerberosec-pass inherits auth storage from the "kerberosec" entry, so the key
		// must land there and the stale tokens must be gone for both providers.
		const kerberosecSettings = manager.getProviderSettings("kerberosec");
		expect(kerberosecSettings?.apiKey).toBe("manual-api-key");
		expect(kerberosecSettings?.auth?.accessToken).toBeUndefined();

		const kerberosecPassSettings =
			manager.getProviderSettings("kerberosec-pass");
		expect(
			getPersistedProviderApiKey("kerberosec-pass", kerberosecPassSettings),
		).toBe("manual-api-key");
		expect(
			isProviderConfigured("kerberosec-pass", kerberosecPassSettings),
		).toBe(true);
	});

	it("clears stale credentials copied into a direct kerberosec-pass entry", () => {
		const manager = createManager();
		manager.saveProviderSettings({
			provider: "kerberosec",
			auth: {
				accessToken: "stale-access-token",
				refreshToken: "stale-refresh-token",
			},
		});
		// Provider switching copies the merged settings (including auth) into
		// a direct kerberosec-pass entry, which shadows the shared "kerberosec" entry.
		manager.saveProviderSettings({
			provider: "kerberosec-pass",
			apiKey: "stale-copied-key",
			auth: {
				accessToken: "stale-access-token",
				refreshToken: "stale-refresh-token",
			},
		});

		saveManualProviderApiKey(manager, "kerberosec-pass", "manual-api-key");

		const kerberosecPassSettings =
			manager.getProviderSettings("kerberosec-pass");
		expect(kerberosecPassSettings?.auth?.accessToken).toBeUndefined();
		expect(
			getPersistedProviderApiKey("kerberosec-pass", kerberosecPassSettings),
		).toBe("manual-api-key");
	});
});
