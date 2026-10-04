/**
 * JSON Schema normalization for LLM tool definitions.
 *
 * Providers -- and the gateways in front of them -- validate the JSON Schema we
 * send as a tool's `parameters`. Object schemas must carry `required` as an
 * array: an absent (or `null`) `required` is what a strict validator reports as
 *
 *   Invalid schema for function 'tool_name': null is not of type "array"
 *
 * and the whole request is rejected before the model ever runs. Zod's
 * `z.toJSONSchema()` omits `required` entirely for objects whose properties are
 * all optional, so a tool built from `z.object({})` -- e.g. `team_status` --
 * fails every request that exposes it through such a gateway.
 *
 * `sanitizeToolInputSchema()` deep-clones a schema and repairs those shapes at
 * every depth (`properties`, `items`, `anyOf`, `oneOf`, `allOf`, `$defs`, ...)
 * so strict and lenient providers agree on its meaning:
 *
 *   - object schemas always carry `properties` (object) and `required` (array)
 *   - `required` is always an array of unique strings, never `null`/`undefined`
 *   - an empty `required: []` is preserved, never dropped: `[]` means "no
 *     required properties" while a missing key means `null` to strict validators
 *   - `$schema` meta-keys are stripped (LLM tool APIs do not need them)
 *   - `null` keyword values are dropped, and a `null` subschema (e.g. a broken
 *     `properties` entry from an MCP server) becomes an empty schema `{}` so no
 *     keyword can end up `null` where a provider expects an object or array
 *   - arrays always carry `items`
 *
 * `normalizeProviderToolInputSchema()` additionally guarantees the root is a
 * well-formed provider object schema, which is the shape every tool
 * `parameters` field must have.
 */

/**
 * Keywords whose value is a single subschema (`items` also accepts the legacy
 * draft-04 tuple form, which `sanitizeSchemaValue` handles as an array).
 */
const SCHEMA_VALUE_KEYS = new Set([
	"items",
	"additionalItems",
	"additionalProperties",
	"contains",
	"propertyNames",
	"not",
	"if",
	"then",
	"else",
	"unevaluatedItems",
	"unevaluatedProperties",
]);

/** Keywords whose value is a list of subschemas. */
const SCHEMA_ARRAY_KEYS = new Set(["anyOf", "oneOf", "allOf", "prefixItems"]);

/** Keywords whose value is a map of names to subschemas. */
const SCHEMA_MAP_KEYS = new Set([
	"properties",
	"patternProperties",
	"$defs",
	"definitions",
	"dependentSchemas",
]);

/**
 * Keywords that assert the instance shape by composition instead of naming
 * `properties`. Adding `properties: {}` to those nodes is harmless, but adding
 * `required: []` would claim "nothing is required" even though a branch may
 * require fields, so they are left alone and only their branches normalize.
 */
const COMPOSITION_KEYS = [
	"allOf",
	"anyOf",
	"oneOf",
	"not",
	"if",
	"then",
	"else",
	"$ref",
] as const;

/**
 * Keywords where `null` is a legitimate value: `const: null` constrains the
 * instance to null and `default: null` is an annotation.
 *
 * `enum` and `examples` are deliberately absent: both are array keywords, so a
 * null there is precisely the "null is not of type \"array\"" rejection we are
 * removing. They are dropped instead of forwarded.
 */
const NULL_TOLERANT_KEYS = new Set(["const", "default"]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeSchemaValue(value: unknown): unknown {
	if (value === null) {
		// A null where a subschema is expected (`properties: {a: null}`,
		// `items: [null]`, a null branch) would reach the provider as
		// `null is not of type "object"`. An empty schema keeps the shape
		// valid while constraining nothing, which matches what null meant here.
		return {};
	}
	if (Array.isArray(value)) {
		return value.map((entry) => sanitizeSchemaValue(entry));
	}
	if (!isPlainObject(value)) {
		return value;
	}
	return sanitizeSchemaNode(value);
}

/**
 * An object schema that can safely be given `properties`/`required` defaults:
 * either it already declares `properties`, or it is a plain `type: "object"`
 * with no composition keyword that may be supplying them.
 */
function isPlainObjectSchema(node: Record<string, unknown>): boolean {
	if (isPlainObject(node.properties)) {
		return true;
	}
	if (node.type !== "object") {
		return false;
	}
	return !COMPOSITION_KEYS.some((key) => key in node);
}

function normalizeRequiredKeyword(node: Record<string, unknown>): void {
	if (!Array.isArray(node.required)) {
		node.required = [];
		return;
	}
	const required: string[] = [];
	for (const entry of node.required) {
		if (typeof entry === "string" && !required.includes(entry)) {
			required.push(entry);
		}
	}
	node.required = required;
}

function normalizeTypeKeyword(node: Record<string, unknown>): void {
	const type = node.type;
	if (!Array.isArray(type)) {
		return;
	}
	const types = type.filter(
		(entry): entry is string => typeof entry === "string",
	);
	if (types.length === 0) {
		delete node.type;
		return;
	}
	node.type = types;
}

function normalizeShapeKeywords(node: Record<string, unknown>): void {
	if (isPlainObjectSchema(node)) {
		if (!isPlainObject(node.properties)) {
			node.properties = {};
		}
		normalizeRequiredKeyword(node);
	}
	if (node.type === "array" && node.items === undefined) {
		node.items = {};
	}
}

function sanitizeSchemaNode(
	node: Record<string, unknown>,
): Record<string, unknown> {
	const sanitized: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(node)) {
		// Zod v4 stamps every schema it emits with a draft-2020-12 meta-key.
		// It is meaningless for tool parameters and some strict gateways reject
		// schemas they cannot resolve, so it never survives normalization.
		if (key === "$schema") {
			continue;
		}
		if (value === null && !NULL_TOLERANT_KEYS.has(key)) {
			continue;
		}
		if (SCHEMA_MAP_KEYS.has(key) && isPlainObject(value)) {
			const entries: Record<string, unknown> = {};
			for (const [name, subschema] of Object.entries(value)) {
				entries[name] = sanitizeSchemaValue(subschema);
			}
			sanitized[key] = entries;
			continue;
		}
		if (SCHEMA_ARRAY_KEYS.has(key) && Array.isArray(value)) {
			sanitized[key] = value.map((entry) => sanitizeSchemaValue(entry));
			continue;
		}
		if (SCHEMA_VALUE_KEYS.has(key)) {
			sanitized[key] = sanitizeSchemaValue(value);
			continue;
		}
		sanitized[key] = value;
	}

	normalizeTypeKeyword(sanitized);
	normalizeShapeKeywords(sanitized);
	return sanitized;
}

/** Canonical empty object schema: the only valid shape for a tool with no input. */
function emptyObjectSchema(): Record<string, unknown> {
	return { type: "object", properties: {}, required: [] };
}

/**
 * Deep-clone a tool input schema and normalize it for provider submission.
 *
 * Already valid schemas round-trip unchanged apart from the stripped `$schema`
 * meta-key, which makes this safe to apply on every path a tool definition
 * travels: registration, hub transport, persistence and the request builder.
 */
export function sanitizeToolInputSchema(
	schema: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
	if (schema === null || schema === undefined) {
		return emptyObjectSchema();
	}
	const sanitized = sanitizeSchemaValue(schema);
	return isPlainObject(sanitized) ? sanitized : emptyObjectSchema();
}

/**
 * Sanitize a tool input schema and guarantee the root is a provider-acceptable
 * object schema.
 *
 * Every path into a model provider must send a tool's `parameters` as an object
 * schema with `properties` and `required` present, so this is the normalizer
 * the provider adapters apply at the wire boundary.
 */
export function normalizeProviderToolInputSchema(
	schema: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
	const sanitized = sanitizeToolInputSchema(schema);
	const root =
		sanitized.type === "object" ? sanitized : { ...sanitized, type: "object" };
	if (!isPlainObject(root.properties)) {
		root.properties = {};
	}
	if (!Array.isArray(root.required)) {
		root.required = [];
	}
	return root;
}
