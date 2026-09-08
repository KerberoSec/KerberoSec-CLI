import { describe, expect, it } from "vitest";
import {
	KERBEROSEC_PASS_SUBSCRIPTION_OPTIONS,
	MAIN_MENU,
	getMainMenuOptions,
	getOAuthProviderLabel,
	shouldUseFeaturedKerberoSecModelPicker,
	toModelEntriesFromKnownModels,
	toModelEntry,
	toProviderEntry,
} from "./model";

describe("onboarding model helpers", () => {
	it("has updated AgentRouter and Cline main menu options", () => {
		const agentRouter = MAIN_MENU.find(
			(option) => option.value === "agent-router",
		);
		expect(agentRouter?.detail).toBe(
			"Multi-model gateway including Claude, GPT, & DeepSeek",
		);

		const kerberosecPass = MAIN_MENU.find(
			(option) => option.value === "kerberosec-pass",
		);
		expect(kerberosecPass?.label).toBe("Sign in with Cline");
		expect(kerberosecPass?.detail).toBe("Low cost subscription for everyone");

		const subscribeOption = KERBEROSEC_PASS_SUBSCRIPTION_OPTIONS.find(
			(option) => option.value === "subscribe",
		);
		expect(subscribeOption?.label).toBe("Subscribe to Cline");
	});

	it("hides KerberoSecPass from the main menu unless its feature flag is enabled", () => {
		expect(
			getMainMenuOptions().some((option) => option.value === "kerberosec-pass"),
		).toBe(false);
		expect(
			getMainMenuOptions({ isKerberoSecPassEnabled: false }).some(
				(option) => option.value === "kerberosec-pass",
			),
		).toBe(false);
		expect(
			getMainMenuOptions({ isKerberoSecPassEnabled: true }).some(
				(option) => option.value === "kerberosec-pass",
			),
		).toBe(true);
	});

	it("maps provider catalog entries into onboarding provider entries", () => {
		expect(
			toProviderEntry({
				id: "kerberosec",
				name: "KerberoSec",
				apiKey: "",
				oauthAccessTokenPresent: true,
				models: 12,
				defaultModelId: "openai/gpt-5.3-codex",
			}),
		).toEqual({
			id: "kerberosec",
			name: "KerberoSec",
			isOAuth: true,
			isLocalAuth: false,
			hasAuth: true,
			models: 12,
			defaultModelId: "openai/gpt-5.3-codex",
		});
	});

	it("treats API key providers as authenticated when an API key exists", () => {
		expect(
			toProviderEntry({
				id: "anthropic",
				name: "Anthropic",
				apiKey: "sk-test",
				models: null,
			}),
		).toMatchObject({
			id: "anthropic",
			isOAuth: false,
			isLocalAuth: false,
			hasAuth: true,
			models: null,
		});
	});

	it("marks the OpenAI Codex CLI provider as local auth", () => {
		expect(
			toProviderEntry({
				id: "openai-codex-cli",
				name: "OpenAI Codex CLI",
				models: null,
			}),
		).toMatchObject({
			id: "openai-codex-cli",
			isOAuth: false,
			isLocalAuth: true,
		});
	});

	it("maps model names and reasoning support strictly", () => {
		expect(
			toModelEntry({
				id: "anthropic/claude-sonnet-4.6",
				supportsReasoning: false,
			}),
		).toEqual({
			id: "anthropic/claude-sonnet-4.6",
			name: "anthropic/claude-sonnet-4.6",
			supportsReasoning: false,
		});

		expect(
			toModelEntry({
				id: "openai/gpt-5.3-codex",
				name: "GPT-5.3 Codex",
				supportsReasoning: true,
			}),
		).toEqual({
			id: "openai/gpt-5.3-codex",
			name: "GPT-5.3 Codex",
			supportsReasoning: true,
		});
	});

	it("maps resolved known models into sorted onboarding model entries", () => {
		expect(
			toModelEntriesFromKnownModels({
				"gpt-5.2": {
					name: "GPT-5.2",
					capabilities: ["tools"],
				},
				"gpt-5.3-codex": {
					name: "GPT-5.3 Codex",
					capabilities: ["tools", "reasoning"],
				},
			}),
		).toEqual([
			{
				id: "gpt-5.2",
				name: "GPT-5.2",
				supportsReasoning: false,
			},
			{
				id: "gpt-5.3-codex",
				name: "GPT-5.3 Codex",
				supportsReasoning: true,
			},
		]);
	});

	it("keeps non-chat models out of the onboarding model picker", () => {
		expect(
			toModelEntriesFromKnownModels({
				"operation-only-whisper": {
					name: "Operation-only Whisper",
					operation: "transcription",
				},
				"whisper-large-v3": {
					name: "Whisper Large V3",
					modalities: { input: ["audio"], output: ["text"] },
				},
				"llama-chat": {
					name: "Llama Chat",
					modalities: { input: ["text"], output: ["text"] },
				},
			}),
		).toEqual([
			{
				id: "llama-chat",
				name: "Llama Chat",
				supportsReasoning: false,
			},
		]);
	});

	it("formats OAuth provider labels for onboarding status views", () => {
		expect(getOAuthProviderLabel("kerberosec")).toBe("Cline");
		expect(getOAuthProviderLabel("kerberosec-pass")).toBe("Cline");
		expect(getOAuthProviderLabel("openai-codex")).toBe("ChatGPT");
		expect(getOAuthProviderLabel("oca")).toBe("oca");
	});

	it("uses the featured KerberoSec model picker for the KerberoSec and KerberoSecPass providers", () => {
		expect(shouldUseFeaturedKerberoSecModelPicker("kerberosec")).toBe(true);
		expect(shouldUseFeaturedKerberoSecModelPicker("kerberosec-pass")).toBe(
			true,
		);
		expect(shouldUseFeaturedKerberoSecModelPicker("anthropic")).toBe(false);
	});
});
