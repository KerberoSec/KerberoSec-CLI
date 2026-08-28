import type { FeatureFlagPayload } from "@/services/feature-flags/providers/IFeatureFlagsProvider"

export enum FeatureFlag {
	WORKTREES = "worktree-exp",
	// Feature flag for showing the new onboarding flow or old welcome view.
	ONBOARDING_MODELS = "onboarding_models",
	// Feature flag for remote banner service
	REMOTE_BANNERS = "remote-banners",
	// Feature flag payload (milliseconds) controlling remote banner cache TTL
	EXTENSION_REMOTE_BANNERS_TTL = "extension_remote_banners_ttl",
	// Feature flag for DB-backed welcome banners (What's New modal)
	// When off, hardcoded welcome items are shown instead
	REMOTE_WELCOME_BANNERS = "remote-welcome-banners",
	// Rollout flag for KerberoSec provider model sourcing:
	// off => OpenRouter model list, on => KerberoSec endpoint model list.
	EXTENSION_KERBEROSEC_MODELS_ENDPOINT = "extension_kerberosec_models_endpoint",
	// Rollout flag for fetching recommended KerberoSec models from the upstream endpoint.
	KERBEROSEC_RECOMMENDED_MODELS_UPSTREAM = "kerberosec_recommended_models_upstream",
	// Use the websocket mode for OpenAI native Responses API format
	OPENAI_RESPONSES_WEBSOCKET_MODE = "openai-responses-websocket-mode",
}

export const FeatureFlagDefaultValue: Partial<Record<FeatureFlag, FeatureFlagPayload>> = {
	[FeatureFlag.WORKTREES]: false,
	[FeatureFlag.ONBOARDING_MODELS]: process.env.E2E_TEST === "true" ? { models: {} } : undefined,
	[FeatureFlag.REMOTE_BANNERS]: process.env.E2E_TEST === "true" || process.env.IS_DEV === "true",
	[FeatureFlag.EXTENSION_REMOTE_BANNERS_TTL]: 24 * 60 * 60 * 1000,
	[FeatureFlag.REMOTE_WELCOME_BANNERS]: process.env.E2E_TEST === "true" || process.env.IS_DEV === "true",
	[FeatureFlag.EXTENSION_KERBEROSEC_MODELS_ENDPOINT]: false,
	[FeatureFlag.KERBEROSEC_RECOMMENDED_MODELS_UPSTREAM]: false,
	[FeatureFlag.OPENAI_RESPONSES_WEBSOCKET_MODE]: false,
}

export const FEATURE_FLAGS = Object.values(FeatureFlag)
