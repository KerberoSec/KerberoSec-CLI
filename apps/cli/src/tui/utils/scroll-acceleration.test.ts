import { describe, expect, it } from "bun:test";
import { FastScrollAccel, fastScrollAccel } from "./scroll-acceleration";

describe("FastScrollAccel", () => {
	it("should provide at least 10x multiplier on first tick", () => {
		const accel = new FastScrollAccel(10);
		expect(accel.tick(1000)).toBe(10);
	});

	it("should maintain 10x multiplier across ticks outside minTickInterval", () => {
		const accel = new FastScrollAccel(10);
		expect(accel.tick(1000)).toBe(10);
		// Tick 100ms later (normal mouse scroll speed)
		const mult = accel.tick(1100);
		expect(mult).toBeGreaterThanOrEqual(10);
	});

	it("should reset velocity history on reset()", () => {
		const accel = new FastScrollAccel(10);
		accel.tick(1000);
		accel.tick(1020);
		accel.reset();
		expect(accel.tick(2000)).toBe(10);
	});

	it("exported fastScrollAccel singleton should have baseline 10", () => {
		expect(fastScrollAccel.tick(1000)).toBeGreaterThanOrEqual(10);
	});
});
