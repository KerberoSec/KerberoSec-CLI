import "opentui-spinner/react";
import type { ScrollBoxRenderable } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import {
	CODEX_CLI_INSTALL_URL,
	type CodexCliStatus,
} from "../../../utils/codex-cli";
import { KerberoSecBanner } from "../../components/kerberosec-banner";
import {
	KerberoSecModelPicker,
	type KerberoSecModelPickerEntry,
} from "../../components/model-selector/kerberosec-model-picker";
import {
	type SearchableItem,
	SearchableList,
	type SearchableListState,
} from "../../components/searchable-list";
import type { useMouseTracker } from "../../components/tracked-robot";
import { useTheme } from "../../hooks/use-theme";
import { getInputRuleColor, getUserMessageBackground } from "../../palette";
import { FIELD_ORDER } from "./fields";
import {
	type KerberoSecPassSubscriptionOption,
	type KerberoSecPassSubscriptionStatus,
	type MenuOption,
	THINKING_LEVELS,
} from "./model";

type MouseTrackerState = ReturnType<typeof useMouseTracker>;

function useDefaultFg(): string | undefined {
	return useTheme().defaultForeground;
}

/**
 * Theme-derived colors for the onboarding surface. The subtle border/detail
 * tones used to be fixed dark grays (#333333 / #555555), which disappear on
 * light or tinted theme backgrounds; they now lift from the theme background.
 */
function useOnboardingColors() {
	const theme = useTheme();
	return {
		accent: theme.accents.act,
		success: theme.accents.success,
		selection: theme.selection,
		textOnSelection: theme.textOnSelection,
		subtleBorder: getUserMessageBackground(theme.background),
		mutedDetail: getInputRuleColor(theme.background),
	};
}

function getKerberoSecPassSubscriptionOptionId(index: number): string {
	return `kerberosec-pass-subscription-option-${index}`;
}

interface OnboardingFrameProps {
	children: ReactNode;
	compact: boolean;
	contentWidth: number;
	mouse: MouseTrackerState;
}

function OnboardingFrame({
	children,
	compact,
	contentWidth,
	mouse,
}: OnboardingFrameProps) {
	const { height } = useTerminalDimensions();
	return (
		<box
			flexDirection="column"
			width="100%"
			height="100%"
			justifyContent={height >= 26 ? "center" : "flex-start"}
			alignItems="center"
			paddingTop={height < 26 ? 1 : 0}
			onMouseMove={mouse.onMouseMove}
		>
			{!compact && <KerberoSecBanner />}
			<box
				flexDirection="column"
				width={contentWidth}
				marginTop={compact ? 0 : 1}
				gap={1}
			>
				{children}
			</box>
		</box>
	);
}

export function OnboardingDoneScreen(props: { mouse: MouseTrackerState }) {
	const colors = useOnboardingColors();
	return (
		<box
			flexDirection="column"
			width="100%"
			height="100%"
			justifyContent="center"
			alignItems="center"
			onMouseMove={props.mouse.onMouseMove}
		>
			<text fg={colors.success}>{"\u2714"} You're all set!</text>
		</box>
	);
}

export function OnboardingOAuthPendingScreen(props: {
	authError: string;
	authStatus: string;
	authUrl: string;
	compact: boolean;
	contentWidth: number;
	label: string;
	mouse: MouseTrackerState;
	oauthProvider: string;
}) {
	const defaultFg = useDefaultFg();
	const colors = useOnboardingColors();
	return (
		<OnboardingFrame
			compact={props.compact}
			contentWidth={props.contentWidth}
			mouse={props.mouse}
		>
			<box flexDirection="column" alignItems="center" gap={1}>
				<text fg={defaultFg}>Signing in with {props.label}</text>

				{!props.authError && (
					<box flexDirection="row" gap={1} justifyContent="center">
						<spinner name="dots" color={colors.accent} />
						<text fg="gray">{props.authStatus}</text>
					</box>
				)}

				{props.authError && (
					<box flexDirection="column" alignItems="center" gap={1}>
						<text fg="red">{props.authError}</text>
						<text fg="gray">Esc to go back</text>
					</box>
				)}

				{props.authUrl && !props.authError && (
					<box
						flexDirection="column"
						border
						borderStyle="rounded"
						borderColor={colors.subtleBorder}
						paddingX={2}
						paddingY={1}
						width={props.contentWidth}
					>
						<text fg="gray">If the browser didn't open:</text>
						<text fg={colors.accent} marginTop={1} selectable>
							<a href={props.authUrl}>{props.authUrl}</a>
						</text>
					</box>
				)}

				<text fg="gray">
					<em>Esc to cancel, Ctrl+C to exit</em>
				</text>
			</box>
		</OnboardingFrame>
	);
}

export function OnboardingDeviceCodeScreen(props: {
	compact: boolean;
	contentWidth: number;
	deviceError: string;
	deviceStatus: string;
	deviceUserCode: string;
	deviceVerifyUrl: string;
	label: string;
	mouse: MouseTrackerState;
}) {
	const defaultFg = useDefaultFg();
	const colors = useOnboardingColors();
	return (
		<OnboardingFrame
			compact={props.compact}
			contentWidth={props.contentWidth}
			mouse={props.mouse}
		>
			<box flexDirection="column" alignItems="center" gap={1}>
				<text fg={defaultFg}>Signing in with {props.label}</text>

				{!props.deviceUserCode && !props.deviceError && (
					<box flexDirection="row" gap={1} justifyContent="center">
						<spinner name="dots" color={colors.accent} />
						<text fg="gray">{props.deviceStatus}</text>
					</box>
				)}

				{props.deviceError && (
					<box flexDirection="column" alignItems="center" gap={1}>
						<text fg="red">{props.deviceError}</text>
						<text fg="gray">Esc to go back</text>
					</box>
				)}

				{props.deviceUserCode && !props.deviceError && (
					<box
						flexDirection="column"
						border
						borderStyle="rounded"
						borderColor={colors.accent}
						paddingX={2}
						paddingY={1}
						width={props.contentWidth}
						alignItems="center"
						gap={1}
					>
						<text fg="gray">Your code:</text>
						<text fg={defaultFg} selectable>
							<strong>{props.deviceUserCode}</strong>
						</text>
						<text fg="gray" marginTop={1}>
							Visit this URL and enter the code above:
						</text>
						<text fg={colors.accent} selectable>
							<a href={props.deviceVerifyUrl}>{props.deviceVerifyUrl}</a>
						</text>
					</box>
				)}

				{props.deviceUserCode && !props.deviceError && (
					<box flexDirection="row" gap={1} justifyContent="center">
						<spinner name="dots" color={colors.accent} />
						<text fg="gray">Waiting for sign-in...</text>
					</box>
				)}

				<text fg="gray">
					<em>Esc to cancel, Ctrl+C to exit</em>
				</text>
			</box>
		</OnboardingFrame>
	);
}

import type {
	ProviderConfigFieldKey,
	ProviderConfigFieldRequirement,
} from "@kerberosec/core";

const DEFAULT_FIELD_LABELS: Partial<Record<ProviderConfigFieldKey, string>> = {
	apiKey: "API key",
	baseUrl: "Base URL",
	azureApiVersion: "Azure API Version",
	awsRegion: "AWS Region",
	awsProfile: "AWS Profile Name",
	sapClientId: "Client ID",
	sapClientSecret: "Client Secret",
	sapTokenUrl: "Token URL",
	sapResourceGroup: "Resource Group",
	sapDeploymentId: "Deployment ID",
};

const DEFAULT_FIELD_PLACEHOLDERS: Partial<
	Record<ProviderConfigFieldKey, string>
> = {
	apiKey: "Paste your API key here...",
	baseUrl: "",
	azureApiVersion: "2025-01-01-preview",
	awsRegion: "us-east-1",
	awsProfile: "default",
	sapClientId: "sb-...|xsuaa_std!b...",
	sapClientSecret: "SAP AI Core client secret",
	sapTokenUrl: "https://<subdomain>.authentication.sap.hana.ondemand.com",
	sapResourceGroup: "default",
	sapDeploymentId: "",
};

export function OnboardingProviderConfigScreen(props: {
	activeProviderName: string;
	compact: boolean;
	contentWidth: number;
	description?: string;
	error?: string;
	fields: Partial<
		Record<ProviderConfigFieldKey, ProviderConfigFieldRequirement>
	>;
	focusedField: ProviderConfigFieldKey;
	mouse: MouseTrackerState;
	values: Partial<Record<ProviderConfigFieldKey, string>>;
	onFieldInput: (field: ProviderConfigFieldKey, value: string) => void;
	onSubmit: () => void;
}) {
	const defaultFg = useDefaultFg();
	const colors = useOnboardingColors();
	const visibleFields = FIELD_ORDER.filter(
		(key) => props.fields[key] !== undefined,
	);

	return (
		<OnboardingFrame
			compact={props.compact}
			contentWidth={props.contentWidth}
			mouse={props.mouse}
		>
			<box flexDirection="column" gap={1} alignItems="center">
				<text fg={defaultFg}>{props.activeProviderName}</text>

				{props.description && <text fg="gray">{props.description}</text>}

				{visibleFields.map((key) => {
					const requirement = props.fields[key];
					if (!requirement) return null;
					const label = requirement.label ?? DEFAULT_FIELD_LABELS[key] ?? key;
					const placeholder =
						requirement.placeholder ??
						(key === "baseUrl" && requirement.defaultValue
							? requirement.defaultValue
							: (DEFAULT_FIELD_PLACEHOLDERS[key] ?? ""));
					const value = props.values[key] ?? "";
					const isFocused = props.focusedField === key;
					return (
						<box
							key={key}
							flexDirection="column"
							gap={0}
							width={props.contentWidth}
						>
							<text fg="gray">{label}</text>
							{requirement.note && <text fg="gray">{requirement.note}</text>}
							<box
								border
								borderStyle="rounded"
								borderColor={
									isFocused ? (props.error ? "red" : colors.accent) : "gray"
								}
								paddingX={1}
							>
								<input
									value={value}
									onInput={(v: string) => props.onFieldInput(key, v)}
									onSubmit={props.onSubmit}
									placeholder={placeholder}
									textColor={defaultFg}
									focusedTextColor={defaultFg}
									cursorColor={defaultFg}
									focused={isFocused}
									flexGrow={1}
								/>
							</box>
						</box>
					);
				})}

				{props.error && (
					<box width={props.contentWidth} justifyContent="center">
						<text fg="red">{props.error}</text>
					</box>
				)}

				<text fg="gray">
					<em>
						{visibleFields.length > 1
							? "Tab/Enter to switch fields, Enter on last field to save, Esc to go back, Ctrl+C to exit"
							: "Enter to save, Esc to go back, Ctrl+C to exit"}
					</em>
				</text>
			</box>
		</OnboardingFrame>
	);
}

export function OnboardingCodexCliScreen(props: {
	activeProviderName: string;
	checking: boolean;
	compact: boolean;
	contentWidth: number;
	mouse: MouseTrackerState;
	status?: CodexCliStatus;
}) {
	const defaultFg = useDefaultFg();
	const colors = useOnboardingColors();
	const installedStatus =
		props.status?.installed === true ? props.status : undefined;
	return (
		<OnboardingFrame
			compact={props.compact}
			contentWidth={props.contentWidth}
			mouse={props.mouse}
		>
			<box flexDirection="column" gap={1} alignItems="center">
				<text fg={defaultFg}>{props.activeProviderName}</text>

				{props.checking && (
					<box flexDirection="row" gap={1}>
						<spinner name="dots" color="gray" />
						<text fg="gray">Checking for Codex CLI...</text>
					</box>
				)}

				{installedStatus && (
					<box flexDirection="column" gap={1} alignItems="center">
						<text fg={colors.success}>{"\u25cf"} Codex CLI installed</text>
						<text fg="gray">{installedStatus.version}</text>
					</box>
				)}

				{props.status && !props.status.installed && (
					<box flexDirection="column" gap={1} width={props.contentWidth}>
						<text fg="yellow">Codex CLI was not found</text>
						<text fg="gray">{props.status.reason}</text>
						<text fg="gray">Install Codex CLI from:</text>
						<text fg={colors.accent} selectable>
							{CODEX_CLI_INSTALL_URL}
						</text>
					</box>
				)}

				<text fg="gray">
					<em>
						{installedStatus
							? "Enter to continue, R to recheck, Esc to go back, Ctrl+C to exit"
							: "R to recheck, Esc to go back, Ctrl+C to exit"}
					</em>
				</text>
			</box>
		</OnboardingFrame>
	);
}

export function OnboardingProviderPickerScreen(props: {
	compact: boolean;
	contentWidth: number;
	mouse: MouseTrackerState;
	providerList: SearchableListState;
	providersLoading: boolean;
}) {
	const defaultFg = useDefaultFg();
	return (
		<OnboardingFrame
			compact={props.compact}
			contentWidth={props.contentWidth}
			mouse={props.mouse}
		>
			<text fg={defaultFg} paddingX={1}>
				Choose a provider
			</text>

			{props.providersLoading ? (
				<box flexDirection="row" gap={1} paddingX={1}>
					<spinner name="dots" color="gray" />
					<text fg="gray">Loading providers...</text>
				</box>
			) : (
				<SearchableList
					items={props.providerList.filtered}
					selected={props.providerList.safeSelected}
					onSearchChange={props.providerList.setSearch}
					placeholder="Search providers..."
					emptyText="No providers match"
				/>
			)}

			<text fg="gray" paddingX={1}>
				<em>
					Type to search, ↑/↓ navigate, Enter to select, Esc to go back, Ctrl+C
					to exit
				</em>
			</text>
		</OnboardingFrame>
	);
}

export function OnboardingKerberoSecModelScreen(props: {
	activeProviderName?: string;
	kerberosecEntries: KerberoSecModelPickerEntry[];
	kerberosecModelSelected: number;
	compact: boolean;
	contentWidth: number;
	mouse: MouseTrackerState;
	recommendedLoading: boolean;
}) {
	const defaultFg = useDefaultFg();
	const providerDisplay = props.activeProviderName || "Cline Usage Billing";
	return (
		<OnboardingFrame
			compact={props.compact}
			contentWidth={props.contentWidth}
			mouse={props.mouse}
		>
			<text fg={defaultFg} paddingX={1}>
				<strong>Choose a model</strong>
			</text>
			<text fg="gray" paddingX={1}>
				Provider: {providerDisplay} (tab to change provider)
			</text>

			<KerberoSecModelPicker
				entries={props.kerberosecEntries}
				selected={props.kerberosecModelSelected}
				loading={props.recommendedLoading}
			/>

			<text fg="gray" paddingX={1}>
				<em>
					↑/↓ navigate, Enter to select, Tab to change provider, Esc to go back
				</em>
			</text>
		</OnboardingFrame>
	);
}

export function OnboardingKerberoSecPassSubscriptionScreen(props: {
	compact: boolean;
	contentWidth: number;
	currentPlanName: string;
	error: string;
	mouse: MouseTrackerState;
	openStatus: string;
	options: KerberoSecPassSubscriptionOption[];
	planFeatures: string[];
	selected: number;
	status: KerberoSecPassSubscriptionStatus;
	subscriptionUrl: string;
}) {
	const defaultFg = useDefaultFg();
	const planAccent = useTheme().accents.plan;
	const colors = useOnboardingColors();
	const scrollRef = useRef<ScrollBoxRenderable | null>(null);
	const isLoading = props.status === "loading";
	const isSubscribed = props.status === "subscribed";
	const isError = props.status === "error";
	const bodyHeight = props.compact ? 17 : 19;

	useEffect(() => {
		if (isSubscribed) {
			return;
		}
		const scrollSelectedOptionIntoView = () => {
			scrollRef.current?.scrollChildIntoView(
				getKerberoSecPassSubscriptionOptionId(props.selected),
			);
		};
		scrollSelectedOptionIntoView();
		queueMicrotask(scrollSelectedOptionIntoView);
		const timeout = setTimeout(scrollSelectedOptionIntoView, 0);
		return () => clearTimeout(timeout);
	}, [isSubscribed, props.selected]);

	return (
		<OnboardingFrame
			compact={props.compact}
			contentWidth={props.contentWidth}
			mouse={props.mouse}
		>
			<box
				flexDirection="column"
				border
				borderStyle="rounded"
				borderColor={isSubscribed ? colors.success : planAccent}
				paddingX={1}
				paddingY={1}
				height={bodyHeight}
				overflow="hidden"
			>
				<scrollbox
					ref={scrollRef}
					width="100%"
					height="100%"
					scrollY
					scrollX={false}
					viewportOptions={{ overflow: "hidden" }}
					contentOptions={{ flexDirection: "column" }}
				>
					<box flexDirection="column" width="100%" flexShrink={0}>
						<text
							fg={isSubscribed ? colors.success : planAccent}
							flexShrink={0}
						>
							{isSubscribed
								? "Cline subscription active"
								: "Cline subscription required"}
						</text>

						{isLoading ? (
							<box flexDirection="row" gap={1} flexShrink={0}>
								<spinner name="dots" color="gray" />
								<text fg="gray">Checking your Cline subscription...</text>
							</box>
						) : isSubscribed ? (
							<text fg={defaultFg} selectable flexShrink={0}>
								Current plan: {props.currentPlanName || "Cline"}
							</text>
						) : isError ? (
							<text
								fg={defaultFg}
								selectable
								flexShrink={0}
								content="Could not verify your Cline subscription. Re-check before choosing a Cline model."
							/>
						) : (
							<text
								fg={defaultFg}
								selectable
								flexShrink={0}
								content="No access to Cline subscription models yet. Subscribe to Cline to access models."
							/>
						)}

						{props.status === "error" &&
							props.error &&
							props.error !== "no plan found for user" && (
								<text fg="red" selectable flexShrink={0}>
									{props.error}
								</text>
							)}

						{!isSubscribed && props.planFeatures.length > 0 && (
							<box flexDirection="column" marginTop={1} flexShrink={0}>
								{props.planFeatures.map((feature) => {
									if (
										feature === "Low cost subscription pricing" ||
										feature === "Generous limits and reliable access" ||
										feature === "Built for as many programmers as possible"
									) {
										return null;
									}

									return (
										<text
											key={feature}
											fg={defaultFg}
											selectable
											flexShrink={0}
										>
											<span fg="green">✓ </span>
											<span>{feature}</span>
										</text>
									);
								})}
							</box>
						)}

						{!isSubscribed && (
							<box flexDirection="column" marginTop={1} flexShrink={0}>
								{props.options.map((option, i) => {
									const isSel = i === props.selected;
									return (
										<box
											id={getKerberoSecPassSubscriptionOptionId(i)}
											key={option.value}
											paddingX={1}
											flexDirection="row"
											gap={1}
											backgroundColor={isSel ? colors.selection : undefined}
											height={1}
											flexShrink={0}
											overflow="hidden"
										>
											<text
												fg={isSel ? colors.textOnSelection : "gray"}
												flexShrink={0}
											>
												{isSel ? "\u276f" : " "}
											</text>
											<text
												fg={isSel ? colors.textOnSelection : defaultFg}
												flexShrink={0}
											>
												{option.label}
											</text>
										</box>
									);
								})}
							</box>
						)}

						{props.openStatus && (
							<text fg="gray" selectable flexShrink={0}>
								{props.openStatus}
							</text>
						)}

						{!isSubscribed && (
							<box flexDirection="column" marginTop={1} flexShrink={0}>
								<text fg="gray" flexShrink={0}>
									If the browser button does not work:
								</text>
								<text fg={colors.accent} selectable flexShrink={0}>
									<a href={props.subscriptionUrl}>{props.subscriptionUrl}</a>
								</text>
							</box>
						)}
					</box>
				</scrollbox>
			</box>

			<text fg="gray" paddingX={1}>
				<em>↑/↓ navigate, Enter to select, Esc to go back, Ctrl+C to exit</em>
			</text>
		</OnboardingFrame>
	);
}

export function OnboardingModelPickerScreen(props: {
	activeProviderName: string;
	compact: boolean;
	contentWidth: number;
	modelList: SearchableListState;
	modelsLoading: boolean;
	mouse: MouseTrackerState;
	onModelItemSelect: (item: SearchableItem) => void;
}) {
	const defaultFg = useDefaultFg();
	return (
		<OnboardingFrame
			compact={props.compact}
			contentWidth={props.contentWidth}
			mouse={props.mouse}
		>
			<text fg={defaultFg} paddingX={1}>
				<strong>Choose a model for {props.activeProviderName}</strong>
			</text>
			<text fg="gray" paddingX={1}>
				You can change this anytime
			</text>

			{props.modelsLoading ? (
				<box flexDirection="row" gap={1} paddingX={1}>
					<spinner name="dots" color="gray" />
					<text fg="gray">Loading models...</text>
				</box>
			) : (
				<SearchableList
					items={props.modelList.filtered}
					selected={props.modelList.safeSelected}
					onSearchChange={props.modelList.setSearch}
					onItemSelect={props.onModelItemSelect}
					placeholder="Search models..."
					emptyText="Create a custom model ID to enter one manually"
				/>
			)}

			<text fg="gray" paddingX={1}>
				<em>
					Type to search, ↑/↓ navigate, Enter to select, Esc to go back, Ctrl+C
					to exit
				</em>
			</text>
		</OnboardingFrame>
	);
}

export function OnboardingCustomModelIdScreen(props: {
	activeProviderName: string;
	compact: boolean;
	contentWidth: number;
	error: string;
	mouse: MouseTrackerState;
	onInput: (value: string) => void;
	onSubmit: () => void;
	title: string;
	value: string;
}) {
	const defaultFg = useDefaultFg();
	return (
		<OnboardingFrame
			compact={props.compact}
			contentWidth={props.contentWidth}
			mouse={props.mouse}
		>
			<text fg={defaultFg} paddingX={1}>
				{props.title}
			</text>
			<text fg="gray" paddingX={1}>
				{props.activeProviderName}
			</text>

			<box flexDirection="column" gap={0} paddingX={1}>
				<text fg="gray">Model ID</text>
				<box
					border
					borderStyle="rounded"
					borderColor={props.error ? "red" : "gray"}
					paddingX={1}
				>
					<input
						value={props.value}
						onInput={props.onInput}
						onSubmit={props.onSubmit}
						placeholder=""
						textColor={defaultFg}
						focusedTextColor={defaultFg}
						cursorColor={defaultFg}
						flexGrow={1}
						focused
					/>
				</box>
				{props.error && <text fg="red">{props.error}</text>}
			</box>

			<text fg="gray" paddingX={1}>
				<em>
					Enter to create, Esc to go back to model selection, Ctrl+C to exit
				</em>
			</text>
		</OnboardingFrame>
	);
}

export function OnboardingThinkingLevelScreen(props: {
	compact: boolean;
	contentWidth: number;
	mouse: MouseTrackerState;
	selectedModelName: string;
	thinkingSelected: number;
}) {
	const defaultFg = useDefaultFg();
	const colors = useOnboardingColors();
	return (
		<OnboardingFrame
			compact={props.compact}
			contentWidth={props.contentWidth}
			mouse={props.mouse}
		>
			<text fg={defaultFg} paddingX={1}>
				Thinking level for {props.selectedModelName}
			</text>
			<text fg="gray" paddingX={1}>
				Extended thinking lets the model reason through complex problems
			</text>

			<box flexDirection="column">
				{THINKING_LEVELS.map((level, i) => {
					const isSel = i === props.thinkingSelected;
					return (
						<box
							key={level.value}
							paddingX={1}
							flexDirection="row"
							gap={1}
							backgroundColor={isSel ? colors.selection : undefined}
							height={1}
						>
							<text fg={isSel ? colors.textOnSelection : "gray"} flexShrink={0}>
								{isSel ? "\u276f" : " "}
							</text>
							<text fg={isSel ? colors.textOnSelection : defaultFg}>
								{level.label}
							</text>
							<text fg={isSel ? colors.textOnSelection : "gray"}>
								{level.desc}
							</text>
						</box>
					);
				})}
			</box>

			<text fg="gray" paddingX={1}>
				<em>↑/↓ navigate, Enter to select, Esc to go back, Ctrl+C to exit</em>
			</text>
		</OnboardingFrame>
	);
}

export function OnboardingMainMenuScreen(props: {
	compact?: boolean;
	contentWidth: number;
	menuOptions: MenuOption[];
	menuSelected: number;
	mouse: MouseTrackerState;
}) {
	const { width, height } = useTerminalDimensions();
	const defaultFg = useDefaultFg();
	const colors = useOnboardingColors();

	// Responsive threshold tiers:
	// - Full: height >= 34 && width >= 86 (ASCII art banner, individual cards)
	// - Medium: height >= 26 && height < 34 (compact header, individual cards)
	// - Compact: height >= 18 && height < 26 (compact header, single card container)
	// - Minimal: height < 18 (ultra-compact rows, minimal header)
	const isFull = !props.compact && height >= 34 && width >= 86;
	const isMedium = height >= 26 && height < 34;
	const isCompact = height >= 18 && height < 26;

	const selectedOption = props.menuOptions[props.menuSelected];
	const effectiveWidth = Math.max(24, Math.min(props.contentWidth, width - 2));

	return (
		<box
			flexDirection="column"
			width="100%"
			height="100%"
			justifyContent={height >= 24 ? "center" : "flex-start"}
			alignItems="center"
			paddingTop={height < 24 ? 1 : 0}
			onMouseMove={props.mouse.onMouseMove}
		>
			{/* Banner */}
			{height >= 12 && (
				<KerberoSecBanner compact={!isFull} hideDetails={height < 24} />
			)}

			{/* Welcome title */}
			{height >= 16 && (
				<box
					flexDirection="column"
					width={effectiveWidth}
					alignItems="center"
					marginTop={isFull ? 1 : 0}
				>
					<text fg={defaultFg}>
						<strong>Welcome to KerberoSec</strong>
					</text>
					{isFull && (
						<text fg="gray" marginTop={1}>
							Connect a model provider to get started.
						</text>
					)}
				</box>
			)}

			{/* Menu Options */}
			{isFull || isMedium ? (
				/* Full / Medium: Individual rounded border cards */
				<box
					flexDirection="column"
					width={effectiveWidth}
					marginTop={isFull ? 1 : 0}
					gap={0}
				>
					{props.menuOptions.map((option, i) => {
						const isSel = i === props.menuSelected;
						return (
							<box
								key={option.value}
								flexDirection="row"
								border
								borderStyle="rounded"
								borderColor={isSel ? colors.accent : colors.subtleBorder}
								paddingX={1}
								gap={1}
								alignItems="center"
							>
								<text
									fg={isSel ? colors.accent : colors.mutedDetail}
									flexShrink={0}
								>
									{option.icon}
								</text>
								<box flexDirection="column" flexGrow={1}>
									<text fg={isSel ? defaultFg : "gray"}>
										<strong>{option.label}</strong>
									</text>
									<text fg={isSel ? "gray" : colors.mutedDetail}>
										{option.detail}
									</text>
								</box>
								{isSel && (
									<text fg={colors.accent} flexShrink={0}>
										{"\u2192"}
									</text>
								)}
							</box>
						);
					})}
				</box>
			) : isCompact ? (
				/* Compact (height 18-25): Single bordered container holding all 4 options */
				<box flexDirection="column" width={effectiveWidth} marginTop={0}>
					<box
						flexDirection="column"
						border
						borderStyle="rounded"
						borderColor={colors.accent}
						paddingX={1}
					>
						{props.menuOptions.map((option, i) => {
							const isSel = i === props.menuSelected;
							return (
								<box
									key={option.value}
									flexDirection="row"
									gap={1}
									alignItems="center"
									backgroundColor={isSel ? colors.selection : undefined}
								>
									<text
										fg={isSel ? colors.accent : colors.mutedDetail}
										flexShrink={0}
									>
										{isSel ? "\u276f" : " "}
									</text>
									<text
										fg={
											isSel ? (colors.textOnSelection ?? defaultFg) : defaultFg
										}
										flexShrink={0}
									>
										<strong>{option.label}</strong>
									</text>
									{effectiveWidth >= 68 && (
										<text
											fg={
												isSel
													? (colors.textOnSelection ?? "gray")
													: colors.mutedDetail
											}
											flexShrink={1}
										>
											: {option.detail}
										</text>
									)}
								</box>
							);
						})}
					</box>
					{effectiveWidth < 68 && selectedOption && height >= 22 && (
						<box marginTop={0} paddingX={1}>
							<text fg="gray">{selectedOption.detail}</text>
						</box>
					)}
				</box>
			) : (
				/* Minimal (height < 18): Sleek 1-line rows without card borders */
				<box flexDirection="column" width={effectiveWidth} marginTop={0}>
					{props.menuOptions.map((option, i) => {
						const isSel = i === props.menuSelected;
						return (
							<box
								key={option.value}
								flexDirection="row"
								paddingX={1}
								gap={1}
								alignItems="center"
								backgroundColor={isSel ? colors.selection : undefined}
							>
								<text
									fg={isSel ? colors.accent : colors.mutedDetail}
									flexShrink={0}
								>
									{isSel ? "\u276f" : " "}
								</text>
								<text
									fg={isSel ? (colors.textOnSelection ?? defaultFg) : defaultFg}
									flexShrink={0}
								>
									<strong>{option.label}</strong>
								</text>
								{effectiveWidth >= 65 && (
									<text
										fg={
											isSel
												? (colors.textOnSelection ?? "gray")
												: colors.mutedDetail
										}
										flexShrink={1}
									>
										: {option.detail}
									</text>
								)}
							</box>
						);
					})}
					{effectiveWidth < 65 && selectedOption && height >= 14 && (
						<box marginTop={0} paddingX={1}>
							<text fg="gray">{selectedOption.detail}</text>
						</box>
					)}
				</box>
			)}

			{/* Navigation hints */}
			{height >= 10 && (
				<text fg="gray" marginTop={isFull ? 1 : 0}>
					<em>
						{height >= 16
							? "↑/↓ navigate, Enter to select, Ctrl+C to exit"
							: "↑/↓ select, Enter confirm"}
					</em>
				</text>
			)}
		</box>
	);
}
