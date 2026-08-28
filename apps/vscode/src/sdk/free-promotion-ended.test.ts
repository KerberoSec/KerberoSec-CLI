import { describe, expect, it } from "vitest"
import { KerberoSecError, KerberoSecErrorType } from "../services/error/KerberoSecError"
import { reshapeErrorForWebview } from "./message-translator"

// Once a free promotion ends the kerberosec-free/ model is removed from the catalog
// and the backend answers "model not found". These tests pin the host-side
// detection that turns that answer into the webview's promotion-ended card.
describe("reshapeErrorForWebview - free promotion ended", () => {
	it("stamps the promotion-ended code when a kerberosec-free model answers model-not-found", () => {
		const payload = reshapeErrorForWebview({ message: "Error 404: Model not found" }, "kerberosec", "kerberosec-free/glm-5")

		const parsed = JSON.parse(payload)
		expect(parsed.code).toBe("kerberosec_free_promotion_ended")
		expect(parsed.modelId).toBe("kerberosec-free/glm-5")
		expect(parsed.providerId).toBe("kerberosec")
		expect(parsed.details?.code).toBe("kerberosec_free_promotion_ended")
	})

	it("keeps the selected provider id, so kerberosec-pass selections stay attributed", () => {
		const payload = reshapeErrorForWebview({ message: "Model not found" }, "kerberosec-pass", "kerberosec-free/glm-5")

		expect(JSON.parse(payload).providerId).toBe("kerberosec-pass")
	})

	it("round-trips into the webview's KerberoSecFreePromotionEnded classification", () => {
		const payload = reshapeErrorForWebview({ message: "Error 404: Model not found" }, "kerberosec", "kerberosec-free/glm-5")

		const kerberosecError = KerberoSecError.parse(payload)
		expect(kerberosecError && KerberoSecError.getErrorType(kerberosecError)).toBe(KerberoSecErrorType.KerberoSecFreePromotionEnded)
	})

	it("leaves model-not-found for a paid model on the generic guidance path", () => {
		const payload = reshapeErrorForWebview({ message: "Model not found" }, "kerberosec", "deepseek/deepseek-v4-flash")

		expect(payload).toBe(
			"Model not found This model may be retired or unavailable on your account. Switch to a different model in API Configuration settings, then retry.",
		)
	})

	it("leaves model-not-found on the generic guidance path when the model id is unknown", () => {
		const payload = reshapeErrorForWebview({ message: "Model not found" }, "kerberosec")

		expect(payload).toContain("This model may be retired or unavailable")
	})

	it("does not touch unrelated errors from a kerberosec-free model", () => {
		expect(reshapeErrorForWebview({ message: "socket hang up" }, "kerberosec", "kerberosec-free/glm-5")).toBe("socket hang up")
	})
})
