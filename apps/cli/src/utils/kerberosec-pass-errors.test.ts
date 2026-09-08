import { describe, expect, it } from "vitest";
import {
	formatCliErrorMessage,
	getCliKerberoSecFreeModelLimitMessage,
	getCliKerberoSecPassLimitMessage,
	getCliNotSubscribedMessage,
	getKerberoSecOrgIndividualInferenceSubscriptionMessage,
	getKerberoSecPassLimitDetailMessage,
	isContentBlockedErrorMessage,
	isGenericHtmlErrorMessage,
	isKerberoSecFreeModelLimitErrorMessage,
	isKerberoSecFreePromotionEndedErrorMessage,
	isKerberoSecOrgIndividualInferenceSubscriptionErrorMessage,
	isKerberoSecPassLimitErrorMessage,
	isKerberoSecPassSubscriptionError,
	isWafBlockedErrorMessage,
} from "./kerberosec-pass-errors";

describe("kerberosec-pass-errors", () => {
	it("recognizes both raw and formatted KerberoSecPass subscription messages", () => {
		expect(
			isKerberoSecPassSubscriptionError(
				"the user is not subscribed to required model plan",
			),
		).toBe(true);

		const sdkFormatted =
			"No access to ClinePass subscription models yet. Subscribe to ClinePass, the low cost open weights model coding plan: https://app.cline.bot/dashboard/subscription?personal=true";
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
			"Switch to Cline usage-based billing",
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

	it("recognizes and formats upstream WAF / firewall HTML block pages", () => {
		const alibabaWafHtml =
			'<!doctypehtml><html lang="zh-cn"><head><meta charset="utf-8"><title>405</title></head><body><h1>Sorry, your request has been blocked as it may cause potential threats to the server\'s security.</h1><p>Powered by Alibaba Cloud</p></body></html>';

		expect(isWafBlockedErrorMessage(alibabaWafHtml)).toBe(true);
		expect(isWafBlockedErrorMessage(new Error(alibabaWafHtml))).toBe(true);

		const formatted = formatCliErrorMessage(new Error(alibabaWafHtml));
		expect(formatted).toContain("Provider Firewall / WAF Block (HTTP 405/403)");
		expect(formatted).toContain("Web Application Firewall (WAF)");
		expect(formatted).not.toContain("<!doctypehtml>");
		expect(formatted).not.toContain("zh-cn");
		expect(isWafBlockedErrorMessage(formatted)).toBe(true);
	});

	it("recognizes and formats content-blocked moderation responses", () => {
		const rawJson =
			'{"error":{"code":"content-blocked","message":"content-blocked (request id: 20260907202643936000273dzc56AdHWwbo6)","param":"","type":"agent_router_api_error"}}';

		expect(isContentBlockedErrorMessage(rawJson)).toBe(true);
		expect(isContentBlockedErrorMessage(new Error(rawJson))).toBe(true);

		const formatted = formatCliErrorMessage(new Error(rawJson));
		expect(formatted).toContain("Provider Content Filter Blocked");
		expect(formatted).toContain("content-blocked");
		expect(formatted).not.toContain("20260907202643936000273dzc56AdHWwbo6");
		expect(isContentBlockedErrorMessage(formatted)).toBe(true);
	});

	it("recognizes and formats generic HTML gateway error pages cleanly", () => {
		const html502 =
			"<!DOCTYPE html><html><head><title>502 Bad Gateway</title></head><body><center><h1>502 Bad Gateway</h1></center></body></html>";

		expect(isGenericHtmlErrorMessage(html502)).toBe(true);
		const formatted = formatCliErrorMessage(new Error(html502));
		expect(formatted).toContain("Provider Gateway Error");
		expect(formatted).toContain("502 Bad Gateway");
		expect(formatted).not.toContain("<center>");
	});
});
