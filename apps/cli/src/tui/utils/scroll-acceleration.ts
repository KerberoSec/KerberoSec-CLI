import { type ScrollAcceleration, ScrollBoxRenderable } from "@opentui/core";

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

/**
 * Baseline 10x multiplier for text-selection drag auto-scrolling.
 */
export const SELECTION_AUTO_SCROLL_MULTIPLIER = 10;

/**
 * Configures a ScrollBoxRenderable instance with 10x faster auto-scroll speeds
 * when selecting text and dragging near or outside the container boundaries.
 */
export function configureFastAutoScroll(
	scrollbox: ScrollBoxRenderable,
	multiplier = SELECTION_AUTO_SCROLL_MULTIPLIER,
): void {
	if (!scrollbox) return;
	const sb = scrollbox as unknown as {
		autoScrollSpeedSlow?: number;
		autoScrollSpeedMedium?: number;
		autoScrollSpeedFast?: number;
	};
	sb.autoScrollSpeedSlow = (sb.autoScrollSpeedSlow ?? 6) * multiplier;
	sb.autoScrollSpeedMedium = (sb.autoScrollSpeedMedium ?? 36) * multiplier;
	sb.autoScrollSpeedFast = (sb.autoScrollSpeedFast ?? 72) * multiplier;
}

/**
 * Globally patches ScrollBoxRenderable prototype to increase text-selection
 * drag auto-scroll speed by 10x across all scrollboxes.
 */
export function applyAutoScrollSpeedPatch(): void {
	if (
		ScrollBoxRenderable?.prototype &&
		!(ScrollBoxRenderable.prototype as Record<string, unknown>)
			.__autoScroll10xPatched
	) {
		(
			ScrollBoxRenderable.prototype as Record<string, unknown>
		).__autoScroll10xPatched = true;
		const origGetAutoScrollSpeed =
			ScrollBoxRenderable.prototype.getAutoScrollSpeed;

		ScrollBoxRenderable.prototype.getAutoScrollSpeed = function (
			mouseX: number,
			mouseY: number,
		): number {
			const relativeY = mouseY - this.y;
			const distToBottom = this.height - relativeY;
			const baseSpeed = origGetAutoScrollSpeed
				? origGetAutoScrollSpeed.call(this, mouseX, mouseY)
				: ((this as unknown as { autoScrollSpeedFast?: number })
						.autoScrollSpeedFast ?? 72);

			// If the instance speeds were already scaled (e.g. >= 360), avoid multiplying twice
			const alreadyScaled = baseSpeed >= 360;
			const factor = alreadyScaled ? 1 : SELECTION_AUTO_SCROLL_MULTIPLIER;

			// When dragged near or past the bottom border (below terminal), apply 10x boost
			// with progressive acceleration when pulled further below the terminal boundary
			if (distToBottom <= 1) {
				const overshoot = Math.max(0, -distToBottom);
				const extra = Math.min(5, Math.floor(overshoot / 2));
				return baseSpeed * (factor + extra);
			}

			return baseSpeed * factor;
		};
	}
}

// Automatically apply auto-scroll 10x patch at load time
applyAutoScrollSpeedPatch();
