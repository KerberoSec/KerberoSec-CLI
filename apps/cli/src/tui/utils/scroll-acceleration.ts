import type { ScrollAcceleration } from "@opentui/core";

/**
 * 10x scroll acceleration for responsive terminal mouse wheel and trackpad scrolling.
 * Provides an immediate 10x baseline multiplier with dynamic boost for continuous streaks.
 */
export class FastScrollAccel implements ScrollAcceleration {
	private readonly baseMultiplier: number;
	private lastTickTime = 0;
	private velocityHistory: number[] = [];
	private readonly historySize = 3;
	private readonly streakTimeout = 150;
	private readonly minTickInterval = 6;

	constructor(baseMultiplier = 10) {
		this.baseMultiplier = baseMultiplier;
	}

	tick(now = Date.now()): number {
		const dt = this.lastTickTime ? now - this.lastTickTime : Infinity;
		if (dt === Infinity || dt > this.streakTimeout) {
			this.lastTickTime = now;
			this.velocityHistory = [];
			return this.baseMultiplier;
		}

		if (dt < this.minTickInterval) {
			return this.baseMultiplier;
		}

		this.lastTickTime = now;
		this.velocityHistory.push(dt);
		if (this.velocityHistory.length > this.historySize) {
			this.velocityHistory.shift();
		}

		const avgInterval =
			this.velocityHistory.reduce((a, b) => a + b, 0) /
			this.velocityHistory.length;
		const velocity = 100 / avgInterval;
		const additional = Math.min(20, Math.floor(velocity * 2));
		return this.baseMultiplier + additional;
	}

	reset(): void {
		this.lastTickTime = 0;
		this.velocityHistory = [];
	}
}

export const fastScrollAccel = new FastScrollAccel(10);
