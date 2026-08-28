import { desktopClient } from "@/lib/desktop-client";
import { isKerberoSecAccountNotAuthenticatedResult } from "@/lib/kerberosec-account-state";
import type {
	KerberoSecGitHubRepository,
	KerberoSecIntegration,
} from "@/lib/kerberosec-integrations-types";

export * from "@/lib/kerberosec-integrations-types";

export type KerberoSecIntegrationsListResult =
	| { status: "ok"; integrations: KerberoSecIntegration[] }
	| { status: "not-authenticated" };

export async function listKerberoSecIntegrations(): Promise<KerberoSecIntegrationsListResult> {
	const result = await desktopClient.invoke("kerberosec_integrations", {
		operation: "list",
	});
	if (isKerberoSecAccountNotAuthenticatedResult(result)) {
		return { status: "not-authenticated" };
	}
	return {
		status: "ok",
		integrations: Array.isArray(result)
			? (result as KerberoSecIntegration[])
			: [],
	};
}

export async function listKerberoSecGitHubRepositories(): Promise<
	KerberoSecGitHubRepository[]
> {
	const result = await desktopClient.invoke("kerberosec_integrations", {
		operation: "listGitHubRepositories",
	});
	return Array.isArray(result) ? (result as KerberoSecGitHubRepository[]) : [];
}

export async function fetchGitHubInstallUrl(): Promise<string> {
	const result = await desktopClient.invoke("kerberosec_integrations", {
		operation: "githubInstallUrl",
	});
	if (isKerberoSecAccountNotAuthenticatedResult(result)) {
		throw new Error("sign in to your KerberoSec account first");
	}
	const url = (result as { url?: unknown } | null)?.url;
	if (typeof url !== "string" || !url.trim()) {
		throw new Error("no GitHub install URL was returned");
	}
	return url;
}
