import type { Decorator, Preview } from "@storybook/react-vite";
import "./preview.css";

const withKerberoSecTheme: Decorator = (Story, context) => {
	const isDark = context.globals.theme === "dark";
	document.documentElement.classList.toggle("dark", isDark);
	return (
		<div className="kerberosec-storybook-surface">
			<Story />
		</div>
	);
};

const preview: Preview = {
	decorators: [withKerberoSecTheme],
	parameters: {
		backgrounds: { disable: true },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		layout: "fullscreen",
		viewport: {
			viewports: {
				chatPanel: {
					name: "Chat panel",
					styles: { height: "800px", width: "700px" },
					type: "desktop",
				},
				mobile: {
					name: "Mobile",
					styles: { height: "844px", width: "390px" },
					type: "mobile",
				},
			},
		},
	},
	globalTypes: {
		theme: {
			description: "KerberoSec color theme",
			defaultValue: "dark",
			toolbar: {
				dynamicTitle: true,
				icon: "circlehollow",
				items: [
					{ title: "Light", value: "light" },
					{ title: "Dark", value: "dark" },
				],
			},
		},
	},
};

export default preview;
