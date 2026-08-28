import type { Anthropic } from "@anthropic-ai/sdk"
import type { KerberoSecMessageMetricsInfo, KerberoSecMessageModelInfo } from "./metrics"

export type KerberoSecPromptInputContent = string

export type KerberoSecMessageRole = "user" | "assistant"

export interface KerberoSecReasoningDetailParam {
	type: "reasoning.text" | string
	text: string
	signature: string
	format: "anthropic-claude-v1" | string
	index: number
}

interface KerberoSecSharedMessageParam {
	// The id of the response that the block belongs to
	call_id?: string
}

export const REASONING_DETAILS_PROVIDERS = ["kerberosec", "openrouter"]

/**
 * An extension of Anthropic.MessageParam that includes KerberoSec-specific fields: reasoning_details.
 * This ensures backward compatibility where the messages were stored in Anthropic format with additional
 * fields unknown to Anthropic SDK.
 */
export interface KerberoSecTextContentBlock extends Anthropic.TextBlockParam, KerberoSecSharedMessageParam {
	// reasoning_details only exists for providers listed in REASONING_DETAILS_PROVIDERS
	reasoning_details?: KerberoSecReasoningDetailParam[]
	// Thought Signature associates with Gemini
	signature?: string
}

export interface KerberoSecImageContentBlock extends Anthropic.ImageBlockParam, KerberoSecSharedMessageParam {}

export interface KerberoSecDocumentContentBlock extends Anthropic.DocumentBlockParam, KerberoSecSharedMessageParam {}

export interface KerberoSecUserToolResultContentBlock extends Anthropic.ToolResultBlockParam, KerberoSecSharedMessageParam {}

/**
 * Assistant only content types
 */
export interface KerberoSecAssistantToolUseBlock extends Anthropic.ToolUseBlockParam, KerberoSecSharedMessageParam {
	// reasoning_details only exists for providers listed in REASONING_DETAILS_PROVIDERS
	reasoning_details?: unknown[] | KerberoSecReasoningDetailParam[]
	// Thought Signature associates with Gemini
	signature?: string
}

export interface KerberoSecAssistantThinkingBlock extends Anthropic.ThinkingBlock, KerberoSecSharedMessageParam {
	// The summary items returned by OpenAI response API
	// The reasoning details that will be moved to the text block when finalized
	summary?: unknown[] | KerberoSecReasoningDetailParam[]
}

export interface KerberoSecAssistantRedactedThinkingBlock extends Anthropic.RedactedThinkingBlockParam, KerberoSecSharedMessageParam {}

export type KerberoSecToolResponseContent = KerberoSecPromptInputContent | Array<KerberoSecTextContentBlock | KerberoSecImageContentBlock>

export type KerberoSecUserContent =
	| KerberoSecTextContentBlock
	| KerberoSecImageContentBlock
	| KerberoSecDocumentContentBlock
	| KerberoSecUserToolResultContentBlock

export type KerberoSecAssistantContent =
	| KerberoSecTextContentBlock
	| KerberoSecImageContentBlock
	| KerberoSecDocumentContentBlock
	| KerberoSecAssistantToolUseBlock
	| KerberoSecAssistantThinkingBlock
	| KerberoSecAssistantRedactedThinkingBlock

export type KerberoSecContent = KerberoSecUserContent | KerberoSecAssistantContent

/**
 * An extension of Anthropic.MessageParam that includes KerberoSec-specific fields.
 * This ensures backward compatibility where the messages were stored in Anthropic format,
 * while allowing for additional metadata specific to KerberoSec to avoid unknown fields in Anthropic SDK
 * added by ignoring the type checking for those fields.
 */
export interface KerberoSecStorageMessage extends Anthropic.MessageParam {
	/**
	 * Response ID associated with this message
	 */
	id?: string
	role: KerberoSecMessageRole
	content: KerberoSecPromptInputContent | KerberoSecContent[]
	/**
	 * NOTE: model information used when generating this message.
	 * Internal use for message conversion only.
	 * MUST be removed before sending message to any LLM provider.
	 */
	modelInfo?: KerberoSecMessageModelInfo
	/**
	 * LLM operational and performance metrics for this message
	 * Includes token counts, costs.
	 */
	metrics?: KerberoSecMessageMetricsInfo
	/**
	 * Timestamp of when the message was created
	 */
	ts?: number
}

/**
 * Converts KerberoSecStorageMessage to Anthropic.MessageParam by removing KerberoSec-specific fields
 * KerberoSec-specific fields (like modelInfo, reasoning_details) are properly omitted.
 */
export function convertKerberoSecStorageToAnthropicMessage(
	kerberosecMessage: KerberoSecStorageMessage,
	provider = "anthropic",
): Anthropic.MessageParam {
	const { role, content } = kerberosecMessage

	// Handle string content - fast path
	if (typeof content === "string") {
		return { role, content }
	}

	// Removes thinking block that has no signature (invalid thinking block that's incompatible with Anthropic API)
	const filteredContent = content.filter((b) => b.type !== "thinking" || !!b.signature)

	// Handle array content - strip KerberoSec-specific fields for non-reasoning_details providers
	const shouldCleanContent = !REASONING_DETAILS_PROVIDERS.includes(provider)
	const cleanedContent = shouldCleanContent
		? filteredContent.map(cleanContentBlock)
		: (filteredContent as Anthropic.MessageParam["content"])

	return { role, content: cleanedContent }
}

/**
 * KerberoSec stores images as base64, so an image block's source is always a base64 source.
 * The Anthropic SDK types the source as a Base64ImageSource | URLImageSource union, so this
 * narrows to the base64 variant for the transform layer. URL sources are not produced by KerberoSec,
 * so they degrade to empty values rather than throwing.
 */
export function getBase64ImageSource(source: Anthropic.ImageBlockParam["source"]): { mediaType: string; data: string } {
	if (source.type === "base64") {
		return { mediaType: source.media_type, data: source.data }
	}
	return { mediaType: "", data: "" }
}

/**
 * Builds a base64 data URL from an image block's source. See getBase64ImageSource.
 */
export function getImageDataUrl(source: Anthropic.ImageBlockParam["source"]): string {
	const { mediaType, data } = getBase64ImageSource(source)
	return `data:${mediaType};base64,${data}`
}

/**
 * Clean a content block by removing KerberoSec-specific fields and returning only Anthropic-compatible fields
 */
export function cleanContentBlock(block: KerberoSecContent): Anthropic.ContentBlock {
	// Fast path: if no KerberoSec-specific fields exist, return as-is
	const hasKerberoSecFields =
		"reasoning_details" in block ||
		"call_id" in block ||
		"summary" in block ||
		(block.type !== "thinking" && "signature" in block)

	if (!hasKerberoSecFields) {
		return block as Anthropic.ContentBlock
	}

	// Removes KerberoSec-specific fields & the signature field that's added for Gemini.
	const { reasoning_details, call_id, summary, ...rest } = block as any

	// Remove signature from non-thinking blocks that were added for Gemini
	if (block.type !== "thinking" && rest.signature) {
		rest.signature = undefined
	}

	return rest satisfies Anthropic.ContentBlock
}
