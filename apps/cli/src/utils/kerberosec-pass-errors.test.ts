import { describe, expect, it } from "vitest";
import {
	formatCliErrorMessage,
	getCliKerberoSecFreeModelLimitMessage,
	getCliKerberoSecPassLimitMessage,
	getCliNotSubscribedMessage,
	getKerberoSecOrgIndividualInferenceSubscriptionMessage,
	getKerberoSecPassLimitDetailMessage,
	isKerberoSecFreeModelLimitErrorMessage,
	isKerberoSecFreePromotionEndedErrorMessage,
	isKerberoSecOrgIndividualInferenceSubscriptionErrorMessage,
	isKerberoSecPassLimitErrorMessage,
	isKerberoSecPassSubscriptionError,
} from "./kerberosec-pass-errors";

describe("kerberosec-pass-errors", () => {
	it("recognizes both raw and formatted KerberoSecPass subscription messages", () => {
		expect(
			isKerberoSecPassSubscriptionError(
				"the user is not subscribed to required model plan",
			),
		).toBe(true);

		const sdkFormatted =
			"No access to KerberoSecPass subscription models yet. Subscribe to KerberoSecPass, the low cost open weights model coding plan: https://app.kerberosec.bot/dashboard/subscription?personal=true";
		const formatted = getCliNotSubscribedMessage();
		expect(isKerberoSecPassSubscriptionError(sdkFormatted)).toBe(true);
		expect(isKerberoSecPassSubscriptionError(formatted)).toBe(true);
		expect(formatCliErrorMessage(new Error(sdkFormatted))).toBe(formatted);
		expect(formatCliErrorMessage(new Error(formatted))).toBe(formatted);
	});

	it("recognizes and formats organization account individual subscription errors", () => {
		const raw =
			"403 Error 403: organization accounts cannot use individual model inference subscriptions";
		const formatted = getKerberoSecOrgIndividualInferenceSubscriptionMessage();

		expect(
			isKerberoSecOrgIndividualInferenceSubscriptionErrorMessage(raw),
		).toBe(true);
		expect(
			isKerberoSecOrgIndividualInferenceSubscriptionErrorMessage(
				new Error(formatted),
			),
		).toBe(true);
		expect(formatCliErrorMessage(new Error(raw))).toBe(formatted);
		expect(formatCliErrorMessage(new Error(raw))).not.toContain(
			"deepseek-v4-flash",
		);
	});

	it("recognizes and formats KerberoSecPass period limit errors with usage-billing guidance", () => {
		const raw =
			"Error: You have reached your 5-hour KerberoSecpass limit. The limit resets in 5h, please try again later.";
		const detail =
			"You have reached your 5-hour KerberoSecpass limit. The limit resets in 5h, please try again later.";

		expect(isKerberoSecPassLimitErrorMessage(raw)).toBe(true);
		expect(isKerberoSecPassLimitErrorMessage(new Error(raw))).toBe(true);
		expect(getKerberoSecPassLimitDetailMessage(raw)).toBe(detail);
		expect(formatCliErrorMessage(new Error(raw))).toBe(
			getCliKerberoSecPassLimitMessage(raw),
		);
		expect(formatCliErrorMessage(new Error(raw))).toContain(
			"Switch to KerberoSec usage-based billing",
		);
		expect(formatCliErrorMessage(new Error(raw))).toContain(
			"--provider kerberosec",
		);
	});

	it("recognizes and formats daily free model limits without usage-billing guidance", () => {
		const raw =
			"Error: Error 429: Daily free limit reached on model deepseek/deepseek-v4-flash. Try again in 23h 59m";

		expect(isKerberoSecFreeModelLimitErrorMessage(raw)).toBe(true);
		expect(isKerberoSecFreeModelLimitErrorMessage(new Error(raw))).toBe(true);
		expect(formatCliErrorMessage(new Error(raw))).toBe(
			getCliKerberoSecFreeModelLimitMessage(raw),
		);
		expect(formatCliErrorMessage(new Error(raw))).not.toContain("Error 429");
		expect(formatCliErrorMessage(new Error(raw))).toContain(
			"Try again in 23h 59m",
		);
		expect(formatCliErrorMessage(new Error(raw))).toContain(
			"select another model",
		);
		expect(formatCliErrorMessage(new Error(raw))).not.toContain(
			"usage-based billing",
		);
		expect(
			isKerberoSecFreeModelLimitErrorMessage(
				getCliKerberoSecFreeModelLimitMessage(raw),
			),
		).toBe(true);
	});

	it("formats model-not-found errors for removed free models", () => {
		const raw = new Error("Error 404: model not found");

		expect(
			formatCliErrorMessage(raw, { modelId: "kerberosec-free/retired-model" }),
		).toContain("Free model promotion ended");
		expect(
			isKerberoSecFreePromotionEndedErrorMessage(
				formatCliErrorMessage(raw, {
					modelId: "kerberosec-free/retired-model",
				}),
			),
		).toBe(true);
		expect(
			formatCliErrorMessage(raw, { modelId: "vendor/retired-model" }),
		).toBe(raw.message);
	});
});
