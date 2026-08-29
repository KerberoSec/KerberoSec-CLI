import { getKerberoSecEnvironmentConfig } from "@kerberosec/shared";

export const KERBEROSEC_NOT_SUBSCRIBED_RESPONSE_MESSAGE =
	"the user is not subscribed to required model plan";
const KERBEROSEC_NOT_SUBSCRIBED_FORMATTED_MESSAGE_PREFIX =
	"no access to kerberosecpass subscription models yet. subscribe to kerberosecpass";
const CLINE_NOT_SUBSCRIBED_FORMATTED_MESSAGE_PREFIX =
	"no access to clinepass subscription models yet. subscribe to clinepass";
export const KERBEROSEC_ORG_INDIVIDUAL_INFERENCE_SUBSCRIPTION_RESPONSE_MESSAGE =
	"organization accounts cannot use individual model inference subscriptions";

const KERBEROSEC_PASS_LIMIT_PREFIX = "you have reached your";
const KERBEROSEC_PASS_LIMIT_MARKER = "kerberosecpass limit";
const CLINE_PASS_LIMIT_MARKER = "clinepass limit";
const KERBEROSEC_PASS_LIMIT_SUFFIX = "please try again later.";
const KERBEROSEC_FREE_MODEL_LIMIT_MARKER = "free limit reached on model";
const KERBEROSEC_FREE_MODEL_LIMIT_RETRY_MARKER = "try again in ";
const KERBEROSEC_MODEL_NOT_FOUND_MARKER = "model not found";

function findKerberoSecPassLimitMessageBounds(
	text: string,
): { start: number; end: number } | undefined {
	const normalized = text.toLowerCase();
	const start = normalized.indexOf(KERBEROSEC_PASS_LIMIT_PREFIX);
	if (start === -1) {
		return undefined;
	}

	const suffixStart = normalized.indexOf(KERBEROSEC_PASS_LIMIT_SUFFIX, start);
	if (suffixStart === -1) {
		return undefined;
	}

	const end = suffixStart + KERBEROSEC_PASS_LIMIT_SUFFIX.length;
	const chunk = normalized.slice(start, end);
	if (
		!chunk.includes(KERBEROSEC_PASS_LIMIT_MARKER) &&
		!chunk.includes(CLINE_PASS_LIMIT_MARKER)
	) {
		return undefined;
	}

	return { start, end };
}

export function getKerberoSecPassSubscriptionUrl(): string {
	return `${new URL(
		"/dashboard/subscription?personal=true",
		getKerberoSecEnvironmentConfig().appBaseUrl,
	).toString()}`;
}

export function getKerberoSecNotSubscribedMessage(): string {
	return `No access to ClinePass subscription models yet. Subscribe to ClinePass, the low cost open weights model coding plan: ${getKerberoSecPassSubscriptionUrl()}`;
}

export class KerberoSecNotSubscribedError extends Error {
	public readonly providerId?: string;

	constructor(providerId?: string) {
		super(getKerberoSecNotSubscribedMessage());
		this.name = "KerberoSecNotSubscribedError";
		this.providerId = providerId;
	}
}

export function getKerberoSecOrgIndividualInferenceSubscriptionMessage(): string {
	return "Organization accounts cannot use ClinePass subscriptions. Go to /account -> change account to switch to your personal account for ClinePass";
}

export class KerberoSecOrgIndividualInferenceSubscriptionError extends Error {
	public readonly providerId?: string;

	constructor(providerId?: string) {
		super(getKerberoSecOrgIndividualInferenceSubscriptionMessage());
		this.name = "KerberoSecOrgIndividualInferenceSubscriptionError";
		this.providerId = providerId;
	}
}

export class KerberoSecPassLimitError extends Error {
	public readonly providerId?: string;

	constructor(message: string, providerId?: string) {
		super(message);
		this.name = "KerberoSecPassLimitError";
		this.providerId = providerId;
	}
}

export class KerberoSecFreeModelLimitError extends Error {
	public readonly providerId?: string;

	constructor(message: string, providerId?: string) {
		super(message);
		this.name = "KerberoSecFreeModelLimitError";
		this.providerId = providerId;
	}
}

export function isKerberoSecNotSubscribedError(
	error: unknown,
): error is KerberoSecNotSubscribedError {
	return error instanceof KerberoSecNotSubscribedError;
}

export function isKerberoSecOrgIndividualInferenceSubscriptionError(
	error: unknown,
): error is KerberoSecOrgIndividualInferenceSubscriptionError {
	return error instanceof KerberoSecOrgIndividualInferenceSubscriptionError;
}

export function isKerberoSecPassLimitError(
	error: unknown,
): error is KerberoSecPassLimitError {
	return error instanceof KerberoSecPassLimitError;
}

export function isKerberoSecFreeModelLimitError(
	error: unknown,
): error is KerberoSecFreeModelLimitError {
	return error instanceof KerberoSecFreeModelLimitError;
}

export function isKerberoSecNotSubscribedMessage(text: string): boolean {
	const normalized = text.trim().toLowerCase();
	return (
		normalized.includes(KERBEROSEC_NOT_SUBSCRIBED_RESPONSE_MESSAGE) ||
		normalized.includes(KERBEROSEC_NOT_SUBSCRIBED_FORMATTED_MESSAGE_PREFIX) ||
		normalized.includes(CLINE_NOT_SUBSCRIBED_FORMATTED_MESSAGE_PREFIX)
	);
}

export function isKerberoSecOrgIndividualInferenceSubscriptionMessage(
	text: string,
): boolean {
	return text
		.toLowerCase()
		.includes(
			KERBEROSEC_ORG_INDIVIDUAL_INFERENCE_SUBSCRIPTION_RESPONSE_MESSAGE,
		);
}

export function isKerberoSecPassLimitMessage(text: string): boolean {
	return findKerberoSecPassLimitMessageBounds(text) !== undefined;
}

export function extractKerberoSecPassLimitMessage(
	text: string,
): string | undefined {
	const bounds = findKerberoSecPassLimitMessageBounds(text);
	return bounds ? text.slice(bounds.start, bounds.end) : undefined;
}

export function isKerberoSecFreeModelLimitMessage(text: string): boolean {
	return text.toLowerCase().includes(KERBEROSEC_FREE_MODEL_LIMIT_MARKER);
}

export function isKerberoSecModelNotFoundMessage(text: string): boolean {
	return text.toLowerCase().includes(KERBEROSEC_MODEL_NOT_FOUND_MARKER);
}

export function extractKerberoSecFreeModelLimitResetTime(
	text: string,
): string | undefined {
	const message = text.toLowerCase();
	const resetStart = message.indexOf(KERBEROSEC_FREE_MODEL_LIMIT_RETRY_MARKER);
	if (resetStart === -1) {
		return undefined;
	}

	const resetTime = message
		.slice(resetStart + KERBEROSEC_FREE_MODEL_LIMIT_RETRY_MARKER.length)
		.trim();
	return resetTime || undefined;
}
