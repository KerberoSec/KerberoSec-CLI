import type { ApiConfiguration } from "@shared/api"
import { describe, expect, it } from "vitest"
import { getModeSpecificFields } from "../providerUtils"

describe("getModeSpecificFields", () => {
	it("returns undefined provider-specific fields when apiConfiguration is undefined", () => {
		const fields = getModeSpecificFields(undefined, "plan")
		expect(fields.apiProvider).toBeUndefined()
		expect(fields.openRouterModelId).toBeUndefined()
		expect(fields.kerberosecModelId).toBeUndefined()
	})

	it("isolates each provider's saved fields so cross-provider state does not leak", () => {
		// Reproduces the original kerberosec/openrouter conflation guard: even when
		// the user has stale OpenRouter selection state and is now configured
		// for KerberoSec, KerberoSec-specific fields stay undefined until the user
		// commits a KerberoSec selection.
		const apiConfiguration: ApiConfiguration = {
			planModeApiProvider: "kerberosec",
			planModeOpenRouterModelId: "openrouter/some-model",
			planModeOpenRouterModelInfo: { description: "stale OpenRouter model" },
		} as ApiConfiguration

		const fields = getModeSpecificFields(apiConfiguration, "plan")

		expect(fields.apiProvider).toBe("kerberosec")
		expect(fields.openRouterModelId).toBe("openrouter/some-model")
		expect(fields.kerberosecModelId).toBeUndefined()
		expect(fields.kerberosecModelInfo).toBeUndefined()
	})
})
