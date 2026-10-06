/**
 * Conservative chars-per-token approximation used for compaction triggering
 * and request-size diagnostics. Uses 3 chars/token (slightly over-counts vs
 * the conventional 4) so trigger thresholds fire before provider rejection
 * rather than after.
 */

export const CHARS_PER_TOKEN = 3;

export function estimateTokens(chars: number): number {
	return Math.max(1, Math.ceil(chars / CHARS_PER_TOKEN));
}

export interface TokenEstimatedRequest {
	systemPrompt?: string;
	messages: readonly unknown[];
	tools?: readonly unknown[];
}

const OMIT_VALUE = Symbol("omit JSON value");

interface JsonLengthState {
	/** JSON.stringify rejects cycles, but its fallback counts repeated references as [Circular]. */
	seen?: WeakSet<object>;
	/** Tracks only the current path so shared, non-circular values remain serializable. */
	stack?: WeakSet<object>;
	convertBigInt: boolean;
}

function quotedStringLength(value: string): number {
	let length = 2;
	for (let index = 0; index < value.length; index += 1) {
		const code = value.charCodeAt(index);
		if (
			code === 34 ||
			code === 92 ||
			code === 8 ||
			code === 9 ||
			code === 10 ||
			code === 12 ||
			code === 13
		) {
			length += 2;
		} else if (code < 32) {
			length += 6;
		} else if (code >= 0xd800 && code <= 0xdfff) {
			const next = value.charCodeAt(index + 1);
			if (code <= 0xdbff && next >= 0xdc00 && next <= 0xdfff) {
				length += 2;
				index += 1;
			} else {
				// Modern JSON.stringify escapes lone surrogates as \uXXXX.
				length += 6;
			}
		} else {
			length += 1;
		}
	}
	return length;
}

function sumIntegerKeyDigits(count: number): number {
	let total = 0;
	let start = 0;
	let width = 1;
	while (start < count) {
		const end = Math.min(count, 10 ** width);
		total += (end - start) * width;
		start = end;
		width += 1;
	}
	return total;
}

function byteArrayJsonLength(value: Uint8Array): number {
	const count = value.length;
	if (count === 0) return 2;

	let valueDigits = 0;
	for (const byte of value) {
		valueDigits += byte < 10 ? 1 : byte < 100 ? 2 : 3;
	}
	// Uint8Array JSON is an object with numeric keys; count it directly so a
	// large image buffer does not create millions of temporary property keys.
	return 1 + count * 4 + sumIntegerKeyDigits(count) + valueDigits;
}

function bufferJsonLength(value: object): number | undefined {
	const bufferConstructor = (
		globalThis as typeof globalThis & {
			Buffer?: {
				isBuffer?: (candidate: unknown) => boolean;
				prototype?: { toJSON?: unknown };
			};
		}
	).Buffer;
	if (
		!bufferConstructor?.isBuffer?.(value) ||
		(value as { toJSON?: unknown }).toJSON !==
			bufferConstructor.prototype?.toJSON
	) {
		return undefined;
	}

	const bytes = value as Uint8Array;
	let length = '{"type":"Buffer","data":['.length + 2;
	for (let index = 0; index < bytes.length; index += 1) {
		if (index > 0) length += 1;
		const byte = bytes[index] ?? 0;
		length += byte < 10 ? 1 : byte < 100 ? 2 : 3;
	}
	return length;
}

function jsonValueLength(
	input: unknown,
	key: string,
	state: JsonLengthState,
): number | typeof OMIT_VALUE {
	let value = input;
	if (typeof value === "object" && value !== null) {
		const bufferLength = bufferJsonLength(value);
		if (bufferLength !== undefined) return bufferLength;
	}
	if (
		(typeof value === "object" && value !== null) ||
		typeof value === "function" ||
		typeof value === "bigint"
	) {
		const toJSON = (value as { toJSON?: (key: string) => unknown }).toJSON;
		if (typeof toJSON === "function") {
			value = toJSON.call(value, key);
		}
	}
	if (value instanceof Uint8Array) return byteArrayJsonLength(value);

	if (typeof value === "bigint") {
		if (!state.convertBigInt) {
			throw new TypeError("Do not know how to serialize a BigInt");
		}
		value = value.toString();
	}

	if (value === null) return 4;
	if (typeof value === "string") return quotedStringLength(value);
	if (typeof value === "boolean") return value ? 4 : 5;
	if (typeof value === "number") {
		return Number.isFinite(value) ? (JSON.stringify(value)?.length ?? 0) : 4;
	}
	if (
		typeof value === "undefined" ||
		typeof value === "function" ||
		typeof value === "symbol"
	) {
		return OMIT_VALUE;
	}
	if (typeof value !== "object") return OMIT_VALUE;

	if (state.seen) {
		if (state.seen.has(value)) return quotedStringLength("[Circular]");
		state.seen.add(value);
	} else if (state.stack?.has(value)) {
		throw new TypeError("Converting circular structure to JSON");
	}

	state.stack?.add(value);
	try {
		if (Array.isArray(value)) {
			let length = 2;
			for (let index = 0; index < value.length; index += 1) {
				if (index > 0) length += 1;
				const itemLength = jsonValueLength(value[index], String(index), state);
				length += itemLength === OMIT_VALUE ? 4 : itemLength;
			}
			return length;
		}

		let length = 2;
		let hasEntries = false;
		for (const propertyKey in value) {
			if (!Object.prototype.hasOwnProperty.call(value, propertyKey)) continue;
			const entryLength = jsonValueLength(
				(value as Record<string, unknown>)[propertyKey],
				propertyKey,
				state,
			);
			if (entryLength === OMIT_VALUE) continue;
			if (hasEntries) length += 1;
			hasEntries = true;
			length += quotedStringLength(propertyKey) + 1 + entryLength;
		}
		return length;
	} finally {
		state.stack?.delete(value);
	}
}

function serializedJsonLength(value: unknown): number {
	return jsonValueLength(value, "", {
		stack: new WeakSet(),
		convertBigInt: false,
	}) as number;
}

function fallbackSerializedLength(value: unknown): number {
	try {
		const length = jsonValueLength(value, "", {
			seen: new WeakSet(),
			convertBigInt: true,
		});
		return length === OMIT_VALUE ? 0 : length;
	} catch {
		return String(value ?? "").length;
	}
}

/**
 * Estimate the complete provider request payload so request execution and
 * pre-request policies use the same definition of input utilization.
 */
export function estimateRequestInputTokens(
	request: TokenEstimatedRequest,
): number {
	let serializedLength: number;
	try {
		serializedLength = serializedJsonLength({
			systemPrompt: request.systemPrompt,
			messages: request.messages,
			tools: request.tools,
		});
	} catch {
		serializedLength =
			fallbackSerializedLength(request.systemPrompt) +
			fallbackSerializedLength(request.messages) +
			fallbackSerializedLength(request.tools) +
			2;
	}
	// Deliberately over-estimate slightly to leave room for provider formatting,
	// tool schema overhead, and tokenizer drift.
	return estimateTokens(serializedLength);
}
