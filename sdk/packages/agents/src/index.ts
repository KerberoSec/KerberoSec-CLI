/**
 * @kerberosec/agents
 *
 * Browser-safe agent runtime for the next-generation KerberoSec SDK.
 *
 * Exports:
 *   - `AgentRuntime` / `Agent` - the agentic loop class (two names for the
 *     same class). Use `Agent` when supplying provider/model IDs, or
 *     `AgentRuntime` when supplying a pre-built `AgentModel`.
 *   - `createAgentRuntime` / `createAgent` - factory-function equivalents.
 *   - `AgentRuntimeConfig` and its two variants (`AgentRuntimeConfigWithModel`,
 *     `AgentRuntimeConfigWithProvider`) - the discriminated config union.
 *   - `AgentRunInput` / `AgentEventListener` - convenience type aliases.
 *   - `createTool` - re-exported from `@kerberosec/shared` for authoring tools.
 *
 * Shared types (`AgentMessage`, `AgentRunResult`, etc.) should be imported
 * directly from `@kerberosec/shared`.
 */

export type {
	AgentAfterToolResult,
	AgentBeforeModelResult,
	AgentBeforeToolResult,
	AgentMessage,
	AgentMessagePart,
	AgentModel,
	AgentModelFinishReason,
	AgentModelRequest,
	AgentRunResult,
	AgentRuntimeConfig as BaseAgentRuntimeConfig,
	AgentRuntimeEvent,
	AgentRuntimeHooks,
	AgentRuntimeStateSnapshot,
	AgentStopControl,
	AgentTool,
	AgentToolCallPart,
	AgentToolDefinition,
	AgentToolResult,
	AgentUsage,
	ToolApprovalResult,
	ToolPolicy,
} from "@kerberosec/shared";
export { createTool } from "@kerberosec/shared";
export type {
	AgentEventListener,
	AgentRunInput,
	AgentRuntimeConfig,
	AgentRuntimeConfigWithModel,
	AgentRuntimeConfigWithProvider,
} from "./agent-runtime";
export {
	Agent,
	AgentRuntime,
	AgentRuntimeAbortError,
	createAgent,
	createAgentRuntime,
	extractTextualToolCalls,
} from "./agent-runtime";
