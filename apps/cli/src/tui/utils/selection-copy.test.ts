import type { Selection } from "@opentui/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	createSelectionCopyHandler,
	type SelectionCopyDeps,
} from "./selection-copy";

function makeSelection(text: string): Selection {
	return { getSelectedText: () => text } as unknown as Selection;
}

interface PendingCopy {
	signal: AbortSignal;
	resolve: (copied: boolean) => void;
}

function createTestDeps(
	options: {
		osc52Returns?: boolean;
		autoCopyOnSelect?: boolean;
		getSelectionText?: () => string;
		clearSelection?: () => void;
	} = {},
) {
	const showToast = vi.fn();
	const copyToClipboardOSC52 = vi
		.fn()
		.mockReturnValue(options.osc52Returns ?? false);
	const pending: PendingCopy[] = [];
	const copyTextToSystemClipboardImpl = vi
		.fn<NonNullable<SelectionCopyDeps["copyTextToSystemClipboardImpl"]>>()
		.mockImplementation((_text, opts) => {
			return new Promise<boolean>((resolve) => {
				pending.push({
					signal: opts?.signal as AbortSignal,
					resolve,
				});
			});
		});
	return {
		deps: {
			copyToClipboardOSC52,
			showToast,
			copyTextToSystemClipboardImpl,
			autoCopyOnSelect: options.autoCopyOnSelect,
			getSelectionText: options.getSelectionText,
			clearSelection: options.clearSelection,
		},
		pending,
	};
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe("createSelectionCopyHandler (default mode: no auto copy)", () => {
	it("does not automatically copy or toast when text is selected", () => {
		const { deps, pending } = createTestDeps();
		const handler = createSelectionCopyHandler(deps);

		handler.handleSelection(makeSelection("hello"));

		expect(deps.copyToClipboardOSC52).not.toHaveBeenCalled();
		expect(deps.copyTextToSystemClipboardImpl).not.toHaveBeenCalled();
		expect(deps.showToast).not.toHaveBeenCalled();
		expect(pending).toHaveLength(0);
		expect(handler.hasSelection()).toBe(true);
	});

	it("returns false from copyCurrentSelection() when there is no selection", () => {
		const { deps } = createTestDeps();
		const handler = createSelectionCopyHandler(deps);

		const result = handler.copyCurrentSelection();

		expect(result).toBe(false);
		expect(deps.copyToClipboardOSC52).not.toHaveBeenCalled();
		expect(deps.copyTextToSystemClipboardImpl).not.toHaveBeenCalled();
		expect(deps.showToast).not.toHaveBeenCalled();
	});

	it("copies selection and toasts when copyCurrentSelection() is invoked", async () => {
		const { deps, pending } = createTestDeps({ osc52Returns: true });
		const handler = createSelectionCopyHandler(deps);

		handler.handleSelection(makeSelection("selected text"));
		expect(deps.copyToClipboardOSC52).not.toHaveBeenCalled();

		const result = handler.copyCurrentSelection();
		expect(result).toBe(true);
		expect(deps.copyToClipboardOSC52).toHaveBeenCalledWith("selected text");

		pending[0]?.resolve(true);
		await Promise.resolve();
		await Promise.resolve();

		expect(deps.showToast).toHaveBeenCalledWith(
			"Copied to clipboard",
			"success",
		);
	});

	it("resets selection after copyCurrentSelection() so subsequent call returns false", () => {
		const { deps } = createTestDeps({ osc52Returns: true });
		const handler = createSelectionCopyHandler(deps);

		handler.handleSelection(makeSelection("once"));
		expect(handler.copyCurrentSelection()).toBe(true);
		expect(handler.copyCurrentSelection()).toBe(false);
	});

	it("uses getSelectionText and clearSelection callbacks if provided", () => {
		let dynamicText = "from renderer";
		const clearSelectionMock = vi.fn(() => {
			dynamicText = "";
		});
		const { deps } = createTestDeps({
			osc52Returns: true,
			getSelectionText: () => dynamicText,
			clearSelection: clearSelectionMock,
		});
		const handler = createSelectionCopyHandler(deps);

		expect(handler.hasSelection()).toBe(true);
		expect(handler.copyCurrentSelection()).toBe(true);
		expect(deps.copyToClipboardOSC52).toHaveBeenCalledWith("from renderer");
		expect(clearSelectionMock).toHaveBeenCalled();
		expect(handler.hasSelection()).toBe(false);
		expect(handler.copyCurrentSelection()).toBe(false);
	});
});

describe("createSelectionCopyHandler (autoCopyOnSelect: true)", () => {
	it("ignores empty selections (no toast, no copy attempt)", () => {
		const { deps, pending } = createTestDeps({ autoCopyOnSelect: true });
		const { handleSelection } = createSelectionCopyHandler(deps);

		handleSelection(makeSelection(""));

		expect(deps.copyToClipboardOSC52).not.toHaveBeenCalled();
		expect(deps.copyTextToSystemClipboardImpl).not.toHaveBeenCalled();
		expect(deps.showToast).not.toHaveBeenCalled();
		expect(pending).toHaveLength(0);
	});

	it("still calls system clipboard when OSC52 succeeds", async () => {
		const { deps, pending } = createTestDeps({
			osc52Returns: true,
			autoCopyOnSelect: true,
		});
		const { handleSelection } = createSelectionCopyHandler(deps);

		handleSelection(makeSelection("hello"));

		expect(deps.copyToClipboardOSC52).toHaveBeenCalledWith("hello");
		expect(deps.copyTextToSystemClipboardImpl).toHaveBeenCalledWith(
			"hello",
			expect.objectContaining({ signal: expect.any(AbortSignal) }),
		);
		expect(deps.showToast).not.toHaveBeenCalled();

		pending[0]?.resolve(true);
		await Promise.resolve();
		await Promise.resolve();

		expect(deps.showToast).toHaveBeenCalledWith(
			"Copied to clipboard",
			"success",
		);
	});

	it("reports success when OSC52 succeeds even if system clipboard fails", async () => {
		const { deps, pending } = createTestDeps({
			osc52Returns: true,
			autoCopyOnSelect: true,
		});
		const { handleSelection } = createSelectionCopyHandler(deps);

		handleSelection(makeSelection("hello"));
		pending[0]?.resolve(false);
		await Promise.resolve();
		await Promise.resolve();

		expect(deps.showToast).toHaveBeenCalledWith(
			"Copied to clipboard",
			"success",
		);
	});

	it("calls fallback when OSC52 fails and toasts on success", async () => {
		const { deps, pending } = createTestDeps({ autoCopyOnSelect: true });
		const { handleSelection } = createSelectionCopyHandler(deps);

		handleSelection(makeSelection("text-A"));
		expect(pending).toHaveLength(1);

		pending[0]?.resolve(true);
		await Promise.resolve();
		await Promise.resolve();

		expect(deps.showToast).toHaveBeenCalledWith(
			"Copied to clipboard",
			"success",
		);
	});

	it("toasts an error when fallback returns false", async () => {
		const { deps, pending } = createTestDeps({ autoCopyOnSelect: true });
		const { handleSelection } = createSelectionCopyHandler(deps);

		handleSelection(makeSelection("text-A"));
		pending[0]?.resolve(false);
		await Promise.resolve();
		await Promise.resolve();

		expect(deps.showToast).toHaveBeenCalledWith(
			"Unable to copy selection",
			"error",
		);
	});

	it("aborts the prior in-flight fallback when a new selection arrives", () => {
		const { deps, pending } = createTestDeps({ autoCopyOnSelect: true });
		const { handleSelection } = createSelectionCopyHandler(deps);

		handleSelection(makeSelection("text-A"));
		expect(pending).toHaveLength(1);
		const firstSignal = pending[0]?.signal;
		expect(firstSignal?.aborted).toBe(false);

		handleSelection(makeSelection("text-B"));

		expect(firstSignal?.aborted).toBe(true);
		expect(pending).toHaveLength(2);
		expect(deps.copyTextToSystemClipboardImpl).toHaveBeenNthCalledWith(
			1,
			"text-A",
			expect.objectContaining({ signal: expect.any(AbortSignal) }),
		);
		expect(deps.copyTextToSystemClipboardImpl).toHaveBeenNthCalledWith(
			2,
			"text-B",
			expect.objectContaining({ signal: expect.any(AbortSignal) }),
		);
	});

	it("does not toast for a stale fallback result that resolves after a newer selection", async () => {
		const { deps, pending } = createTestDeps({ autoCopyOnSelect: true });
		const { handleSelection } = createSelectionCopyHandler(deps);

		handleSelection(makeSelection("text-A"));
		handleSelection(makeSelection("text-B"));
		expect(pending).toHaveLength(2);

		pending[0]?.resolve(true);
		await Promise.resolve();
		await Promise.resolve();
		expect(deps.showToast).not.toHaveBeenCalled();

		pending[1]?.resolve(true);
		await Promise.resolve();
		await Promise.resolve();
		expect(deps.showToast).toHaveBeenCalledTimes(1);
		expect(deps.showToast).toHaveBeenCalledWith(
			"Copied to clipboard",
			"success",
		);
	});

	it("aborts in-flight fallback when the next selection starts", async () => {
		const { deps, pending } = createTestDeps({ autoCopyOnSelect: true });
		const { handleSelection } = createSelectionCopyHandler(deps);

		handleSelection(makeSelection("text-A"));
		const firstSignal = pending[0]?.signal;
		expect(firstSignal?.aborted).toBe(false);

		deps.copyToClipboardOSC52.mockReturnValueOnce(true);
		handleSelection(makeSelection("text-B"));

		expect(firstSignal?.aborted).toBe(true);
		expect(deps.showToast).not.toHaveBeenCalled();
		expect(deps.copyTextToSystemClipboardImpl).toHaveBeenCalledTimes(2);

		pending[1]?.resolve(false);
		await Promise.resolve();
		await Promise.resolve();

		expect(deps.showToast).toHaveBeenCalledWith(
			"Copied to clipboard",
			"success",
		);
	});

	it("dispose() aborts any in-flight fallback and suppresses later toasts", async () => {
		const { deps, pending } = createTestDeps({ autoCopyOnSelect: true });
		const { handleSelection, dispose } = createSelectionCopyHandler(deps);

		handleSelection(makeSelection("text-A"));
		const signal = pending[0]?.signal;
		expect(signal?.aborted).toBe(false);

		dispose();
		expect(signal?.aborted).toBe(true);

		pending[0]?.resolve(true);
		await Promise.resolve();
		await Promise.resolve();

		expect(deps.showToast).not.toHaveBeenCalled();
	});
});
