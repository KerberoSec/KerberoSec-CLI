import type { ProviderSettingsManager } from "@kerberosec/core";
import { Command } from "commander";
import {
	checkOllamaInstalled,
	detectHardwareProfile,
	ensureOllamaServerRunning,
	listInstalledOllamaModels,
	pullOllamaModel,
	runOllamaSetupWorkflow,
} from "../utils/ollama-manager";

const c = {
	reset: "\x1b[0m",
	dim: "\x1b[2m",
	cyan: "\x1b[36m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
};

export function createOllamaCommand(
	providerSettingsManager: ProviderSettingsManager,
): Command {
	const cmd = new Command("ollama")
		.description(
			"Manage local Ollama provider, detect hardware, and auto-configure models",
		)
		.option(
			"-m, --model <id>",
			"Specific model to configure (e.g. qwen2.5-coder:1.5b, qwen2.5-coder:14b)",
		)
		.action(async (opts: { model?: string }) => {
			const result = await runOllamaSetupWorkflow(providerSettingsManager, {
				explicitModel: opts.model,
				onLog: (msg) => console.log(msg),
				onProgress: (status, percent) => {
					if (percent !== undefined) {
						process.stdout.write(
							`\r${c.dim}${status} (${percent}%)${c.reset}   `,
						);
					} else {
						console.log(status);
					}
				},
			});

			if (!result.success) {
				console.error(
					`\n${c.red}Ollama setup encountered an error:${c.reset} ${result.error}`,
				);
				process.exitCode = 1;
			} else {
				console.log(
					`\n${c.green}You can now run tasks with Ollama using:${c.reset} ${c.cyan}kerberosec -P ollama "your prompt"${c.reset}`,
				);
			}
		});

	cmd
		.command("status")
		.description(
			"Check Ollama installation, running server status, and detected hardware",
		)
		.action(async () => {
			console.log(`\n${c.cyan}=== Hardware & Ollama Status ===${c.reset}`);
			const hw = detectHardwareProfile();
			console.log(`Hardware Profile:`);
			if (hw.gpuFound) {
				console.log(
					`  GPU: ${c.green}${hw.gpuName}${c.reset} (${hw.vramMb ?? 0} MB VRAM)`,
				);
			} else {
				console.log(
					`  GPU: ${c.yellow}No discrete NVIDIA GPU detected (CPU mode)${c.reset}`,
				);
			}
			console.log(
				`  CPU: ${hw.cpuModel} (${hw.cpuCores} cores, ${hw.totalRamGb} GB RAM)`,
			);
			console.log(
				`  Recommended Coding Model: ${c.green}${hw.recommendedModel}${c.reset} (${hw.reason})\n`,
			);

			const install = checkOllamaInstalled();
			console.log(`Ollama Status:`);
			console.log(
				`  Installed: ${install.installed ? `${c.green}Yes${c.reset} (${install.path})` : `${c.red}No${c.reset}`}`,
			);

			const running = await ensureOllamaServerRunning();
			console.log(
				`  Server Running: ${running.running ? `${c.green}Yes (http://127.0.0.1:11434)${c.reset}` : `${c.red}No${c.reset}`}`,
			);

			if (running.running) {
				const models = await listInstalledOllamaModels();
				console.log(`  Installed Models (${models.length}):`);
				for (const m of models) {
					const isRec =
						m.name === hw.recommendedModel || m.model === hw.recommendedModel;
					console.log(
						`    - ${m.name}${isRec ? ` ${c.green}(recommended)${c.reset}` : ""}`,
					);
				}
			}
		});

	cmd
		.command("pull <model>")
		.description("Pull a model directly into Ollama")
		.action(async (model: string) => {
			await ensureOllamaServerRunning();
			console.log(`Pulling ${model}...`);
			const res = await pullOllamaModel(
				model,
				"http://127.0.0.1:11434",
				(status, percent) => {
					if (percent !== undefined) {
						process.stdout.write(`\r${status} (${percent}%)   `);
					} else {
						console.log(status);
					}
				},
			);
			if (!res.success) {
				console.error(`\n${c.red}Failed to pull model:${c.reset} ${res.error}`);
				process.exitCode = 1;
			} else {
				console.log(`\n${c.green}Successfully pulled ${model}${c.reset}`);
			}
		});

	return cmd;
}
