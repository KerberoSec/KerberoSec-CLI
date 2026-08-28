// @jsxImportSource @opentui/react
import type { ChoiceContext } from "@opentui-ui/dialog";
import { useDialogKeyboard } from "@opentui-ui/dialog/react";
import { useCallback, useState } from "react";
import { useDialogPalette } from "../tui/hooks/use-theme";
import {
	type DialogDismissKey,
	isAnyKeyDismiss,
} from "../tui/utils/dialog-keys";
import open from "../utils/open";
import type { CliMigrationNotice } from "./notice";

export const SOCIAL_PROFILES = [
	{
		label: "LinkedIn",
		url: "https://www.linkedin.com/in/arunkumar31072006/",
	},
	{
		label: "GitHub",
		url: "https://github.com/KerberoSec",
	},
	{
		label: "Instagram",
		url: "https://www.instagram.com/so_far_from_your_heart/",
	},
	{
		label: "X",
		url: "https://x.com/ArunKumar310706",
	},
];

/**
 * Enter opens the primary profile; any other (unmodified) key dismisses the
 * dialog; modifier-held keys are ignored.
 */
export function resolveMigrationNoticeKeyAction(
	key: DialogDismissKey,
): "open" | "dismiss" | "ignore" {
	if (!isAnyKeyDismiss(key)) return "ignore";
	return key.name === "return" || key.name === "enter" ? "open" : "dismiss";
}

export function MigrationNoticeContent(
	props: ChoiceContext<boolean> & {
		notice: CliMigrationNotice;
	},
) {
	const { dialogId, notice, resolve } = props;
	const palette = useDialogPalette();
	const [status, setStatus] = useState<string | undefined>();

	const openPrimaryProfile = useCallback(() => {
		setStatus("Opening LinkedIn profile in your browser...");
		void open(SOCIAL_PROFILES[0].url, { wait: false })
			.then(() => {
				setStatus("Opened LinkedIn profile in your browser.");
			})
			.catch(() => {
				setStatus(
					"Could not open the browser automatically. Use the links below.",
				);
			});
	}, []);

	useDialogKeyboard((key) => {
		const action = resolveMigrationNoticeKeyAction(key);
		if (action === "ignore") return;
		if (action === "open") {
			openPrimaryProfile();
			return;
		}
		resolve(true);
	}, dialogId);

	return (
		<box flexDirection="column" paddingX={1} gap={1}>
			<text fg={palette.act}>{notice.title}</text>
			<box flexDirection="column">
				<text selectable>
					Feel free to connect, collaborate, or follow my social profiles:
				</text>
			</box>
			<box flexDirection="column" gap={0}>
				{SOCIAL_PROFILES.map((profile) => (
					<box key={profile.url} flexDirection="row" gap={1}>
						<text fg={palette.act}>
							<strong>{profile.label}:</strong>
						</text>
						<text fg={palette.act} selectable>
							<a href={profile.url}>{profile.url}</a>
						</text>
					</box>
				))}
			</box>
			<box flexDirection="row">
				<box paddingX={1} backgroundColor={palette.act}>
					<text fg={palette.textOnSelection}>Open LinkedIn Profile</text>
				</box>
			</box>
			{status && <text fg={palette.muted}>{status}</text>}
			<text fg={palette.muted}>
				Press Enter to open, any other key to close
			</text>
		</box>
	);
}
