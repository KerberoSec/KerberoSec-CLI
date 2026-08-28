import { describe, expect, it } from "bun:test";
import { nightlifyPackageJson } from "./nightlify.mjs";

const fixture = {
	name: "claude-dev",
	displayName: "KerberoSec",
	publisher: "saoudrizwan",
	version: "4.0.0",
	main: "./dist/extension.js",
	contributes: {
		viewsContainers: {
			activitybar: [
				{
					id: "claude-dev-ActivityBar",
					title: "KerberoSec",
					icon: "assets/icon.svg",
				},
			],
		},
		views: {
			"claude-dev-ActivityBar": [
				{ type: "webview", id: "claude-dev.SidebarProvider" },
			],
		},
		commands: [{ command: "kerberosec.plusButtonClicked", title: "New Task" }],
		keybindings: [{ command: "kerberosec.addToChat", key: "ctrl+'" }],
		menus: {
			"view/title": [
				{
					command: "kerberosec.plusButtonClicked",
					when: "view == claude-dev.SidebarProvider",
				},
				// Mid-string references are NOT rewritten — a known limitation
				// shared with the standalone nightly's publish-nightly.mjs.
				{ command: "kerberosec.addToChat", when: "config.kerberosec.enableExtras" },
			],
		},
		configuration: {
			title: "KerberoSec",
			properties: { "kerberosec.enableExtras": { type: "boolean" } },
		},
	},
};

describe("nightlifyPackageJson", () => {
	const pkg = JSON.parse(
		nightlifyPackageJson(JSON.stringify(fixture, null, "\t"), "4.0.1752600000"),
	);

	it("sets the nightly identity and the supplied version", () => {
		expect(pkg.name).toBe("kerberosec-nightly");
		expect(pkg.displayName).toBe("KerberoSec (Nightly)");
		expect(pkg.version).toBe("4.0.1752600000");
		expect(pkg.publisher).toBe("saoudrizwan");
	});

	it("rewrites claude-dev IDs and the kerberosec.* namespace", () => {
		expect(pkg.contributes.viewsContainers.activitybar[0].id).toBe(
			"kerberosec-nightly-ActivityBar",
		);
		expect(pkg.contributes.viewsContainers.activitybar[0].title).toBe(
			"KerberoSec (Nightly)",
		);
		expect(Object.keys(pkg.contributes.views)).toEqual([
			"kerberosec-nightly-ActivityBar",
		]);
		expect(pkg.contributes.views["kerberosec-nightly-ActivityBar"][0].id).toBe(
			"kerberosec-nightly.SidebarProvider",
		);
		expect(pkg.contributes.commands[0].command).toBe(
			"kerberosec-nightly.plusButtonClicked",
		);
		expect(pkg.contributes.keybindings[0].command).toBe(
			"kerberosec-nightly.addToChat",
		);
		expect(Object.keys(pkg.contributes.configuration.properties)).toEqual([
			"kerberosec-nightly.enableExtras",
		]);
	});

	it("rewrites when-clauses that start with a rewritten ID, but not mid-string references", () => {
		const [gated, midString] = pkg.contributes.menus["view/title"];
		expect(gated.when).toBe("view == kerberosec-nightly.SidebarProvider");
		// Documented limitation: `config.kerberosec.` does not match the `"kerberosec.`
		// pattern, so it survives unrewritten (matches publish-nightly.mjs).
		expect(midString.when).toBe("config.kerberosec.enableExtras");
	});

	it("requires a version", () => {
		expect(() => nightlifyPackageJson("{}", undefined)).toThrow(/version/);
	});
});
