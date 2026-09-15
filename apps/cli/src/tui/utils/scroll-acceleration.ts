import {
	type MouseEvent,
	type ScrollAcceleration,
	ScrollBoxRenderable,
} from "@opentui/core";

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
 * High-speed multiplier for text-selection scrolling (30x baseline).
 */
export const SELECTION_AUTO_SCROLL_MULTIPLIER = 30;

/**
 * Configures a ScrollBoxRenderable instance with ultra-fast auto-scroll speeds
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
	sb.autoScrollSpeedFast = Math.max(
		(sb.autoScrollSpeedFast ?? 72) * multiplier,
		2160,
	);
}

/**
 * Globally patches ScrollBoxRenderable prototype to drastically increase
 * scroll speed when text is selected (both for drag auto-scrolling and wheel scrolling).
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
		const origOnUpdate = ScrollBoxRenderable.prototype.onUpdate;
		const origOnMouseEvent = ScrollBoxRenderable.prototype.onMouseEvent;

		ScrollBoxRenderable.prototype.getAutoScrollSpeed = function (
			mouseX: number,
			mouseY: number,
		): number {
			const relativeY = mouseY - this.y;
			const distToBottom = this.height - relativeY;
			const distToTop = relativeY;

			// When dragged near or below the bottom border, fly at 2,160+ lines/sec
			// with progressive overshoot acceleration when pulled further below the terminal
			if (distToBottom <= 1) {
				const overshoot = Math.max(0, -distToBottom);
				return Math.max(
					2160,
					72 * SELECTION_AUTO_SCROLL_MULTIPLIER + overshoot * 150,
				);
			}

			if (distToTop <= 1) {
				const overshoot = Math.max(0, -distToTop);
				return Math.max(
					2160,
					72 * SELECTION_AUTO_SCROLL_MULTIPLIER + overshoot * 150,
				);
			}

			const baseSpeed = origGetAutoScrollSpeed
				? origGetAutoScrollSpeed.call(this, mouseX, mouseY)
				: ((this as unknown as { autoScrollSpeedFast?: number })
						.autoScrollSpeedFast ?? 72);

			return Math.max(baseSpeed * SELECTION_AUTO_SCROLL_MULTIPLIER, 1080);
		};

		ScrollBoxRenderable.prototype.onUpdate = function (
			deltaTime: number,
		): void {
			const ctx = (
				this as unknown as {
					_ctx?: {
						getSelection?: () => {
							isDragging?: boolean;
							anchor?: { x: number; y: number };
							focus?: { x: number; y: number };
						} | null;
					};
				}
			)._ctx;
			const selection = ctx?.getSelection?.();

			if (selection?.isDragging && selection.focus) {
				const relativeY = selection.focus.y - this.y;
				const distToBottom = this.height - relativeY;
				const distToTop = relativeY;

				// If selection cursor is near or outside the vertical bounds of the scrollbox,
				// drive auto-scroll at ultra-fast speed
				if (distToBottom <= 3 || distToTop <= 3) {
					this.updateAutoScroll(selection.focus.x, selection.focus.y);
				}
			}

			if (origOnUpdate) {
				origOnUpdate.call(this, deltaTime);
			} else {
				(
					this as unknown as { handleAutoScroll: (dt: number) => void }
				).handleAutoScroll(deltaTime);
			}
		};

		ScrollBoxRenderable.prototype.onMouseEvent = function (
			event: MouseEvent,
		): void {
			// When text is selected and user scrolls wheel or trackpad, boost scroll velocity
			if (event.type === "scroll") {
				const ctx = (
					this as unknown as {
						_ctx?: {
							getSelection?: () => {
								isActive?: boolean;
								isDragging?: boolean;
							} | null;
							requestSelectionUpdate?: () => void;
						};
					}
				)._ctx;
				const selection = ctx?.getSelection?.();
				if (selection && (selection.isActive || selection.isDragging)) {
					const dir = event.scroll?.direction;
					const baseDelta = event.scroll?.delta ?? 1;
					if (dir === "down" || dir === "up") {
						const extraLines =
							(dir === "down" ? 1 : -1) * Math.max(1, Math.abs(baseDelta)) * 30;
						this.scrollTop += extraLines;
						(
							this as unknown as { syncManualScrollState: () => void }
						).syncManualScrollState();
						ctx?.requestSelectionUpdate?.();
					}
				}
			}

			origOnMouseEvent.call(this, event);
		};
	}
}

// Automatically apply auto-scroll ultra-fast patch at load time
applyAutoScrollSpeedPatch();
