import type { OnboardingModel, OnboardingModelGroup } from "@shared/proto/kerberosec/state"
import { describe, expect, it } from "vitest"
import {
	KERBEROSECPASS_GROUP,
	getKerberoSecUIOnboardingGroups,
	getOnboardingGroupDisplayName,
	getRecommendedModelsData,
} from "../data-models"

function model(id: string, group: string): OnboardingModel {
	return {
		id,
		name: id,
		group,
		badge: "",
		score: 0,
		latency: 0,
		info: undefined,
	} as OnboardingModel
}

function groupOf(models: OnboardingModel[]): OnboardingModelGroup {
	return { models } as OnboardingModelGroup
}

describe("getKerberoSecUIOnboardingGroups", () => {
	it("buckets KerberoSecPass models into the kerberosecPass group", () => {
		const result = getKerberoSecUIOnboardingGroups(
			groupOf([
				model("kerberosec-pass/glm-5.2", KERBEROSECPASS_GROUP),
				model("free-model", "free"),
				model("anthropic/claude", "frontier"),
				model("z-ai/glm", "open source"),
			]),
		)

		expect(result.kerberosecPass).toHaveLength(1)
		expect(result.kerberosecPass[0].group).toBe(KERBEROSECPASS_GROUP)
		expect(result.kerberosecPass[0].models.map((m) => m.id)).toEqual(["kerberosec-pass/glm-5.2"])
		expect(result.free[0].models.map((m) => m.id)).toEqual(["free-model"])
		expect(result.power.flatMap((g) => g.models.map((m) => m.id))).toEqual(["anthropic/claude", "z-ai/glm"])
	})

	it("does not bucket kerberosec-pass ids without a KerberoSecPass group label", () => {
		const result = getKerberoSecUIOnboardingGroups(groupOf([model("kerberosec-pass/glm-5.2", "frontier")]))

		expect(result.kerberosecPass).toEqual([])
	})

	it("returns an empty kerberosecPass group when no KerberoSecPass models are present", () => {
		const result = getKerberoSecUIOnboardingGroups(groupOf([model("free-model", "free")]))
		expect(result.kerberosecPass).toEqual([])
	})
})

describe("getRecommendedModelsData", () => {
	it("includes KerberoSecPass-only responses without depending on feature-flag timing", () => {
		const result = getRecommendedModelsData({
			recommended: [],
			free: [],
			kerberosecPass: [{ id: "kerberosec-pass/glm-5.2", name: "GLM 5.1", description: "", tags: [] }],
		})

		expect(result?.kerberosecPass.map((model) => model.id)).toEqual(["kerberosec-pass/glm-5.2"])
	})

	it("keeps classic recommended/free responses and KerberoSecPass responses", () => {
		const result = getRecommendedModelsData({
			recommended: [{ id: "anthropic/claude", name: "Claude", description: "", tags: [] }],
			free: [{ id: "free-model", name: "Free", description: "", tags: [] }],
			kerberosecPass: [{ id: "kerberosec-pass/glm-5.2", name: "GLM 5.1", description: "", tags: [] }],
		})

		expect(result?.recommended.map((model) => model.id)).toEqual(["anthropic/claude"])
		expect(result?.free.map((model) => model.id)).toEqual(["free-model"])
		expect(result?.kerberosecPass.map((model) => model.id)).toEqual(["kerberosec-pass/glm-5.2"])
	})

	it("returns undefined when every recommended bucket is empty", () => {
		const result = getRecommendedModelsData({ recommended: [], free: [], kerberosecPass: [] })

		expect(result).toBeUndefined()
	})
})

describe("onboarding display labels", () => {
	it("renders the canonical KerberoSecPass group as a user-facing product name", () => {
		expect(getOnboardingGroupDisplayName(KERBEROSECPASS_GROUP)).toBe("KerberoSecPass")
		expect(getOnboardingGroupDisplayName("frontier")).toBe("frontier")
	})
})
