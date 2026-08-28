import { exec, execSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import type {
	ProviderSettings,
	ProviderSettingsManager,
} from "@kerberosec/core";

export interface HardwareProfile {
	gpuFound: boolean;
	gpuName?: string;
	vramMb?: number;
	totalRamGb: number;
	cpuModel: string;
	cpuCores: number;
	recommendedModel: string;
	reason: string;
}

export interface OllamaInstallStatus {
	installed: boolean;
	path?: string;
	version?: string;
}

export interface OllamaModelInfo {
	name: string;
	model: string;
	size: number;
	parameterSize?: string;
}

/**
 * Detect system hardware (GPU, VRAM, CPU, RAM) and recommend the best Qwen Coder 2.5 model.
 */
export function detectHardwareProfile(): HardwareProfile {
	const cpus = os.cpus();
	const cpuModel = cpus[0]?.model ?? "Unknown CPU";
	const cpuCores = cpus.length;
	const totalRamGb = Math.round(os.totalmem() / (1024 * 1024 * 1024));

	let gpuFound = false;
	let gpuName: string | undefined;
	let vramMb: number | undefined;

	// Check nvidia-smi (including WSL standard path)
	const nvidiaSmiCandidates = [
		"nvidia-smi",
		"/usr/lib/wsl/lib/nvidia-smi",
		"/usr/bin/nvidia-smi",
		"/usr/local/cuda/bin/nvidia-smi",
	];

	for (const candidate of nvidiaSmiCandidates) {
		try {
			const output = execSync(
				`${candidate} --query-gpu=name,memory.total --format=csv,noheader,nounits 2>/dev/null`,
				{ encoding: "utf-8", timeout: 3000 },
			).trim();

			if (output) {
				const [name, memStr] = output.split(",").map((s) => s.trim());
				gpuFound = true;
				gpuName = name;
				vramMb = memStr ? Number.parseInt(memStr, 10) : undefined;
				break;
			}
		} catch {
			// Ignore and check next candidate
		}
	}

	// Model recommendation logic based on hardware capabilities
	let recommendedModel = "qwen2.5-coder:1.5b";
	let reason = "Default lightweight model suitable for CPU & laptop inference";

	if (gpuFound && gpuName) {
		const lowerName = gpuName.toLowerCase();
		const vram = vramMb ?? 0;

		if (lowerName.includes("3050")) {
			// RTX 3050 (laptop / desktop)
			recommendedModel = "qwen2.5-coder:14b";
			reason = `Detected ${gpuName} (${vram}MB VRAM) - Optimized for 14B coding model`;
		} else if (vram >= 12000) {
			// High VRAM (12GB+)
			recommendedModel = "qwen2.5-coder:14b";
			reason = `Detected ${gpuName} with high VRAM (${vram}MB) - Excellent for 14B coding model`;
		} else if (vram >= 5500) {
			// Mid-range VRAM (6GB - 8GB)
			recommendedModel = "qwen2.5-coder:7b";
			reason = `Detected ${gpuName} (${vram}MB VRAM) - 7B coding model provides optimal speed and quality`;
		} else {
			// Low VRAM (< 4GB, e.g. MX150, GTX 1050 2GB)
			recommendedModel = "qwen2.5-coder:1.5b";
			reason = `Detected ${gpuName} with compact VRAM (${vram}MB) - 1.5B model is fast and fits in memory`;
		}
	} else {
		// CPU-only / Laptop
		if (totalRamGb >= 16) {
			recommendedModel = "qwen2.5-coder:7b";
			reason = `Detected ${totalRamGb}GB RAM on CPU - 7B model supported; 1.5B can be used for faster responses`;
		} else {
			recommendedModel = "qwen2.5-coder:1.5b";
			reason = `Detected ${totalRamGb}GB RAM on CPU - 1.5B model recommended for smooth laptop performance`;
		}
	}

	return {
		gpuFound,
		gpuName,
		vramMb,
		totalRamGb,
		cpuModel,
		cpuCores,
		recommendedModel,
		reason,
	};
}

/**
 * Check if the Ollama binary is installed on the system.
 */
export function checkOllamaInstalled(): OllamaInstallStatus {
	try {
		const path = execSync("which ollama 2>/dev/null", {
			encoding: "utf-8",
		}).trim();
		if (path && existsSync(path)) {
			let version: string | undefined;
			try {
				version = execSync("ollama --version 2>/dev/null", {
					encoding: "utf-8",
				}).trim();
			} catch {
				// Version query failed
			}
			return { installed: true, path, version };
		}
	} catch {
		// Try standard binary paths
		const standardPaths = ["/usr/local/bin/ollama", "/usr/bin/ollama"];
		for (const p of standardPaths) {
			if (existsSync(p)) {
				return { installed: true, path: p };
			}
		}
	}

	return { installed: false };
}

/**
 * Automatically install Ollama on Linux/macOS.
 */
export async function installOllama(
	onProgress?: (message: string) => void,
): Promise<{ success: boolean; error?: string }> {
	const platform = os.platform();

	if (platform !== "linux" && platform !== "darwin") {
		return {
			success: false,
			error: `Automatic installation is only supported on Linux and macOS. For Windows, please install Ollama from https://ollama.com/download`,
		};
	}

	onProgress?.("Downloading and running official Ollama installer...");

	return new Promise((resolve) => {
		const cmd =
			platform === "linux"
				? "curl -fsSL https://ollama.com/install.sh | sh"
				: "brew install ollama || curl -fsSL https://ollama.com/install.sh | sh";

		exec(cmd, { timeout: 180000 }, (error, _stdout, stderr) => {
			if (error) {
				resolve({
					success: false,
					error: `Installation failed: ${stderr || error.message}`,
				});
			} else {
				onProgress?.("Ollama installed successfully!");
				resolve({ success: true });
			}
		});
	});
}

/**
 * Check if the Ollama server is responding at baseUrl.
 */
export async function isOllamaServerRunning(
	baseUrl = "http://127.0.0.1:11434",
): Promise<boolean> {
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 2000);
		const res = await fetch(`${baseUrl}/api/tags`, {
			signal: controller.signal,
		});
		clearTimeout(timeout);
		return res.ok;
	} catch {
		return false;
	}
}

/**
 * Ensure the Ollama server daemon is running, starting it in background if needed.
 */
export async function ensureOllamaServerRunning(
	baseUrl = "http://127.0.0.1:11434",
	onProgress?: (msg: string) => void,
): Promise<{ running: boolean; error?: string }> {
	if (await isOllamaServerRunning(baseUrl)) {
		return { running: true };
	}

	onProgress?.("Starting Ollama background server...");

	try {
		// Try systemctl first on Linux
		if (os.platform() === "linux") {
			try {
				execSync("systemctl start ollama 2>/dev/null");
			} catch {
				// systemctl not available or non-root, fall back to spawning process
			}
		}

		if (await isOllamaServerRunning(baseUrl)) {
			return { running: true };
		}

		// Spawn detached background process
		const child = spawn("ollama", ["serve"], {
			detached: true,
			stdio: "ignore",
		});
		child.unref();

		// Wait up to 10 seconds for server to start
		for (let i = 0; i < 20; i++) {
			await new Promise((r) => setTimeout(r, 500));
			if (await isOllamaServerRunning(baseUrl)) {
				onProgress?.("Ollama server is now active.");
				return { running: true };
			}
		}

		return {
			running: false,
			error:
				"Ollama server failed to start within 10 seconds. Run `ollama serve` in a terminal.",
		};
	} catch (e) {
		return {
			running: false,
			error: `Failed to launch Ollama server: ${e instanceof Error ? e.message : String(e)}`,
		};
	}
}

/**
 * List all models currently downloaded in Ollama.
 */
export async function listInstalledOllamaModels(
	baseUrl = "http://127.0.0.1:11434",
): Promise<OllamaModelInfo[]> {
	try {
		const res = await fetch(`${baseUrl}/api/tags`);
		if (!res.ok) return [];
		const data = (await res.json()) as {
			models?: Array<{
				name: string;
				model: string;
				size: number;
				details?: { parameter_size?: string };
			}>;
		};

		return (data.models ?? []).map((m) => ({
			name: m.name,
			model: m.model,
			size: m.size,
			parameterSize: m.details?.parameter_size,
		}));
	} catch {
		return [];
	}
}

/**
 * Pull a model from the Ollama library.
 */
export async function pullOllamaModel(
	modelName: string,
	baseUrl = "http://127.0.0.1:11434",
	onProgress?: (statusText: string, percentage?: number) => void,
): Promise<{ success: boolean; error?: string }> {
	onProgress?.(`Starting download of ${modelName}...`);

	try {
		const res = await fetch(`${baseUrl}/api/pull`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: modelName, stream: true }),
		});

		if (!res.ok || !res.body) {
			return {
				success: false,
				error: `Ollama pull returned status ${res.status}: ${res.statusText}`,
			};
		}

		const reader = res.body.getReader();
		const decoder = new TextDecoder();
		let buffer = "";

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split("\n");
			buffer = lines.pop() ?? "";

			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;
				try {
					const json = JSON.parse(trimmed) as {
						status?: string;
						completed?: number;
						total?: number;
						error?: string;
					};

					if (json.error) {
						return { success: false, error: json.error };
					}

					let percent: number | undefined;
					if (json.completed && json.total && json.total > 0) {
						percent = Math.round((json.completed / json.total) * 100);
					}

					onProgress?.(json.status ?? "Downloading...", percent);
				} catch {
					// Ignore line JSON parse errors
				}
			}
		}

		onProgress?.(
			`Model ${modelName} downloaded and verified successfully!`,
			100,
		);
		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: `Download error: ${err instanceof Error ? err.message : String(err)}`,
		};
	}
}

/**
 * Check if the target model or a compatible variant is installed, and pull it if missing.
 */
export async function ensureOllamaModel(
	targetModel: string,
	baseUrl = "http://127.0.0.1:11434",
	onProgress?: (status: string, percent?: number) => void,
): Promise<{ modelId: string; success: boolean; error?: string }> {
	const models = await listInstalledOllamaModels(baseUrl);
	const targetBase = targetModel.split(":")[0];

	// Check exact match or base match
	const exact = models.find(
		(m) => m.name === targetModel || m.model === targetModel,
	);
	if (exact) {
		return { modelId: exact.name, success: true };
	}

	// Check if any matching family model is installed
	const familyMatch = models.find((m) => m.name.startsWith(targetBase));
	if (familyMatch) {
		onProgress?.(`Found existing installed model: ${familyMatch.name}`);
		return { modelId: familyMatch.name, success: true };
	}

	// Pull the recommended model
	onProgress?.(`Model ${targetModel} is not installed. Pulling it now...`);
	const pullResult = await pullOllamaModel(targetModel, baseUrl, onProgress);
	if (!pullResult.success) {
		return {
			modelId: targetModel,
			success: false,
			error: pullResult.error,
		};
	}

	return { modelId: targetModel, success: true };
}

/**
 * Configure KerberoSec settings to use Ollama with the given model.
 */
export function configureOllamaProvider(
	providerSettingsManager: ProviderSettingsManager,
	modelId: string,
	baseUrl = "http://localhost:11434",
): void {
	const existing = providerSettingsManager.getProviderSettings("ollama");
	const nextSettings: ProviderSettings = {
		...(existing ?? { provider: "ollama" }),
		provider: "ollama",
		apiKey: "",
		baseUrl,
		model: modelId,
	};
	providerSettingsManager.saveProviderSettings(nextSettings);
}

/**
 * Comprehensive Ollama setup workflow:
 * 1. Detect hardware profile and choose best model
 * 2. Check & install Ollama if needed
 * 3. Ensure server is running
 * 4. Check & pull the model
 * 5. Configure provider in KerberoSec
 */
export async function runOllamaSetupWorkflow(
	providerSettingsManager: ProviderSettingsManager,
	options?: {
		explicitModel?: string;
		onLog?: (msg: string) => void;
		onProgress?: (status: string, percent?: number) => void;
	},
): Promise<{
	success: boolean;
	modelId?: string;
	hardware?: HardwareProfile;
	error?: string;
}> {
	const log = options?.onLog ?? console.log;
	const progress = options?.onProgress ?? ((msg: string) => log(msg));

	// 1. Hardware detection
	log("\x1b[36m[Ollama] Detecting system hardware...\x1b[0m");
	const hw = detectHardwareProfile();
	if (hw.gpuFound) {
		log(`  GPU: \x1b[32m${hw.gpuName}\x1b[0m (${hw.vramMb ?? 0} MB VRAM)`);
	} else {
		log(`  CPU: ${hw.cpuModel} (${hw.totalRamGb} GB RAM)`);
	}
	const targetModel = options?.explicitModel ?? hw.recommendedModel;
	log(`  Recommended Model: \x1b[33m${targetModel}\x1b[0m (${hw.reason})`);

	// 2. Check Ollama installation
	log("\x1b[36m[Ollama] Checking Ollama installation...\x1b[0m");
	const installStatus = checkOllamaInstalled();
	if (!installStatus.installed) {
		log("  Ollama is not installed. Initiating installation...");
		const installResult = await installOllama((msg) => log(`  ${msg}`));
		if (!installResult.success) {
			return { success: false, error: installResult.error, hardware: hw };
		}
	} else {
		log(`  Ollama binary found at: ${installStatus.path}`);
	}

	// 3. Ensure server is running
	log("\x1b[36m[Ollama] Checking Ollama service status...\x1b[0m");
	const serverStatus = await ensureOllamaServerRunning(
		"http://127.0.0.1:11434",
		(msg) => log(`  ${msg}`),
	);
	if (!serverStatus.running) {
		return { success: false, error: serverStatus.error, hardware: hw };
	}
	log("  Ollama service is up and running.");

	// 4. Ensure model is installed
	log(`\x1b[36m[Ollama] Checking model '${targetModel}'...\x1b[0m`);
	const modelResult = await ensureOllamaModel(
		targetModel,
		"http://127.0.0.1:11434",
		(status, percent) => {
			if (percent !== undefined) {
				progress(`  [${percent}%] ${status}`, percent);
			} else {
				progress(`  ${status}`);
			}
		},
	);

	if (!modelResult.success) {
		return { success: false, error: modelResult.error, hardware: hw };
	}
	log(`  Model ready: \x1b[32m${modelResult.modelId}\x1b[0m`);

	// 5. Configure provider
	log("\x1b[36m[Ollama] Configuring KerberoSec provider settings...\x1b[0m");
	configureOllamaProvider(providerSettingsManager, modelResult.modelId);
	log(
		`\x1b[32m✔ Ollama successfully configured as active provider with model: ${modelResult.modelId}\x1b[0m`,
	);

	return {
		success: true,
		modelId: modelResult.modelId,
		hardware: hw,
	};
}
