import { FALLBACK_KERBEROSEC_RECOMMENDED_MODELS, fetchKerberoSecRecommendedModels } from "@kerberosec/core"
import { KerberoSecEnv } from "@/config"
import { fetch } from "@/shared/net"

interface KerberoSecRecommendedModelData {
	id: string
	name: string
	description: string
	tags: string[]
}

export interface KerberoSecRecommendedModelsData {
	recommended: KerberoSecRecommendedModelData[]
	free: KerberoSecRecommendedModelData[]
	kerberosecPass?: KerberoSecRecommendedModelData[]
}

const RECOMMENDED_MODELS_CACHE_TTL_MS = 60 * 60 * 1000

let pendingRefresh: Promise<KerberoSecRecommendedModelsData> | null = null
let inMemoryCache: { data: KerberoSecRecommendedModelsData; timestamp: number } | null = null

export async function refreshKerberoSecRecommendedModels(): Promise<KerberoSecRecommendedModelsData> {
	if (inMemoryCache && Date.now() - inMemoryCache.timestamp <= RECOMMENDED_MODELS_CACHE_TTL_MS) {
		return inMemoryCache.data
	}

	if (pendingRefresh) {
		return pendingRefresh
	}

	pendingRefresh = (async () => {
		try {
			return await fetchAndCacheKerberoSecRecommendedModels()
		} finally {
			pendingRefresh = null
		}
	})()

	return pendingRefresh
}

export function resetKerberoSecRecommendedModelsCacheForTests(): void {
	pendingRefresh = null
	inMemoryCache = null
}

function isFallbackRecommendedModels(data: KerberoSecRecommendedModelsData): boolean {
	return JSON.stringify(data) === JSON.stringify(FALLBACK_KERBEROSEC_RECOMMENDED_MODELS)
}

async function fetchAndCacheKerberoSecRecommendedModels(): Promise<KerberoSecRecommendedModelsData> {
	// Delegate the actual HTTP fetch + response normalization + offline fallback
	// to the SDK so the CLI/JetBrains and the extension share one implementation.
	// We pass the proxy-aware fetch (per .kerberosecrules/network.md) and the
	// extension's configured API base URL. On failure the SDK returns its own
	// fallback list.
	const result = await fetchKerberoSecRecommendedModels({
		baseUrl: KerberoSecEnv.config().apiBaseUrl,
		fetchImpl: fetch,
	})

	// Only pin a populated, non-fallback result in memory for the full TTL; a
	// transient failure (SDK returns a clone of its fallback) should be retried
	// next call.
	if ((result.recommended.length > 0 || result.free.length > 0) && !isFallbackRecommendedModels(result)) {
		inMemoryCache = { data: result, timestamp: Date.now() }
	}
	return result
}
