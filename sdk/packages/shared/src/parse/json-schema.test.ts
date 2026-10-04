import { describe, expect, it } from "vitest";
import {
	normalizeProviderToolInputSchema,
	sanitizeToolInputSchema,
} from "./json-schema";

/**
 * These schemas are the wire-level contract with providers. A strict gateway
 * rejects the whole request when an object schema has no `required` array:
 *
 *   Invalid schema for function 'team_status': null is not of type "array"
 *
 * so the normalizer is asserted to leave no object schema (at any depth)
 * without `required`, while keeping the schema's meaning unchanged.
 */
describe("sanitizeToolInputSchema", () => {
	it("adds an empty required array to an object with no properties", () => {
		// z.object({}) -- the `team_status` shape that triggered the regression.
		const sanitized = sanitizeToolInputSchema({ type: "object" });

		expect(sanitized).toEqual({
			type: "object",
			properties: {},
			required: [],
		});
	});

	it("preserves an explicitly empty required array", () => {
		const sanitized = sanitizeToolInputSchema({
			type: "object",
			properties: {},
			required: [],
			additionalProperties: false,
		});

		expect(sanitized.required).toEqual([]);
		expect(sanitized.additionalProperties).toBe(false);
	});

	it("normalizes a missing or null required to an array of strings", () => {
		expect(
			sanitizeToolInputSchema({
				type: "object",
				properties: { a: { type: "string" } },
			}).required,
		).toEqual([]);
		expect(
			sanitizeToolInputSchema({
				type: "object",
				properties: { a: { type: "string" } },
				required: null as unknown as string[],
			}).required,
		).toEqual([]);
		expect(
			sanitizeToolInputSchema({
				type: "object",
				properties: { a: { type: "string" }, b: { type: "string" } },
				required: ["a", "a", 3, null] as unknown as string[],
			}).required,
		).toEqual(["a"]);
	});

	it("keeps a valid required list untouched", () => {
		const sanitized = sanitizeToolInputSchema({
			type: "object",
			properties: { files: { type: "array", items: { type: "string" } } },
			required: ["files"],
			additionalProperties: false,
		});

		expect(sanitized).toEqual({
			type: "object",
			properties: { files: { type: "array", items: { type: "string" } } },
			required: ["files"],
			additionalProperties: false,
		});
	});

	it("normalizes nested object schemas recursively", () => {
		const sanitized = sanitizeToolInputSchema({
			type: "object",
			properties: {
				outer: {
					type: "object",
					properties: { inner: { type: "object" } },
				},
			},
			required: [],
		});

		const properties = sanitized.properties as Record<
			string,
			Record<string, unknown>
		>;
		const outer = properties.outer;
		expect(outer.required).toEqual([]);
		expect(
			(outer.properties as Record<string, Record<string, unknown>>).inner
				.required,
		).toEqual([]);
	});

	it("normalizes schemas inside anyOf, allOf, oneOf and items", () => {
		const sanitized = sanitizeToolInputSchema({
			type: "object",
			properties: {
				choice: {
					anyOf: [{ type: "object" }, { type: "string" }],
				},
				list: { type: "array", items: { type: "object" } },
			},
			required: [],
		});

		const properties = sanitized.properties as Record<
			string,
			Record<string, unknown>
		>;
		expect(properties.choice.anyOf).toEqual([
			{ type: "object", properties: {}, required: [] },
			{ type: "string" },
		]);
		expect(properties.list.items).toEqual({
			type: "object",
			properties: {},
			required: [],
		});
	});

	it("strips $schema meta-keys at every depth", () => {
		const sanitized = sanitizeToolInputSchema({
			$schema: "https://json-schema.org/draft/2020-12/schema",
			type: "object",
			properties: {
				value: {
					$schema: "https://json-schema.org/draft/2020-12/schema",
					type: "string",
				},
			},
			required: [],
		});

		expect(sanitized).not.toHaveProperty("$schema");
		expect(
			(sanitized.properties as Record<string, Record<string, unknown>>).value,
		).not.toHaveProperty("$schema");
	});

	it("drops null keyword values but keeps nulls inside enums", () => {
		const sanitized = sanitizeToolInputSchema({
			type: "object",
			properties: {
				value: { type: "string", description: null as unknown as string },
				maybe: { enum: [null, "a"] },
				weird: { type: ["string", null] as unknown as string[] },
			},
			required: [],
		});

		const properties = sanitized.properties as Record<
			string,
			Record<string, unknown>
		>;
		expect(properties.value).not.toHaveProperty("description");
		expect(properties.maybe.enum).toEqual([null, "a"]);
		expect(properties.weird.type).toEqual(["string"]);
	});

	it("adds items to arrays that declare none", () => {
		const sanitized = sanitizeToolInputSchema({
			type: "object",
			properties: { commands: { type: "array" } },
			required: [],
		});

		expect(
			(sanitized.properties as Record<string, Record<string, unknown>>).commands
				.items,
		).toEqual({});
	});

	it("drops null values on array keywords but keeps const and default null", () => {
		// `enum: null` / `examples: null` are array keywords holding null, i.e.
		// exactly the "null is not of type \"array\"" rejection. `const: null`
		// and `default: null` are legitimate and must survive.
		const sanitized = sanitizeToolInputSchema({
			type: "object",
			properties: {
				a: { type: "string", enum: null as unknown as string[] },
				b: { type: "string", examples: null as unknown as string[] },
				c: { type: "string", const: null as unknown as string },
				d: { type: "string", default: null as unknown as string },
			},
			required: [],
		});

		const properties = sanitized.properties as Record<
			string,
			Record<string, unknown>
		>;
		expect(properties.a).not.toHaveProperty("enum");
		expect(properties.b).not.toHaveProperty("examples");
		expect(properties.c).toHaveProperty("const");
		expect(properties.c.const).toBeNull();
		expect(properties.d).toHaveProperty("default");
		expect(properties.d.default).toBeNull();
	});

	it("replaces null subschemas with an empty schema", () => {
		// A null where a subschema belongs (broken MCP/plugin schemas do this)
		// would reach the provider as "null is not of type \"object\"".
		const sanitized = sanitizeToolInputSchema({
			type: "object",
			properties: {
				broken: null as unknown as Record<string, unknown>,
				list: { type: "array", items: [null] },
				choice: { anyOf: [null, { type: "string" }] },
			},
			required: [],
		});

		const properties = sanitized.properties as Record<
			string,
			Record<string, unknown>
		>;
		expect(properties.broken).toEqual({});
		expect((properties.list.items as unknown[])[0]).toEqual({});
		expect((properties.choice.anyOf as unknown[])[0]).toEqual({});
	});

	it("never mutates the caller's schema", () => {
		const original = { type: "object", properties: { a: { type: "string" } } };
		const snapshot = structuredClone(original);

		sanitizeToolInputSchema(original);

		expect(original).toEqual(snapshot);
	});

	it("falls back to an empty object schema for non-object input", () => {
		expect(sanitizeToolInputSchema(undefined)).toEqual({
			type: "object",
			properties: {},
			required: [],
		});
		expect(sanitizeToolInputSchema(null)).toEqual({
			type: "object",
			properties: {},
			required: [],
		});
		expect(
			sanitizeToolInputSchema([{ type: "object" }] as unknown as Record<
				string,
				unknown
			>),
		).toEqual({ type: "object", properties: {}, required: [] });
	});
	it("leaves composition-only branches free to declare required", () => {
		// A branch such as { required: ["commands"] } contributes to an allOf
		// parent. Adding required: [] there would erase the constraint, so the
		// normalizer only touches branches that own their properties.
		const sanitized = sanitizeToolInputSchema({
			allOf: [
				{ type: "object", properties: { commands: { type: "array" } } },
				{ required: ["commands"] },
			],
		});

		expect(sanitized.allOf).toEqual([
			{
				type: "object",
				properties: { commands: { type: "array", items: {} } },
				required: [],
			},
			{ required: ["commands"] },
		]);
	});
});

describe("normalizeProviderToolInputSchema", () => {
	it("forces the root into an object schema with required present", () => {
		expect(normalizeProviderToolInputSchema(undefined)).toEqual({
			type: "object",
			properties: {},
			required: [],
		});
		expect(normalizeProviderToolInputSchema({})).toEqual({
			type: "object",
			properties: {},
			required: [],
		});
		expect(normalizeProviderToolInputSchema({ type: "object" })).toEqual({
			type: "object",
			properties: {},
			required: [],
		});
	});

	it("adds required to a composition root without hoisting its branches", () => {
		const normalized = normalizeProviderToolInputSchema({
			type: "object",
			allOf: [{ type: "object", properties: { a: { type: "string" } } }],
		});

		expect(normalized.type).toBe("object");
		expect(normalized.required).toEqual([]);
		expect(normalized).toHaveProperty("allOf");
	});

	it("leaves provider-safe schemas unchanged", () => {
		const schema = {
			type: "object",
			properties: {
				queries: { type: "array", items: { type: "string" } },
			},
			required: ["queries"],
			additionalProperties: false,
		};

		expect(normalizeProviderToolInputSchema(structuredClone(schema))).toEqual(
			schema,
		);
	});
});
