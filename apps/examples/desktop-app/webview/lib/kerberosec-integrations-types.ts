export type KerberoSecIntegration = {
	provider?: string;
	created_at?: string;
};

export type KerberoSecGitHubRepository = {
	id?: number;
	name?: string;
	full_name?: string;
	html_url?: string;
	private?: boolean;
};

export const GITHUB_INTEGRATION_PROVIDER = "github";

export function findGitHubIntegration(
	integrations: KerberoSecIntegration[],
): KerberoSecIntegration | undefined {
	return integrations.find(
		(integration) => integration?.provider === GITHUB_INTEGRATION_PROVIDER,
	);
}
