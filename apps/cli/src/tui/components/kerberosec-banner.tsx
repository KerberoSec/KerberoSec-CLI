import { homedir } from "node:os";
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

export function KerberoSecBanner(props?: { color?: string }) {
	const defaultFg = useTheme().defaultForeground;
	const fg = props?.color ?? defaultFg;
	const displayCwd = formatTildePath(process.cwd());

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
			<box marginTop={1} flexDirection="row" alignItems="center">
				<text fg="cyan">
					<strong>KerberoSec CLI</strong>
				</text>
				<text fg="gray"> | </text>
				<text fg="gray">{displayCwd}</text>
			</box>
		</box>
	);
}
