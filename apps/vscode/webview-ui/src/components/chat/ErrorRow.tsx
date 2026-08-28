import type { KerberoSecMessage } from "@shared/ExtensionMessage"
import { memo } from "react"
import { KerberoSecAuthStatus } from "@/components/account/KerberoSecAuthStatus"
import KerberoSecFreeModelLimitError from "@/components/chat/KerberoSecFreeModelLimitError"
import KerberoSecFreePromotionEndedError from "@/components/chat/KerberoSecFreePromotionEndedError"
import KerberoSecPassLimitError from "@/components/chat/KerberoSecPassLimitError"
import CreditLimitError from "@/components/chat/CreditLimitError"
import EntitlementError from "@/components/chat/EntitlementError"
import OrgKerberoSecPassRestrictionError from "@/components/chat/OrgKerberoSecPassRestrictionError"
import SpendLimitError from "@/components/chat/SpendLimitError"
import { Button } from "@/components/ui/button"
import { useKerberoSecAuth, useKerberoSecSignIn } from "@/context/KerberoSecAuthContext"
import { KerberoSecError, KerberoSecErrorType } from "../../../../src/services/error/KerberoSecError"

const _errorColor = "var(--vscode-errorForeground)"

interface ErrorRowProps {
	message: KerberoSecMessage
	errorType: "error" | "mistake_limit_reached" | "diff_error" | "kerberosecignore_error"
	apiRequestFailedMessage?: string
	apiReqStreamingFailedMessage?: string
}

const ErrorRow = memo(({ message, errorType, apiRequestFailedMessage, apiReqStreamingFailedMessage }: ErrorRowProps) => {
	const { kerberosecUser } = useKerberoSecAuth()
	const rawApiError = apiRequestFailedMessage || apiReqStreamingFailedMessage

	const { isLoginLoading, authStatusMessage, handleSignIn } = useKerberoSecSignIn()

	const renderErrorContent = () => {
		switch (errorType) {
			case "error":
			case "mistake_limit_reached":
				// Handle API request errors with special error parsing
				if (rawApiError) {
					// FIXME: KerberoSecError parsing should not be applied to non-KerberoSec providers, but it seems we're using kerberosecErrorMessage below in the default error display
					const kerberosecError = KerberoSecError.parse(rawApiError)
					const errorMessage = kerberosecError?._error?.message || kerberosecError?.message || rawApiError
					const requestId = kerberosecError?._error?.request_id
					const providerId = kerberosecError?.providerId || kerberosecError?._error?.providerId
					// Deliberately narrower than the shared isKerberoSecManagedProvider (which
					// also matches kerberosec-pass): only usage-billing errors get the credit
					// and login prompts below.
					const isKerberoSecUsageBillingProvider = providerId === "kerberosec"
					const errorCode = kerberosecError?._error?.code

					if (kerberosecError?.isErrorType(KerberoSecErrorType.Balance)) {
						const errorDetails = kerberosecError._error?.details
						if (isKerberoSecUsageBillingProvider || errorDetails?.buy_credits_url) {
							return (
								<CreditLimitError
									buyCreditsUrl={errorDetails?.buy_credits_url}
									currentBalance={errorDetails?.current_balance}
									message={errorDetails?.message}
									totalPromotions={errorDetails?.total_promotions}
									totalSpent={errorDetails?.total_spent}
								/>
							)
						}
					}

					if (kerberosecError?.isErrorType(KerberoSecErrorType.SpendLimit)) {
						const d = kerberosecError._error?.details
						return (
							<SpendLimitError
								budgetPeriod={d?.budget_period}
								limitUsd={d?.limit_usd}
								message={d?.message || errorMessage}
								resetsAt={d?.resets_at}
								spentUsd={d?.spent_usd}
							/>
						)
					}

					if (kerberosecError?.isErrorType(KerberoSecErrorType.Entitlement)) {
						const detailMessage = kerberosecError?._error?.details?.message || errorMessage
						return <EntitlementError message={detailMessage} />
					}

					if (kerberosecError?.isErrorType(KerberoSecErrorType.OrgKerberoSecPassRestriction)) {
						return <OrgKerberoSecPassRestrictionError />
					}

					if (kerberosecError?.isErrorType(KerberoSecErrorType.KerberoSecPassLimit)) {
						const detailMessage = kerberosecError?._error?.details?.message || errorMessage
						return <KerberoSecPassLimitError message={detailMessage} />
					}

					if (kerberosecError?.isErrorType(KerberoSecErrorType.KerberoSecFreeModelLimit)) {
						const detailMessage = kerberosecError?._error?.details?.message || errorMessage
						return <KerberoSecFreeModelLimitError message={detailMessage} />
					}

					// A retired free model answers model-not-found once its promotion
					// ends — dedicated copy plus a route into the model picker,
					// since retrying the deleted model can never succeed.
					if (kerberosecError?.isErrorType(KerberoSecErrorType.KerberoSecFreePromotionEnded)) {
						return <KerberoSecFreePromotionEndedError />
					}

					if (kerberosecError?.isErrorType(KerberoSecErrorType.RateLimit)) {
						return (
							<p className="m-0 whitespace-pre-wrap text-error wrap-anywhere">
								{errorMessage}
								{requestId && <div>Request ID: {requestId}</div>}
							</p>
						)
					}

					if (kerberosecError?.isErrorType(KerberoSecErrorType.QuotaExceeded)) {
						const detailMessage = kerberosecError?._error?.details?.message || errorMessage
						return <p className="m-0 whitespace-pre-wrap text-error wrap-anywhere">{detailMessage}</p>
					}

					if (kerberosecError?.isErrorType(KerberoSecErrorType.Auth) && isKerberoSecUsageBillingProvider) {
						return !kerberosecUser ? (
							// User is using KerberoSec provider and is not logged in
							<div className="flex flex-col gap-3">
								<div className="flex items-center justify-center rounded border border-neutral-500/30 bg-vscode-editor-background p-6 text-center text-vscode-foreground">
									Whoops looks like you're logged out – click below to sign in
								</div>
								<Button className="w-full" disabled={isLoginLoading} onClick={handleSignIn}>
									Sign in to KerberoSec
									{isLoginLoading && (
										<span className="ml-1 animate-spin">
											<span className="codicon codicon-refresh" />
										</span>
									)}
								</Button>
								<KerberoSecAuthStatus message={authStatusMessage} />
							</div>
						) : (
							// Don't show sign in button after the user has logged in, just ask them to retry
							<div className="mt-4">
								<span className="text-description">(Click "Retry" below)</span>
							</div>
						)
					}

					return (
						<p className="m-0 whitespace-pre-wrap text-error wrap-anywhere flex flex-col gap-3">
							{/* Display the well-formatted error extracted from the KerberoSecError instance */}

							<header>
								{providerId && <span className="uppercase">[{providerId}] </span>}
								{errorCode && <span>{errorCode}</span>}
								{errorMessage}
								{requestId && <div>Request ID: {requestId}</div>}
							</header>

							{/* Windows Powershell Issue */}
							{errorMessage?.toLowerCase()?.includes("powershell") && (
								<div>
									It seems like you're having Windows PowerShell issues, please see this{" "}
									<a
										className="underline text-inherit"
										href="https://github.com/kerberosec/kerberosec/wiki/TroubleShooting-%E2%80%90-%22PowerShell-is-not-recognized-as-an-internal-or-external-command%22">
										troubleshooting guide
									</a>
									.
								</div>
							)}

							{/* Display raw API error if different from parsed error message */}
							{errorMessage !== rawApiError && <div>{rawApiError}</div>}
						</p>
					)
				}

				// Regular error message
				return <p className="m-0 mt-0 whitespace-pre-wrap text-error wrap-anywhere">{message.text}</p>

			case "diff_error":
				return (
					<div className="flex flex-col p-2 rounded text-xs opacity-80 bg-quote text-foreground">
						<div>The model used search patterns that don't match anything in the file. Retrying...</div>
					</div>
				)

			case "kerberosecignore_error":
				return (
					<div className="flex flex-col p-2 rounded text-xs opacity-80 bg-quote text-foreground">
						<div>
							KerberoSec tried to access <code>{message.text}</code> which is blocked by the <code>.kerberosecignore</code>
							file.
						</div>
					</div>
				)

			default:
				return null
		}
	}

	// For diff_error and kerberosecignore_error, we don't show the header separately
	if (errorType === "diff_error" || errorType === "kerberosecignore_error") {
		return renderErrorContent()
	}

	// For other error types, show header + content
	return renderErrorContent()
})

export default ErrorRow
