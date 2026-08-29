import { getKerberoSecEnvironmentConfig } from "@kerberosec/shared";
import type { ModelInfo } from "./types";

export interface KerberoSecRecommendedModelEntry {
	id: string;
	name?: string;
	description?: string;
}

export interface KerberoSecRecommendedModelsPayload {
	kerberosecPass?: KerberoSecRecommendedModelEntry[];
	clinePass?: KerberoSecRecommendedModelEntry[];
	free?: KerberoSecRecommendedModelEntry[];
}

type ModelCapabilities = Pick<
	ModelInfo,
	| "contextWindow"
	| "maxInputTokens"
	| "maxTokens"
	| "capabilities"
	| "reasoningOptions"
	| "pricing"
>;

const KERBEROSEC_PASS_PROVIDER_ID = "kerberosec-pass";
const KERBEROSEC_PROVIDER_ID = "kerberosec";

const KERBEROSEC_PASS_MODEL_DEFAULTS = {
	contextWindow: 128_000,
	maxInputTokens: 128_000,
	maxTokens: 8_192,
	capabilities: ["tools", "reasoning", "temperature"],
	pricing: {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
	},
} as const satisfies ModelCapabilities;

function findORModelCapabilities(
	entry: KerberoSecRecommendedModelEntry,
	openRouterModels: Record<string, ModelInfo>,
): ModelCapabilities {
	if (!openRouterModels) {
		return KERBEROSEC_PASS_MODEL_DEFAULTS;
	}

	const modelSlug = entry.id.split("/").at(-1) ?? entry.id;

	return openRouterModels[modelSlug] || KERBEROSEC_PASS_MODEL_DEFAULTS;
}

// KerberoSec-Pass models have only the model name (and not the lab),
// so we need to look-up using glm-5.2 instead of kerberosec-pass/glm-5.2
function buildModelsNameMap(
	openrouterModels: Record<string, ModelInfo>,
): Record<string, ModelInfo> {
	const nameMap: Record<string, ModelInfo> = {};

	for (const model of Object.values(openrouterModels)) {
		const modelSlugWithoutProvider = model.id.split("/").at(-1) ?? model.id;

		nameMap[modelSlugWithoutProvider] = model;
	}

	return nameMap;
}

export function normalizeKerberoSecRecommendedProviderModels(
	payload: KerberoSecRecommendedModelsPayload,
	openRouterModels: Record<string, ModelInfo>,
): Record<string, Record<string, ModelInfo>> {
	const kerberosecPass = payload.kerberosecPass ?? payload.clinePass ?? [];
	const models: Record<string, ModelInfo> = {};
	const kerberosecFreeModels: Record<string, ModelInfo> = {};
	const openRouterModelsByName = buildModelsNameMap(openRouterModels);

	kerberosecPass.forEach((entry) => {
		const capabilities = findORModelCapabilities(entry, openRouterModelsByName);

		models[entry.id] = {
			// We should use the OR name, unless there is not one (like when using defaults)
			name: entry.name,
			...capabilities,
			id: entry.id,
			description: entry.description,
		};
	});

	// KerberoSec free models are selectable on the KerberoSecPass provider too (same API
	// underneath; they ride usage billing at $0 instead of the subscription quota).
	// Unlike pass models their ids are full OpenRouter-style ids or kerberosec-free ids,
	// so look up capabilities by full id before falling back to the slug map.
	(payload.free ?? []).forEach((entry) => {
		const capabilities =
			openRouterModels?.[entry.id] ??
			findORModelCapabilities(entry, openRouterModelsByName);
		// The recommended-models endpoint only sends slug-like names (e.g.
		// "deepseek-v4-flash"), so prefer the OpenRouter catalog's display name
		// for every free entry. Without this, the free overlay overwrites the
		// nice OpenRouter names in the merged kerberosec/kerberosec-pass catalogs and the
		// pickers end up rendering raw model ids for the Free section.
		const entryName =
			capabilities.name?.trim() || entry.name?.trim() || entry.id;
		const name = entry.id.startsWith("kerberosec-free/")
			? `${entryName} (free)`
			: entryName;

		const modelInfo = {
			...capabilities,
			name,
			id: entry.id,
			description: entry.description,
		};

		kerberosecFreeModels[entry.id] = {
			...modelInfo,
			pricing: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		};

		if (models[entry.id]) {
			return;
		}

		models[entry.id] = {
			...modelInfo,
			pricing: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		};
	});

	const result: Record<string, Record<string, ModelInfo>> = {};
	if (Object.keys(kerberosecFreeModels).length > 0) {
		result[KERBEROSEC_PROVIDER_ID] = kerberosecFreeModels;
	}
	if (kerberosecPass.length > 0) {
		result[KERBEROSEC_PASS_PROVIDER_ID] = models;
	}
	return result;
}

export async function fetchKerberoSecRecommendedModelsPayload(
	fetcher: typeof fetch = fetch,
): Promise<KerberoSecRecommendedModelsPayload> {
	const base = getKerberoSecEnvironmentConfig().apiBaseUrl;
	let response = await fetcher(
		`${base}/api/v1/ai/kerberosec/recommended-models`,
	).catch(() => undefined);
	if (!response || !response.ok) {
		response = await fetcher(
			`${base}/api/v1/ai/cline/recommended-models`,
		).catch(() => undefined);
	}
	if (!response || !response.ok) {
		throw new Error(
			`Failed to load recommended models from ${base}: HTTP ${response?.status ?? "unknown"}`,
		);
	}

	return (await response.json()) as KerberoSecRecommendedModelsPayload;
}

export async function fetchKerberoSecRecommendedProviderModels(
	fetcher: typeof fetch = fetch,
	openRouterModels: Record<string, ModelInfo>,
): Promise<Record<string, Record<string, ModelInfo>>> {
	const payload = await fetchKerberoSecRecommendedModelsPayload(fetcher);
	return normalizeKerberoSecRecommendedProviderModels(
		payload,
		openRouterModels,
	);
}
