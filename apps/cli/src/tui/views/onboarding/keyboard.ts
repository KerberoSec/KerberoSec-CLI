import type { ProviderConfigFieldKey } from "@kerberosec/core";
import { useKeyboard } from "@opentui/react";
import { type Dispatch, type SetStateAction, useRef } from "react";
import type { KerberoSecModelPickerEntry } from "../../components/model-selector/kerberosec-model-picker";
import type { SearchableListState } from "../../components/searchable-list";
import {
	isOnboardingOAuthProviderId,
	type OnboardingOAuthProviderId,
} from "./auth";
import { FIELD_ORDER } from "./fields";
import {
	type KerberoSecPassSubscriptionOption,
	type KerberoSecPassSubscriptionStatus,
	type MenuOption,
	type OnboardingStep,
	shouldUseFeaturedKerberoSecModelPicker,
	THINKING_LEVELS,
	type ThinkingLevel,
} from "./model";

export function useOnboardingKeyboard(input: {
	step: OnboardingStep;
	onExit: () => void;
	oauthProvider: string;
	activeProviderId: string;
	menuOptions: MenuOption[];
	menuSelected: number;
	providerList: SearchableListState;
	modelList: SearchableListState;
	kerberosecEntries: KerberoSecModelPickerEntry[];
	kerberosecModelSelected: number;
	kerberosecPassSubscriptionStatus: KerberoSecPassSubscriptionStatus;
	kerberosecPassSubscriptionOptions: KerberoSecPassSubscriptionOption[];
	kerberosecPassSubscriptionSelected: number;
	thinkingSelected: number;
	setStep: (step: OnboardingStep) => void;
	setMenuSelected: Dispatch<SetStateAction<number>>;
	resetByoFields: () => void;
	byoFields: Partial<Record<ProviderConfigFieldKey, unknown>>;
	byoFocusedField: ProviderConfigFieldKey;
	setByoFocusedField: Dispatch<SetStateAction<ProviderConfigFieldKey>>;
	setDeviceUserCode: (value: string) => void;
	setDeviceVerifyUrl: (value: string) => void;
	setDeviceError: (value: string) => void;
	setDeviceStatus: (value: string) => void;
	setKerberoSecModelSelected: Dispatch<SetStateAction<number>>;
	setKerberoSecPassSubscriptionSelected: Dispatch<SetStateAction<number>>;
	setThinkingSelected: Dispatch<SetStateAction<number>>;
	continueFromKerberoSecPassSubscription: () => void;
	refreshKerberoSecPassSubscriptionStatus: () => void;
	openKerberoSecPassSubscriptionPage: () => void;
	abortOAuth: () => void;
	abortDeviceCode: () => void;
	resetAuth: () => void;
	refreshCodexCliStatus: () => void;
	startOAuthFlow: (providerId: OnboardingOAuthProviderId) => void;
	startDeviceCodeFlow: (providerId: OnboardingOAuthProviderId) => void;
	selectProvider: (providerId: string) => void;
	loadModelsForProvider: (providerId: string) => void;
	saveKerberoSecModelSelection: (modelId: string, modelName: string) => void;
	saveCodexCliConfig: () => void;
	saveByoConfig: () => void;
	saveModelSelection: () => void;
	saveThinkingLevel: (level: ThinkingLevel) => void;
}) {
	const lastCtrlCRef = useRef(0);

	useKeyboard((key) => {
		if (input.step === "done") return;

		if (key.ctrl && key.name === "c") {
			const now = Date.now();
			if (now - lastCtrlCRef.current < 2000) {
				input.onExit();
			} else {
				lastCtrlCRef.current = now;
			}
			return;
		}

		if (key.name === "escape") {
			if (input.step === "oauth_pending") {
				input.abortOAuth();
				input.resetAuth();
				input.setStep("menu");
				input.setMenuSelected(0);
				return;
			}
			if (input.step === "device_code") {
				input.abortDeviceCode();
				input.setDeviceUserCode("");
				input.setDeviceVerifyUrl("");
				input.setDeviceError("");
				input.setDeviceStatus("");
				input.setStep("menu");
				input.setMenuSelected(0);
				return;
			}
			if (input.step === "byo_apikey") {
				input.resetByoFields();
				if (input.activeProviderId === "agent-router") {
					input.setStep("menu");
					input.setMenuSelected(0);
				} else {
					input.setStep("byo_provider");
				}
				return;
			}
			if (input.step === "byo_provider") {
				input.setStep("menu");
				input.setMenuSelected(0);
				return;
			}
			if (input.step === "codex_cli_setup") {
				input.setStep("byo_provider");
				return;
			}
			if (input.step === "kerberosec_pass_subscription") {
				input.setStep("menu");
				input.setMenuSelected(0);
				return;
			}
			if (input.step === "kerberosec_model") {
				input.setStep("menu");
				input.setMenuSelected(0);
				return;
			}
			if (input.step === "model_picker") {
				if (shouldUseFeaturedKerberoSecModelPicker(input.activeProviderId)) {
					input.setKerberoSecModelSelected(0);
					input.setStep("kerberosec_model");
				} else {
					input.setStep("menu");
					input.setMenuSelected(0);
				}
				return;
			}
			if (input.step === "custom_model_id") {
				input.setStep("model_picker");
				return;
			}
			if (input.step === "thinking_level") {
				if (shouldUseFeaturedKerberoSecModelPicker(input.activeProviderId)) {
					input.setKerberoSecModelSelected(0);
					input.setStep("kerberosec_model");
				} else {
					input.setStep("model_picker");
					input.loadModelsForProvider(input.activeProviderId);
				}
			}
			return;
		}

		if (input.step === "oauth_pending") {
			if (key.name === "d" && input.oauthProvider === "kerberosec") {
				input.abortOAuth();
				input.resetAuth();
				input.startDeviceCodeFlow("kerberosec");
			}
			return;
		}

		if (input.step === "device_code") return;

		if (input.step === "kerberosec_pass_subscription") {
			const total = input.kerberosecPassSubscriptionOptions.length;
			if (total === 0) return;
			if (key.name === "up" || (key.ctrl && key.name === "p")) {
				input.setKerberoSecPassSubscriptionSelected((s) =>
					s <= 0 ? total - 1 : s - 1,
				);
				return;
			}
			if (key.name === "down" || (key.ctrl && key.name === "n")) {
				input.setKerberoSecPassSubscriptionSelected((s) =>
					s >= total - 1 ? 0 : s + 1,
				);
				return;
			}
			if (key.name === "return" || key.name === "enter") {
				const option =
					input.kerberosecPassSubscriptionOptions[
						Math.min(input.kerberosecPassSubscriptionSelected, total - 1)
					];
				if (!option) return;
				if (option.value === "subscribe") {
					input.openKerberoSecPassSubscriptionPage();
				} else if (option.value === "refresh") {
					if (input.kerberosecPassSubscriptionStatus !== "loading") {
						input.refreshKerberoSecPassSubscriptionStatus();
					}
				} else if (option.value === "skip") {
					input.continueFromKerberoSecPassSubscription();
				} else if (option.value === "back") {
					input.setStep("menu");
					input.setMenuSelected(0);
				}
			}
			return;
		}

		if (input.step === "menu") {
			if (key.name === "up") {
				input.setMenuSelected((s) =>
					s <= 0 ? input.menuOptions.length - 1 : s - 1,
				);
				return;
			}
			if (key.name === "down") {
				input.setMenuSelected((s) =>
					s >= input.menuOptions.length - 1 ? 0 : s + 1,
				);
				return;
			}
			if (key.name === "return") {
				const option = input.menuOptions[input.menuSelected];
				if (!option) return;
				if (isOnboardingOAuthProviderId(option.value)) {
					input.startOAuthFlow(option.value);
				} else if (option.value === "agent-router") {
					input.selectProvider("agent-router");
				} else {
					input.setStep("byo_provider");
				}
			}
			return;
		}

		if (input.step === "byo_provider") {
			if (key.name === "up" || (key.ctrl && key.name === "p")) {
				input.providerList.moveUp();
				return;
			}
			if (key.name === "down" || (key.ctrl && key.name === "n")) {
				input.providerList.moveDown();
				return;
			}
			if (key.name === "return") {
				const item = input.providerList.selectedItem;
				if (item) input.selectProvider(item.key);
			}
			return;
		}

		if (input.step === "codex_cli_setup") {
			if (key.name === "r") {
				input.refreshCodexCliStatus();
				return;
			}
			if (key.name === "return") {
				input.saveCodexCliConfig();
			}
			return;
		}

		if (input.step === "byo_apikey") {
			if (key.name === "return" || key.name === "enter") {
				input.saveByoConfig();
				return;
			}
			if (key.name === "tab") {
				const visible = FIELD_ORDER.filter(
					(k) => input.byoFields[k] !== undefined,
				);
				if (visible.length > 1) {
					const idx = visible.indexOf(input.byoFocusedField);
					const nextIdx = key.shift
						? (idx - 1 + visible.length) % visible.length
						: (idx + 1) % visible.length;
					const next = visible[nextIdx];
					if (next) input.setByoFocusedField(next as ProviderConfigFieldKey);
				}
			}
			return;
		}

		if (input.step === "kerberosec_model") {
			if (key.name === "tab") {
				input.setStep("byo_provider");
				return;
			}
			const total = input.kerberosecEntries.length;
			if (total === 0) return;
			if (key.name === "up" || (key.ctrl && key.name === "p")) {
				input.setKerberoSecModelSelected((s) => (s <= 0 ? total - 1 : s - 1));
				return;
			}
			if (key.name === "down" || (key.ctrl && key.name === "n")) {
				input.setKerberoSecModelSelected((s) => (s >= total - 1 ? 0 : s + 1));
				return;
			}
			if (key.name === "return") {
				const entry = input.kerberosecEntries[input.kerberosecModelSelected];
				if (!entry) return;
				if (entry.kind === "model") {
					input.saveKerberoSecModelSelection(entry.model.id, entry.model.name);
				} else {
					input.setStep("model_picker");
					input.loadModelsForProvider(input.activeProviderId);
				}
			}
			return;
		}

		if (input.step === "model_picker") {
			if (key.name === "up" || (key.ctrl && key.name === "p")) {
				input.modelList.moveUp();
				return;
			}
			if (key.name === "down" || (key.ctrl && key.name === "n")) {
				input.modelList.moveDown();
				return;
			}
			if (key.name === "return") {
				input.saveModelSelection();
			}
			return;
		}

		if (input.step === "thinking_level") {
			if (key.name === "up" || (key.ctrl && key.name === "p")) {
				input.setThinkingSelected((s) =>
					s <= 0 ? THINKING_LEVELS.length - 1 : s - 1,
				);
				return;
			}
			if (key.name === "down" || (key.ctrl && key.name === "n")) {
				input.setThinkingSelected((s) =>
					s >= THINKING_LEVELS.length - 1 ? 0 : s + 1,
				);
				return;
			}
			if (key.name === "return") {
				const level = THINKING_LEVELS[input.thinkingSelected];
				if (level) input.saveThinkingLevel(level.value);
			}
		}
	});
}
