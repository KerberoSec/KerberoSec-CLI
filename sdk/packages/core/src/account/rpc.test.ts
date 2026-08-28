import { describe, expect, it, vi } from "vitest";
import {
	executeKerberoSecAccountAction,
	type KerberoSecAccountOperations,
	RpcKerberoSecAccountService,
} from "./rpc";

describe("executeKerberoSecAccountAction", () => {
	it("dispatches fetchMe", async () => {
		const service: KerberoSecAccountOperations = {
			fetchMe: vi.fn(async () => ({
				id: "u1",
				email: "user1@example.com",
				displayName: "User 1",
				photoUrl: "",
				createdAt: "2025-01-01T00:00:00Z",
				updatedAt: "2025-01-01T00:00:00Z",
				organizations: [],
			})),
			fetchBalance: vi.fn(async () => ({ balance: 1, userId: "u1" })),
			fetchUsageTransactions: vi.fn(async () => []),
			fetchPaymentTransactions: vi.fn(async () => []),
			fetchUserOrganizations: vi.fn(async () => []),
			fetchOrganizationBalance: vi.fn(async () => ({
				balance: 1,
				organizationId: "org-1",
			})),
			fetchOrganizationUsageTransactions: vi.fn(async () => []),
			switchAccount: vi.fn(async () => {}),
			fetchFeaturebaseToken: vi.fn(async () => undefined),
		};

		const result = await executeKerberoSecAccountAction(
			{ action: "kerberosecAccount", operation: "fetchMe" },
			service,
		);
		expect(service.fetchMe).toHaveBeenCalledTimes(1);
		expect(result).toMatchObject({ id: "u1" });
	});
});

describe("RpcKerberoSecAccountService", () => {
	it("sends provider action payload and parses response", async () => {
		const runProviderAction = vi.fn(async (request: unknown) => {
			const parsed = request as {
				action: string;
				operation: string;
			};
			expect(parsed).toEqual({
				action: "kerberosecAccount",
				operation: "fetchMe",
			});
			return {
				result: { id: "u2", email: "u2@example.com" },
			};
		});
		const service = new RpcKerberoSecAccountService({ runProviderAction });

		const me = await service.fetchMe();
		expect(runProviderAction).toHaveBeenCalledTimes(1);
		expect(me).toEqual({ id: "u2", email: "u2@example.com" });
	});
});
