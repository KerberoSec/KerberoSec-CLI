import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./webview", import.meta.url)),
		},
	},
	server: {
		deps: {
			inline: ["zod"],
		},
	},
	test: {
		server: {
			deps: {
				inline: ["zod"],
			},
		},
		environment: "node",
	},
});
