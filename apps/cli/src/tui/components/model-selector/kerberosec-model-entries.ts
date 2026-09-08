import type {
	KerberoSecRecommendedModel,
	KerberoSecRecommendedModelsData,
} from "@kerberosec/core";

export type KerberoSecModelPickerTier = "recommended" | "subscribed" | "free";

export interface KerberoSecModelPickerItem {
	kind: "model";
	model: KerberoSecRecommendedModel;
	tier: KerberoSecModelPickerTier;
}

export interface KerberoSecModelPickerBrowse {
	kind: "browse";
}

export type KerberoSecModelPickerEntry =
	| KerberoSecModelPickerItem
	| KerberoSecModelPickerBrowse;

export const KERBEROSEC_MODEL_PICKER_TIER_LABELS: Record<
	KerberoSecModelPickerTier,
	string
> = {
	recommended: "Recommended",
	subscribed: "Subscribed",
	free: "Free",
};

// Featured entries for the sectioned picker, keyed by provider: kerberosec gets
// Recommended/Free with a browse-all escape into the full catalog; kerberosec-pass
// gets Subscribed/Free (see buildKerberoSecPassModelEntries for why no browse-all).
export function buildFeaturedModelEntries(
	providerId: string,
	data: KerberoSecRecommendedModelsData,
): KerberoSecModelPickerEntry[] {
	return providerId === "kerberosec-pass"
		? buildKerberoSecPassModelEntries(data)
		: buildKerberoSecModelEntries(data);
}

function buildKerberoSecModelEntries(
	data: KerberoSecRecommendedModelsData,
): KerberoSecModelPickerEntry[] {
	const entries: KerberoSecModelPickerEntry[] = [];
	for (const m of data.recommended) {
		entries.push({ kind: "model", model: m, tier: "recommended" });
	}
	for (const m of data.free) {
		entries.push({ kind: "model", model: m, tier: "free" });
	}
	entries.push({ kind: "browse" });
	return entries;
}

// Shown under the Free section header when picking a model for ClinePass
export const KERBEROSEC_PASS_FREE_SECTION_DESCRIPTION =
	"Try with limited usage, separate from ClinePass quota.";

// KerberoSecPass shows the subscription's models plus the KerberoSec free models -- both
// providers hit the same KerberoSec API, so free models are selectable in place
// (they ride usage billing at $0 instead of the subscription quota).
// No "browse all" entry when the kerberosecPass bucket is populated: unlike kerberosec,
// the KerberoSecPass catalog contains exactly these two buckets, so the sections
// already list every selectable model. An empty kerberosecPass bucket means the
// fetch fell back to the bundled list (which has no pass models) -- without an
// escape into the full catalog a subscriber could only pick free models, so
// browse-all comes back in that degraded mode.
function buildKerberoSecPassModelEntries(
	data: KerberoSecRecommendedModelsData,
): KerberoSecModelPickerEntry[] {
	const entries: KerberoSecModelPickerEntry[] = [];
	for (const m of data.kerberosecPass) {
		entries.push({ kind: "model", model: m, tier: "subscribed" });
	}
	for (const m of data.free) {
		entries.push({ kind: "model", model: m, tier: "free" });
	}
	if (data.kerberosecPass.length === 0) {
		entries.push({ kind: "browse" });
	}
	return entries;
}

// The quota explainer only makes sense in the KerberoSecPass picker, which is the
// only picker that has a "subscribed" section
export function freeTierDescriptionFor(
	entries: KerberoSecModelPickerEntry[],
): string | undefined {
	const isKerberoSecPassPicker = entries.some(
		(entry) => entry.kind === "model" && entry.tier === "subscribed",
	);
	return isKerberoSecPassPicker
		? KERBEROSEC_PASS_FREE_SECTION_DESCRIPTION
		: undefined;
}
