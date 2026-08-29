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

export function KerberoSecBanner(props?: { color?: string }) {
	const defaultFg = useTheme().defaultForeground;
	const fg = props?.color ?? defaultFg;

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
		</box>
	);
}
