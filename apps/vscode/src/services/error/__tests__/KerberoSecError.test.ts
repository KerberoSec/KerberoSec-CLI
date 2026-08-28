import { describe, it } from "bun:test"
import "should"
import { KerberoSecError, KerberoSecErrorType } from "../KerberoSecError"

describe("KerberoSecError", () => {
	describe("getErrorType", () => {
		it("should return QuotaExceeded when code is INFERENCE_CAP_ERROR", () => {
			const err = new KerberoSecError({ message: "Inference cap reached", code: "INFERENCE_CAP_ERROR" })
			KerberoSecError.getErrorType(err)!.should.equal(KerberoSecErrorType.QuotaExceeded)
		})

		it("should return Entitlement for the SDK KerberoSecPass subscription message", () => {
			const err = new KerberoSecError(
				"No access to KerberoSecPass subscription models yet. Subscribe to KerberoSecPass, the low cost open weights model coding plan:",
			)

			KerberoSecError.getErrorType(err)!.should.equal(KerberoSecErrorType.Entitlement)
		})

		it("should return Entitlement for the SDK KerberoSecPass subscription message with a different app URL", () => {
			const err = new KerberoSecError(
				"No access to KerberoSecPass subscription models yet. Subscribe to KerberoSecPass, the low cost open weights model coding plan:",
			)

			KerberoSecError.getErrorType(err)!.should.equal(KerberoSecErrorType.Entitlement)
		})

		it("should return Entitlement for the raw required-plan message", () => {
			const err = new KerberoSecError("403 Error 403: the user is not subscribed to required model plan")

			KerberoSecError.getErrorType(err)!.should.equal(KerberoSecErrorType.Entitlement)
		})

		it("should classify the SDK org individual subscription message separately", () => {
			const err = new KerberoSecError(
				"Organization accounts cannot use KerberoSecPass subscriptions. Go to /account -> change account to switch to your personal account for KerberoSecPass",
			)

			KerberoSecError.getErrorType(err)!.should.equal(KerberoSecErrorType.OrgKerberoSecPassRestriction)
		})

		it("should classify the raw organization individual subscription message separately", () => {
			const err = new KerberoSecError("403 Error 403: organization accounts cannot use individual model inference subscriptions")

			KerberoSecError.getErrorType(err)!.should.equal(KerberoSecErrorType.OrgKerberoSecPassRestriction)
		})

		it("should classify KerberoSecPass period limit messages separately", () => {
			const err = new KerberoSecError(
				"You have reached your weekly KerberoSecpass limit. The limit resets in 7d, please try again later.",
			)

			KerberoSecError.getErrorType(err)!.should.equal(KerberoSecErrorType.KerberoSecPassLimit)
		})

		it("should classify nested KerberoSecPass period limit messages separately", () => {
			const err = new KerberoSecError({
				message: "403 Error 403",
				error: {
					message: "You have reached your monthly KerberoSecPass limit. The limit resets in 12h, please try again later.",
				},
			})

			KerberoSecError.getErrorType(err)!.should.equal(KerberoSecErrorType.KerberoSecPassLimit)
		})

		it("should classify daily KerberoSec free model limits separately", () => {
			const err = new KerberoSecError(
				"Error: Error 429: Daily free limit reached on model deepseek/deepseek-v4-flash. Try again in 23h 59m",
			)

			KerberoSecError.getErrorType(err)!.should.equal(KerberoSecErrorType.KerberoSecFreeModelLimit)
		})

		it("should classify the host-stamped promotion-ended code as KerberoSecFreePromotionEnded", () => {
			// reshapeErrorForWebview stamps this code when the active model is a
			// retired kerberosec-free/ id (see message-translator).
			const err = new KerberoSecError({
				message: "Model not found",
				code: "kerberosec_free_promotion_ended",
			})

			KerberoSecError.getErrorType(err)!.should.equal(KerberoSecErrorType.KerberoSecFreePromotionEnded)
		})

		it("should classify model-not-found for a kerberosec-free model as KerberoSecFreePromotionEnded", () => {
			const err = new KerberoSecError({ message: "Error 404: Model not found" }, "kerberosec-free/glm-5")

			KerberoSecError.getErrorType(err)!.should.equal(KerberoSecErrorType.KerberoSecFreePromotionEnded)
		})

		it("should prefer KerberoSecFreePromotionEnded over Auth for a 404 with a kerberosec-free model", () => {
			// A 404 falls inside the generic 401-428 auth-status range; the
			// promotion-ended classification must win.
			const err = new KerberoSecError({ message: "Error 404: Model not found", status: 404 }, "kerberosec-free/glm-5")

			const result = KerberoSecError.getErrorType(err)
			result!.should.equal(KerberoSecErrorType.KerberoSecFreePromotionEnded)
		})

		it("should keep model-not-found for a non-free model on the generic path", () => {
			const err = new KerberoSecError({ message: "Error 404: Model not found", status: 404 }, "deepseek/deepseek-v4-flash")

			const result = KerberoSecError.getErrorType(err)
			;(result !== KerberoSecErrorType.KerberoSecFreePromotionEnded).should.be.true()
		})

		it("should not classify unrelated kerberosec-free errors as KerberoSecFreePromotionEnded", () => {
			const err = new KerberoSecError({ message: "Network error: socket hang up" }, "kerberosec-free/glm-5")

			const result = KerberoSecError.getErrorType(err)
			;(result !== KerberoSecErrorType.KerberoSecFreePromotionEnded).should.be.true()
		})
	})
})
