import {
	AgentTeamsRuntime,
	createAgentTeamsTools,
	createBuiltinTools,
	createDelegatedAgentConfigProvider,
} from "@kerberosec/core";
import { normalizeProviderToolInputSchema } from "@kerberosec/shared";

/**
 * Verifies that every tool schema the CLI exposes normalizes into a shape a
 * strict OpenAI-compatible gateway accepts. A strict validator reports a missing
 * `required` as `null` and rejects the whole request with:
 *   Invalid schema for function 'team_status': null is not of type "array"
 */

function collectViolations(node: unknown, path: string, out: string[]): void {
	if (Array.isArray(node)) {
		for (const [index, entry] of node.entries()) {
			collectViolations(entry, `${path}[${index}]`, out);
		}
		return;
	}
	if (!node || typeof node !== "object") {
		return;
	}
	const record = node as Record<string, unknown>;
	if (record.$schema !== undefined) {
		out.push(`${path}: leaked $schema meta-key`);
	}
	const isObjectNode = record.type === "object" || "properties" in record;
	if (isObjectNode) {
		if (!Array.isArray(record.required)) {
			out.push(`${path}: object schema without a required array`);
		}
		if (!record.properties || typeof record.properties !== "object") {
			out.push(`${path}: object schema without a properties object`);
		}
	}
	if (record.type === "array" && record.items === undefined) {
		out.push(`${path}: array schema without items`);
	}
	for (const [key, value] of Object.entries(record)) {
		if (
			value === null &&
			!["enum", "const", "default", "examples"].includes(key)
		) {
			out.push(`${path}.${key}: null keyword value`);
			continue;
		}
		collectViolations(value, `${path}.${key}`, out);
	}
}

const builtin = createBuiltinTools({ cwd: process.cwd() });
const runtime = new AgentTeamsRuntime({ teamName: "verify-team" });
const team = createAgentTeamsTools({
	runtime,
	requesterId: "lead",
	teammateConfigProvider: createDelegatedAgentConfigProvider({
		providerId: "agent-router",
		modelId: "deepseek-v4-flash",
	}),
});

const tools = [...builtin, ...team];
const violations: string[] = [];
for (const tool of tools) {
	const parameters = normalizeProviderToolInputSchema(
		(tool as { inputSchema?: Record<string, unknown> }).inputSchema,
	);
	collectViolations(parameters, tool.name, violations);
}

console.log(`checked ${tools.length} tools`);
for (const tool of tools) {
	if (tool.name === "team_status") {
		console.log(
			"team_status wire parameters:",
			JSON.stringify(
				normalizeProviderToolInputSchema(
					(tool as { inputSchema?: Record<string, unknown> }).inputSchema,
				),
				null,
				2,
			),
		);
	}
}

if (violations.length > 0) {
	console.error("violations:", violations);
	process.exit(1);
}
console.log("OK: no schema would be rejected for a missing required array");
