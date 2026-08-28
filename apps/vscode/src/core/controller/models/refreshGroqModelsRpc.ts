import { EmptyRequest } from "@shared/proto/kerberosec/common"
import { OpenRouterCompatibleModelInfo } from "@shared/proto/kerberosec/models"
import { toProtobufModels } from "../../../shared/proto-conversions/models/typeConversion"
import { Controller } from ".."
import { refreshGroqModels } from "./refreshGroqModels"

/**
 * Handles protobuf conversion for gRPC service
 * @param controller The controller instance
 * @param request Empty request object
 * @returns Response containing Groq models (protobuf types)
 */
export async function refreshGroqModelsRpc(
	controller: Controller,
	_request: EmptyRequest,
): Promise<OpenRouterCompatibleModelInfo> {
	const models = await refreshGroqModels(controller)
	return OpenRouterCompatibleModelInfo.create({ models: toProtobufModels(models) })
}
