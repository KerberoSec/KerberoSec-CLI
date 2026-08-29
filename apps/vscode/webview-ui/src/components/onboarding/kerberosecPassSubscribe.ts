import { StringRequest } from "@shared/proto/kerberosec/common"
import { UiServiceClient } from "@/services/grpc-client"

// KerberoSecPass subscription signup page in the dashboard (requires auth).
const KERBEROSEC_PASS_SUBSCRIBE_PATH = "/onboarding/individual-plan"
const KERBEROSEC_PASS_USAGE_PATH = "/dashboard/subscription"
export const DEFAULT_APP_BASE_URL = "https://app.cline.bot"

// Module-level so the pending intent survives OnboardingView unmounting: handleAuthCallback
// completes the welcome view (unmounting onboarding) before it pushes the auth-status update
// that sets kerberosecUser, so this must outlive the component to fire the redirect.
let pendingKerberoSecPassSubscribe = false

export function setPendingKerberoSecPassSubscribe(pending: boolean): void {
	pendingKerberoSecPassSubscribe = pending
}

// Opens the KerberoSecPass subscription page once a pending signup is authenticated (guarded so it fires once).
export function openKerberoSecPassSubscriptionIfPending(appBaseUrl: string | undefined): void {
	if (!pendingKerberoSecPassSubscribe) {
		return
	}
	pendingKerberoSecPassSubscribe = false
	const baseUrl = appBaseUrl || DEFAULT_APP_BASE_URL
	UiServiceClient.openUrl(StringRequest.create({ value: `${baseUrl}${KERBEROSEC_PASS_SUBSCRIBE_PATH}` })).catch((err) =>
		console.error("Failed to open KerberoSecPass subscription page:", err),
	)
}

export function buildKerberoSecPassSubscriptionPageUrl(appBaseUrl: string | undefined): string {
	return new URL(KERBEROSEC_PASS_USAGE_PATH, appBaseUrl || DEFAULT_APP_BASE_URL).toString()
}
