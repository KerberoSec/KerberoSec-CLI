import { defineConfig } from "vitest/config";

export default defineConfig({
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
		include: ["src/**/*.test.ts"],
		exclude: ["src/example.test.ts"],
		passWithNoTests: true,
	},
});
