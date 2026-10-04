import {
	type AgentModelEvent,
	type AgentToolDefinition,
	type GatewayProviderContext,
	type GatewayStreamRequest,
	TeamStatusInputSchema,
	zodToJsonSchema,
} from "@kerberosec/shared";
import { describe, expect, it } from "vitest";
import { createOpenAICompatibleProvider } from "./ai-sdk";

/**
 * Regression coverage for the request rejection that reads
 *
 *   Invalid schema for function 'team_status': null is not of type "array"
 *
 * AgentRouter (and every other gateway that validates tool schemas strictly)
 * treats an object schema without `required` as `required: null`. `team_status`
 * is `z.object({})`, so it was the first tool in the payload whose schema had no
 * `required` array and it failed every request that exposed the team tools.
 *
 * These tests assert on the serialized HTTP body -- not on the in-process tool
 * definition -- because that is what the provider actually validates.
 */

const TEAM_STATUS_TOOL: AgentToolDefinition = {
	name: "team_status",
	description: "Return a snapshot of team members.",
	inputSchema: zodToJsonSchema(TeamStatusInputSchema),
};

const SSE_OK = [
	'data: {"id":"c1","object":"chat.completion.chunk","created":1,"model":"test-model","choices":[{"index":0,"delta":{"role":"assistant","content":"ok"},"finish_reason":null}]}',
	'data: {"id":"c1","object":"chat.completion.chunk","created":1,"model":"test-model","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}',
	"data: [DONE]",
	"",
].join("\n\n");

interface CapturedFunctionTool {
	type: string;
	function: {
		name: string;
		description?: string;
		parameters?: Record<string, unknown>;
	};
}

async function captureWireTools(
	tools: AgentToolDefinition[],
): Promise<CapturedFunctionTool[]> {
	const bodies: Array<{ tools?: CapturedFunctionTool[] }> = [];
	const config = {
		providerId: "openai-compatible",
		apiKey: "test-key",
		baseUrl: "http://fake.local/v1",
		fetch: (async (_input: unknown, init: { body?: unknown }) => {
			bodies.push(
				typeof init?.body === "string"
					? (JSON.parse(init.body) as { tools?: CapturedFunctionTool[] })
					: {},
			);
			return new Response(SSE_OK, {
				status: 200,
				headers: { "content-type": "text/event-stream" },
			});
		}) as unknown as typeof fetch,
	};
	const provider = await createOpenAICompatibleProvider(config);
	const model = {
		id: "test-model",
		providerId: "openai-compatible",
		name: "test-model",
	};
	const context = {
		provider: {
			id: "openai-compatible",
			name: "OpenAI Compatible",
			defaultModelId: "test-model",
			models: [model],
		},
		model,
		config,
	} as unknown as GatewayProviderContext;
	const request = {
		providerId: "openai-compatible",
		modelId: "test-model",
		messages: [
			{
				id: "msg_user",
				role: "user",
				content: [{ type: "text", text: "status?" }],
				createdAt: new Date(),
			},
		],
		tools,
	} as unknown as GatewayStreamRequest;

	const events: AgentModelEvent[] = [];
	for await (const event of await provider.stream(request, context)) {
		events.push(event);
	}

	return bodies[0]?.tools ?? [];
}

describe("openai-compatible tool schema wire format", () => {
	it("sends required as an array for a tool with no parameters", async () => {
		const tools = await captureWireTools([TEAM_STATUS_TOOL]);
		const parameters = tools[0]?.function.parameters as Record<string, unknown>;

		expect(tools[0]?.function.name).toBe("team_status");
		expect(parameters).toHaveProperty("required");
		expect(parameters.required).toEqual([]);
		expect(parameters.properties).toEqual({});
		// The draft-2020-12 meta-key Zod emits must not reach the provider.
		expect(parameters).not.toHaveProperty("$schema");
	});

	it("normalizes missing required at every depth of a hand-written schema", async () => {
		const tools = await captureWireTools([
			{
				name: "nested_tool",
				description: "Tool with nested objects and no required arrays",
				inputSchema: {
					type: "object",
					properties: {
						outer: {
							type: "object",
							properties: { value: { type: "string" } },
						},
						entries: {
							type: "array",
							items: {
								type: "object",
								properties: { path: { type: "string" } },
							},
						},
					},
				},
			},
		]);

		const parameters = tools[0]?.function.parameters as Record<string, unknown>;
		const properties = parameters.properties as Record<
			string,
			Record<string, unknown>
		>;

		expect(parameters.required).toEqual([]);
		expect(properties.outer.required).toEqual([]);
		expect(
			(properties.entries.items as Record<string, unknown>).required,
		).toEqual([]);
	});

	it("leaves a fully specified tool schema unchanged", async () => {
		const schema = {
			type: "object",
			properties: {
				commands: { type: "array", items: { type: "string" } },
			},
			required: ["commands"],
			additionalProperties: false,
		};

		const tools = await captureWireTools([
			{
				name: "run_commands",
				description: "Runs shell commands",
				inputSchema: schema,
			},
		]);

		expect(tools[0]?.function.parameters).toEqual(schema);
	});
});
