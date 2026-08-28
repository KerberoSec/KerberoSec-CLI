import * as os from "node:os";
import {
	captureExtensionActivated,
	createConfiguredTelemetryHandle,
	createKerberoSecTelemetryServiceConfig,
	type ITelemetryService,
	identifyAccount,
	ProviderSettingsManager,
	setSdkLogger,
} from "@kerberosec/core";
import { version } from "../package.json";
import { setDesktopFeatureFlagsAccountContext } from "./feature-flags";
import {
	createDesktopLoggerAdapter,
	type DesktopLoggerAdapter,
} from "./logging";

export interface DesktopObservability {
	readonly logger: DesktopLoggerAdapter["core"];
	readonly telemetry: ITelemetryService;
	dispose(): Promise<void>;
}

export function createDesktopObservability(): DesktopObservability {
	const loggerAdapter = createDesktopLoggerAdapter();
	const logger = loggerAdapter.core;
	setSdkLogger(logger);

	const telemetryHandle = createConfiguredTelemetryHandle({
		...createKerberoSecTelemetryServiceConfig({
			metadata: {
				extension_version: version,
				kerberosec_type: "desktop",
				platform: "KerberoSec",
				platform_version: process.version,
				os_type: os.platform(),
				os_version: os.version(),
			},
		}),
		logger,
	});
	const telemetry = telemetryHandle.telemetry;
	const auth = new ProviderSettingsManager().getProviderSettings(
		"kerberosec",
	)?.auth;
	if (auth?.accountId) {
		identifyAccount(telemetry, {
			id: auth.accountId,
			provider: "kerberosec",
		});
		setDesktopFeatureFlagsAccountContext({ id: auth.accountId });
	}
	captureExtensionActivated(telemetry);

	let disposed = false;
	return {
		logger,
		telemetry,
		async dispose() {
			if (disposed) return;
			disposed = true;
			await telemetryHandle.dispose();
			setSdkLogger(undefined);
			loggerAdapter.dispose();
		},
	};
}
