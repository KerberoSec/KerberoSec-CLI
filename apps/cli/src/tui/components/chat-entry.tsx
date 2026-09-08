import {
	extractKerberoSecFreeModelLimitResetTime,
	type KerberoSecSubscriptionPlan,
} from "@kerberosec/core";
import { useTerminalDimensions } from "@opentui/react";
import type React from "react";
import { useEffect, useState } from "react";
import "opentui-spinner/react";
import {
	getCliSubscriptionUrl,
	getIndividualPlanFeatures,
	getKerberoSecOrgIndividualInferenceSubscriptionMessage,
	getKerberoSecPassLimitDetailMessage,
	isContentBlockedErrorMessage,
	isKerberoSecFreeModelLimitErrorMessage,
	isKerberoSecFreePromotionEndedErrorMessage,
	isKerberoSecOrgIndividualInferenceSubscriptionErrorMessage,
	isKerberoSecPassLimitErrorMessage,
	isKerberoSecPassSubscriptionError,
	isWafBlockedErrorMessage,
} from "../../utils/kerberosec-pass-errors";
import {
	isKerberoSecAccountCreditsErrorMessage,
	KERBEROSEC_CREDITS_DASHBOARD_URL,
} from "../kerberosec-account";
import { getUserMessageBackground } from "../palette";
import type { ResolvedTheme } from "../themes";
import type { ChatEntry } from "../types";
import { formatCompactionDividerLabel } from "../utils/compaction-status";
import { getSyntaxStyle, type SyntaxAccentMode } from "../utils/syntax-style";
import { isWarningToolError } from "../utils/tool-errors";
import {
	buildReadFilesKeys,
	parseApplyPatchInput,
	parseAskQuestionInput,
	parseEditorInput,
	parseReadFilesInput,
	parseRunCommandsInput,
	parseSearchInput,
	parseSpawnAgentInput,
	parseWebFetchInput,
	shortenPath,
} from "../utils/tool-parsing";
import { ToolOutput } from "./tool-output";

function trimLeading(text: string): string {
	return text.replace(/^\n+/, "");
}

export function sanitizeAssistantText(text: string): string {
	if (!text) return "";
	let sanitized = text;
	sanitized = sanitized.replace(
		/<calling\b[^>]*>[\s\S]*?(?:<\/calling>|$)/gi,
		"",
	);
	sanitized = sanitized.replace(
		/<invoke\b[^>]*>[\s\S]*?(?:<\/invoke>|$)/gi,
		"",
	);
	sanitized = sanitized.replace(
		/<(?:tool_call|function_call)\b[^>]*>[\s\S]*?(?:<\/(?:tool_call|function_call)>|$)/gi,
		"",
	);
	sanitized = sanitized.replace(
		/<(?:parameter|param)\b[^>]*>[\s\S]*?(?:<\/(?:parameter|param)>|$)/gi,
		"",
	);
	sanitized = sanitized.replace(
		/<\/?(?:calling|invoke|tool_call|function_call|parameter|param)\b[^>]*>/gi,
		"",
	);
	sanitized = sanitized.replace(/```(?:xml|json)?\s*```/g, "");
	return sanitized;
}

function formatMediaSize(byteLength: number): string {
	if (byteLength <= 0) return "unknown size";
	if (byteLength < 1024) return `${byteLength} B`;
	if (byteLength < 1024 * 1024) return `${(byteLength / 1024).toFixed(1)} KiB`;
	return `${(byteLength / (1024 * 1024)).toFixed(1)} MiB`;
}

function formatReasoningContent(text: string): string {
	return text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*\*/g, "");
}

function ReasoningBlock(props: { text: string; streaming: boolean }) {
	const [expanded, setExpanded] = useState(false);
	const content = formatReasoningContent(trimLeading(props.text));
	if (!content.trim()) {
		if (props.streaming) {
			return (
				<box flexDirection="row" gap={1}>
					<spinner name="dots" color="gray" />
					<text fg="gray">
						<em>Thinking...</em>
					</text>
				</box>
			);
		}
		return null;
	}

	if (props.streaming) {
		const lines = content.split("\n");
		return (
			<box flexDirection="column">
				<box flexDirection="row" gap={1}>
					<spinner name="dots" color="gray" />
					<text fg="gray">
						<em>Thinking...</em>
					</text>
				</box>
				<box flexDirection="column" paddingLeft={2}>
					{lines.map((line) => (
						<text key={line} fg="gray" selectable>
							<em>{line || " "}</em>
						</text>
					))}
				</box>
			</box>
		);
	}

	if (expanded) {
		const lines = content.split("\n");
		return (
			<box flexDirection="column" onMouseDown={() => setExpanded(false)}>
				<text fg="gray">
					{"\u25bc"} <em>Thought:</em>
				</text>
				<box flexDirection="column" paddingLeft={2}>
					{lines.map((line) => (
						<text key={line} fg="gray" selectable>
							<em>{line || " "}</em>
						</text>
					))}
				</box>
			</box>
		);
	}

	return (
		<box onMouseDown={() => setExpanded(true)}>
			<text fg="gray" selectable>
				{"\u25b8"} <em>Thought</em>
			</text>
		</box>
	);
}

export function getDisplayToolName(toolName: string): string {
	switch (toolName) {
		case "run_commands":
		case "run_command":
		case "run_shell_command":
		case "bash":
		case "execute_command":
		case "sh":
		case "command":
			return "Bash";
		case "read_files":
		case "read_file":
		case "view_file":
			return "Read";
		case "editor":
		case "edit":
		case "write":
		case "edit_file":
		case "replace_file_content":
		case "write_to_file":
			return "Edit";
		case "apply_patch":
			return "ApplyPatch";
		case "search_codebase":
		case "grep_search":
		case "find_by_name":
			return "Search";
		case "fetch_web_content":
		case "read_url_content":
			return "Fetch";
		case "spawn_agent":
		case "invoke_subagent":
			return "Agent";
		case "ask_question":
		case "ask_followup_question":
			return "Ask";
		case "skills":
			return "Skill";
		case "schedule":
			return "Schedule";
		default:
			return toolName;
	}
}

function formatToolParams(
	toolName: string,
	rawInput: unknown,
	fallback: string,
): React.ReactNode {
	switch (toolName) {
		case "read_files":
		case "read_file":
		case "view_file": {
			const info = parseReadFilesInput(rawInput);
			if (!info?.files.length) return fallback;
			const keys = buildReadFilesKeys(info.files);
			return info.files.map((f, i) => {
				const sl = f.startLine != null ? String(f.startLine) : undefined;
				const el = f.endLine != null ? String(f.endLine) : undefined;
				const sep = i > 0 ? "; " : "";
				const range = sl || el ? `, ${sl ?? ""}-${el ?? ""}` : "";
				return (
					<span key={keys[i]}>
						{sep}
						{shortenPath(f.path)}
						{range && <span fg="gray">{range}</span>}
					</span>
				);
			});
		}
		case "run_commands":
		case "run_command":
		case "run_shell_command":
		case "bash":
		case "execute_command":
		case "sh":
		case "command": {
			const info = parseRunCommandsInput(rawInput);
			if (!info?.commands.length) return fallback;
			return info.commands.join(" && ");
		}
		case "editor":
		case "edit":
		case "write":
		case "edit_file":
		case "replace_file_content":
		case "write_to_file": {
			const info = parseEditorInput(rawInput);
			if (!info) return fallback;
			return shortenPath(info.path);
		}
		case "apply_patch": {
			const patchInfo = parseApplyPatchInput(rawInput);
			if (!patchInfo?.files.length) return fallback;
			return patchInfo.files.map((f) => shortenPath(f)).join(", ");
		}
		case "search_codebase":
		case "grep_search":
		case "find_by_name": {
			const info = parseSearchInput(rawInput);
			if (!info?.queries.length) return fallback;
			return info.queries.join(", ");
		}
		case "fetch_web_content":
		case "read_url_content": {
			const info = parseWebFetchInput(rawInput);
			if (!info?.urls.length) return fallback;
			return info.urls.join(", ");
		}
		case "spawn_agent":
		case "invoke_subagent": {
			const info = parseSpawnAgentInput(rawInput);
			if (!info) return fallback;
			const task =
				info.task.length > 60 ? `${info.task.slice(0, 60)}...` : info.task;
			return task;
		}
		case "ask_question":
		case "ask_followup_question": {
			const info = parseAskQuestionInput(rawInput);
			if (!info) return fallback;
			const q =
				info.question.length > 60
					? `${info.question.slice(0, 60)}...`
					: info.question;
			return q;
		}
		case "switch_to_act_mode":
			return "";
		case "skills": {
			if (rawInput && typeof rawInput === "object" && "skill" in rawInput) {
				const s = String((rawInput as { skill: unknown }).skill);
				const args =
					"args" in rawInput
						? ` ${String((rawInput as { args: unknown }).args)}`
						: "";
				const full = `${s}${args}`;
				return full.length > 70 ? `${full.slice(0, 70)}...` : full;
			}
			return fallback;
		}
		default:
			return fallback;
	}
}

function ToolCallView(props: {
	toolName: string;
	inputSummary: string;
	rawInput?: unknown;
	accent: string;
	defaultFg?: string;
	streaming: boolean;
	result?: {
		outputSummary: string;
		rawOutput?: unknown;
		error?: string;
	};
}) {
	const { toolName, inputSummary, streaming, result, accent, defaultFg } =
		props;
	const failed = result?.error != null;
	const warningFailure = isWarningToolError(result?.error);
	const displayName = getDisplayToolName(toolName);
	const params = formatToolParams(toolName, props.rawInput, inputSummary);

	return (
		<box flexDirection="column">
			<box flexDirection="row">
				<box width={2}>
					{streaming ? (
						<spinner name="dots" color="gray" />
					) : warningFailure ? (
						<text fg="yellow">!</text>
					) : failed ? (
						<text fg="red">✕</text>
					) : (
						<text fg={accent}>●</text>
					)}
				</box>
				<text fg={defaultFg} selectable>
					<span fg={accent}>
						<strong>{displayName}</strong>
					</span>
					<span fg={accent}>
						<strong>(</strong>
					</span>
					<span>{params}</span>
					<span fg={accent}>
						<strong>)</strong>
					</span>
				</text>
			</box>
			{result && (
				<ToolOutput
					toolName={toolName}
					outputSummary={result.outputSummary}
					rawOutput={result.rawOutput}
					rawInput={props.rawInput}
					error={result.error}
				/>
			)}
		</box>
	);
}

function KerberoSecCreditsKerberoSecPassErrorView(props: {
	defaultFg?: string;
	theme: ResolvedTheme;
}) {
	const linkColor = props.theme.accents.act;
	const subscriptionUrl = getCliSubscriptionUrl();
	return (
		<box flexDirection="row">
			<text fg="red" content="* " />
			<box
				flexDirection="column"
				border
				borderStyle="rounded"
				borderColor="red"
				paddingX={1}
			>
				<text fg="red">Cline Credits depleted</text>
				<text
					fg={props.defaultFg}
					selectable
					content={
						"You have run out of Cline credits. Add credits in the dashboard or purchase and switch to ClinePass to continue."
					}
				/>
				<box flexDirection="row">
					<text fg="gray">Purchase Credits: </text>
					<text fg={linkColor} selectable>
						<a href={KERBEROSEC_CREDITS_DASHBOARD_URL}>
							{KERBEROSEC_CREDITS_DASHBOARD_URL}
						</a>
					</text>
				</box>
				<box flexDirection="row">
					<text fg="gray">Purchase ClinePass: </text>
					<text fg={linkColor} selectable>
						<a href={subscriptionUrl}>{subscriptionUrl}</a>
					</text>
				</box>
				<box flexDirection="row">
					<text fg="gray">Switch to ClinePass: </text>
					<text fg="gray">
						type /model in CLI and switch provider to ClinePass
					</text>
				</box>
			</box>
		</box>
	);
}

function KerberoSecCreditsErrorView(props: {
	defaultFg?: string;
	theme: ResolvedTheme;
}) {
	return (
		<KerberoSecCreditsKerberoSecPassErrorView
			defaultFg={props.defaultFg}
			theme={props.theme}
		/>
	);
}

function KerberoSecPassSubscriptionErrorView(props: {
	defaultFg?: string;
	loadIndividualSubscriptionPlans?: () => Promise<KerberoSecSubscriptionPlan[]>;
	theme: ResolvedTheme;
}) {
	const subscriptionUrl = getCliSubscriptionUrl();
	const [planFeatures, setPlanFeatures] = useState<string[]>([]);
	const planAccent = props.theme.accents.plan;

	useEffect(() => {
		if (!props.loadIndividualSubscriptionPlans) {
			return;
		}
		let isMounted = true;
		void props
			.loadIndividualSubscriptionPlans()
			.then((plans) => {
				if (isMounted) {
					setPlanFeatures(getIndividualPlanFeatures(plans));
				}
			})
			.catch(() => {
				// Keep the subscription error view usable if plan metadata is unavailable.
			});

		return () => {
			isMounted = false;
		};
	}, [props.loadIndividualSubscriptionPlans]);

	return (
		<box flexDirection="row">
			<text fg={planAccent} content="* " />
			<box
				flexDirection="column"
				border
				borderStyle="rounded"
				borderColor={planAccent}
				paddingX={1}
			>
				<text fg={planAccent}>ClinePass subscription required</text>
				<text
					fg={props.defaultFg}
					selectable
					content="No access to ClinePass subscription models yet. Subscribe to ClinePass, the low cost open weights model coding plan."
				/>
				{planFeatures.length > 0 && (
					<box flexDirection="column" marginTop={1}>
						<text fg={props.defaultFg}>ClinePass includes:</text>
						{planFeatures.map((feature) => (
							<text key={feature} fg={props.defaultFg} selectable>
								<span fg="green">✓ </span>
								<span>{feature}</span>
							</text>
						))}
					</box>
				)}
				<box flexDirection="row">
					<text fg="gray">Subscribe: </text>
					<text fg={props.theme.accents.act} selectable>
						<a href={subscriptionUrl}>Open subscription page</a>
					</text>
				</box>
				<box flexDirection="row">
					<text fg="gray">URL: </text>
					<text fg={props.theme.accents.act} selectable>
						<a href={subscriptionUrl}>{subscriptionUrl}</a>
					</text>
				</box>
			</box>
		</box>
	);
}

function KerberoSecOrgIndividualInferenceSubscriptionErrorView(props: {
	defaultFg?: string;
	theme: ResolvedTheme;
}) {
	const planAccent = props.theme.accents.plan;

	return (
		<box flexDirection="row">
			<text fg={planAccent} content="* " />
			<box
				flexDirection="column"
				border
				borderStyle="rounded"
				borderColor={planAccent}
				paddingX={1}
			>
				<text fg={planAccent}>Personal ClinePass required</text>
				<text
					fg={props.defaultFg}
					selectable
					content={getKerberoSecOrgIndividualInferenceSubscriptionMessage()}
				/>
			</box>
		</box>
	);
}

function CompactionDividerRow(props: {
	entry: Extract<ChatEntry, { kind: "compaction" }>;
}) {
	const { entry } = props;
	const { width: terminalWidth } = useTerminalDimensions();
	const inProgress = entry.status === "started";
	const labelColor = inProgress
		? "cyan"
		: entry.status === "failed"
			? "red"
			: entry.status === "cancelled" || entry.status === "skipped"
				? "gray"
				: "cyan";
	const label = `✻ ${formatCompactionDividerLabel(entry)} ✻`;
	// Fill the remaining line with a plain rule instead of a flexGrow bordered
	// box: a single fixed-content text row keeps the renderer's diffing stable.
	const ruleWidth = Math.max(2, Math.min(40, terminalWidth - label.length - 8));
	return (
		<box flexDirection="row">
			{inProgress ? (
				<box width={2}>
					<spinner name="dots" color={labelColor} />
				</box>
			) : (
				<text fg="gray" content="── " />
			)}
			<text fg={labelColor} selectable content={label} />
			<text fg="gray" content={` ${"─".repeat(ruleWidth)}`} />
		</box>
	);
}

function KerberoSecPassLimitErrorView(props: {
	message: string;
	defaultFg?: string;
	theme: ResolvedTheme;
}) {
	const detail =
		getKerberoSecPassLimitDetailMessage(props.message) ?? props.message;
	const accent = props.theme.accents.act;

	return (
		<box flexDirection="row">
			<text fg={accent} content="* " />
			<box
				flexDirection="column"
				border
				borderStyle="rounded"
				borderColor={accent}
				paddingX={1}
			>
				<text fg={props.theme.accents.error}>ClinePass limit reached</text>
				<text fg={props.defaultFg} selectable content={detail} />
				<text
					fg={props.defaultFg}
					selectable
					content="Switch to Cline usage-based billing and retry with the Cline provider."
				/>
				<box flexDirection="row">
					<text fg="gray">Headless CLI: </text>
					<text fg={props.defaultFg} selectable content="rerun with " />
					<code
						content="--provider kerberosec"
						filetype="bash"
						syntaxStyle={getSyntaxStyle(props.theme)}
						selectable
					/>
					<text fg={props.defaultFg} selectable content="." />
				</box>
			</box>
		</box>
	);
}

function KerberoSecFreeModelLimitErrorView(props: {
	message: string;
	defaultFg?: string;
	theme: ResolvedTheme;
}) {
	const resetTime = extractKerberoSecFreeModelLimitResetTime(props.message);
	const accent = props.theme.accents.act;

	return (
		<box flexDirection="row">
			<text fg={accent} content="* " />
			<box
				flexDirection="column"
				border
				borderStyle="rounded"
				borderColor={accent}
				paddingX={1}
			>
				<text fg={props.theme.accents.error}>
					Daily free model limit reached
				</text>
				<text
					fg={props.defaultFg}
					selectable
					content="You've reached today's free usage limit for this model."
				/>
				<text
					fg={props.defaultFg}
					selectable
					content={
						resetTime
							? `Try again in ${resetTime} or select another model.`
							: "Try again later or select another model."
					}
				/>
				<text fg="gray">Open the model selector with /model.</text>
			</box>
		</box>
	);
}

function KerberoSecFreePromotionEndedErrorView(props: {
	defaultFg?: string;
	theme: ResolvedTheme;
}) {
	const accent = props.theme.accents.act;
	return (
		<box flexDirection="row">
			<text fg={accent} content="* " />
			<box
				flexDirection="column"
				border
				borderStyle="rounded"
				borderColor={accent}
				paddingX={1}
			>
				<text fg={props.theme.accents.error}>Free model promotion ended</text>
				<text
					fg={props.defaultFg}
					selectable
					content="The free promotion for this model has ended and it is no longer available."
				/>
				<text
					fg={props.defaultFg}
					selectable
					content="Select another model to continue."
				/>
				<text fg="gray">Open the model selector with /model.</text>
			</box>
		</box>
	);
}

function WafBlockedErrorView(props: {
	defaultFg?: string;
	theme: ResolvedTheme;
}) {
	const accent = props.theme.accents.error;
	return (
		<box flexDirection="row">
			<text fg={accent} content="* " />
			<box
				flexDirection="column"
				border
				borderStyle="rounded"
				borderColor={accent}
				paddingX={1}
			>
				<text fg={props.theme.accents.error}>
					Provider Firewall / WAF Block (HTTP 405/403)
				</text>
				<text
					fg={props.defaultFg}
					selectable
					content="The upstream provider Web Application Firewall (WAF) blocked this request."
				/>
				<text
					fg={props.defaultFg}
					selectable
					content="This happens when shell command pipelines, redirections, or security payloads match firewall inspection rules."
				/>
				<text fg="gray">Suggestions:</text>
				<text fg="gray">1. Keep commands concise and unchained (avoid '||', '&&', or subshell pipes).</text>
				<text fg="gray">2. Start a fresh session with /new if an earlier turn contained flagged payloads.</text>
				<text fg="gray">3. For local or offline security operations without remote filters, switch to local models via Ollama (/model).</text>
			</box>
		</box>
	);
}

function ContentBlockedErrorView(props: {
	defaultFg?: string;
	theme: ResolvedTheme;
}) {
	const accent = props.theme.accents.error;
	return (
		<box flexDirection="row">
			<text fg={accent} content="* " />
			<box
				flexDirection="column"
				border
				borderStyle="rounded"
				borderColor={accent}
				paddingX={1}
			>
				<text fg={props.theme.accents.error}>
					Provider Content Filter Blocked
				</text>
				<text
					fg={props.defaultFg}
					selectable
					content="The upstream provider automated content filter rejected this request (content-blocked)."
				/>
				<text
					fg={props.defaultFg}
					selectable
					content="This occurs when prompts, commands, or context trigger provider-side moderation keywords."
				/>
				<text fg="gray">Suggestions:</text>
				<text fg="gray">1. Rephrase your prompt (some remote gateways restrict direct execution phrasing or security terms).</text>
				<text fg="gray">2. Start a fresh session with /new to clear previous turn context.</text>
				<text fg="gray">3. For local or offline security operations without remote filters, switch to local models via Ollama (/model).</text>
			</box>
		</box>
	);
}

export function ChatEntryView(props: {
	entry: ChatEntry;
	accent?: string;
	/** Mode the entry was produced in (resolved with the current-mode fallback). */
	mode?: SyntaxAccentMode;
	loadIndividualSubscriptionPlans?: () => Promise<KerberoSecSubscriptionPlan[]>;
	theme: ResolvedTheme;
}) {
	const { entry, mode = "act", theme } = props;
	const accent = props.accent ?? theme.accents.act;
	const defaultFg = theme.defaultForeground;
	const userMsgBg = getUserMessageBackground(theme.background);

	switch (entry.kind) {
		case "user":
			return (
				<box
					flexDirection="row"
					backgroundColor={userMsgBg}
					marginX={-1}
					paddingLeft={1}
					paddingRight={2}
				>
					<box width={2}>
						<text fg={accent}>{"❯"}</text>
					</box>
					<text fg={defaultFg} selectable>
						{entry.text}
					</text>
				</box>
			);

		case "user_submitted":
			return (
				<box
					flexDirection="row"
					backgroundColor={userMsgBg}
					marginX={-1}
					paddingLeft={1}
					paddingRight={2}
				>
					<box width={2}>
						<text fg={accent}>{"❯"}</text>
					</box>
					{entry.delivery === "steer" && <text fg="yellow">[steer] </text>}
					{entry.delivery === "queue" && <text fg="gray">[queued] </text>}
					<text fg={defaultFg} selectable>
						{entry.text}
					</text>
				</box>
			);

		case "assistant_text": {
			const content = sanitizeAssistantText(trimLeading(entry.text));
			if (!content.trim()) return null;
			return (
				<box flexDirection="row">
					<box width={2}>
						{entry.streaming ? (
							<spinner name="dots" color={accent} />
						) : (
							<text fg={accent}>*</text>
						)}
					</box>
					<box flexGrow={1}>
						{/*
						 * internalBlockMode="top-level" keeps each markdown block as its
						 * own renderable. The default coalesced mode merges the whole
						 * message into one block that is torn down and re-highlighted on
						 * every streamed chunk, which flashes already-rendered headings
						 * and links back to raw uncolored markdown while tree-sitter
						 * re-highlights asynchronously. Top-level blocks are reused by
						 * token identity, so settled content never re-renders.
						 * tableOptions preserves the bordered table style that coalesced
						 * mode used by default (top-level defaults to borderless columns).
						 */}
						<markdown
							content={content}
							syntaxStyle={getSyntaxStyle(theme, mode)}
							streaming={entry.streaming}
							internalBlockMode="top-level"
							tableOptions={{ style: "grid" }}
							fg={defaultFg}
						/>
					</box>
				</box>
			);
		}

		case "assistant_media":
			return (
				<box flexDirection="row">
					<box width={2}>
						<text fg={accent}>*</text>
					</box>
					<text fg={defaultFg} selectable>
						{entry.location
							? `Generated ${entry.modality} (${entry.mediaType}, ${formatMediaSize(entry.byteLength)}): ${entry.location}`
							: `Generated ${entry.modality} (${entry.mediaType}) could not be saved`}
					</text>
				</box>
			);

		case "reasoning":
			return <ReasoningBlock text={entry.text} streaming={entry.streaming} />;

		case "tool_call":
			return (
				<ToolCallView
					toolName={entry.toolName}
					inputSummary={entry.inputSummary}
					rawInput={entry.rawInput}
					streaming={entry.streaming}
					result={entry.result}
					accent={accent}
					defaultFg={defaultFg}
				/>
			);

		case "error":
			if (isKerberoSecAccountCreditsErrorMessage(entry.text)) {
				return (
					<KerberoSecCreditsErrorView defaultFg={defaultFg} theme={theme} />
				);
			}
			if (
				isKerberoSecOrgIndividualInferenceSubscriptionErrorMessage(entry.text)
			) {
				return (
					<KerberoSecOrgIndividualInferenceSubscriptionErrorView
						defaultFg={defaultFg}
						theme={theme}
					/>
				);
			}
			if (isKerberoSecPassSubscriptionError(entry.text)) {
				return (
					<KerberoSecPassSubscriptionErrorView
						defaultFg={defaultFg}
						loadIndividualSubscriptionPlans={
							props.loadIndividualSubscriptionPlans
						}
						theme={theme}
					/>
				);
			}
			if (isKerberoSecPassLimitErrorMessage(entry.text)) {
				return (
					<KerberoSecPassLimitErrorView
						message={entry.text}
						defaultFg={defaultFg}
						theme={theme}
					/>
				);
			}
			if (isKerberoSecFreeModelLimitErrorMessage(entry.text)) {
				return (
					<KerberoSecFreeModelLimitErrorView
						defaultFg={defaultFg}
						message={entry.text}
						theme={theme}
					/>
				);
			}
			if (isKerberoSecFreePromotionEndedErrorMessage(entry.text)) {
				return (
					<KerberoSecFreePromotionEndedErrorView
						defaultFg={defaultFg}
						theme={theme}
					/>
				);
			}
			if (isWafBlockedErrorMessage(entry.text)) {
				return <WafBlockedErrorView defaultFg={defaultFg} theme={theme} />;
			}
			if (isContentBlockedErrorMessage(entry.text)) {
				return (
					<ContentBlockedErrorView defaultFg={defaultFg} theme={theme} />
				);
			}
			return (
				<box flexDirection="row">
					<text fg={theme.accents.error} content="* " />
					<text
						fg={theme.accents.error}
						selectable
						content={`Error: ${entry.text}`}
					/>
				</box>
			);

		case "status":
			return (
				<box flexDirection="row">
					<text fg="gray" content="* " />
					<text fg="gray" selectable content={entry.text} />
				</box>
			);

		case "team":
			return (
				<box flexDirection="row">
					<text fg="gray" content="* " />
					<text fg="gray" selectable content={entry.text} />
				</box>
			);

		case "compaction":
			return <CompactionDividerRow entry={entry} />;

		case "done": {
			const parts: string[] = [];
			if (entry.elapsed) parts.push(`${entry.elapsed}s`);
			if (entry.tokens > 0)
				parts.push(`${entry.tokens.toLocaleString()} tokens`);
			if (entry.cost > 0) parts.push(`$${entry.cost.toFixed(2)}`);
			if (entry.iterations > 0)
				parts.push(
					`${entry.iterations} iteration${entry.iterations !== 1 ? "s" : ""}`,
				);
			if (parts.length === 0) return null;
			return <text fg="gray" content={parts.join(" | ")} />;
		}
	}
}
