import { Mode } from "../storage/types"

export interface KerberoSecMessageModelInfo {
	modelId: string
	providerId: string
	mode: Mode
}

interface KerberoSecTokensInfo {
	prompt: number // Total input tokens (includes cached + non-cached)
	completion: number // Total output tokens
	cached: number // Subset of prompt_tokens that were cache hits
}

export interface KerberoSecMessageMetricsInfo {
	tokens?: KerberoSecTokensInfo
	cost?: number // Monetary cost for this turn
}
