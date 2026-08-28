import { CheckpointRestoreRequest } from "@shared/proto/kerberosec/checkpoints"
import { Empty } from "@shared/proto/kerberosec/common"
import { KerberoSecCheckpointRestore } from "../../../shared/WebviewMessage"
import { Controller } from ".."

export async function checkpointRestore(controller: Controller, request: CheckpointRestoreRequest): Promise<Empty> {
	const sdkRestoreCheckpoint = (
		controller as Controller & {
			restoreCheckpoint?: (input: { checkpointRunCount: number; restoreType: KerberoSecCheckpointRestore }) => Promise<void>
		}
	).restoreCheckpoint
	if (sdkRestoreCheckpoint) {
		if (request.number) {
			await sdkRestoreCheckpoint.call(controller, {
				checkpointRunCount: Number(request.number),
				restoreType: request.restoreType as KerberoSecCheckpointRestore,
			})
		}
		return Empty.create({})
	}

	return Empty.create({})
}
