import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type {
	LanguageModelV4,
	LanguageModelV4FunctionTool,
	LanguageModelV4Middleware,
} from "@ai-sdk/provider";
import { createProviderDefinedToolFactory } from "@ai-sdk/provider-utils";
import type {
	GatewayProviderContext,
	GatewayResolvedProviderConfig,
} from "@kerberosec/shared";
import {
	modelProducesImages,
	usesImageGenerationOperation,
} from "@kerberosec/shared";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { wrapLanguageModel } from "ai";
import { z } from "zod";
import { ensureFetch, resolveApiKey } from "../http";
import { splitToolImagesMiddleware } from "../middleware/split-tool-images";
import {
	createSuccessDataResponseFetch,
	withMaxCompletionTokensForReasoningModels,
} from "./openai-compatible";
import type { ProviderFactoryResult } from "./types";

export interface KerberoSecWebSearchInput {
	query: string;
	allowed_domains?: string[];
	blocked_domains?: string[];
}

export interface KerberoSecWebSearchResult {
	results: Array<{ title?: string; url?: string }>;
}

export interface KerberoSecWebSearchOptions {
	allowedDomains?: string[];
	blockedDomains?: string[];
}

export interface KerberoSecProviderOptions {
	apiKey?: string;
	baseURL: string;
	headers?: Record<string, string>;
	fetch?: typeof fetch;
	onResponseError?: (response: Response) => Promise<void> | void;
}

const KERBEROSEC_WEB_SEARCH_INPUT_SCHEMA: LanguageModelV4FunctionTool["inputSchema"] =
	{
		type: "object",
		properties: {
			query: {
				type: "string",
				description: "The search query.",
			},
			allowed_domains: {
				type: "array",
				items: { type: "string" },
				description: "Optional domains to restrict results to.",
			},
			blocked_domains: {
				type: "array",
				items: { type: "string" },
				description: "Optional domains to exclude from results.",
			},
		},
		required: ["query"],
		additionalProperties: false,
	};

const KerberoSecWebSearchInputSchema = z.object({
	query: z.string().min(1),
	allowed_domains: z.array(z.string()).optional(),
	blocked_domains: z.array(z.string()).optional(),
});

const webSearchFactory = createProviderDefinedToolFactory<
	KerberoSecWebSearchInput,
	KerberoSecWebSearchOptions
>({
	id: "kerberosec.web_search",
	inputSchema: KerberoSecWebSearchInputSchema,
});

function withoutTrailingSlash(value: string): string {
	return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizeDomains(value: string[] | undefined): string[] | undefined {
	const domains = value?.map((domain) => domain.trim()).filter(Boolean);
	return domains?.length ? domains : undefined;
}

function createKerberoSecFetch(
	options: KerberoSecProviderOptions,
): typeof fetch {
	const baseFetch = ensureFetch(options.fetch);
	return (async (input, init) => {
		const response = await baseFetch(input, init);
		await options.onResponseError?.(response);
		return response;
	}) as typeof fetch;
}

async function executeWebSearch(
	input: KerberoSecWebSearchInput,
	options: KerberoSecWebSearchOptions,
	provider: KerberoSecProviderOptions,
	abortSignal?: AbortSignal,
): Promise<KerberoSecWebSearchResult> {
	const allowedDomains = normalizeDomains(
		input.allowed_domains ?? options.allowedDomains,
	);
	const blockedDomains = normalizeDomains(
		input.blocked_domains ?? options.blockedDomains,
	);
	if (allowedDomains && blockedDomains) {
		throw new Error(
			"web_search accepts allowed domains or blocked domains, but not both.",
		);
	}

	const response = await createKerberoSecFetch(provider)(
		`${withoutTrailingSlash(provider.baseURL)}/search/websearch`,
		{
			method: "POST",
			headers: {
				...(provider.apiKey
					? { Authorization: `Bearer ${provider.apiKey}` }
					: {}),
				"Content-Type": "application/json",
				...provider.headers,
			},
			body: JSON.stringify({
				query: input.query,
				...(allowedDomains ? { allowed_domains: allowedDomains } : {}),
				...(blockedDomains ? { blocked_domains: blockedDomains } : {}),
			}),
			signal: abortSignal,
		},
	);
	const body = await response.text();
	if (!response.ok) {
		throw new Error(
			`KerberoSec web search failed (HTTP ${response.status}): ${body || response.statusText}`,
		);
	}

	const parsed = body ? (JSON.parse(body) as unknown) : {};
	const result = parsed as {
		data?: { results?: Array<{ title?: string; url?: string }> };
	};
	return {
		results: Array.isArray(result.data?.results) ? result.data.results : [],
	};
}

function createKerberoSecProviderToolMiddleware(): LanguageModelV4Middleware {
	return {
		specificationVersion: "v4",
		transformParams: async ({ params }) => ({
			...params,
			tools: params.tools?.map((tool) => {
				if (tool.type !== "provider" || tool.id !== "kerberosec.web_search") {
					return tool;
				}
				return {
					type: "function",
					name: tool.name,
					description:
						"Search the public web for current information and return matching pages.",
					inputSchema: KERBEROSEC_WEB_SEARCH_INPUT_SCHEMA,
				} satisfies LanguageModelV4FunctionTool;
			}),
		}),
	};
}

export interface KerberoSecProvider {
	(modelId: string): LanguageModelV4;
	tools: {
		webSearch(
			options?: KerberoSecWebSearchOptions,
		): ReturnType<typeof webSearchFactory<KerberoSecWebSearchResult>>;
	};
}

/** Create the KerberoSec AI SDK provider, including KerberoSec-native client tools. */
export function createKerberoSec(
	options: KerberoSecProviderOptions,
): KerberoSecProvider {
	const providerFetch = createKerberoSecFetch(options);
	const compatible = createOpenAICompatible({
		// Both KerberoSec gateway providers ("kerberosec" and "kerberosec-pass") share this AI
		// SDK provider and the same KerberoSec API; option routing keys their
		// providerOptions to the "kerberosec" bucket (see buildProviderAndAliasPatch).
		name: "kerberosec",
		baseURL: withoutTrailingSlash(options.baseURL),
		apiKey: options.apiKey,
		headers: options.headers,
		fetch: providerFetch,
		includeUsage: true,
		transformRequestBody: withMaxCompletionTokensForReasoningModels,
	});
	const createModel = (modelId: string): LanguageModelV4 =>
		wrapLanguageModel({
			model: wrapLanguageModel({
				model: compatible(modelId),
				middleware: createKerberoSecProviderToolMiddleware(),
			}),
			middleware: splitToolImagesMiddleware,
		});
	const kerberosec = ((modelId: string) =>
		createModel(modelId)) as KerberoSecProvider;
	kerberosec.tools = {
		webSearch: (toolOptions = {}) =>
			webSearchFactory<KerberoSecWebSearchResult>({
				...toolOptions,
				execute: (input, execution) =>
					executeWebSearch(input, toolOptions, options, execution.abortSignal),
			}),
	};
	return kerberosec;
}

function readResponseErrorHandler(
	config: GatewayResolvedProviderConfig,
): KerberoSecProviderOptions["onResponseError"] {
	const candidate = config.options?.onResponseError;
	return typeof candidate === "function"
		? (candidate as KerberoSecProviderOptions["onResponseError"])
		: undefined;
}

export async function createKerberoSecProviderModule(
	config: GatewayResolvedProviderConfig,
	context: GatewayProviderContext,
): Promise<ProviderFactoryResult> {
	const providerOptions: KerberoSecProviderOptions = {
		apiKey: await resolveApiKey(config),
		baseURL: config.baseUrl ?? "https://api.kerberosec.bot/api/v1",
		headers: config.headers,
		fetch: config.fetch,
		onResponseError: readResponseErrorHandler(config),
	};
	const kerberosec = createKerberoSec(providerOptions);
	const openRouter =
		context.provider.metadata?.imageTransport === "openrouter"
			? createOpenRouter({
					apiKey: providerOptions.apiKey,
					baseURL: providerOptions.baseURL,
					headers: providerOptions.headers,
					fetch: createSuccessDataResponseFetch(
						createKerberoSecFetch(providerOptions),
					),
					compatibility: "compatible",
				})
			: undefined;
	return {
		operations: {
			language: (modelId) =>
				openRouter &&
				modelProducesImages(context.model) &&
				!usesImageGenerationOperation(context.model)
					? openRouter.chat(modelId)
					: kerberosec(modelId),
			...(openRouter
				? {
						imageGeneration: (modelId: string) =>
							openRouter.imageModel(modelId),
					}
				: {}),
		},
		buildModelTools: (tools) => {
			const result: ReturnType<
				NonNullable<ProviderFactoryResult["buildModelTools"]>
			> = {};
			for (const tool of tools) {
				if (tool.name === "web_search") {
					result.web_search = {
						tool: kerberosec.tools.webSearch({
							allowedDomains: tool.allowedDomains,
							blockedDomains: tool.blockedDomains,
						}),
					};
				}
			}
			return result;
		},
		executesModelTools: true,
	};
}
