import { describe, expect, it } from "vitest";
import {
	buildKerberoSecSystemPrompt,
	MODE_TAG_INSTRUCTIONS,
	PLAN_MODE_INSTRUCTIONS,
	PLAN_MODE_INSTRUCTIONS_MANUAL_SWITCH,
	processWorkspaceInfo,
} from "./kerberosec";

const BASE_OPTIONS = {
	ide: "VS Code",
	workspaceRoot: "/workspace/project",
	workspaceName: "project",
	platform: "linux",
};

describe("processWorkspaceInfo", () => {
	it("redacts URL credentials while preserving SCP-style SSH remotes", () => {
		const metadata = JSON.parse(
			processWorkspaceInfo({
				rootPath: "/workspace/project",
				associatedRemoteUrls: [
					"origin: https://user:token@github.com/kerberosec/kerberosec.git",
					"backup: ssh://git:secret@example.com/kerberosec/kerberosec.git",
					"mirror: git@github.com:kerberosec/kerberosec.git",
				],
			}),
		);

		expect(
			metadata.workspaces["/workspace/project"].associatedRemoteUrls,
		).toEqual([
			"origin: https://github.com/kerberosec/kerberosec.git",
			"backup: ssh://example.com/kerberosec/kerberosec.git",
			"mirror: git@github.com:kerberosec/kerberosec.git",
		]);
	});
});

describe("buildKerberoSecSystemPrompt mode instructions", () => {
	it("explains the user_input mode attribute in act mode", () => {
		const prompt = buildKerberoSecSystemPrompt({
			...BASE_OPTIONS,
			mode: "act",
		});
		expect(prompt).toContain(MODE_TAG_INSTRUCTIONS);
		expect(prompt).toContain('<user_input mode="...">');
		expect(prompt).toContain("<mode_notice>");
		expect(prompt).not.toContain(PLAN_MODE_INSTRUCTIONS);
	});

	it("appends the plan-mode contract only in plan mode", () => {
		const prompt = buildKerberoSecSystemPrompt({
			...BASE_OPTIONS,
			mode: "plan",
		});
		expect(prompt).toContain(MODE_TAG_INSTRUCTIONS);
		expect(prompt).toContain(PLAN_MODE_INSTRUCTIONS);
		// The mode-tag explanation precedes the plan contract, matching the
		// order the CLI historically composed by hand.
		expect(prompt.indexOf(MODE_TAG_INSTRUCTIONS)).toBeLessThan(
			prompt.indexOf(PLAN_MODE_INSTRUCTIONS),
		);
	});

	it("keeps run_commands available-but-read-only in the plan contract", () => {
		// Explicit product decision: run_commands is NOT removed in plan mode
		// (it is essential for read-only investigation); the mitigation for
		// plan-mode mutations is prompting, so the contract must spell out the
		// inspection-only usage.
		expect(PLAN_MODE_INSTRUCTIONS).toContain("run_commands");
		expect(PLAN_MODE_INSTRUCTIONS).toContain("read-only");
		expect(PLAN_MODE_INSTRUCTIONS).toContain("switch_to_act_mode");
	});

	it("swaps in the manual-switch plan contract when the host has no switch tool", () => {
		const prompt = buildKerberoSecSystemPrompt({
			...BASE_OPTIONS,
			mode: "plan",
			planModeSwitchTool: false,
		});
		expect(prompt).toContain(PLAN_MODE_INSTRUCTIONS_MANUAL_SWITCH);
		expect(prompt).not.toContain("switch_to_act_mode");
		// The read-only run_commands contract is shared by both variants.
		expect(PLAN_MODE_INSTRUCTIONS_MANUAL_SWITCH).toContain("run_commands");
		expect(PLAN_MODE_INSTRUCTIONS_MANUAL_SWITCH).toContain("Plan/Act toggle");
	});

	it("emits mode instructions for both mode: undefined and yolo", () => {
		// After a switch the transcript still contains messages tagged with the
		// other mode, so the explanation is unconditional.
		expect(buildKerberoSecSystemPrompt({ ...BASE_OPTIONS })).toContain(
			MODE_TAG_INSTRUCTIONS,
		);
		expect(
			buildKerberoSecSystemPrompt({ ...BASE_OPTIONS, mode: "yolo" }),
		).toContain(MODE_TAG_INSTRUCTIONS);
	});

	it("places caller rules before the mode instructions", () => {
		const prompt = buildKerberoSecSystemPrompt({
			...BASE_OPTIONS,
			mode: "plan",
			rules: "# Custom Rules\n\nAlways speak like a pirate.",
		});
		const rulesIndex = prompt.indexOf("Always speak like a pirate.");
		expect(rulesIndex).toBeGreaterThan(-1);
		expect(rulesIndex).toBeLessThan(prompt.indexOf(MODE_TAG_INSTRUCTIONS));
	});

	it("includes rich workspace metadata for the KerberoSec backend parser", () => {
		const metadata = JSON.stringify({
			workspaces: {
				"/workspace/project": {
					hint: "project",
					associatedRemoteUrls: [
						"origin: https://github.com/kerberosec/kerberosec.git",
					],
					latestGitCommitHash: "abc123",
				},
			},
		});
		const prompt = buildKerberoSecSystemPrompt({
			...BASE_OPTIONS,
			providerId: "kerberosec",
			metadata,
		});

		expect(prompt).toContain(`# Workspace Configuration\n${metadata}`);
	});

	it("respects an explicit override prompt without injecting mode sections", () => {
		const prompt = buildKerberoSecSystemPrompt({
			...BASE_OPTIONS,
			mode: "plan",
			overridePrompt: "You are a custom agent.",
		});
		expect(prompt).toBe("You are a custom agent.");
	});

	it("uses sanitized system prompt for agent-router without moderation trigger words", () => {
		const prompt = buildKerberoSecSystemPrompt({
			...BASE_OPTIONS,
			providerId: "agent-router",
		});
		expect(prompt).toContain(
			"Security Engineering, Code Auditing & Systems Assessment Agent",
		);
		expect(prompt).not.toContain("Penetration Testing & Red Teaming");
		expect(prompt).not.toContain("offensive security operations");
		expect(prompt).not.toContain("exploit analysis");
		expect(prompt).toContain("Full execution authority");
		expect(prompt).toContain("AUTONOMOUS MULTI-AGENT & TEAM ORCHESTRATION");
		expect(prompt).toContain("AUTOMATIC TEAM DELEGATION");
		expect(prompt).toContain("team_spawn_teammate");
	});

	it("uses sanitized system prompt for all default models without moderation triggers", () => {
		const prompt = buildKerberoSecSystemPrompt({
			...BASE_OPTIONS,
			providerId: "openai",
		});
		expect(prompt).toContain(
			"Security Engineering, Code Auditing & Systems Assessment Agent",
		);
		expect(prompt).not.toContain("Penetration Testing & Red Teaming");
		expect(prompt).not.toContain("metasploit");
		expect(prompt).not.toContain("burpsuite");
		expect(prompt).not.toContain("sqlmap");
		expect(prompt).toContain("operational authority");
		expect(prompt).toContain("AUTONOMOUS MULTI-AGENT & TEAM ORCHESTRATION");
		expect(prompt).toContain("AUTOMATIC TEAM DELEGATION");
		expect(prompt).toContain("team_spawn_teammate");
	});
});
