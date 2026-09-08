import type { ProviderSettingsManager } from "@kerberosec/core";
import { useTerminalDimensions } from "@opentui/react";
import { useMouseTracker } from "../../components/tracked-robot";
import { useOnboardingController } from "./controller";
import { getOAuthProviderLabel, type OnboardingResult } from "./model";
import {
	OnboardingCodexCliScreen,
	OnboardingCustomModelIdScreen,
	OnboardingDeviceCodeScreen,
	OnboardingDoneScreen,
	OnboardingKerberoSecModelScreen,
	OnboardingKerberoSecPassSubscriptionScreen,
	OnboardingMainMenuScreen,
	OnboardingModelPickerScreen,
	OnboardingOAuthPendingScreen,
	OnboardingProviderConfigScreen,
	OnboardingProviderPickerScreen,
	OnboardingThinkingLevelScreen,
} from "./screens";

export interface OnboardingViewProps {
	onComplete: (result: OnboardingResult) => void;
	onExit: () => void;
	providerSettingsManager?: ProviderSettingsManager;
}

export function OnboardingView(props: OnboardingViewProps) {
	const { width, height } = useTerminalDimensions();
	const mouse = useMouseTracker();
	const state = useOnboardingController(props);
	const contentWidth = Math.max(20, Math.min(width - 2, 76));
	const compact = height < 34 || width < 86;

	if (state.step === "done") {
		return <OnboardingDoneScreen mouse={mouse} />;
	}

	if (state.step === "oauth_pending") {
		return (
			<OnboardingOAuthPendingScreen
				authError={state.authError}
				authStatus={state.authStatus}
				authUrl={state.authUrl}
				compact={compact}
				contentWidth={contentWidth}
				label={getOAuthProviderLabel(state.oauthProvider)}
				mouse={mouse}
				oauthProvider={state.oauthProvider}
			/>
		);
	}

	if (state.step === "device_code") {
		return (
			<OnboardingDeviceCodeScreen
				compact={compact}
				contentWidth={contentWidth}
				deviceError={state.deviceError}
				deviceStatus={state.deviceStatus}
				deviceUserCode={state.deviceUserCode}
				deviceVerifyUrl={state.deviceVerifyUrl}
				label={getOAuthProviderLabel(state.oauthProvider)}
				mouse={mouse}
			/>
		);
	}

	if (state.step === "byo_apikey") {
		return (
			<OnboardingProviderConfigScreen
				activeProviderName={state.activeProviderName}
				compact={compact}
				contentWidth={contentWidth}
				description={state.byoDescription}
				error={state.byoError}
				fields={state.byoFields}
				focusedField={state.byoFocusedField}
				mouse={mouse}
				values={state.byoValues}
				onFieldInput={state.handleByoFieldInput}
				onSubmit={state.saveByoConfig}
			/>
		);
	}

	if (state.step === "codex_cli_setup") {
		return (
			<OnboardingCodexCliScreen
				activeProviderName={state.activeProviderName}
				checking={state.codexCliChecking}
				compact={compact}
				contentWidth={contentWidth}
				mouse={mouse}
				status={state.codexCliStatus}
			/>
		);
	}

	if (state.step === "byo_provider") {
		return (
			<OnboardingProviderPickerScreen
				compact={compact}
				contentWidth={contentWidth}
				mouse={mouse}
				providerList={state.providerList}
				providersLoading={state.providersLoading}
			/>
		);
	}

	if (state.step === "kerberosec_model") {
		return (
			<OnboardingKerberoSecModelScreen
				activeProviderName={state.activeProviderName}
				kerberosecEntries={state.kerberosecEntries}
				kerberosecModelSelected={state.kerberosecModelSelected}
				compact={compact}
				contentWidth={contentWidth}
				mouse={mouse}
				recommendedLoading={state.recommendedLoading}
			/>
		);
	}

	if (state.step === "kerberosec_pass_subscription") {
		return (
			<OnboardingKerberoSecPassSubscriptionScreen
				compact={compact}
				contentWidth={contentWidth}
				currentPlanName={state.kerberosecPassCurrentPlanName}
				error={state.kerberosecPassSubscriptionError}
				mouse={mouse}
				openStatus={state.kerberosecPassSubscriptionOpenStatus}
				options={state.kerberosecPassSubscriptionOptions}
				planFeatures={state.kerberosecPassPlanFeatures}
				selected={state.kerberosecPassSubscriptionSelected}
				status={state.kerberosecPassSubscriptionStatus}
				subscriptionUrl={state.kerberosecPassSubscriptionUrl}
			/>
		);
	}

	if (state.step === "model_picker") {
		return (
			<OnboardingModelPickerScreen
				activeProviderName={state.activeProviderName}
				compact={compact}
				contentWidth={contentWidth}
				modelList={state.modelList}
				modelsLoading={state.modelsLoading}
				mouse={mouse}
				onModelItemSelect={state.handleModelItemSelect}
			/>
		);
	}

	if (state.step === "custom_model_id") {
		return (
			<OnboardingCustomModelIdScreen
				activeProviderName={state.activeProviderName}
				compact={compact}
				contentWidth={contentWidth}
				error={state.customModelError}
				mouse={mouse}
				onInput={state.handleCustomModelIdInput}
				onSubmit={state.saveCustomModelId}
				title={state.customModelTitle}
				value={state.customModelId}
			/>
		);
	}

	if (state.step === "thinking_level") {
		return (
			<OnboardingThinkingLevelScreen
				compact={compact}
				contentWidth={contentWidth}
				mouse={mouse}
				selectedModelName={state.selectedModelName}
				thinkingSelected={state.thinkingSelected}
			/>
		);
	}

	return (
		<OnboardingMainMenuScreen
			compact={compact}
			contentWidth={contentWidth}
			menuOptions={state.menuOptions}
			menuSelected={state.menuSelected}
			mouse={mouse}
		/>
	);
}
