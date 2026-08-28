import { KerberoSecAsk as AppKerberoSecAsk, KerberoSecMessage as AppKerberoSecMessage, KerberoSecSay as AppKerberoSecSay } from "@shared/ExtensionMessage"
import { KerberoSecAsk, KerberoSecMessageType, KerberoSecSay, KerberoSecMessage as ProtoKerberoSecMessage } from "@shared/proto/kerberosec/ui"

// Helper function to convert KerberoSecAsk string to enum
function convertKerberoSecAskToProtoEnum(ask: AppKerberoSecAsk | undefined): KerberoSecAsk | undefined {
	if (!ask) {
		return undefined
	}

	const mapping: Record<AppKerberoSecAsk, KerberoSecAsk> = {
		followup: KerberoSecAsk.FOLLOWUP,
		plan_mode_respond: KerberoSecAsk.PLAN_MODE_RESPOND,
		act_mode_respond: KerberoSecAsk.ACT_MODE_RESPOND,
		command: KerberoSecAsk.COMMAND,
		command_output: KerberoSecAsk.COMMAND_OUTPUT,
		completion_result: KerberoSecAsk.COMPLETION_RESULT,
		tool: KerberoSecAsk.TOOL,
		api_req_failed: KerberoSecAsk.API_REQ_FAILED,
		resume_task: KerberoSecAsk.RESUME_TASK,
		resume_completed_task: KerberoSecAsk.RESUME_COMPLETED_TASK,
		mistake_limit_reached: KerberoSecAsk.MISTAKE_LIMIT_REACHED,
		browser_action_launch: KerberoSecAsk.BROWSER_ACTION_LAUNCH,
		use_mcp_server: KerberoSecAsk.USE_MCP_SERVER,
		new_task: KerberoSecAsk.NEW_TASK,
		condense: KerberoSecAsk.CONDENSE,
		summarize_task: KerberoSecAsk.SUMMARIZE_TASK,
		report_bug: KerberoSecAsk.REPORT_BUG,
		use_subagents: KerberoSecAsk.USE_SUBAGENTS,
	}

	const result = mapping[ask]
	if (result === undefined) {
	}
	return result
}

// Helper function to convert KerberoSecAsk enum to string
function convertProtoEnumToKerberoSecAsk(ask: KerberoSecAsk): AppKerberoSecAsk | undefined {
	if (ask === KerberoSecAsk.UNRECOGNIZED) {
		return undefined
	}

	const mapping: Record<Exclude<KerberoSecAsk, KerberoSecAsk.UNRECOGNIZED>, AppKerberoSecAsk> = {
		[KerberoSecAsk.FOLLOWUP]: "followup",
		[KerberoSecAsk.PLAN_MODE_RESPOND]: "plan_mode_respond",
		[KerberoSecAsk.ACT_MODE_RESPOND]: "act_mode_respond",
		[KerberoSecAsk.COMMAND]: "command",
		[KerberoSecAsk.COMMAND_OUTPUT]: "command_output",
		[KerberoSecAsk.COMPLETION_RESULT]: "completion_result",
		[KerberoSecAsk.TOOL]: "tool",
		[KerberoSecAsk.API_REQ_FAILED]: "api_req_failed",
		[KerberoSecAsk.RESUME_TASK]: "resume_task",
		[KerberoSecAsk.RESUME_COMPLETED_TASK]: "resume_completed_task",
		[KerberoSecAsk.MISTAKE_LIMIT_REACHED]: "mistake_limit_reached",
		[KerberoSecAsk.BROWSER_ACTION_LAUNCH]: "browser_action_launch",
		[KerberoSecAsk.USE_MCP_SERVER]: "use_mcp_server",
		[KerberoSecAsk.NEW_TASK]: "new_task",
		[KerberoSecAsk.CONDENSE]: "condense",
		[KerberoSecAsk.SUMMARIZE_TASK]: "summarize_task",
		[KerberoSecAsk.REPORT_BUG]: "report_bug",
		[KerberoSecAsk.USE_SUBAGENTS]: "use_subagents",
	}

	return mapping[ask]
}

// Helper function to convert KerberoSecSay string to enum
function convertKerberoSecSayToProtoEnum(say: AppKerberoSecSay | undefined): KerberoSecSay | undefined {
	if (!say) {
		return undefined
	}

	const mapping: Record<AppKerberoSecSay, KerberoSecSay> = {
		task: KerberoSecSay.TASK,
		error: KerberoSecSay.ERROR,
		api_req_started: KerberoSecSay.API_REQ_STARTED,
		api_req_finished: KerberoSecSay.API_REQ_FINISHED,
		text: KerberoSecSay.TEXT,
		reasoning: KerberoSecSay.REASONING,
		completion_result: KerberoSecSay.COMPLETION_RESULT_SAY,
		plan_completion_result: KerberoSecSay.PLAN_COMPLETION_RESULT,
		user_feedback: KerberoSecSay.USER_FEEDBACK,
		user_feedback_diff: KerberoSecSay.USER_FEEDBACK_DIFF,
		command: KerberoSecSay.COMMAND_SAY,
		command_output: KerberoSecSay.COMMAND_OUTPUT_SAY,
		tool: KerberoSecSay.TOOL_SAY,
		shell_integration_warning: KerberoSecSay.SHELL_INTEGRATION_WARNING,
		shell_integration_warning_with_suggestion: KerberoSecSay.SHELL_INTEGRATION_WARNING,
		browser_action_launch: KerberoSecSay.BROWSER_ACTION_LAUNCH_SAY,
		browser_action: KerberoSecSay.BROWSER_ACTION,
		browser_action_result: KerberoSecSay.BROWSER_ACTION_RESULT,
		mcp_server_request_started: KerberoSecSay.MCP_SERVER_REQUEST_STARTED,
		mcp_server_response: KerberoSecSay.MCP_SERVER_RESPONSE,
		mcp_notification: KerberoSecSay.MCP_NOTIFICATION,
		use_mcp_server: KerberoSecSay.USE_MCP_SERVER_SAY,
		diff_error: KerberoSecSay.DIFF_ERROR,
		deleted_api_reqs: KerberoSecSay.DELETED_API_REQS,
		kerberosecignore_error: KerberoSecSay.KERBEROSECIGNORE_ERROR,
		command_permission_denied: KerberoSecSay.COMMAND_PERMISSION_DENIED,
		checkpoint_created: KerberoSecSay.CHECKPOINT_CREATED,
		load_mcp_documentation: KerberoSecSay.LOAD_MCP_DOCUMENTATION,
		info: KerberoSecSay.INFO,
		task_progress: KerberoSecSay.TASK_PROGRESS,
		hook_status: KerberoSecSay.HOOK_STATUS,
		hook_output_stream: KerberoSecSay.HOOK_OUTPUT_STREAM,
		conditional_rules_applied: KerberoSecSay.CONDITIONAL_RULES_APPLIED,
		subagent: KerberoSecSay.SUBAGENT_STATUS,
		use_subagents: KerberoSecSay.USE_SUBAGENTS_SAY,
		subagent_usage: KerberoSecSay.SUBAGENT_USAGE,
		compaction: KerberoSecSay.COMPACTION,
	}

	const result = mapping[say]

	return result
}

// Helper function to convert KerberoSecSay enum to string
function convertProtoEnumToKerberoSecSay(say: KerberoSecSay): AppKerberoSecSay | undefined {
	if (say === KerberoSecSay.UNRECOGNIZED) {
		return undefined
	}

	const mapping: Record<Exclude<KerberoSecSay, KerberoSecSay.UNRECOGNIZED>, AppKerberoSecSay> = {
		[KerberoSecSay.TASK]: "task",
		[KerberoSecSay.ERROR]: "error",
		[KerberoSecSay.API_REQ_STARTED]: "api_req_started",
		[KerberoSecSay.API_REQ_FINISHED]: "api_req_finished",
		[KerberoSecSay.TEXT]: "text",
		[KerberoSecSay.REASONING]: "reasoning",
		[KerberoSecSay.COMPLETION_RESULT_SAY]: "completion_result",
		[KerberoSecSay.PLAN_COMPLETION_RESULT]: "plan_completion_result",
		[KerberoSecSay.USER_FEEDBACK]: "user_feedback",
		[KerberoSecSay.USER_FEEDBACK_DIFF]: "user_feedback_diff",
		[KerberoSecSay.COMMAND_SAY]: "command",
		[KerberoSecSay.COMMAND_OUTPUT_SAY]: "command_output",
		[KerberoSecSay.TOOL_SAY]: "tool",
		[KerberoSecSay.SHELL_INTEGRATION_WARNING]: "shell_integration_warning",
		[KerberoSecSay.BROWSER_ACTION_LAUNCH_SAY]: "browser_action_launch",
		[KerberoSecSay.BROWSER_ACTION]: "browser_action",
		[KerberoSecSay.BROWSER_ACTION_RESULT]: "browser_action_result",
		[KerberoSecSay.MCP_SERVER_REQUEST_STARTED]: "mcp_server_request_started",
		[KerberoSecSay.MCP_SERVER_RESPONSE]: "mcp_server_response",
		[KerberoSecSay.MCP_NOTIFICATION]: "mcp_notification",
		[KerberoSecSay.USE_MCP_SERVER_SAY]: "use_mcp_server",
		[KerberoSecSay.DIFF_ERROR]: "diff_error",
		[KerberoSecSay.DELETED_API_REQS]: "deleted_api_reqs",
		[KerberoSecSay.KERBEROSECIGNORE_ERROR]: "kerberosecignore_error",
		[KerberoSecSay.COMMAND_PERMISSION_DENIED]: "command_permission_denied",
		[KerberoSecSay.CHECKPOINT_CREATED]: "checkpoint_created",
		[KerberoSecSay.LOAD_MCP_DOCUMENTATION]: "load_mcp_documentation",
		[KerberoSecSay.INFO]: "info",
		[KerberoSecSay.TASK_PROGRESS]: "task_progress",
		[KerberoSecSay.HOOK_STATUS]: "hook_status",
		[KerberoSecSay.HOOK_OUTPUT_STREAM]: "hook_output_stream",
		[KerberoSecSay.CONDITIONAL_RULES_APPLIED]: "conditional_rules_applied",
		[KerberoSecSay.SUBAGENT_STATUS]: "subagent",
		[KerberoSecSay.USE_SUBAGENTS_SAY]: "use_subagents",
		[KerberoSecSay.SUBAGENT_USAGE]: "subagent_usage",
		[KerberoSecSay.COMPACTION]: "compaction",
	}

	return mapping[say]
}

/**
 * Convert application KerberoSecMessage to proto KerberoSecMessage
 */
export function convertKerberoSecMessageToProto(message: AppKerberoSecMessage): ProtoKerberoSecMessage {
	// For sending messages, we need to provide values for required proto fields
	const askEnum = message.ask ? convertKerberoSecAskToProtoEnum(message.ask) : undefined
	const sayEnum = message.say ? convertKerberoSecSayToProtoEnum(message.say) : undefined

	// Determine appropriate enum values based on message type
	let finalAskEnum: KerberoSecAsk = KerberoSecAsk.FOLLOWUP // Proto default
	let finalSayEnum: KerberoSecSay = KerberoSecSay.TEXT // Proto default

	if (message.type === "ask") {
		finalAskEnum = askEnum ?? KerberoSecAsk.FOLLOWUP // Use FOLLOWUP as default for ask messages
	} else if (message.type === "say") {
		finalSayEnum = sayEnum ?? KerberoSecSay.TEXT // Use TEXT as default for say messages
	}

	const protoMessage: ProtoKerberoSecMessage = {
		ts: message.ts,
		type: message.type === "ask" ? KerberoSecMessageType.ASK : KerberoSecMessageType.SAY,
		ask: finalAskEnum,
		say: finalSayEnum,
		text: message.text ?? "",
		reasoning: message.reasoning ?? "",
		images: message.images ?? [],
		files: message.files ?? [],
		partial: message.partial ?? false,
		// Convergent-replica fields (default 0 = unstamped, e.g. classic/legacy path).
		seq: message.seq ?? 0,
		epoch: message.epoch ?? 0,
		lastCheckpointHash: message.lastCheckpointHash ?? "",
		isCheckpointCheckedOut: message.isCheckpointCheckedOut ?? false,
		isOperationOutsideWorkspace: message.isOperationOutsideWorkspace ?? false,
		conversationHistoryIndex: message.conversationHistoryIndex ?? 0,
		conversationHistoryDeletedRange: message.conversationHistoryDeletedRange
			? {
					startIndex: message.conversationHistoryDeletedRange[0],
					endIndex: message.conversationHistoryDeletedRange[1],
				}
			: undefined,
		// Additional optional fields for specific ask/say types
		sayTool: undefined,
		sayBrowserAction: undefined,
		browserActionResult: undefined,
		askUseMcpServer: undefined,
		planModeResponse: undefined,
		askQuestion: undefined,
		askNewTask: undefined,
		apiReqInfo: undefined,
		modelInfo: message.modelInfo ?? undefined,
	}

	return protoMessage
}

/**
 * Convert proto KerberoSecMessage to application KerberoSecMessage
 */
export function convertProtoToKerberoSecMessage(protoMessage: ProtoKerberoSecMessage): AppKerberoSecMessage {
	const message: AppKerberoSecMessage = {
		ts: protoMessage.ts,
		type: protoMessage.type === KerberoSecMessageType.ASK ? "ask" : "say",
	}

	// Convert ask enum to string
	if (protoMessage.type === KerberoSecMessageType.ASK) {
		const ask = convertProtoEnumToKerberoSecAsk(protoMessage.ask)
		if (ask !== undefined) {
			message.ask = ask
		}
	}

	// Convert say enum to string
	if (protoMessage.type === KerberoSecMessageType.SAY) {
		const say = convertProtoEnumToKerberoSecSay(protoMessage.say)
		if (say !== undefined) {
			message.say = say
		}
	}

	// Convert other fields - preserve empty strings as they may be intentional
	if (protoMessage.text !== "") {
		message.text = protoMessage.text
	}
	if (protoMessage.reasoning !== "") {
		message.reasoning = protoMessage.reasoning
	}
	if (protoMessage.images.length > 0) {
		message.images = protoMessage.images
	}
	if (protoMessage.files.length > 0) {
		message.files = protoMessage.files
	}
	if (protoMessage.partial) {
		message.partial = protoMessage.partial
	}
	if (protoMessage.lastCheckpointHash !== "") {
		message.lastCheckpointHash = protoMessage.lastCheckpointHash
	}
	if (protoMessage.isCheckpointCheckedOut) {
		message.isCheckpointCheckedOut = protoMessage.isCheckpointCheckedOut
	}
	if (protoMessage.isOperationOutsideWorkspace) {
		message.isOperationOutsideWorkspace = protoMessage.isOperationOutsideWorkspace
	}
	if (protoMessage.conversationHistoryIndex !== 0) {
		message.conversationHistoryIndex = protoMessage.conversationHistoryIndex
	}

	// Convert conversationHistoryDeletedRange from object to tuple
	if (protoMessage.conversationHistoryDeletedRange) {
		message.conversationHistoryDeletedRange = [
			protoMessage.conversationHistoryDeletedRange.startIndex,
			protoMessage.conversationHistoryDeletedRange.endIndex,
		]
	}

	// Convergent-replica fields. 0 means unstamped (classic/legacy path) — leave undefined so
	// the webview reducer treats such messages as always-applicable rather than epoch 0.
	if (protoMessage.seq && protoMessage.seq !== 0) {
		message.seq = protoMessage.seq
	}
	if (protoMessage.epoch && protoMessage.epoch !== 0) {
		message.epoch = protoMessage.epoch
	}

	return message
}
