import { HostProvider } from "@/hosts/host-provider"
import { ExtensionRegistryInfo } from "@/registry"
import { EmptyRequest } from "@/shared/proto/kerberosec/common"
import { Logger } from "@/shared/services/Logger"

// Canonical header names for extra client/host context
const KerberoSecHeaders = {
	PLATFORM: "X-PLATFORM",
	PLATFORM_VERSION: "X-PLATFORM-VERSION",
	CLIENT_VERSION: "X-CLIENT-VERSION",
	CLIENT_TYPE: "X-CLIENT-TYPE",
	CORE_VERSION: "X-CORE-VERSION",
	IS_MULTIROOT: "X-IS-MULTIROOT",
} as const

export function buildExternalBasicHeaders(): Record<string, string> {
	return {
		"User-Agent": `KerberoSec/${ExtensionRegistryInfo.version}`,
	}
}

export async function buildBasicKerberoSecHeaders(): Promise<Record<string, string>> {
	const headers: Record<string, string> = buildExternalBasicHeaders()
	try {
		const host = await HostProvider.env.getHostVersion(EmptyRequest.create({}))
		headers[KerberoSecHeaders.PLATFORM] = host.platform || "unknown"
		headers[KerberoSecHeaders.PLATFORM_VERSION] = host.version || "unknown"
		headers[KerberoSecHeaders.CLIENT_TYPE] = host.kerberosecType || "unknown"
		headers[KerberoSecHeaders.CLIENT_VERSION] = host.kerberosecVersion || "unknown"
	} catch (error) {
		Logger.log("Failed to get IDE/platform info via HostBridge EnvService.getHostVersion", error)
		headers[KerberoSecHeaders.PLATFORM] = "unknown"
		headers[KerberoSecHeaders.PLATFORM_VERSION] = "unknown"
		headers[KerberoSecHeaders.CLIENT_TYPE] = "unknown"
		headers[KerberoSecHeaders.CLIENT_VERSION] = "unknown"
	}
	headers[KerberoSecHeaders.CORE_VERSION] = ExtensionRegistryInfo.version

	return headers
}
