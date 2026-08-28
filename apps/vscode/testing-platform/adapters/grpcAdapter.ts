import { AccountServiceClient } from "@kerberosec-grpc/account"
import { BrowserServiceClient } from "@kerberosec-grpc/browser"
import { CheckpointsServiceClient } from "@kerberosec-grpc/checkpoints"
import { CommandsServiceClient } from "@kerberosec-grpc/commands"
import { FileServiceClient } from "@kerberosec-grpc/file"
import { McpServiceClient } from "@kerberosec-grpc/mcp"
import { ModelsServiceClient } from "@kerberosec-grpc/models"
import { SlashServiceClient } from "@kerberosec-grpc/slash"
import { StateServiceClient } from "@kerberosec-grpc/state"
import { TaskServiceClient } from "@kerberosec-grpc/task"
import { UiServiceClient } from "@kerberosec-grpc/ui"
import { WebServiceClient } from "@kerberosec-grpc/web"
import { credentials } from "@grpc/grpc-js"
import { promisify } from "util"

const serviceRegistry = {
	"kerberosec.AccountService": AccountServiceClient,
	"kerberosec.BrowserService": BrowserServiceClient,
	"kerberosec.CheckpointsService": CheckpointsServiceClient,
	"kerberosec.CommandsService": CommandsServiceClient,
	"kerberosec.FileService": FileServiceClient,
	"kerberosec.McpService": McpServiceClient,
	"kerberosec.ModelsService": ModelsServiceClient,
	"kerberosec.SlashService": SlashServiceClient,
	"kerberosec.StateService": StateServiceClient,
	"kerberosec.TaskService": TaskServiceClient,
	"kerberosec.UiService": UiServiceClient,
	"kerberosec.WebService": WebServiceClient,
} as const

export type ServiceClients = {
	-readonly [K in keyof typeof serviceRegistry]: InstanceType<(typeof serviceRegistry)[K]>
}

export class GrpcAdapter {
	private clients: Partial<ServiceClients> = {}

	constructor(address: string) {
		for (const [name, Client] of Object.entries(serviceRegistry)) {
			this.clients[name as keyof ServiceClients] = new (Client as any)(address, credentials.createInsecure())
		}
	}

	async call(service: keyof ServiceClients, method: string, request: any): Promise<any> {
		const client = this.clients[service]
		if (!client) {
			throw new Error(`No gRPC client registered for service: ${String(service)}`)
		}

		const fn = (client as any)[method]
		if (typeof fn !== "function") {
			throw new Error(`Method ${method} not found on service ${String(service)}`)
		}

		try {
			const fnAsync = promisify(fn).bind(client)
			const response = await fnAsync(request.message)
			return response?.toObject ? response.toObject() : response
		} catch (error) {
			console.error(`[GrpcAdapter] ${service}.${method} failed:`, error)
			throw error
		}
	}

	close(): void {
		for (const client of Object.values(this.clients)) {
			if (client && typeof (client as any).close === "function") {
				;(client as any).close()
			}
		}
	}
}
