import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useState } from "react";
import { AccountServiceClient } from "@/services/grpc-client";

const ORG_KERBEROSEC_PASS_RESTRICTION_MESSAGE =
	"Organization accounts cannot use KerberoSecPass subscriptions.";

const OrgKerberoSecPassRestrictionError = () => {
	const [isSwitching, setIsSwitching] = useState(false);
	const [didSwitch, setDidSwitch] = useState(false);
	const [error, setError] = useState<string | undefined>();

	const handleSwitchToPersonalAccount = async () => {
		setIsSwitching(true);
		setError(undefined);
		try {
			await AccountServiceClient.setUserOrganization({});
			setDidSwitch(true);
		} catch (error) {
			console.error("Failed to switch to personal KerberoSec account:", error);
			setError(
				"Failed to switch account. Use /accounts to switch to your personal account.",
			);
		} finally {
			setIsSwitching(false);
		}
	};

	return (
		<div
			className="p-2 border-none rounded-md mb-2 bg-(--vscode-textBlockQuote-background)"
			data-testid="org-kerberosec-pass-restriction-error"
		>
			<div className="text-error mb-2">
				Organization account cannot use KerberoSecPass
			</div>
			<div className="text-(--vscode-descriptionForeground) text-xs wrap-anywhere">
				{ORG_KERBEROSEC_PASS_RESTRICTION_MESSAGE}
			</div>
			<VSCodeButton
				className="w-full mt-3"
				disabled={isSwitching || didSwitch}
				onClick={handleSwitchToPersonalAccount}
			>
				{isSwitching
					? "Switching..."
					: didSwitch
						? "Switched to personal account"
						: "Switch to personal account"}
			</VSCodeButton>
			{didSwitch && (
				<div className="text-(--vscode-descriptionForeground) text-xs mt-2">
					Retry the request after switching.
				</div>
			)}
			{error && <div className="text-error text-xs mt-2">{error}</div>}
		</div>
	);
};

export { ORG_KERBEROSEC_PASS_RESTRICTION_MESSAGE };
export default OrgKerberoSecPassRestrictionError;
