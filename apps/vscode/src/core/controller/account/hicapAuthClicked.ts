import { Empty, EmptyRequest } from "@shared/proto/kerberosec/common"
import { HostProvider } from "@/hosts/host-provider"
import { openExternal } from "@/utils/env"
import { Controller } from ".."

/**
 * Initiates Hicap auth
 */
export async function hicapAuthClicked(_: Controller, __: EmptyRequest): Promise<Empty> {
	const callbackUrl = await HostProvider.get().getCallbackUrl("/hicap")
	const authUrl = new URL("https://dashboard.hicap.ai/setup")
	authUrl.searchParams.set("application", "kerberosec")
	authUrl.searchParams.set("callback_url", callbackUrl)

	await openExternal(authUrl.toString())

	return {}
}
