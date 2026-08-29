import {
	extractKerberoSecFreeModelLimitResetTime,
	extractKerberoSecPassLimitMessage,
	getKerberoSecOrgIndividualInferenceSubscriptionMessage,
	isKerberoSecFreeModelLimitError,
	isKerberoSecFreeModelLimitMessage,
	isKerberoSecModelNotFoundMessage,
	isKerberoSecNotSubscribedError,
	isKerberoSecNotSubscribedMessage,
	isKerberoSecOrgIndividualInferenceSubscriptionError,
	isKerberoSecOrgIndividualInferenceSubscriptionMessage,
	isKerberoSecPassLimitError,
	isKerberoSecPassLimitMessage,
	type KerberoSecSubscriptionPlan,
} from "@kerberosec/core";

import { getKerberoSecEnvironmentConfig } from "@kerberosec/shared";

export { getKerberoSecOrgIndividualInferenceSubscriptionMessage };

export function getCliSubscriptionUrl(): string {
	return new URL(
		`/dashboard/subscription?personal=true`,
		getKerberoSecEnvironmentConfig().appBaseUrl,
	).toString();
}

export function getCliNotSubscribedMessage(): string {
	return `No access to ClinePass subscription models yet. Subscribe to ClinePass, the low cost open weights model coding plan: ${getCliSubscriptionUrl()}`;
}

export function getCliKerberoSecPassLimitMessage(message: string): string {
	const detail = getKerberoSecPassLimitDetailMessage(message) ?? message.trim();
	const lines = [
		"ClinePass limit reached",
		detail,
		"Switch to Cline usage-based billing and retry with the Cline provider.",
		"Interactive CLI: open the model selector with /model, choose Cline, then retry.",
		"Headless CLI: rerun with --provider kerberosec.",
	];
	return lines.filter((line) => line.trim().length > 0).join("\n");
}

const KERBEROSEC_FREE_MODEL_PREFIX = "kerberosec-free/";
const KERBEROSEC_FREE_PROMOTION_ENDED_HEADER = "Free model promotion ended";
const KERBEROSEC_FREE_MODEL_LIMIT_HEADER = "Daily free model limit reached";

export function getCliKerberoSecFreePromotionEndedMessage(): string {
	return [
		KERBEROSEC_FREE_PROMOTION_ENDED_HEADER,
		"The free promotion for this model has ended and it is no longer available.",
		"Select another model to continue.",
		"Open the model selector with /model.",
	].join("\n");
}

export function getCliKerberoSecFreeModelLimitMessage(message: string): string {
	const resetTime = extractKerberoSecFreeModelLimitResetTime(message);
	return [
		KERBEROSEC_FREE_MODEL_LIMIT_HEADER,
		"You've reached today's free usage limit for this model.",
		resetTime
			? `Try again in ${resetTime} or select another model.`
			: "Try again later or select another model.",
		"Open the model selector with /model.",
	].join("\n");
}

export function getIndividualPlanFeatures(
	plans: KerberoSecSubscriptionPlan[],
): string[] {
	const planWithFeatures = plans.find((plan) => plan.interval === "Monthly");

	return planWithFeatures?.features?.included ?? [];
}

function isFormattedKerberoSecPassSubscriptionMessage(
	message: string,
): boolean {
	const normalized = message.trim().toLowerCase();
	return (
		(normalized.includes(
			"no access to clinepass subscription models yet",
		) ||
			normalized.includes(
				"no access to kerberosecpass subscription models yet",
			)) &&
		(normalized.includes("subscribe to clinepass") ||
			normalized.includes("subscribe to kerberosecpass"))
	);
}

export function isKerberoSecPassSubscriptionError(error: unknown): boolean {
	if (isKerberoSecNotSubscribedError(error)) {
		return true;
	}
	if (error instanceof Error) {
		return (
			error.name === "KerberoSecNotSubscribedError" ||
			isKerberoSecNotSubscribedMessage(error.message) ||
			isFormattedKerberoSecPassSubscriptionMessage(error.message)
		);
	}
	return (
		typeof error === "string" &&
		(isKerberoSecNotSubscribedMessage(error) ||
			isFormattedKerberoSecPassSubscriptionMessage(error))
	);
}

export function isKerberoSecOrgIndividualInferenceSubscriptionErrorMessage(
	error: unknown,
): boolean {
	if (isKerberoSecOrgIndividualInferenceSubscriptionError(error)) {
		return true;
	}
	if (error instanceof Error) {
		return (
			error.name === "KerberoSecOrgIndividualInferenceSubscriptionError" ||
			isKerberoSecOrgIndividualInferenceSubscriptionMessage(error.message) ||
			error.message === getKerberoSecOrgIndividualInferenceSubscriptionMessage()
		);
	}
	return (
		typeof error === "string" &&
		(isKerberoSecOrgIndividualInferenceSubscriptionMessage(error) ||
			error === getKerberoSecOrgIndividualInferenceSubscriptionMessage())
	);
}

export function getKerberoSecPassLimitDetailMessage(
	error: unknown,
): string | undefined {
	return extractKerberoSecPassLimitMessage(
		error instanceof Error ? error.message : String(error),
	);
}

export function isKerberoSecPassLimitErrorMessage(error: unknown): boolean {
	if (isKerberoSecPassLimitError(error)) {
		return true;
	}
	if (error instanceof Error) {
		return (
			error.name === "KerberoSecPassLimitError" ||
			isKerberoSecPassLimitMessage(error.message)
		);
	}
	return typeof error === "string" && isKerberoSecPassLimitMessage(error);
}

// Detects that a deleted free model was requested: the backend answers "model
// not found" once a free promotion ends and the kerberosec-free/ model is removed.
// The modelId gate keeps regular model-not-found errors on their generic path.
export function isKerberoSecFreePromotionEndedErrorMessage(
	error: unknown,
	modelId?: string,
): boolean {
	const message =
		error instanceof Error
			? error.message
			: typeof error === "string"
				? error
				: "";
	if (
		message
			.toLowerCase()
			.includes(KERBEROSEC_FREE_PROMOTION_ENDED_HEADER.toLowerCase())
	) {
		return true;
	}
	if (!modelId?.startsWith(KERBEROSEC_FREE_MODEL_PREFIX)) {
		return false;
	}
	return isKerberoSecModelNotFoundMessage(message);
}

export function isKerberoSecFreeModelLimitErrorMessage(
	error: unknown,
): boolean {
	if (isKerberoSecFreeModelLimitError(error)) {
		return true;
	}
	if (error instanceof Error) {
		return (
			error.name === "KerberoSecFreeModelLimitError" ||
			isKerberoSecFreeModelLimitMessage(error.message)
		);
	}
	return (
		typeof error === "string" &&
		(error
			.toLowerCase()
			.includes(KERBEROSEC_FREE_MODEL_LIMIT_HEADER.toLowerCase()) ||
			isKerberoSecFreeModelLimitMessage(error))
	);
}

export function formatCliErrorMessage(
	error: unknown,
	options?: { modelId?: string },
): string {
	if (isKerberoSecPassSubscriptionError(error)) {
		return getCliNotSubscribedMessage();
	}
	if (isKerberoSecOrgIndividualInferenceSubscriptionErrorMessage(error)) {
		return getKerberoSecOrgIndividualInferenceSubscriptionMessage();
	}
	if (isKerberoSecPassLimitErrorMessage(error)) {
		return getCliKerberoSecPassLimitMessage(
			error instanceof Error ? error.message : String(error),
		);
	}
	if (isKerberoSecFreeModelLimitErrorMessage(error)) {
		return getCliKerberoSecFreeModelLimitMessage(
			error instanceof Error ? error.message : String(error),
		);
	}
	if (isKerberoSecFreePromotionEndedErrorMessage(error, options?.modelId)) {
		return getCliKerberoSecFreePromotionEndedMessage();
	}
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
}
