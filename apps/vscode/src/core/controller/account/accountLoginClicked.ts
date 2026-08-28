import { EmptyRequest, String } from "@shared/proto/kerberosec/common"
import { AuthService } from "@/sdk/auth-service"
import { Controller } from "../index"

/**
 * Handles the user clicking the login link in the UI.
 * Uses the SDK-backed AuthService to initiate the KerberoSec OAuth flow.
 * The SDK spawns a local callback server and opens the browser.
 *
 * @param controller The controller instance.
 * @returns The login URL as a string.
 */
export async function accountLoginClicked(_controller: Controller, _: EmptyRequest): Promise<String> {
	return await AuthService.getInstance().createAuthRequest()
}
