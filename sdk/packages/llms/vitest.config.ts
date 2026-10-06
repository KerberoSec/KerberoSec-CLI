import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	resolve: {
		alias: [
			{
				find: /^@kerberosec\/shared\/(.+)$/,
				replacement: resolve(rootDir, "../shared/src/$1"),
			},
			{
				find: /^@kerberosec\/shared$/,
				replacement: resolve(rootDir, "../shared/src/index.ts"),
			},
		],
	},
	ssr: {
		noExternal: [
			"zod",
			"ai",
			"ai-sdk-provider-claude-code",
			"ai-sdk-provider-codex-cli",
		],
	},
	server: {
		deps: {
			inline: [
				"zod",
				"ai",
				"ai-sdk-provider-claude-code",
				"ai-sdk-provider-codex-cli",
			],
		},
	},
	test: {
		server: {
			deps: {
				inline: [
					"zod",
					"ai",
					"ai-sdk-provider-claude-code",
					"ai-sdk-provider-codex-cli",
				],
			},
		},
		environment: "node",
		include: ["src/**/*.test.ts"],
		testTimeout: 20_000,
		hookTimeout: 25_000,
	},
});
