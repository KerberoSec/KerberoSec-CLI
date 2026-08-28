import {
	getKerberoSecOrgIndividualInferenceSubscriptionMessage,
	isKerberoSecFreeModelLimitMessage,
	isKerberoSecModelNotFoundMessage,
	isKerberoSecNotSubscribedMessage,
	isKerberoSecOrgIndividualInferenceSubscriptionMessage,
	isKerberoSecPassLimitMessage,
} from "@kerberosec/llms"
import { serializeError } from "serialize-error"
import { KERBEROSEC_ACCOUNT_AUTH_ERROR_MESSAGE } from "../../shared/KerberoSecAccount"

export enum KerberoSecErrorType {
	Auth = "auth",
	RateLimit = "rateLimit",
	Balance = "balance",
	SpendLimit = "spendLimit",
	QuotaExceeded = "quotaExceeded",
	Entitlement = "entitlement",
	OrgKerberoSecPassRestriction = "orgKerberoSecPassRestriction",
	KerberoSecPassLimit = "kerberosecPassLimit",
	KerberoSecFreeModelLimit = "kerberosecFreeModelLimit",
	KerberoSecFreePromotionEnded = "kerberosecFreePromotionEnded",
}

export const KERBEROSEC_FREE_MODEL_ID_PREFIX = "kerberosec-free/"
/** Error code stamped by the host when it detects a retired free model (see message-translator). */
export const KERBEROSEC_FREE_PROMOTION_ENDED_ERROR_CODE = "kerberosec_free_promotion_ended"

/**
 * Detects a request against a retired free model: once a promotion ends the
 * kerberosec-free/ model is removed from the catalog and the backend answers "model
 * not found". The modelId gate keeps ordinary model-not-found errors on their
 * generic path. Mirrors the CLI's detection in apps/cli/src/utils/kerberosec-pass-errors.ts.
 */
export function isKerberoSecFreePromotionEndedMessage(message: string, modelId?: string): boolean {
	if (!modelId?.toLowerCase().startsWith(KERBEROSEC_FREE_MODEL_ID_PREFIX)) {
		return false
	}
	return isKerberoSecModelNotFoundMessage(message)
}

interface ErrorDetails {
	/**
	 * The HTTP status code of the error, if applicable.
	 */
	status?: number
	/**
	 * The request ID associated with the error, if available.
	 * This can be useful for debugging and support.
	 */
	request_id?: string
	/**
	 * Specific error code provided by the API or service.
	 */
	code?: string
	/**
	 * The model ID associated with the error, if applicable.
	 * This is useful for identifying which model the error relates to.
	 */
	modelId?: string
	/**
	 * The provider ID associated with the error, if applicable.
	 * This is useful for identifying which provider the error relates to.
	 */
	providerId?: string
	/**
	 * The error message associated with the error, if applicable.
	 */
	message?: string
	// Additional details that might be present in the error
	// This can include things like current balance, error messages, etc.
	details?: any
}

const RATE_LIMIT_PATTERNS = [/status code 429/i, /rate limit/i, /too many requests/i, /quota exceeded/i, /resource exhausted/i]

export class KerberoSecError extends Error {
	readonly title = "KerberoSecError"
	readonly _error: ErrorDetails

	// Error details per providers:
	// KerberoSec: error?.error
	// Ollama: error?.cause
	// tbc
	constructor(
		raw: any,
		public readonly modelId?: string,
		public readonly providerId?: string,
	) {
		const error = serializeError(raw)

		const message = error.message || error?.response?.message || String(error) || error?.cause?.means
		super(message)

		// Extract status from multiple possible locations
		const status = error.status || error.statusCode || error.response?.status
		this.modelId = modelId || error.modelId
		this.providerId = providerId || error.providerId

		// Construct the error details object to includes relevant information
		// And ensure it has a consistent structure
		this._error = {
			...error,
			message: raw.message || message,
			status,
			request_id:
				error.error?.request_id ||
				error.request_id ||
				error.response?.request_id ||
				error.response?.headers?.["x-request-id"],
			code: error.code || error?.cause?.code,
			modelId: this.modelId,
			providerId: this.providerId,
			details: error.details || error.error, // Additional details provided by the server
			stack: undefined, // Avoid serializing stack trace to keep the error object clean
		}
	}

	/**
	 *  Serializes the error to a JSON string that allows for easy transmission and storage.
	 *  This is useful for logging or sending error details to a webviews.
	 */
	public serialize(): string {
		return JSON.stringify({
			message: this.message,
			status: this._error.status,
			request_id: this._error.request_id,
			code: this._error.code,
			modelId: this.modelId,
			providerId: this.providerId,
			details: this._error.details,
		})
	}

	public get status(): number | undefined {
		return this._error.status
	}

	public get requestId(): string | undefined {
		return this._error.request_id
	}

	/**
	 * Parses a stringified error into a KerberoSecError instance.
	 */
	static parse(errorStr?: string, modelId?: string): KerberoSecError | undefined {
		if (!errorStr || typeof errorStr !== "string") {
			return undefined
		}
		return KerberoSecError.transform(errorStr, modelId)
	}

	/**
	 * Transforms any object into a KerberoSecError instance.
	 * Always returns a KerberoSecError, even if the input is not a valid error object.
	 */
	static transform(error: any, modelId?: string, providerId?: string): KerberoSecError {
		try {
			// If already a KerberoSecError, return it directly to prevent infinite recursion
			if (error instanceof KerberoSecError) {
				return error
			}
			return new KerberoSecError(JSON.parse(error), modelId, providerId)
		} catch {
			return new KerberoSecError(error, modelId, providerId)
		}
	}

	public isErrorType(type: KerberoSecErrorType): boolean {
		return KerberoSecError.getErrorType(this) === type
	}

	/**
	 * Is known error type based on the error code, status, and details.
	 * This is useful for determining how to handle the error in the UI or logic.
	 */
	static getErrorType(err: KerberoSecError): KerberoSecErrorType | undefined {
		const { code, status, details } = err._error
		const rawMessage = err._error?.message || err.message || JSON.stringify(err._error)
		const message = rawMessage?.toLowerCase()
		const detailMessage = typeof details?.message === "string" ? details.message : undefined

		// Check balance error first (most specific)
		if (code === "insufficient_credits" && typeof details?.current_balance === "number") {
			return KerberoSecErrorType.Balance
		}

		// Check spend limit exceeded (org-enforced budget cap, 429 SPEND_LIMIT_EXCEEDED)
		// Must be checked before the generic rate-limit check since both use 429
		if (code === "SPEND_LIMIT_EXCEEDED" || details?.code === "SPEND_LIMIT_EXCEEDED") {
			return KerberoSecErrorType.SpendLimit
		}

		if (
			rawMessage === getKerberoSecOrgIndividualInferenceSubscriptionMessage() ||
			(detailMessage ? isKerberoSecOrgIndividualInferenceSubscriptionMessage(detailMessage) : false) ||
			(rawMessage ? isKerberoSecOrgIndividualInferenceSubscriptionMessage(rawMessage) : false)
		) {
			return KerberoSecErrorType.OrgKerberoSecPassRestriction
		}

		if (
			(detailMessage ? isKerberoSecNotSubscribedMessage(detailMessage) : false) ||
			(rawMessage ? isKerberoSecNotSubscribedMessage(rawMessage) : false)
		) {
			return KerberoSecErrorType.Entitlement
		}

		if (
			(detailMessage ? isKerberoSecFreeModelLimitMessage(detailMessage) : false) ||
			(rawMessage ? isKerberoSecFreeModelLimitMessage(rawMessage) : false)
		) {
			return KerberoSecErrorType.KerberoSecFreeModelLimit
		}

		if (
			(detailMessage ? isKerberoSecPassLimitMessage(detailMessage) : false) ||
			(rawMessage ? isKerberoSecPassLimitMessage(rawMessage) : false)
		) {
			return KerberoSecErrorType.KerberoSecPassLimit
		}

		// Retired free models must be classified before the auth branch: the
		// backend's model-not-found answer is a 404, which falls inside the
		// generic 401-428 auth-status range below.
		if (
			code === KERBEROSEC_FREE_PROMOTION_ENDED_ERROR_CODE ||
			details?.code === KERBEROSEC_FREE_PROMOTION_ENDED_ERROR_CODE ||
			(detailMessage ? isKerberoSecFreePromotionEndedMessage(detailMessage, err.modelId) : false) ||
			(rawMessage ? isKerberoSecFreePromotionEndedMessage(rawMessage, err.modelId) : false)
		) {
			return KerberoSecErrorType.KerberoSecFreePromotionEnded
		}

		// Check auth errors
		const isAuthStatus = status !== undefined && status > 400 && status < 429
		if (code === "ERR_BAD_REQUEST" || err instanceof AuthInvalidTokenError || isAuthStatus) {
			return KerberoSecErrorType.Auth
		}

		if (code === "INFERENCE_CAP_ERROR") {
			return KerberoSecErrorType.QuotaExceeded
		}

		if (message) {
			// Check for specific error codes/messages if applicable
			const authErrorRegex = [/(?:in)?valid[-_ ]?(?:api )?(?:token|key)/i, /authentication[-_ ]?failed/i, /unauthorized/i]
			if (message?.includes(KERBEROSEC_ACCOUNT_AUTH_ERROR_MESSAGE) || authErrorRegex.some((regex) => regex.test(message))) {
				return KerberoSecErrorType.Auth
			}

			// Check rate limit patterns
			const lowerMessage = message.toLowerCase()
			if (RATE_LIMIT_PATTERNS.some((pattern) => pattern.test(lowerMessage))) {
				return KerberoSecErrorType.RateLimit
			}
		}

		return undefined
	}
}

class AuthInvalidTokenError extends Error {
	constructor(message: string) {
		super(message)
		this.name = KerberoSecErrorType.Auth
	}
}
