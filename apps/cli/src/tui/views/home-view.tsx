import { useState } from "react";
import {
	AutocompleteDropdown,
	type AutocompleteDropdownProps,
} from "../components/autocomplete-dropdown";
import { InputBar, type TextareaHandle } from "../components/input-bar";
import { KerberoSecBanner } from "../components/kerberosec-banner";
import {
	resolveModelDisplayName,
	resolveModelMaxInputTokens,
	StatusBar,
} from "../components/status-bar";
import { useSession } from "../contexts/session-context";
import { useTheme } from "../hooks/use-theme";
import {
	getInputRuleColor,
	getModeInputForeground,
	getModeInputPlaceholder,
} from "../palette";
import { getThemeModeAccent } from "../themes";
import type { TuiProps } from "../types";

export function HomeView(props: {
	config: TuiProps["config"];
	inputValue: string;
	inputKey: number;
	onSubmit: () => void;
	onContentChange: (text: string) => void;
	onImagePaste: (dataUrl: string) => string;
	onLargeTextPaste: (text: string) => string;
	onInputFocusRequest?: () => void;
	repoStatus: {
		branch: string | null;
		diffStats: {
			files: number;
			additions: number;
			deletions: number;
		} | null;
	};
	textareaRef?: React.MutableRefObject<TextareaHandle | null>;
	autocomplete?: AutocompleteDropdownProps;
	onToggleMode: () => void;
}) {
	const {
		config,
		inputValue,
		inputKey,
		onSubmit,
		onContentChange,
		onImagePaste,
		onLargeTextPaste,
		repoStatus,
	} = props;
	const session = useSession();
	const [, setInputCursor] = useState<{
		visualCol: number;
		visualRow: number;
	} | null>(null);

	const theme = useTheme();
	const terminalBg = theme.background;
	const accent = getThemeModeAccent(theme, session.uiMode);
	const inputRuleColor = getInputRuleColor(terminalBg);
	const inputForeground = getModeInputForeground(session.uiMode, terminalBg);
	const inputPlaceholder = getModeInputPlaceholder(session.uiMode, terminalBg);
	const placeholder =
		session.uiMode === "plan" ? "Plan something..." : "What can I do for you?";
	const modelDisplayName = resolveModelDisplayName(config);
	const maxInputTokens = resolveModelMaxInputTokens(config);
	const hasAutocomplete =
		props.autocomplete?.mode && props.autocomplete.options.length > 0;

	return (
		<box flexDirection="column" width="100%" height="100%">
			<box
				flexDirection="column"
				flexGrow={1}
				alignItems="center"
				justifyContent="center"
			>
				<KerberoSecBanner color="white" />
				<box marginTop={1} marginBottom={1} flexShrink={0}>
					<text fg="gray">
						<em>
							Use / for slash commands, @ for file mentions, Ctrl+P for menu
						</em>
					</text>
				</box>
			</box>

			<box flexDirection="column" flexShrink={0} width="100%">
				{hasAutocomplete && props.autocomplete && (
					<AutocompleteDropdown {...props.autocomplete} accent={accent} />
				)}

				<box>
					<InputBar
						accent={accent}
						ruleColor={inputRuleColor}
						inputForeground={inputForeground}
						inputPlaceholder={inputPlaceholder}
						placeholder={placeholder}
						initialValue={inputValue}
						inputKey={inputKey}
						onSubmit={onSubmit}
						onContentChange={onContentChange}
						onVisualCursorChange={setInputCursor}
						onImagePaste={onImagePaste}
						onLargeTextPaste={onLargeTextPaste}
						onFocusRequest={props.onInputFocusRequest}
						textareaRef={props.textareaRef}
					/>
				</box>

				<StatusBar
					providerId={config.providerId}
					modelId={modelDisplayName}
					totalTokens={session.lastTotalTokens}
					totalCost={session.lastTotalCost}
					maxInputTokens={maxInputTokens}
					uiMode={session.uiMode}
					autoApproveAll={session.autoApproveAll}
					workspaceName={config.workspaceRoot ?? ""}
					gitBranch={repoStatus.branch}
					gitDiffStats={repoStatus.diffStats}
					onToggleMode={props.onToggleMode}
					variant="home"
				/>
			</box>
		</box>
	);
}
