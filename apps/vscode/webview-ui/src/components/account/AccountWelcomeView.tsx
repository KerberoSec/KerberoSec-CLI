import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { KerberoSecAuthStatus } from "@/components/account/KerberoSecAuthStatus"
import { useKerberoSecSignIn } from "@/context/KerberoSecAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import KerberoSecLogoVariable from "../../assets/KerberoSecLogoVariable"

// export const AccountWelcomeView = () => (
// 	<div className="flex flex-col items-center pr-3 gap-2.5">
// 		<KerberoSecLogoWhite className="size-16 mb-4" />
export const AccountWelcomeView = () => {
	const { environment } = useExtensionState()
	const { isLoginLoading, authStatusMessage, handleSignIn } = useKerberoSecSignIn()

	return (
		<div className="flex flex-col items-center gap-2.5">
			<KerberoSecLogoVariable className="size-16 mb-4" environment={environment} />

			<p>
				Sign up for an account to get access to the latest models, billing dashboard to view usage and credits, and more
				upcoming features.
			</p>

			<VSCodeButton className="w-full mb-4" disabled={isLoginLoading} onClick={handleSignIn}>
				Sign up with KerberoSec
				{isLoginLoading && (
					<span className="ml-1 animate-spin">
						<span className="codicon codicon-refresh" />
					</span>
				)}
			</VSCodeButton>

			<KerberoSecAuthStatus message={authStatusMessage} />

			<p className="text-(--vscode-descriptionForeground) text-xs text-center m-0">
				By continuing, you agree to the <VSCodeLink href="https://cline.bot/tos">Terms of Service</VSCodeLink> and{" "}
				<VSCodeLink href="https://cline.bot/privacy">Privacy Policy.</VSCodeLink>
			</p>
		</div>
	)
}
