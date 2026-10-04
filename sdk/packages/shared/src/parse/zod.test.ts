import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zodToJsonSchema } from "./zod";

/**
 * `zodToJsonSchema` is the single conversion point for every zod-defined tool
 * schema in the codebase, so it must emit schemas that strict providers accept:
 * object schemas always carry `required`, and no `$schema` meta-key survives.
 */
describe("zodToJsonSchema", () => {
	it("emits required: [] for a schema with no properties", () => {
		// z.object({}) is `team_status`: an empty schema whose missing `required`
		// was rejected upstream with "null is not of type \"array\"".
		const schema = zodToJsonSchema(z.object({}));

		expect(schema).toEqual({
			type: "object",
			properties: {},
			additionalProperties: false,
			required: [],
		});
	});

	it("emits required: [] when every property is optional", () => {
		const schema = zodToJsonSchema(
			z.object({
				status: z.string().optional(),
				assignee: z.string().optional(),
			}),
		);

		expect(schema.required).toEqual([]);
		expect(Object.keys(schema.properties as object)).toEqual([
			"status",
			"assignee",
		]);
	});

	it("normalizes nested object schemas whose properties are all optional", () => {
		const schema = zodToJsonSchema(
			z.object({
				outer: z
					.object({ inner: z.string().optional() })
					.describe("Nested optional object"),
			}),
		);

		const properties = schema.properties as Record<
			string,
			Record<string, unknown>
		>;
		expect(properties.outer.required).toEqual([]);
		expect(properties.outer.additionalProperties).toBe(false);
	});

	it("keeps required properties and strips the $schema meta-key", () => {
		const schema = zodToJsonSchema(
			z.object({ query: z.string().min(1), limit: z.number().optional() }),
		);

		expect(schema).not.toHaveProperty("$schema");
		expect(schema.required).toEqual(["query"]);
	});

	it("normalizes schemas nested in arrays", () => {
		const schema = zodToJsonSchema(
			z.object({
				files: z.array(
					z.object({ path: z.string(), start_line: z.number().optional() }),
				),
			}),
		);

		const files = (schema.properties as Record<string, Record<string, unknown>>)
			.files;
		expect(schema.required).toEqual(["files"]);
		expect((files.items as Record<string, unknown>).required).toEqual(["path"]);
	});
});
