import { EmptyRequest } from "@shared/proto/kerberosec/common"
import { KerberoSecRecommendedModel, KerberoSecRecommendedModelsResponse } from "@shared/proto/kerberosec/models"
import type { Controller } from "../index"
import { refreshKerberoSecRecommendedModels } from "./refreshKerberoSecRecommendedModels"

export async function refreshKerberoSecRecommendedModelsRpc(
	_controller: Controller,
	_request: EmptyRequest,
): Promise<KerberoSecRecommendedModelsResponse> {
	const models = await refreshKerberoSecRecommendedModels()
	return KerberoSecRecommendedModelsResponse.create({
		recommended: models.recommended.map((model) =>
			KerberoSecRecommendedModel.create({
				id: model.id,
				name: model.name,
				description: model.description,
				tags: model.tags,
			}),
		),
		free: models.free.map((model) =>
			KerberoSecRecommendedModel.create({
				id: model.id,
				name: model.name,
				description: model.description,
				tags: model.tags,
			}),
		),
		kerberosecPass: (models.kerberosecPass ?? []).map((model) =>
			KerberoSecRecommendedModel.create({
				id: model.id,
				name: model.name,
				description: model.description,
				tags: model.tags,
			}),
		),
	})
}
