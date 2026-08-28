import { synchronizeRuleToggles } from "@core/context/instructions/user-instructions/rule-helpers"
import { ensureRulesDirectoryExists, GlobalFileNames } from "@core/storage/disk"
import { KerberoSecRulesToggles } from "@shared/kerberosec-rules"
import path from "path"
import { Controller } from "@/core/controller"

export async function refreshKerberoSecRulesToggles(
	controller: Controller,
	workingDirectory: string,
): Promise<{
	globalToggles: KerberoSecRulesToggles
	localToggles: KerberoSecRulesToggles
}> {
	// Global toggles
	const globalKerberoSecRulesToggles = controller.stateManager.getGlobalSettingsKey("globalKerberoSecRulesToggles")
	const globalKerberoSecRulesFilePath = await ensureRulesDirectoryExists()
	const updatedGlobalToggles = await synchronizeRuleToggles(globalKerberoSecRulesFilePath, globalKerberoSecRulesToggles)
	controller.stateManager.setGlobalState("globalKerberoSecRulesToggles", updatedGlobalToggles)

	// Local toggles
	const localKerberoSecRulesToggles = controller.stateManager.getWorkspaceStateKey("localKerberoSecRulesToggles")
	const localKerberoSecRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.kerberosecRules)
	const updatedLocalToggles = await synchronizeRuleToggles(localKerberoSecRulesFilePath, localKerberoSecRulesToggles, "", [
		[".kerberosecrules", "workflows"],
		[".kerberosecrules", "hooks"],
		[".kerberosecrules", "skills"],
	])
	controller.stateManager.setWorkspaceState("localKerberoSecRulesToggles", updatedLocalToggles)

	return {
		globalToggles: updatedGlobalToggles,
		localToggles: updatedLocalToggles,
	}
}
