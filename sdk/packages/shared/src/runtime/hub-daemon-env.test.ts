import { afterEach, describe, expect, it } from "vitest";
import {
	claimHubDaemonProcess,
	claimSupervisedConnectorProcess,
	isHubDaemonProcess,
	isSupervisedConnectorProcess,
	KERBEROSEC_CONNECTOR_CLI_LAUNCH_ENV,
	KERBEROSEC_CONNECTOR_STARTING_INSTANCE_ENV,
	KERBEROSEC_CONNECTOR_SUPERVISED_ENV,
	KERBEROSEC_RUN_AS_HUB_DAEMON_ENV,
	readConnectorCliLaunchSpec,
	readStartingConnectorInstance,
	setConnectorCliLaunchSpec,
	setStartingConnectorInstance,
} from "./hub-daemon-env";

describe("hub daemon environment helpers", () => {
	it("detects hub daemon mode from the shared sentinel", () => {
		expect(
			isHubDaemonProcess({
				[KERBEROSEC_RUN_AS_HUB_DAEMON_ENV]: "1",
			}),
		).toBe(true);
		expect(
			isHubDaemonProcess({
				[KERBEROSEC_RUN_AS_HUB_DAEMON_ENV]: "0",
			}),
		).toBe(false);
	});

	it("round-trips a connector CLI launch specification", () => {
		const env: Record<string, string | undefined> = {};
		const spec = {
			launcher: "/usr/local/bin/bun",
			connectArgsPrefix: ["/repo/apps/cli/src/index.ts", "connect"],
			cwd: "/workspace",
		};

		setConnectorCliLaunchSpec(spec, env);

		expect(readConnectorCliLaunchSpec(env)).toEqual(spec);
		expect(env[KERBEROSEC_CONNECTOR_CLI_LAUNCH_ENV]).toBe(JSON.stringify(spec));
	});

	it("round-trips the connector instance that is starting", () => {
		const env: Record<string, string | undefined> = {};
		const ref = { channel: "slack", instanceId: "kerberosec-slack" };

		setStartingConnectorInstance(ref, env);

		expect(readStartingConnectorInstance(env)).toEqual(ref);
		expect(env[KERBEROSEC_CONNECTOR_STARTING_INSTANCE_ENV]).toBe(
			JSON.stringify(ref),
		);
	});

	it("reports no starting connector instance when the marker is absent or malformed", () => {
		expect(readStartingConnectorInstance({})).toBeUndefined();
		expect(
			readStartingConnectorInstance({
				[KERBEROSEC_CONNECTOR_STARTING_INSTANCE_ENV]: "not json",
			}),
		).toBeUndefined();
		expect(
			readStartingConnectorInstance({
				[KERBEROSEC_CONNECTOR_STARTING_INSTANCE_ENV]: JSON.stringify({
					channel: "slack",
					instanceId: "   ",
				}),
			}),
		).toBeUndefined();
	});

	it("rejects malformed connector CLI launch specifications", () => {
		expect(
			readConnectorCliLaunchSpec({
				[KERBEROSEC_CONNECTOR_CLI_LAUNCH_ENV]: JSON.stringify({
					launcher: "bun",
					connectArgsPrefix: [42],
					cwd: "/workspace",
				}),
			}),
		).toBeUndefined();
	});
});

describe("claiming the hub daemon sentinel", () => {
	const original = process.env[KERBEROSEC_RUN_AS_HUB_DAEMON_ENV];

	afterEach(() => {
		if (original === undefined) {
			delete process.env[KERBEROSEC_RUN_AS_HUB_DAEMON_ENV];
		} else {
			process.env[KERBEROSEC_RUN_AS_HUB_DAEMON_ENV] = original;
		}
		// Reset the module latch so cases do not leak into each other.
		claimHubDaemonProcess({});
	});

	it("removes the sentinel so spawned children cannot inherit it", () => {
		const env: Record<string, string | undefined> = {
			[KERBEROSEC_RUN_AS_HUB_DAEMON_ENV]: "1",
			PATH: "/usr/bin",
		};

		expect(claimHubDaemonProcess(env)).toBe(true);
		expect(KERBEROSEC_RUN_AS_HUB_DAEMON_ENV in env).toBe(false);
		// Unrelated environment is untouched.
		expect(env.PATH).toBe("/usr/bin");
	});

	it("still reports daemon mode after the sentinel is gone", () => {
		process.env[KERBEROSEC_RUN_AS_HUB_DAEMON_ENV] = "1";

		claimHubDaemonProcess();

		expect(process.env[KERBEROSEC_RUN_AS_HUB_DAEMON_ENV]).toBeUndefined();
		// The guards that stop a daemon spawning another daemon rely on this.
		expect(isHubDaemonProcess()).toBe(true);
	});

	it("reports non-daemon mode when the sentinel was never set", () => {
		delete process.env[KERBEROSEC_RUN_AS_HUB_DAEMON_ENV];

		expect(claimHubDaemonProcess()).toBe(false);
		expect(isHubDaemonProcess()).toBe(false);
	});

	it("reads an explicitly passed environment verbatim, ignoring the latch", () => {
		process.env[KERBEROSEC_RUN_AS_HUB_DAEMON_ENV] = "1";
		claimHubDaemonProcess();

		expect(isHubDaemonProcess({})).toBe(false);
		expect(
			isHubDaemonProcess({ [KERBEROSEC_RUN_AS_HUB_DAEMON_ENV]: "1" }),
		).toBe(true);
	});
});

describe("supervised connector marker", () => {
	const original = process.env[KERBEROSEC_CONNECTOR_SUPERVISED_ENV];

	afterEach(() => {
		if (original === undefined) {
			delete process.env[KERBEROSEC_CONNECTOR_SUPERVISED_ENV];
		} else {
			process.env[KERBEROSEC_CONNECTOR_SUPERVISED_ENV] = original;
		}
		// Reset the module latch so cases do not leak into each other.
		claimSupervisedConnectorProcess({});
	});

	it("removes the marker so spawned children cannot inherit it", () => {
		const env: Record<string, string | undefined> = {
			[KERBEROSEC_CONNECTOR_SUPERVISED_ENV]: "1",
			PATH: "/usr/bin",
		};

		expect(claimSupervisedConnectorProcess(env)).toBe(true);
		expect(KERBEROSEC_CONNECTOR_SUPERVISED_ENV in env).toBe(false);
		expect(env.PATH).toBe("/usr/bin");
	});

	it("still reports supervision after the marker is gone", () => {
		process.env[KERBEROSEC_CONNECTOR_SUPERVISED_ENV] = "1";

		claimSupervisedConnectorProcess();

		expect(process.env[KERBEROSEC_CONNECTOR_SUPERVISED_ENV]).toBeUndefined();
		// The connector still has to run in-process rather than delegating.
		expect(isSupervisedConnectorProcess()).toBe(true);
	});

	it("reports no supervision when the marker was never set", () => {
		delete process.env[KERBEROSEC_CONNECTOR_SUPERVISED_ENV];

		expect(claimSupervisedConnectorProcess()).toBe(false);
		expect(isSupervisedConnectorProcess()).toBe(false);
	});

	it("reads an explicitly passed environment verbatim, ignoring the latch", () => {
		process.env[KERBEROSEC_CONNECTOR_SUPERVISED_ENV] = "1";
		claimSupervisedConnectorProcess();

		expect(isSupervisedConnectorProcess({})).toBe(false);
		expect(
			isSupervisedConnectorProcess({
				[KERBEROSEC_CONNECTOR_SUPERVISED_ENV]: "1",
			}),
		).toBe(true);
	});
});
