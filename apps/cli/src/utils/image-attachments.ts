import { readFileSync, statSync } from "node:fs";
import {
	DEFAULT_MAX_IMAGE_DECODED_BYTES,
	DEFAULT_MAX_IMAGE_ENCODED_BYTES,
	SUPPORTED_IMAGE_MEDIA_TYPES,
} from "@kerberosec/shared";
import { resolveExistingFilePath } from "@kerberosec/shared/storage";

const MIME_TYPES_BY_EXTENSION: Readonly<Record<string, string>> = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".webp": "image/webp",
};
const SUPPORTED_IMAGE_MIME_TYPES: ReadonlySet<string> = new Set(
	SUPPORTED_IMAGE_MEDIA_TYPES,
);
const MAX_IMAGE_FILE_BYTES = Math.min(
	DEFAULT_MAX_IMAGE_DECODED_BYTES,
	Math.floor((DEFAULT_MAX_IMAGE_ENCODED_BYTES * 3) / 4),
);

/**
 * Resolve a possibly-mangled image path to an actual on-disk file.
 */
export function resolveExistingImagePath(filePath: string): string | undefined {
	return resolveExistingFilePath(filePath);
}

export function isImagePath(filePath: string): boolean {
	const extension = filePath.toLowerCase().slice(filePath.lastIndexOf("."));
	return Object.hasOwn(MIME_TYPES_BY_EXTENSION, extension);
}

export function getImageMimeType(filePath: string): string {
	const extension = filePath.toLowerCase().slice(filePath.lastIndexOf("."));
	const mimeType = MIME_TYPES_BY_EXTENSION[extension];
	if (!mimeType) {
		throw new Error(
			`Unsupported image file extension: ${extension || "(none)"}`,
		);
	}
	return mimeType;
}

export function bufferToImageDataUrl(buffer: Buffer, mimeType: string): string {
	return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export function loadImageAsDataUrl(filePath: string): string {
	try {
		const mimeType = getImageMimeType(filePath);
		if (!SUPPORTED_IMAGE_MIME_TYPES.has(mimeType)) {
			throw new Error(`Unsupported image media type: ${mimeType}`);
		}
		const fileSize = statSync(filePath).size;
		if (fileSize > MAX_IMAGE_FILE_BYTES) {
			throw new Error(
				`Image exceeds the ${MAX_IMAGE_FILE_BYTES} byte attachment limit`,
			);
		}
		const buffer = readFileSync(filePath);
		const base64Size = Math.ceil(buffer.byteLength / 3) * 4;
		if (base64Size > DEFAULT_MAX_IMAGE_ENCODED_BYTES) {
			throw new Error(
				`Image exceeds the ${DEFAULT_MAX_IMAGE_ENCODED_BYTES} byte encoded attachment limit`,
			);
		}
		return bufferToImageDataUrl(buffer, mimeType);
	} catch (error) {
		throw new Error(
			`Failed to load image from ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
