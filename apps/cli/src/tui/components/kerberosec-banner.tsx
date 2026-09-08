import { homedir } from "node:os";
import { useTerminalDimensions } from "@opentui/react";
import { useTheme } from "../hooks/use-theme";

export const KERBEROSEC_BANNER_LINES = [
	"██╗  ██╗███████╗██████╗ ██████╗ ███████╗██████╗  ██████╗ ███████╗███████╗ ██████╗",
	"██║ ██╔╝██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔═══██╗██╔════╝██╔════╝██╔════╝",
	"█████╔╝ █████╗  ██████╔╝██████╔╝█████╗  ██████╔╝██║   ██║███████╗█████╗  ██║     ",
	"██╔═██╗ ██╔══╝  ██╔══██╗██╔══██╗██╔══╝  ██╔══██╗██║   ██║╚════██║██╔══╝  ██║     ",
	"██║  ██╗███████╗██║  ██║██████╔╝███████╗██║  ██║╚██████╔╝███████║███████╗╚██████╗",
	"╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝ ╚═════╝",
];

export const KERBEROSEC_SUBTITLE =
	"Next-Gen Autonomous Agentic Terminal Assistant";

function formatTildePath(dir: string): string {
	const home = homedir();
	if (dir === home) {
		return "~";
	}
	if (dir.startsWith(`${home}/`) || dir.startsWith(`${home}\\`)) {
		return `~${dir.slice(home.length)}`;
	}
	return dir;
}

export function KerberoSecBanner(props?: {
	color?: string;
	compact?: boolean;
	hideDetails?: boolean;
}) {
	const { width, height } = useTerminalDimensions();
	const defaultFg = useTheme().defaultForeground;
	const fg = props?.color ?? defaultFg;
	const displayCwd = formatTildePath(process.cwd());

	if (height < 12) {
		return null;
	}

	const showAsciiBanner = !props?.compact && width >= 81 && height >= 14;

	if (!showAsciiBanner) {
		const showSubtitle = height >= 16 && width >= 48 && !props?.hideDetails;
		const showPath = height >= 14 && !props?.hideDetails;
		return (
			<box flexDirection="column" alignItems="center" flexShrink={0}>
				<text fg={fg}>
					<strong>=== KerberoSec CLI ===</strong>
				</text>
				{showSubtitle && <text fg="gray">{KERBEROSEC_SUBTITLE}</text>}
				{showPath && (
					<box flexDirection="row" alignItems="center">
						<text fg="cyan">
							<strong>KerberoSec CLI</strong>
						</text>
						<text fg="gray"> | </text>
						<text fg="gray">{displayCwd}</text>
					</box>
				)}
			</box>
		);
	}

	return (
		<box flexDirection="column" alignItems="center" flexShrink={0}>
			<box flexDirection="column">
				{KERBEROSEC_BANNER_LINES.map((line, idx) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static banner lines
					<text key={`banner-${idx}`} fg={fg}>
						<strong>{line}</strong>
					</text>
				))}
			</box>
			<text fg={fg} marginTop={1}>
				{KERBEROSEC_SUBTITLE}
			</text>
			{!props?.hideDetails && (
				<box marginTop={1} flexDirection="row" alignItems="center">
					<text fg="cyan">
						<strong>KerberoSec CLI</strong>
					</text>
					<text fg="gray"> | </text>
					<text fg="gray">{displayCwd}</text>
				</box>
			)}
		</box>
	);
}
