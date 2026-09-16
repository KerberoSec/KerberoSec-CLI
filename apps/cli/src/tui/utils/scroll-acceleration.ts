import {
	CliRenderer,
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
 * Calibrated multiplier for text-selection scrolling (10x baseline, reduced by 80% from peak).
 */
export const SELECTION_AUTO_SCROLL_MULTIPLIER = 10;

/**
 * Active timers managing continuous auto-scroll during selection drag.
 */
const activeScrollBoxTimers = new WeakMap<
	ScrollBoxRenderable,
	ReturnType<typeof setInterval>
>();

export function startTimerForScrollbox(scrollbox: ScrollBoxRenderable): void {
	if (!scrollbox || activeScrollBoxTimers.has(scrollbox)) return;

	const timer = setInterval(() => {
		const sb = scrollbox as unknown as {
			isAutoScrolling?: boolean;
			_activeTimerAutoScrolling?: boolean;
			viewport?: { height: number };
			height: number;
			scrollHeight?: number;
			scrollTop: number;
			autoScrollMouseY?: number;
			cachedAutoScrollSpeed?: number;
			getAutoScrollDirectionY?: (y: number) => number;
			syncManualScrollState?: () => void;
			stopAutoScroll?: () => void;
			_ctx?: {
				requestSelectionUpdate?: () => void;
				requestRender?: () => void;
			};
		};

		if (!sb.isAutoScrolling && !sb._activeTimerAutoScrolling) {
			stopTimerForScrollbox(scrollbox);
			return;
		}

		const viewportHeight = sb.viewport?.height ?? sb.height;
		const maxScrollTop = Math.max(0, (sb.scrollHeight ?? 0) - viewportHeight);
		const dirY = sb.getAutoScrollDirectionY?.(sb.autoScrollMouseY ?? 0) ?? 0;
		const speed = sb.cachedAutoScrollSpeed || 720;
		const step = Math.max(5, Math.floor(speed * 0.016));

		let scrolled = false;
		if (dirY > 0 && sb.scrollTop < maxScrollTop) {
			sb.scrollTop = Math.min(maxScrollTop, sb.scrollTop + step);
			sb.syncManualScrollState?.();
			scrolled = true;
		} else if (dirY < 0 && sb.scrollTop > 0) {
			sb.scrollTop = Math.max(0, sb.scrollTop - step);
			sb.syncManualScrollState?.();
			scrolled = true;
		}

		if (scrolled) {
			sb._ctx?.requestSelectionUpdate?.();
			sb._ctx?.requestRender?.();
		} else if (dirY === 0) {
			stopTimerForScrollbox(scrollbox);
		}
	}, 16);

	activeScrollBoxTimers.set(scrollbox, timer);
}

export function stopTimerForScrollbox(scrollbox: ScrollBoxRenderable): void {
	if (!scrollbox) return;
	const timer = activeScrollBoxTimers.get(scrollbox);
	if (timer) {
		clearInterval(timer);
		activeScrollBoxTimers.delete(scrollbox);
	}
	(
		scrollbox as unknown as { _activeTimerAutoScrolling?: boolean }
	)._activeTimerAutoScrolling = false;
}

function findEnclosingScrollBox(
	renderable: unknown,
): ScrollBoxRenderable | null {
	let curr = renderable as { parent?: unknown } | null | undefined;
	while (curr) {
		if (curr instanceof ScrollBoxRenderable) {
			return curr;
		}
		curr = curr.parent as { parent?: unknown } | null | undefined;
	}
	return null;
}

/**
 * Configures a ScrollBoxRenderable instance with calibrated auto-scroll speeds
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
		720,
	);
}

/**
 * Globally patches ScrollBoxRenderable and CliRenderer prototypes to handle
 * continuous auto-scrolling at calibrated speeds when text is selected.
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
		const origStartAutoScroll = ScrollBoxRenderable.prototype.startAutoScroll;
		const origStopAutoScroll = ScrollBoxRenderable.prototype.stopAutoScroll;
		const origOnUpdate = ScrollBoxRenderable.prototype.onUpdate;
		const origOnMouseEvent = ScrollBoxRenderable.prototype.onMouseEvent;

		ScrollBoxRenderable.prototype.startAutoScroll = function (
			mouseX: number,
			mouseY: number,
		): void {
			origStartAutoScroll.call(this, mouseX, mouseY);
			startTimerForScrollbox(this);
		};

		ScrollBoxRenderable.prototype.stopAutoScroll = function (): void {
			stopTimerForScrollbox(this);
			origStopAutoScroll.call(this);
		};

		ScrollBoxRenderable.prototype.getAutoScrollSpeed = function (
			mouseX: number,
			mouseY: number,
		): number {
			const relativeY = mouseY - this.y;
			const distToBottom = this.height - relativeY;
			const distToTop = relativeY;

			// Calibrated rate: 720 lines/sec baseline when pulled near/below terminal border
			if (distToBottom <= 1) {
				const overshoot = Math.max(0, -distToBottom);
				return Math.max(
					720,
					72 * SELECTION_AUTO_SCROLL_MULTIPLIER + overshoot * 50,
				);
			}

			if (distToTop <= 1) {
				const overshoot = Math.max(0, -distToTop);
				return Math.max(
					720,
					72 * SELECTION_AUTO_SCROLL_MULTIPLIER + overshoot * 50,
				);
			}

			const baseSpeed = origGetAutoScrollSpeed
				? origGetAutoScrollSpeed.call(this, mouseX, mouseY)
				: ((this as unknown as { autoScrollSpeedFast?: number })
						.autoScrollSpeedFast ?? 72);

			return Math.max(baseSpeed * SELECTION_AUTO_SCROLL_MULTIPLIER, 360);
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
				// drive auto-scroll at calibrated speed
				if (distToBottom <= 3 || distToTop <= 3) {
					this.updateAutoScroll(selection.focus.x, selection.focus.y);
					startTimerForScrollbox(this);
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
							(dir === "down" ? 1 : -1) * Math.max(1, Math.abs(baseDelta)) * 10;
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

	// Also patch CliRenderer to drive selection drag auto-scroll even when the cursor is outside the scrollbox
	if (
		CliRenderer?.prototype &&
		!(CliRenderer.prototype as Record<string, unknown>).__selectionDragPatched
	) {
		(CliRenderer.prototype as Record<string, unknown>).__selectionDragPatched =
			true;

		const origStartSelection = CliRenderer.prototype.startSelection;
		const origUpdateSelection = CliRenderer.prototype.updateSelection;
		const origFinishSelection = CliRenderer.prototype.finishSelection;
		const origClearSelection = CliRenderer.prototype.clearSelection;

		CliRenderer.prototype.startSelection = function (
			renderable: unknown,
			x: number,
			y: number,
		): void {
			origStartSelection.call(this, renderable as never, x, y);
			const scrollbox = findEnclosingScrollBox(renderable);
			(
				this as unknown as {
					_activeSelectionScrollBox?: ScrollBoxRenderable | null;
				}
			)._activeSelectionScrollBox = scrollbox;
		};

		CliRenderer.prototype.updateSelection = function (
			currentRenderable: unknown,
			x: number,
			y: number,
			options?: unknown,
		): void {
			origUpdateSelection.call(
				this,
				currentRenderable as never,
				x,
				y,
				options as never,
			);
			const state = this as unknown as {
				_activeSelectionScrollBox?: ScrollBoxRenderable | null;
			};
			let scrollbox = state._activeSelectionScrollBox;
			if (!scrollbox && currentRenderable) {
				scrollbox = findEnclosingScrollBox(currentRenderable);
				state._activeSelectionScrollBox = scrollbox;
			}
			if (scrollbox) {
				const relativeY = y - scrollbox.y;
				const distToBottom = scrollbox.height - relativeY;
				const distToTop = relativeY;

				if (distToBottom <= 3 || distToTop <= 3) {
					scrollbox.autoScrollMouseX = x;
					scrollbox.autoScrollMouseY = y;
					scrollbox.cachedAutoScrollSpeed = scrollbox.getAutoScrollSpeed(x, y);
					scrollbox.isAutoScrolling = true;
					(
						scrollbox as unknown as { _activeTimerAutoScrolling?: boolean }
					)._activeTimerAutoScrolling = true;
					startTimerForScrollbox(scrollbox);
				} else {
					stopTimerForScrollbox(scrollbox);
					scrollbox.stopAutoScroll?.();
				}
			}
		};

		CliRenderer.prototype.finishSelection = function (): void {
			const state = this as unknown as {
				_activeSelectionScrollBox?: ScrollBoxRenderable | null;
			};
			const scrollbox = state._activeSelectionScrollBox;
			if (scrollbox) {
				stopTimerForScrollbox(scrollbox);
				scrollbox.stopAutoScroll?.();
				state._activeSelectionScrollBox = null;
			}
			origFinishSelection.call(this);
		};

		CliRenderer.prototype.clearSelection = function (): void {
			const state = this as unknown as {
				_activeSelectionScrollBox?: ScrollBoxRenderable | null;
			};
			const scrollbox = state._activeSelectionScrollBox;
			if (scrollbox) {
				stopTimerForScrollbox(scrollbox);
				scrollbox.stopAutoScroll?.();
				state._activeSelectionScrollBox = null;
			}
			origClearSelection.call(this);
		};
	}
}

// Automatically apply auto-scroll calibrated patch at load time
applyAutoScrollSpeedPatch();
