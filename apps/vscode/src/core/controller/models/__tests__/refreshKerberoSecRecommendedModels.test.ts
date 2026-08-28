import * as sdkCore from "@kerberosec/core"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { KerberoSecEnv } from "@/config"
import {
	refreshKerberoSecRecommendedModels,
	resetKerberoSecRecommendedModelsCacheForTests,
} from "../refreshKerberoSecRecommendedModels"

// The HTTP fetch + normalization + offline fallback lives in the SDK
// (`@kerberosec/core` `fetchKerberoSecRecommendedModels`). These tests cover the
// extension-side wrapper: delegation to the SDK and in-memory caching. There is
// intentionally no feature-flag gate here; onboarding must not race against the
// remote-config cache and accidentally keep the hardcoded fallback list.

describe("refreshKerberoSecRecommendedModels", () => {
	beforeEach(() => {
		resetKerberoSecRecommendedModelsCacheForTests()
		// KerberoSecEnv is not initialized in the unit-test environment; the wrapper
		// passes its apiBaseUrl to the SDK, so provide a stable stub.
		vi.spyOn(KerberoSecEnv, "config").mockReturnValue({ apiBaseUrl: "https://api.kerberosec-test.bot" } as ReturnType<
			typeof KerberoSecEnv.config
		>)
	})

	afterEach(() => {
		resetKerberoSecRecommendedModelsCacheForTests()
		vi.restoreAllMocks()
	})

	it("delegates to the SDK fetch", async () => {
		const sdkResult = {
			recommended: [{ id: "anthropic/claude-sonnet-4.6", name: "Claude Sonnet 4.6", description: "Remote", tags: ["NEW"] }],
			free: [{ id: "kerberosec-free/glm-5", name: "GLM 5", description: "Remote free", tags: [] }],
			kerberosecPass: [],
		}
		const sdkSpy = vi.spyOn(sdkCore, "fetchKerberoSecRecommendedModels").mockResolvedValue(sdkResult)

		const result = await refreshKerberoSecRecommendedModels()

		expect(sdkSpy).toHaveBeenCalledTimes(1)
		expect(result).toEqual(sdkResult)
	})

	it("uses the in-memory cache after a populated upstream result", async () => {
		const sdkResult = {
			recommended: [{ id: "google/gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", description: "Remote", tags: ["NEW"] }],
			free: [],
			kerberosecPass: [],
		}
		const sdkSpy = vi.spyOn(sdkCore, "fetchKerberoSecRecommendedModels").mockResolvedValue(sdkResult)

		const firstResult = await refreshKerberoSecRecommendedModels()
		const secondResult = await refreshKerberoSecRecommendedModels()

		expect(sdkSpy).toHaveBeenCalledTimes(1)
		expect(secondResult).toEqual(firstResult)
	})

	it("does not cache the SDK fallback result", async () => {
		const sdkFallbackClone = structuredClone(sdkCore.FALLBACK_KERBEROSEC_RECOMMENDED_MODELS)
		const sdkSpy = vi
			.spyOn(sdkCore, "fetchKerberoSecRecommendedModels")
			.mockResolvedValueOnce(sdkFallbackClone)
			.mockResolvedValueOnce({
				recommended: [
					{ id: "anthropic/claude-sonnet-4.6", name: "Claude Sonnet 4.6", description: "Remote", tags: ["NEW"] },
				],
				free: [],
				kerberosecPass: [],
			})

		const firstResult = await refreshKerberoSecRecommendedModels()
		const secondResult = await refreshKerberoSecRecommendedModels()

		expect(sdkSpy).toHaveBeenCalledTimes(2)
		expect(firstResult).toEqual(sdkCore.FALLBACK_KERBEROSEC_RECOMMENDED_MODELS)
		expect(secondResult).not.toEqual(sdkCore.FALLBACK_KERBEROSEC_RECOMMENDED_MODELS)
	})
})
