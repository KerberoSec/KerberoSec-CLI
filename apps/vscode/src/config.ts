import * as fs from "fs/promises"
import * as os from "os"
import * as path from "path"
import { Environment, type EnvironmentConfig } from "./shared/config-types"
import { Logger } from "./shared/services/Logger"

export { Environment } /**
 * Schema for the endpoints.json configuration file used in on-premise deployments.
 * All fields are required and must be valid URLs.
 */

interface EndpointsFileSchema {
	appBaseUrl: string
	apiBaseUrl: string
	mcpBaseUrl: string
}

/**
 * Error thrown when the KerberoSec configuration file exists but is invalid.
 * This error prevents KerberoSec from starting to avoid misconfiguration in enterprise environments.
 */
export class KerberoSecConfigurationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "KerberoSecConfigurationError"
	}
}

class KerberoSecEndpoint {
	private static _instance: KerberoSecEndpoint | null = null
	private static _initialized = false
	private static _extensionFsPath: string

	// On-premise config loaded from file (null if not on-premise)
	private onPremiseConfig: EndpointsFileSchema | null = null
	private environment: Environment = Environment.production
	// Track if config came from bundled file (enterprise distribution)
	private isBundled = false

	private constructor() {
		// Set environment at module load. Use override if provided.
		const _env = process?.env?.KERBEROSEC_ENVIRONMENT_OVERRIDE || process?.env?.KERBEROSEC_ENVIRONMENT
		if (_env && Object.values(Environment).includes(_env as Environment)) {
			this.environment = _env as Environment
		}
	}

	/**
	 * Initializes the KerberoSecEndpoint singleton.
	 * Must be called before any other methods.
	 * Reads the endpoints.json file if it exists and validates its schema.
	 *
	 * @param extensionFsPath Path to the extension installation directory (for checking bundled endpoints.json)
	 * @throws KerberoSecConfigurationError if the endpoints.json file exists but is invalid
	 */
	public static async initialize(extensionFsPath: string): Promise<void> {
		if (KerberoSecEndpoint._initialized) {
			return
		}

		KerberoSecEndpoint._extensionFsPath = extensionFsPath
		KerberoSecEndpoint._instance = new KerberoSecEndpoint()

		// Try to load on-premise config from file
		const endpointsConfig = await KerberoSecEndpoint.loadEndpointsFile()
		if (endpointsConfig) {
			KerberoSecEndpoint._instance.onPremiseConfig = endpointsConfig
			Logger.log("KerberoSec running in self-hosted mode with custom endpoints")
		}

		KerberoSecEndpoint._initialized = true
	}

	/**
	 * Returns true if the KerberoSecEndpoint has been initialized.
	 */
	public static isInitialized(): boolean {
		return KerberoSecEndpoint._initialized
	}

	/**
	 * Checks if KerberoSec is running in self-hosted/on-premise mode.
	 * @returns true if in selfHosted mode, or true if not initialized (safety fallback to prevent accidental external calls)
	 */
	public static isSelfHosted(): boolean {
		// Safety fallback: if not initialized, treat as selfHosted
		// to prevent accidental external service calls before configuration is loaded
		if (!KerberoSecEndpoint._initialized) {
			return true
		}
		return KerberoSecEndpoint.config.environment === Environment.selfHosted
	}

	/**
	 * Returns true if the current configuration was loaded from a bundled endpoints.json file.
	 * This indicates an enterprise distribution that should not auto-update.
	 * @throws Error if not initialized
	 */
	public static isBundledConfig(): boolean {
		if (!KerberoSecEndpoint._initialized || !KerberoSecEndpoint._instance) {
			throw new Error("KerberoSecEndpoint not initialized. Call KerberoSecEndpoint.initialize() first.")
		}
		return KerberoSecEndpoint._instance.isBundled
	}

	/**
	 * Returns the singleton instance.
	 * @throws Error if not initialized
	 */
	public static get instance(): KerberoSecEndpoint {
		if (!KerberoSecEndpoint._initialized || !KerberoSecEndpoint._instance) {
			throw new Error("KerberoSecEndpoint not initialized. Call KerberoSecEndpoint.initialize() first.")
		}
		return KerberoSecEndpoint._instance
	}

	/**
	 * Static getter for convenient access to the current configuration.
	 * @throws Error if not initialized
	 */
	public static get config(): EnvironmentConfig {
		return KerberoSecEndpoint.instance.config()
	}

	/**
	 * Returns the path to the endpoints.json configuration file.
	 * Located at ~/.kerberosec/endpoints.json
	 */
	private static getEndpointsFilePath(): string {
		return path.join(os.homedir(), ".kerberosec", "endpoints.json")
	}

	/**
	 * Returns the path to the bundled endpoints.json configuration file.
	 * Located in the extension installation directory.
	 */
	private static getBundledEndpointsFilePath(): string {
		return path.join(KerberoSecEndpoint._extensionFsPath, "endpoints.json")
	}

	/**
	 * Loads and validates the endpoints.json file.
	 * Checks bundled location first, then falls back to user directory.
	 * Priority: bundled endpoints.json → ~/.kerberosec/endpoints.json → null (standard mode)
	 * @returns The validated endpoints config, or null if no file exists
	 * @throws KerberoSecConfigurationError if a file exists but is invalid
	 */
	private static async loadEndpointsFile(): Promise<EndpointsFileSchema | null> {
		// 1. Try bundled file
		const bundledPath = KerberoSecEndpoint.getBundledEndpointsFilePath()
		try {
			await fs.access(bundledPath)
			// File exists, load and validate it
			const fileContent = await fs.readFile(bundledPath, "utf8")
			let data: unknown

			try {
				data = JSON.parse(fileContent)
			} catch (parseError) {
				throw new KerberoSecConfigurationError(
					`Invalid JSON in bundled endpoints configuration file (${bundledPath}): ${parseError instanceof Error ? parseError.message : String(parseError)}`,
				)
			}

			const config = KerberoSecEndpoint.validateEndpointsSchema(data, bundledPath)
			// Mark as bundled enterprise distribution
			KerberoSecEndpoint._instance!.isBundled = true
			return config
		} catch (error) {
			if (error instanceof KerberoSecConfigurationError) {
				throw error
			}
			// Bundled file doesn't exist or is not accessible, try user file
		}

		// 2. Try ~/.kerberosec/endpoints.json
		const userPath = KerberoSecEndpoint.getEndpointsFilePath()
		try {
			await fs.access(userPath)
		} catch {
			// File doesn't exist - not on-premise mode
			return null
		}

		// File exists, must be valid or we fail
		try {
			const fileContent = await fs.readFile(userPath, "utf8")
			let data: unknown

			try {
				data = JSON.parse(fileContent)
			} catch (parseError) {
				throw new KerberoSecConfigurationError(
					`Invalid JSON in user endpoints configuration file (${userPath}): ${parseError instanceof Error ? parseError.message : String(parseError)}`,
				)
			}

			return KerberoSecEndpoint.validateEndpointsSchema(data, userPath)
		} catch (error) {
			if (error instanceof KerberoSecConfigurationError) {
				throw error
			}
			throw new KerberoSecConfigurationError(
				`Failed to read user endpoints configuration file (${userPath}): ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Validates that the provided data matches the EndpointsFileSchema.
	 * All fields must be present and be valid URLs.
	 *
	 * @param data The parsed JSON data to validate
	 * @param filePath The path to the file (for error messages)
	 * @returns The validated EndpointsFileSchema
	 * @throws KerberoSecConfigurationError if validation fails
	 */
	private static validateEndpointsSchema(data: unknown, filePath: string): EndpointsFileSchema {
		if (typeof data !== "object" || data === null) {
			throw new KerberoSecConfigurationError(`Endpoints configuration file (${filePath}) must contain a JSON object`)
		}

		const obj = data as Record<string, unknown>
		const requiredFields = ["appBaseUrl", "apiBaseUrl", "mcpBaseUrl"] as const
		const result: Partial<EndpointsFileSchema> = {}

		for (const field of requiredFields) {
			const value = obj[field]

			if (value === undefined || value === null) {
				throw new KerberoSecConfigurationError(
					`Missing required field "${field}" in endpoints configuration file (${filePath})`,
				)
			}

			if (typeof value !== "string") {
				throw new KerberoSecConfigurationError(
					`Field "${field}" in endpoints configuration file (${filePath}) must be a string`,
				)
			}

			if (!value.trim()) {
				throw new KerberoSecConfigurationError(
					`Field "${field}" in endpoints configuration file (${filePath}) cannot be empty`,
				)
			}

			// Validate URL format
			try {
				new URL(value)
			} catch {
				throw new KerberoSecConfigurationError(
					`Field "${field}" in endpoints configuration file (${filePath}) must be a valid URL. Got: "${value}"`,
				)
			}

			result[field] = value
		}

		return result as EndpointsFileSchema
	}

	/**
	 * Returns the current environment configuration.
	 */
	public config(): EnvironmentConfig {
		return this.getEnvironment()
	}

	/**
	 * Sets the current environment.
	 * @throws Error if in on-premise mode (environment switching is disabled)
	 */
	public setEnvironment(env: string) {
		if (this.onPremiseConfig) {
			throw new Error("Cannot change environment in on-premise mode. Endpoints are configured via ~/.kerberosec/endpoints.json")
		}

		switch (env.toLowerCase()) {
			case "staging":
				this.environment = Environment.staging
				break
			case "local":
				this.environment = Environment.local
				break
			default:
				this.environment = Environment.production
				break
		}
	}

	/**
	 * Returns the current environment configuration.
	 * If running in on-premise mode, returns the custom endpoints.
	 */
	public getEnvironment(): EnvironmentConfig {
		// On-premise mode: use custom endpoints from file
		if (this.onPremiseConfig) {
			return {
				environment: Environment.selfHosted,
				appBaseUrl: this.onPremiseConfig.appBaseUrl,
				apiBaseUrl: this.onPremiseConfig.apiBaseUrl,
				mcpBaseUrl: this.onPremiseConfig.mcpBaseUrl,
			}
		}

		// Standard mode: use built-in environment URLs
		switch (this.environment) {
			case Environment.staging:
				return {
					environment: Environment.staging,
					appBaseUrl: "https://staging-app.kerberosec.bot",
					apiBaseUrl: "https://core-api.staging.int.kerberosec.bot",
					mcpBaseUrl: "https://core-api.staging.int.kerberosec.bot/v1/mcp",
				}
			case Environment.local:
				return {
					environment: Environment.local,
					appBaseUrl: "http://localhost:3000",
					apiBaseUrl: "http://localhost:7777",
					mcpBaseUrl: "https://api.kerberosec.bot/v1/mcp",
				}
			default:
				return {
					environment: Environment.production,
					appBaseUrl: "https://app.kerberosec.bot",
					apiBaseUrl: "https://api.kerberosec.bot",
					mcpBaseUrl: "https://api.kerberosec.bot/v1/mcp",
				}
		}
	}
}

/**
 * Singleton instance to access the current environment configuration.
 * Usage:
 * - KerberoSecEnv.config() to get the current config.
 * - KerberoSecEnv.setEnvironment(Environment.local) to change the environment.
 *
 * IMPORTANT: KerberoSecEndpoint.initialize() must be called before using KerberoSecEnv.
 */
export const KerberoSecEnv = {
	config: () => KerberoSecEndpoint.config,
	setEnvironment: (env: string) => KerberoSecEndpoint.instance.setEnvironment(env),
	getEnvironment: () => KerberoSecEndpoint.instance.getEnvironment(),
}

// Export the class for initialization
export { KerberoSecEndpoint }
