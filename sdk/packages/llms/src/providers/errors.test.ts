import { describe, expect, it } from "vitest";
import { isKerberoSecPassLimitMessage } from "../index.browser";
import {
	extractKerberoSecFreeModelLimitResetTime,
	extractKerberoSecPassLimitMessage,
	isKerberoSecFreeModelLimitMessage,
} from "./errors";

describe("isKerberoSecPassLimitMessage", () => {
	it("matches the KerberoSecPass weekly limit message", () => {
		const message =
			"You have reached your weekly KerberoSecpass limit. The limit resets in 7d, please try again later.";
		expect(isKerberoSecPassLimitMessage(message)).toBe(true);
	});

	it("matches the 5-hour KerberoSecPass limit message", () => {
		const message =
			"You have reached your 5-hour KerberoSecpass limit. The limit resets in 5h, please try again later.";
		expect(isKerberoSecPassLimitMessage(message)).toBe(true);
	});

	it("handles tab-heavy non-matches without regex backtracking", () => {
		expect(
			isKerberoSecPassLimitMessage(
				`You have reached your\t${"\t".repeat(10_000)}`,
			),
		).toBe(false);
		expect(
			isKerberoSecPassLimitMessage(
				`You have reached your\t-${"\t".repeat(10_000)}`,
			),
		).toBe(false);
		expect(
			isKerberoSecPassLimitMessage(
				`You have reached your\t-\tKerberoSecpass limit.The limit resets in\t${"\t".repeat(10_000)}`,
			),
		).toBe(false);
	});
});

describe("extractKerberoSecPassLimitMessage", () => {
	it("extracts the KerberoSecPass weekly limit message", () => {
		const message =
			"You have reached your weekly KerberoSecpass limit. The limit resets in 7d, please try again later.";

		const extracted = extractKerberoSecPassLimitMessage(`Error: ${message}`);
		expect(extracted).toBe(message);
	});

	it("extracts the 5-hour KerberoSecPass limit message", () => {
		const message =
			"You have reached your 5-hour KerberoSecpass limit. The limit resets in 5h, please try again later.";

		const extracted = extractKerberoSecPassLimitMessage(`Error: ${message}`);
		expect(extracted).toBe(message);
	});
});

describe("KerberoSec free model limit messages", () => {
	const message =
		"Daily free limit reached on model deepseek/deepseek-v4-flash. Try again in 23h 59m";

	it("detects the message in an HTTP error", () => {
		const error = `Error: Error 429: ${message}`;
		expect(isKerberoSecFreeModelLimitMessage(error)).toBe(true);
		expect(extractKerberoSecFreeModelLimitResetTime(error)).toBe("23h 59m");
	});

	it("does not match unrelated daily limits", () => {
		expect(
			isKerberoSecFreeModelLimitMessage(
				"Your daily spend limit has been reached. Try again in 23h 59m",
			),
		).toBe(false);
	});
});
