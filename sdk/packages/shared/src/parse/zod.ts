/**
 * Zod Utilities
 *
 * Helper functions for working with Zod schemas.
 */

import { z } from "zod";

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

export function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
	const json = z.toJSONSchema(schema) as Record<string, unknown>;
	if (json && typeof json === "object" && json.type === "object") {
		if (!json.properties || typeof json.properties !== "object") {
			json.properties = {};
		}
		if (!Array.isArray(json.required)) {
			json.required = [];
		}
	}
	return json;
}
