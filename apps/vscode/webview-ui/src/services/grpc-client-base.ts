/** biome-ignore-all lint/complexity/noThisInStatic: In static methods, this refers to the constructor (the subclass that invoked the method) when we want to refer to the subclass serviceName.
 *
 * NOTE: This file imports PLATFORM_CONFIG directly rather than using the PlatformProvider
 * because it contains static utility methods that are called from various contexts,
 * including non-React code. The configuration is compile-time constant, so direct
 * import is safe and ensures the methods work consistently regardless of React context.
 */
import { v4 as uuidv4 } from "uuid"
import { PLATFORM_CONFIG } from "../config/platform.config"

const UNARY_REQUEST_TIMEOUT_MS = 120_000

export interface Callbacks<TResponse> {
	onResponse: (response: TResponse) => void
	onError: (error: Error) => void
	onComplete: () => void
}

export abstract class ProtoBusClient {
	static serviceName: string

	static async makeUnaryRequest<TRequest, TResponse>(
		methodName: string,
		request: TRequest,
		encodeRequest: (_: TRequest) => unknown,
		decodeResponse: (_: { [key: string]: any }) => TResponse,
	): Promise<TResponse> {
		return new Promise((resolve, reject) => {
			const requestId = uuidv4()
			let timeoutId: ReturnType<typeof setTimeout> | undefined

			const cleanup = () => {
				window.removeEventListener("message", handleResponse)
				if (timeoutId !== undefined) {
					clearTimeout(timeoutId)
				}
			}

			// Set up one-time listener for this specific request
			const handleResponse = (event: MessageEvent) => {
				const message = event.data as {
					type?: unknown
					grpc_response?: {
						request_id?: unknown
						message?: unknown
						error?: unknown
					}
				} | null
				if (
					!message ||
					typeof message !== "object" ||
					message.type !== "grpc_response" ||
					message.grpc_response?.request_id !== requestId
				) {
					return
				}

				cleanup()
				const response = message.grpc_response
				if (response.message) {
					try {
						resolve(PLATFORM_CONFIG.decodeMessage(response.message, decodeResponse))
					} catch (error) {
						reject(error instanceof Error ? error : new Error(String(error)))
					}
				} else if (typeof response.error === "string" && response.error) {
					reject(new Error(response.error))
				} else {
					reject(new Error(`ProtoBus returned no response or error for ${this.serviceName}.${methodName}`))
				}
			}

			const fail = (error: Error) => {
				cleanup()
				reject(error)
			}
			timeoutId = setTimeout(
				() => fail(new Error(`Timed out waiting for ${this.serviceName}.${methodName} response`)),
				UNARY_REQUEST_TIMEOUT_MS,
			)
			try {
				window.addEventListener("message", handleResponse)
				PLATFORM_CONFIG.postMessage({
					type: "grpc_request",
					grpc_request: {
						service: this.serviceName,
						method: methodName,
						message: PLATFORM_CONFIG.encodeMessage(request, encodeRequest),
						request_id: requestId,
						is_streaming: false,
					},
				})
			} catch (error) {
				fail(error instanceof Error ? error : new Error(String(error)))
			}
		})
	}

	static makeStreamingRequest<TRequest, TResponse>(
		methodName: string,
		request: TRequest,
		encodeRequest: (_: TRequest) => unknown,
		decodeResponse: (_: { [key: string]: any }) => TResponse,
		callbacks: Callbacks<TResponse>,
	): () => void {
		const requestId = uuidv4()
		// Set up listener for streaming responses
		const handleResponse = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "grpc_response" && message.grpc_response?.request_id === requestId) {
				if (message.grpc_response.message) {
					// Process streaming message
					const response = PLATFORM_CONFIG.decodeMessage(message.grpc_response.message, decodeResponse)
					callbacks.onResponse(response)
				} else if (message.grpc_response.error) {
					// Handle error
					if (callbacks.onError) {
						callbacks.onError(new Error(message.grpc_response.error))
					}
					// Only remove the event listener on error
					window.removeEventListener("message", handleResponse)
				} else {
					console.error("Received ProtoBus message with no response or error ", JSON.stringify(message))
				}
				if (message.grpc_response.is_streaming === false) {
					if (callbacks.onComplete) {
						callbacks.onComplete()
					}
					// Only remove the event listener when the stream is explicitly ended
					window.removeEventListener("message", handleResponse)
				}
			}
		}
		window.addEventListener("message", handleResponse)
		PLATFORM_CONFIG.postMessage({
			type: "grpc_request",
			grpc_request: {
				service: this.serviceName,
				method: methodName,
				message: PLATFORM_CONFIG.encodeMessage(request, encodeRequest),
				request_id: requestId,
				is_streaming: true,
			},
		})
		// Return a function to cancel the stream
		return () => {
			window.removeEventListener("message", handleResponse)
			PLATFORM_CONFIG.postMessage({
				type: "grpc_request_cancel",
				grpc_request_cancel: {
					request_id: requestId,
				},
			})
			console.log(`[DEBUG] Sent cancellation for request: ${requestId}`)
		}
	}
}
