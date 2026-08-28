import { getWorkspaceBasename } from "@core/workspace"
import type { ToggleKerberoSecRuleRequest } from "@shared/proto/kerberosec/file"
import { RuleScope, ToggleKerberoSecRules } from "@shared/proto/kerberosec/file"
import { telemetryService } from "@/services/telemetry"
import { Logger } from "@/shared/services/Logger"
import type { Controller } from "../index"

/**
 * Toggles a KerberoSec rule (enable or disable)
 * @param controller The controller instance
 * @param request The toggle request
 * @returns The updated KerberoSec rule toggles
 */
export async function toggleKerberoSecRule(
	controller: Controller,
	request: ToggleKerberoSecRuleRequest,
): Promise<ToggleKerberoSecRules> {
	const { scope, rulePath, enabled } = request

	if (!rulePath || typeof enabled !== "boolean" || scope === undefined) {
		Logger.error("toggleKerberoSecRule: Missing or invalid parameters", {
			rulePath,
			scope,
			enabled: typeof enabled === "boolean" ? enabled : `Invalid: ${typeof enabled}`,
		})
		throw new Error("Missing or invalid parameters for toggleKerberoSecRule")
	}

	// Handle the three different scopes
	switch (scope) {
		case RuleScope.GLOBAL: {
			const toggles = controller.stateManager.getGlobalSettingsKey("globalKerberoSecRulesToggles")
			toggles[rulePath] = enabled
			controller.stateManager.setGlobalState("globalKerberoSecRulesToggles", toggles)
			break
		}
		case RuleScope.LOCAL: {
			const toggles = controller.stateManager.getWorkspaceStateKey("localKerberoSecRulesToggles")
			toggles[rulePath] = enabled
			controller.stateManager.setWorkspaceState("localKerberoSecRulesToggles", toggles)
			break
		}
		case RuleScope.REMOTE: {
			const toggles = controller.stateManager.getGlobalStateKey("remoteRulesToggles")
			toggles[rulePath] = enabled
			controller.stateManager.setGlobalState("remoteRulesToggles", toggles)
			break
		}
		default:
			throw new Error(`Invalid scope: ${scope}`)
	}

	// Track rule toggle telemetry with current task context
	if (controller.task?.ulid) {
		// Extract just the filename for privacy (no full paths)
		const ruleFileName = getWorkspaceBasename(rulePath, "Controller.toggleKerberoSecRule")
		const isGlobal = scope === RuleScope.GLOBAL
		telemetryService.captureKerberoSecRuleToggled(controller.task.ulid, ruleFileName, enabled, isGlobal)
	}

	// Get the current state to return in the response
	const globalToggles = controller.stateManager.getGlobalSettingsKey("globalKerberoSecRulesToggles")
	const localToggles = controller.stateManager.getWorkspaceStateKey("localKerberoSecRulesToggles")
	const remoteToggles = controller.stateManager.getGlobalStateKey("remoteRulesToggles")

	return ToggleKerberoSecRules.create({
		globalKerberoSecRulesToggles: { toggles: globalToggles },
		localKerberoSecRulesToggles: { toggles: localToggles },
		remoteRulesToggles: { toggles: remoteToggles },
	})
}
