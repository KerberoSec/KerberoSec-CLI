// Shared between the sidecar (which produces this result) and the webview
// (which consumes it), like the desktop transport types.

/**
 * Typed result the `kerberosec_account` sidecar command returns when no KerberoSec
 * account credentials exist. Being signed out is an expected state, so it
 * travels as a structured response instead of a thrown error: it must not be
 * reported to error telemetry or rendered as a raw error string.
 */
export const KERBEROSEC_ACCOUNT_NOT_AUTHENTICATED_CODE =
	"ACCOUNT_NOT_AUTHENTICATED" as const;

export type KerberoSecAccountNotAuthenticatedResult = {
	signedIn: false;
	code: typeof KERBEROSEC_ACCOUNT_NOT_AUTHENTICATED_CODE;
};

export const KERBEROSEC_ACCOUNT_NOT_AUTHENTICATED_RESULT: KerberoSecAccountNotAuthenticatedResult =
	{
		signedIn: false,
		code: KERBEROSEC_ACCOUNT_NOT_AUTHENTICATED_CODE,
	};

export function isKerberoSecAccountNotAuthenticatedResult(
	value: unknown,
): value is KerberoSecAccountNotAuthenticatedResult {
	return (
		typeof value === "object" &&
		value !== null &&
		(value as KerberoSecAccountNotAuthenticatedResult).code ===
			KERBEROSEC_ACCOUNT_NOT_AUTHENTICATED_CODE &&
		(value as KerberoSecAccountNotAuthenticatedResult).signedIn === false
	);
}
