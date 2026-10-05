#!/usr/bin/env bun

import { isMainThread } from "node:worker_threads";
import { version } from "../package.json";

const earlyArg = process.argv[2];

if (
	isMainThread &&
	process.argv.length === 3 &&
	(earlyArg === "--version" || earlyArg === "-V" || earlyArg === "version")
) {
	process.stdout.write(`${version}\n`);
	process.exit(0);
}

if (
	isMainThread &&
	process.argv.length === 3 &&
	(earlyArg === "--help" || earlyArg === "-h" || earlyArg === "help")
) {
	const { createProgram } = await import("./commands/program");
	process.stdout.write(
		createProgram({ withSubcommands: true }).helpInformation(),
	);
	process.exit(0);
}

if (isMainThread) {
	await import("./runtime-entry");
}
