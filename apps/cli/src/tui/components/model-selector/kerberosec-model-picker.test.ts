import { describe, expect, it } from "vitest";
import {
	buildFeaturedModelEntries,
	freeTierDescriptionFor,
	KERBEROSEC_PASS_FREE_SECTION_DESCRIPTION,
} from "./kerberosec-model-entries";

const model = (id: string) => ({ id, name: id, description: "", tags: [] });

describe("kerberosec model picker entries", () => {
	it("builds Recommended/Free sections for the kerberosec provider", () => {
		const entries = buildFeaturedModelEntries("kerberosec", {
			recommended: [model("anthropic/claude-sonnet-5")],
			free: [model("deepseek/deepseek-v4-flash")],
			kerberosecPass: [model("kerberosec-pass/glm-5.1")],
		});

		expect(entries).toEqual([
			{
				kind: "model",
				model: model("anthropic/claude-sonnet-5"),
				tier: "recommended",
			},
			{
				kind: "model",
				model: model("deepseek/deepseek-v4-flash"),
				tier: "free",
			},
			{ kind: "browse" },
		]);
	});

	it("builds Subscribed/Free sections for the kerberosec-pass provider", () => {
		const entries = buildFeaturedModelEntries("kerberosec-pass", {
			recommended: [model("anthropic/claude-sonnet-5")],
			free: [model("deepseek/deepseek-v4-flash")],
			kerberosecPass: [
				model("kerberosec-pass/glm-5.1"),
				model("kerberosec-pass/kimi-k2.6"),
			],
		});

		expect(entries).toEqual([
			{
				kind: "model",
				model: model("kerberosec-pass/glm-5.1"),
				tier: "subscribed",
			},
			{
				kind: "model",
				model: model("kerberosec-pass/kimi-k2.6"),
				tier: "subscribed",
			},
			{
				kind: "model",
				model: model("deepseek/deepseek-v4-flash"),
				tier: "free",
			},
		]);
	});

	it("adds the browse-all escape when the kerberosecPass bucket is empty", () => {
		// The fetch fell back to the bundled list (no pass models); the sections
		// alone would leave a subscriber able to pick only free models.
		const entries = buildFeaturedModelEntries("kerberosec-pass", {
			recommended: [],
			free: [model("deepseek/deepseek-v4-flash")],
			kerberosecPass: [],
		});

		expect(entries).toEqual([
			{
				kind: "model",
				model: model("deepseek/deepseek-v4-flash"),
				tier: "free",
			},
			{ kind: "browse" },
		]);
	});

	it("attaches the quota explainer only to the KerberoSecPass picker's free section", () => {
		const data = {
			recommended: [model("anthropic/claude-sonnet-5")],
			free: [model("deepseek/deepseek-v4-flash")],
			kerberosecPass: [model("kerberosec-pass/glm-5.1")],
		};

		expect(
			freeTierDescriptionFor(
				buildFeaturedModelEntries("kerberosec-pass", data),
			),
		).toBe(KERBEROSEC_PASS_FREE_SECTION_DESCRIPTION);
		expect(
			freeTierDescriptionFor(buildFeaturedModelEntries("kerberosec", data)),
		).toBe(undefined);
	});
});
