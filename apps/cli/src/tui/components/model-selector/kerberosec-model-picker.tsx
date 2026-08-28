// @jsxImportSource @opentui/react

import {
	fetchKerberoSecRecommendedModels,
	type KerberoSecRecommendedModelsData,
} from "@kerberosec/core";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import "opentui-spinner/react";
import { useDialogPalette } from "../../hooks/use-theme";
import type { DialogPalette } from "../../themes";
import {
	freeTierDescriptionFor,
	KERBEROSEC_MODEL_PICKER_TIER_LABELS,
	type KerberoSecModelPickerEntry,
} from "./kerberosec-model-entries";

export {
	buildFeaturedModelEntries,
	freeTierDescriptionFor,
	KERBEROSEC_MODEL_PICKER_TIER_LABELS,
	type KerberoSecModelPickerBrowse,
	type KerberoSecModelPickerEntry,
	type KerberoSecModelPickerItem,
	type KerberoSecModelPickerTier,
} from "./kerberosec-model-entries";

function tagColor(tag: string, palette: DialogPalette): string {
	if (tag === "FREE") return palette.success;
	if (tag === "BEST") return "magenta";
	return palette.act;
}

export function useKerberoSecRecommendedModels() {
	const [data, setData] = useState<KerberoSecRecommendedModelsData | null>(
		null,
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		fetchKerberoSecRecommendedModels()
			.then((result) => {
				if (!cancelled) setData(result);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	return { data, loading };
}

export function KerberoSecModelPicker(props: {
	entries: KerberoSecModelPickerEntry[];
	selected: number;
	loading?: boolean;
	currentModelId?: string;
}) {
	const { entries, selected, loading, currentModelId } = props;
	const palette = useDialogPalette();

	if (loading) {
		return (
			<box flexDirection="row" gap={1} paddingX={1}>
				<spinner name="dots" color="gray" />
				<text fg="gray">Loading models...</text>
			</box>
		);
	}

	let lastTier: string | null = null;
	let isFirstHeader = true;
	const rows: ReactNode[] = [];
	const freeTierDescription = freeTierDescriptionFor(entries);

	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		if (!entry) continue;
		const isSel = i === selected;

		if (entry.kind === "model") {
			if (entry.tier !== lastTier) {
				lastTier = entry.tier;
				const label = KERBEROSEC_MODEL_PICKER_TIER_LABELS[entry.tier];
				rows.push(
					<box
						key={`tier-${entry.tier}`}
						paddingX={1}
						marginTop={isFirstHeader ? 0 : 1}
						flexDirection="column"
					>
						<text fg="gray">{label}</text>
						{entry.tier === "free" && freeTierDescription && (
							<text fg="gray">
								<em>{freeTierDescription}</em>
							</text>
						)}
					</box>,
				);
				isFirstHeader = false;
			}

			const tags = entry.model.tags;
			// Names arrive display-ready from fetchKerberoSecRecommendedModels
			const name = entry.model.name || entry.model.id;
			const isCurrent = currentModelId === entry.model.id;
			rows.push(
				<box
					key={entry.model.id}
					paddingX={1}
					flexDirection="row"
					gap={1}
					backgroundColor={isSel ? palette.selection : undefined}
				>
					<text fg={isSel ? palette.textOnSelection : "gray"} flexShrink={0}>
						{isSel ? "\u276f" : " "}
					</text>
					<text fg={isSel ? palette.textOnSelection : undefined}>{name}</text>
					{tags.map((t) => (
						<text
							key={t}
							fg={isSel ? palette.textOnSelection : tagColor(t, palette)}
							flexShrink={0}
						>
							{t}
						</text>
					))}
					{isCurrent && (
						<text fg={isSel ? palette.textOnSelection : "gray"} flexShrink={0}>
							(current)
						</text>
					)}
				</box>,
			);
		} else {
			rows.push(
				<box
					key="browse-all"
					paddingX={1}
					flexDirection="row"
					gap={1}
					backgroundColor={isSel ? palette.selection : undefined}
					marginTop={1}
				>
					<text fg={isSel ? palette.textOnSelection : "gray"} flexShrink={0}>
						{isSel ? "\u276f" : " "}
					</text>
					<text fg={isSel ? palette.textOnSelection : "gray"}>
						Browse all models...
					</text>
				</box>,
			);
		}
	}

	return <box flexDirection="column">{rows}</box>;
}
