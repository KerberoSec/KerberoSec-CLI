import { describe, expect, it } from "bun:test";
import { ScrollBoxRenderable } from "@opentui/core";
import {
	applyAutoScrollSpeedPatch,
	configureFastAutoScroll,
	FastScrollAccel,
	fastScrollAccel,
	SELECTION_AUTO_SCROLL_MULTIPLIER,
} from "./scroll-acceleration";

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

describe("Selection Auto-Scroll Acceleration", () => {
	it("should define a calibrated selection auto-scroll multiplier", () => {
		expect(SELECTION_AUTO_SCROLL_MULTIPLIER).toBe(1.25);
	});

	it("configureFastAutoScroll should scale instance autoScroll speeds to calibrated levels", () => {
		const mockScrollBox = {
			autoScrollSpeedSlow: 6,
			autoScrollSpeedMedium: 36,
			autoScrollSpeedFast: 72,
		} as unknown as ScrollBoxRenderable;

		configureFastAutoScroll(mockScrollBox);

		const sb = mockScrollBox as unknown as {
			autoScrollSpeedSlow: number;
			autoScrollSpeedMedium: number;
			autoScrollSpeedFast: number;
		};
		expect(sb.autoScrollSpeedSlow).toBe(7.5);
		expect(sb.autoScrollSpeedMedium).toBe(45);
		expect(sb.autoScrollSpeedFast).toBeGreaterThanOrEqual(90);
	});

	it("getAutoScrollSpeed should scale by at least 90 when dragging below container", () => {
		applyAutoScrollSpeedPatch();

		const mockCtx = {
			x: 0,
			y: 0,
			width: 100,
			height: 30,
			autoScrollSpeedSlow: 6,
			autoScrollSpeedMedium: 36,
			autoScrollSpeedFast: 72,
		};

		// Mouse dragged below container (height = 30, mouseY = 35 -> distToBottom = -5)
		const speed = ScrollBoxRenderable.prototype.getAutoScrollSpeed.call(
			mockCtx as unknown as ScrollBoxRenderable,
			10,
			35,
		);

		// Calibrated auto-scroll should be >= 90
		expect(speed).toBeGreaterThanOrEqual(90);
	});
});
