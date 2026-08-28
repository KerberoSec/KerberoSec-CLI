import { Mode } from "@shared/storage/types"
import { KerberoSecAccountInfoCard } from "../KerberoSecAccountInfoCard"
import KerberoSecModelPicker from "../KerberoSecModelPicker"

/**
 * Props for the KerberoSecProvider component
 */
interface KerberoSecProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
	initialModelTab?: "recommended" | "free"
}

/**
 * The KerberoSec provider configuration component
 */
export const KerberoSecProvider = ({ showModelOptions, isPopup, currentMode, initialModelTab }: KerberoSecProviderProps) => {
	return (
		<div>
			{/* KerberoSec Account Info Card */}
			<div style={{ marginBottom: 14, marginTop: 4 }}>
				<KerberoSecAccountInfoCard />
			</div>

			{showModelOptions && (
				<KerberoSecModelPicker
					currentMode={currentMode}
					initialTab={initialModelTab}
					isPopup={isPopup}
					showProviderRouting={true}
				/>
			)}
		</div>
	)
}
