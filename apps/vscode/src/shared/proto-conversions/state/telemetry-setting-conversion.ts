import { TelemetrySettingEnum } from "@shared/proto/kerberosec/state"
import { TelemetrySetting } from "../../TelemetrySetting"

/**
 * Converts a proto TelemetrySettingEnum to a domain TelemetrySetting string
 */
export function convertProtoTelemetrySettingToDomain(setting: TelemetrySettingEnum): TelemetrySetting {
	switch (setting) {
		case TelemetrySettingEnum.UNSET:
			return "unset"
		case TelemetrySettingEnum.ENABLED:
			return "enabled"
		case TelemetrySettingEnum.DISABLED:
			return "disabled"
		default:
			return "unset"
	}
}
