import { z } from "zod";
import type { AgentTool, AgentToolContext } from "../agent";
import { sanitizeToolInputSchema } from "../parse/json-schema";
import { zodToJsonSchema } from "../parse/zod";

/**
 * Resolve the top-level shape of a hand-written tool input schema.
 *
 * Object-shaped schemas are made explicit (`type: "object"`) while unions are
 * rejected loudly: a tool whose top-level schema can be a string or array is not
 * a valid tool `parameters` value for any major provider, and failing at
 * registration surfaces the bug immediately instead of at inference time.
 */
function resolveToolInputSchemaShape(
	inputSchema: Record<string, unknown>,
): Record<string, unknown> {
	const schema = inputSchema;

	if (typeof schema.type === "string") {
		return schema;
	}
	if (
		"properties" in schema ||
		"required" in schema ||
		"additionalProperties" in schema
	) {
		return {
			type: "object",
			...schema,
		};
	}
	for (const key of ["oneOf", "anyOf", "allOf"] as const) {
		const branches = schema[key];
		if (!Array.isArray(branches) || branches.length === 0) {
			continue;
		}

		if (key === "allOf") {
			// allOf means the input must satisfy ALL branches simultaneously.
			// A single branch explicitly typed as an object is sufficient to
			// constrain the top-level shape — other branches are free to add
			// required, minProperties, etc. without repeating type: "object".
			// If no branch asserts type: "object" we cannot verify the schema
			// is object-shaped, so fail loudly just as we do for anyOf/oneOf —
			// the developer should make the object constraint explicit.
			const hasObjectBranch = branches.some(
				(branch) =>
					branch &&
					typeof branch === "object" &&
					(branch as Record<string, unknown>).type === "object",
			);
			if (hasObjectBranch) {
				return { type: "object", ...schema };
			}
			throw new Error(
				`Tool inputSchema must describe an object at the top level, but ` +
					`the schema has a top-level "allOf" with no branch that asserts ` +
					`type: "object". Add type: "object" to at least one allOf branch ` +
					`to make the object constraint explicit.`,
			);
		}

		// oneOf / anyOf: the input matches ONE (or at least one) branch.
		// Every branch must be object-shaped — a single non-object branch means
		// the top-level input can be a string, array, etc., which providers
		// reject.  Fail loudly at registration time so the bug surfaces
		// immediately rather than at inference time.
		const allObjectBranches = branches.every(
			(branch) =>
				branch &&
				typeof branch === "object" &&
				(branch as Record<string, unknown>).type === "object",
		);
		if (allObjectBranches) {
			return { type: "object", ...schema };
		}
		throw new Error(
			`Tool inputSchema must describe an object at the top level, but ` +
				`the schema has a top-level "${key}" whose branches include ` +
				`non-object types. Pass the strict object schema as inputSchema ` +
				`and reserve union/coercion schemas for use inside execute().`,
		);
	}
	return schema;
}

export function createTool<TInput, TOutput>(config: {
	name: string;
	description: string;
	inputSchema: Record<string, unknown>;
	execute: (input: TInput, context: AgentToolContext) => Promise<TOutput>;
	lifecycle?: AgentTool<TInput, TOutput>["lifecycle"];
	timeoutMs?: number;
	retryable?: boolean;
	maxRetries?: number;
}): AgentTool<TInput, TOutput>;
export function createTool<TSchema extends z.ZodTypeAny, TOutput>(config: {
	name: string;
	description: string;
	inputSchema: TSchema;
	execute: (
		input: z.infer<TSchema>,
		context: AgentToolContext,
	) => Promise<TOutput>;
	lifecycle?: AgentTool<z.infer<TSchema>, TOutput>["lifecycle"];
	timeoutMs?: number;
	retryable?: boolean;
	maxRetries?: number;
}): AgentTool<z.infer<TSchema>, TOutput>;
export function createTool<TInput, TOutput>(config: {
	name: string;
	description: string;
	inputSchema: Record<string, unknown> | z.ZodTypeAny;
	execute: (input: TInput, context: AgentToolContext) => Promise<TOutput>;
	lifecycle?: AgentTool<TInput, TOutput>["lifecycle"];
	timeoutMs?: number;
	retryable?: boolean;
	maxRetries?: number;
}): AgentTool<TInput, TOutput> {
	const inputSchema = sanitizeToolInputSchema(
		resolveToolInputSchemaShape(
			config.inputSchema instanceof z.ZodType
				? zodToJsonSchema(config.inputSchema)
				: config.inputSchema,
		),
	);

	return {
		name: config.name,
		description: config.description,
		inputSchema,
		lifecycle: config.lifecycle,
		timeoutMs: config.timeoutMs ?? 30_000,
		retryable: config.retryable ?? true,
		maxRetries: config.maxRetries ?? 3,
		execute: config.execute,
	};
}
