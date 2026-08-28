import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import sinon from "sinon"
import { Logger } from "@/shared/services/Logger"
import type { Controller } from "../../index"
import { clearOrganizationForKerberoSecPassProviderSelection } from "../handleKerberoSecPassProviderSelection"

/** Let the fire-and-forget switchAccount promise chain settle. */
function flushMicrotasks(): Promise<void> {
	return new Promise((resolve) => setImmediate(resolve))
}

describe("clearOrganizationForKerberoSecPassProviderSelection", () => {
	let sandbox: sinon.SinonSandbox
	let switchAccount: sinon.SinonStub

	beforeEach(() => {
		sandbox = sinon.createSandbox()
		switchAccount = sandbox.stub().resolves()
		sandbox.stub(Logger, "debug")
	})

	afterEach(() => {
		sandbox.restore()
	})

	function createController(): Controller {
		return {
			accountService: { switchAccount },
		} as unknown as Controller
	}

	it("does nothing when KerberoSecPass is not selected", () => {
		clearOrganizationForKerberoSecPassProviderSelection(createController(), {
			planModeApiProvider: "kerberosec",
			actModeApiProvider: "openrouter",
		})

		expect(switchAccount.callCount).toBe(0)
	})

	it("switches to the personal account when KerberoSecPass is selected without blocking the caller", () => {
		clearOrganizationForKerberoSecPassProviderSelection(createController(), {
			planModeApiProvider: "kerberosec-pass",
			actModeApiProvider: "openrouter",
		})

		expect(switchAccount.callCount).toBe(1)
		expect(switchAccount.firstCall.args[0]).toBeUndefined()
	})

	it("logs and swallows account switch failures", async () => {
		const error = new Error("not signed in")
		switchAccount.rejects(error)

		clearOrganizationForKerberoSecPassProviderSelection(createController(), {
			planModeApiProvider: "kerberosec",
			actModeApiProvider: "kerberosec-pass",
		})
		await flushMicrotasks()

		expect(switchAccount.callCount).toBe(1)
		expect(switchAccount.firstCall.args[0]).toBeUndefined()
		expect((Logger.debug as sinon.SinonStub).calledOnce).toBe(true)
	})
})
