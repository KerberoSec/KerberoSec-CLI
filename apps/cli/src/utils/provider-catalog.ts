import {
	listLocalProviders as internalListLocalProviders,
	type ProviderSettingsManager,
} from "@kerberosec/core";

export async function listLocalProviders(
	manager: ProviderSettingsManager,
): ReturnType<typeof internalListLocalProviders> {
	return await internalListLocalProviders(manager, {
		isKerberoSecPassEnabled: true,
	});
}
