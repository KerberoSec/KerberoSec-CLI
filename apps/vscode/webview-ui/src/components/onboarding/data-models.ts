import type { KerberoSecRecommendedModel, OpenRouterModelInfo } from "@shared/proto/kerberosec/models"
import type { OnboardingModel, OnboardingModelGroup } from "@shared/proto/kerberosec/state"

export const KERBEROSECPASS_GROUP = "kerberosec-pass"

export interface RecommendedModelsData {
	recommended: KerberoSecRecommendedModel[]
	free: KerberoSecRecommendedModel[]
	kerberosecPass: KerberoSecRecommendedModel[]
}

type RecommendedModelsResponseLike = {
	recommended?: KerberoSecRecommendedModel[]
	free?: KerberoSecRecommendedModel[]
	kerberosecPass?: KerberoSecRecommendedModel[]
}

export function getRecommendedModelsData(response: RecommendedModelsResponseLike): RecommendedModelsData | undefined {
	const recommended = response.recommended ?? []
	const free = response.free ?? []
	const kerberosecPass = response.kerberosecPass ?? []

	if (recommended.length === 0 && free.length === 0 && kerberosecPass.length === 0) {
		return undefined
	}

	return { recommended, free, kerberosecPass }
}

export interface OnboardingModelsByGroup {
	kerberosecPass: ModelGroup[]
	free: ModelGroup[]
	power: ModelGroup[]
}

interface ModelGroup {
	group: string
	models: OnboardingModel[]
}

function isKerberoSecPassOnboardingModel(model: OnboardingModel): boolean {
	return model.group === KERBEROSECPASS_GROUP
}

export function getKerberoSecUIOnboardingGroups(groupedModels: OnboardingModelGroup): OnboardingModelsByGroup {
	const { models } = groupedModels

	const kerberosecPassModels = models.filter(isKerberoSecPassOnboardingModel)
	const freeModels = models.filter((m) => m.group === "free")
	const frontierModels = models.filter((m) => m.group === "frontier")
	const openSourceModels = models.filter((m) => m.group === "open source")

	return {
		kerberosecPass: kerberosecPassModels.length > 0 ? [{ group: KERBEROSECPASS_GROUP, models: kerberosecPassModels }] : [],
		free: freeModels.length > 0 ? [{ group: "free", models: freeModels }] : [],
		power: [
			...(frontierModels.length > 0 ? [{ group: "frontier", models: frontierModels }] : []),
			...(openSourceModels.length > 0 ? [{ group: "open source", models: openSourceModels }] : []),
		],
	}
}

export function getOnboardingGroupDisplayName(group: string): string {
	if (group === KERBEROSECPASS_GROUP) {
		return "KerberoSecPass"
	}
	return group
}

export function getPriceRange(modelInfo: OpenRouterModelInfo): string {
	const prompt = Number(modelInfo.inputPrice ?? 0)
	const completion = Number(modelInfo.outputPrice ?? 0)
	const cost = prompt + completion
	if (cost === 0) {
		return "Free"
	}
	if (cost < 10) {
		return "$"
	}
	if (cost > 50) {
		return "$$$"
	}
	return "$$"
}

export function getCapabilities(modelInfo: OpenRouterModelInfo): string[] {
	const capabilities = new Set<string>()
	if (modelInfo.supportsImages) {
		capabilities.add("Images")
	}
	if (modelInfo.supportsPromptCache) {
		capabilities.add("Prompt Cache")
	}
	capabilities.add("Tools")
	return Array.from(capabilities)
}

export function getSpeedLabel(latency?: number): string {
	if (!latency) {
		return "Average"
	}
	if (latency < 1) {
		return "Instant"
	}
	if (latency < 2) {
		return "Fast"
	}
	if (latency > 5) {
		return "Slow"
	}

	return "Average"
}
