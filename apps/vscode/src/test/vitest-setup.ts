// Under vitest, `@kerberosec/core` is aliased to src/test/kerberosec-core-vitest-stub.ts
// (see vitest.config.ts), which holds models.json state in memory and exposes
// the stub-only `resetModelsFileState` — hence the cast below.
import * as KerberoSecCore from "@kerberosec/core"
import { resetRegistry } from "@kerberosec/llms"
import { beforeEach } from "vitest"

const { resetModelsFileState } = KerberoSecCore as typeof KerberoSecCore & { resetModelsFileState(): void }

beforeEach(() => {
	resetModelsFileState()
	// The stub's syncStoredProviderRegistration mutates the real shared
	// @kerberosec/llms registry; reset it so registrations never leak across tests.
	resetRegistry()
})
