import { buildModelInfoNameMap, type ModelInfo, resolveKerberoSecPassModelInfo } from "@shared/api"
import { KERBEROSEC_ONBOARDING_MODELS } from "@shared/kerberosec/onboarding"
import { EmptyRequest } from "@shared/proto/kerberosec/common"
import type { KerberoSecRecommendedModel } from "@shared/proto/kerberosec/models"
import type { OnboardingModel, OnboardingModelGroup } from "@shared/proto/kerberosec/state"
import { useEffect, useMemo, useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useProviderModels } from "@/hooks/useProviderModels"
import { ModelsServiceClient } from "@/services/grpc-client"
import { KERBEROSECPASS_GROUP, getRecommendedModelsData, type RecommendedModelsData } from "./data-models"

type OnboardingModelsStatus = "loading" | "success" | "empty"

export interface UseOnboardingModelsResult {
	status: OnboardingModelsStatus
	models: OnboardingModelGroup
}

function toOnboardingModel(
	rec: KerberoSecRecommendedModel,
	group: string,
	fallbackBadge: string,
	modelCatalog: Record<string, ModelInfo>,
): OnboardingModel {
	const catalogInfo = modelCatalog[rec.id]
	const tag = rec.tags?.[0] ?? ""
	const badge = tag || fallbackBadge

	return {
		id: rec.id,
		// Names arrive display-ready from the recommended-models RPC
		name: rec.name || rec.id,
		group,
		badge,
		score: 0,
		latency: 0,
		info: catalogInfo
			? {
					contextWindow: catalogInfo.contextWindow ?? 0,
					supportsImages: catalogInfo.supportsImages ?? false,
					supportsPromptCache: catalogInfo.supportsPromptCache ?? false,
					inputPrice: catalogInfo.inputPrice ?? 0,
					outputPrice: catalogInfo.outputPrice ?? 0,
					tiers: catalogInfo.tiers ?? [],
				}
			: undefined,
	}
}

type FetchState = { status: "loading" } | { status: "success"; data: RecommendedModelsData } | { status: "empty" }

export function useOnboardingModels(): UseOnboardingModelsResult {
	const { openRouterModels } = useExtensionState()
	const { models: kerberosecModels } = useProviderModels("kerberosec")
	const [fetchState, setFetchState] = useState<FetchState>({ status: "loading" })

	useEffect(() => {
		let cancelled = false

		const refreshRecommendedModels = async () => {
			try {
				const response = await ModelsServiceClient.refreshKerberoSecRecommendedModelsRpc(EmptyRequest.create({}))
				if (!cancelled) {
					const data = getRecommendedModelsData(response)
					if (!data) {
						setFetchState({ status: "empty" })
					} else {
						setFetchState({ status: "success", data })
					}
				}
			} catch {
				if (!cancelled) {
					setFetchState({ status: "empty" })
				}
			}
		}

		refreshRecommendedModels()

		return () => {
			cancelled = true
		}
	}, [])

	// Merge openRouter and kerberosec models into a single catalog for lookups
	const modelCatalog = useMemo<Record<string, ModelInfo>>(() => {
		return { ...openRouterModels, ...(kerberosecModels ?? {}) }
	}, [openRouterModels, kerberosecModels])

	// KerberoSecPass model IDs omit the upstream lab (e.g. "kerberosec-pass/glm-5.2"), so look up
	// capabilities via the model slug against the OpenRouter catalog, falling back to
	// conservative KerberoSecPass defaults. Mirrors KerberoSecPassProvider's resolution.
	const openRouterModelsByName = useMemo(() => buildModelInfoNameMap(openRouterModels), [openRouterModels])

	return useMemo<UseOnboardingModelsResult>(() => {
		if (fetchState.status !== "success") {
			return { status: fetchState.status, models: { models: KERBEROSEC_ONBOARDING_MODELS } }
		}

		const { data } = fetchState
		const freeModels = data.free.map((rec) => toOnboardingModel(rec, "free", "Free", modelCatalog))
		const frontierModels = data.recommended.map((rec) => toOnboardingModel(rec, "frontier", "", modelCatalog))
		const kerberosecPassCatalog = Object.fromEntries(
			data.kerberosecPass.map((rec) => [rec.id, resolveKerberoSecPassModelInfo(rec.id, openRouterModelsByName)]),
		)
		const kerberosecPassModels = data.kerberosecPass.map((rec) => toOnboardingModel(rec, KERBEROSECPASS_GROUP, "", kerberosecPassCatalog))

		return { status: "success", models: { models: [...kerberosecPassModels, ...freeModels, ...frontierModels] } }
	}, [fetchState, modelCatalog, openRouterModelsByName])
}
