/**
 * Zod Utilities
 *
 * Helper functions for working with Zod schemas.
 */

import { z } from "zod";
import { sanitizeToolInputSchema } from "./json-schema";

/**
 * Validate input using a Zod schema
 * Throws a formatted error if validation fails
 */
export function validateWithZod<T>(schema: z.ZodType<T>, input: unknown): T {
	const result = schema.safeParse(input);
	if (!result.success) {
		throw new Error(z.prettifyError(result.error));
	}
	return result.data;
}

/**
 * Convert a Zod schema into a provider-safe JSON Schema.
 *
 * `z.toJSONSchema()` omits `required` for objects whose properties are all
 * optional, and stamps the output with a draft-2020-12 `$schema` meta-key.
 * Strict providers reject the missing `required` ("null is not of type
 * \"array\"") and do not need the meta-key, so the result is deep-normalized at
 * every depth before it becomes a tool's `inputSchema`.
 */
export function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
	return sanitizeToolInputSchema(
		z.toJSONSchema(schema) as Record<string, unknown>,
	);
}
