import { describe, expect, it, vi } from "vitest";
import { KerberoSecAccountService } from "./kerberosec-account-service";
import {
	executeKerberoSecAccountAction,
	type KerberoSecAccountOperations,
	RpcKerberoSecAccountService,
} from "./rpc";

describe("KerberoSecAccountService.fetchFeaturebaseToken", () => {
	it("returns featurebaseJwt on success", async () => {
		const fetchImpl = vi.fn(async (input: unknown, init?: RequestInit) => {
			expect(String(input)).toBe(
				"https://api.kerberosec.bot/api/v1/users/me/featurebase-token",
			);
			expect(init?.headers).toMatchObject({
				Authorization: "Bearer workos:token-123",
			});
			return new Response(
				JSON.stringify({
					success: true,
					data: { featurebaseJwt: "eyJhbGciOiJIUzI1NiJ9.test.sig" },
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		});

		const service = new KerberoSecAccountService({
			apiBaseUrl: "https://api.kerberosec.bot",
			getAuthToken: async () => "workos:token-123",
			fetchImpl: fetchImpl as unknown as typeof fetch,
		});

		const result = await service.fetchFeaturebaseToken();
		expect(result).toEqual({
			featurebaseJwt: "eyJhbGciOiJIUzI1NiJ9.test.sig",
		});
		expect(fetchImpl).toHaveBeenCalledTimes(1);
	});

	it("returns undefined on network/request error", async () => {
		const fetchImpl = vi.fn(async () => {
			throw new Error("Network error");
		});

		const service = new KerberoSecAccountService({
			apiBaseUrl: "https://api.kerberosec.bot",
			getAuthToken: async () => "workos:token-123",
			fetchImpl: fetchImpl as unknown as typeof fetch,
		});

		const result = await service.fetchFeaturebaseToken();
		expect(result).toBeUndefined();
	});

	it("returns undefined when auth token is missing", async () => {
		const fetchImpl = vi.fn();

		const service = new KerberoSecAccountService({
			apiBaseUrl: "https://api.kerberosec.bot",
			getAuthToken: async () => undefined,
			fetchImpl: fetchImpl as unknown as typeof fetch,
		});

		const result = await service.fetchFeaturebaseToken();
		expect(result).toBeUndefined();
		expect(fetchImpl).not.toHaveBeenCalled();
	});

	it("returns undefined on HTTP error response", async () => {
		const fetchImpl = vi.fn(async () => {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		});

		const service = new KerberoSecAccountService({
			apiBaseUrl: "https://api.kerberosec.bot",
			getAuthToken: async () => "workos:token-123",
			fetchImpl: fetchImpl as unknown as typeof fetch,
		});

		const result = await service.fetchFeaturebaseToken();
		expect(result).toBeUndefined();
	});
});

describe("executeKerberoSecAccountAction - fetchFeaturebaseToken", () => {
	it("dispatches fetchFeaturebaseToken", async () => {
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
			fetchFeaturebaseToken: vi.fn(async () => ({
				featurebaseJwt: "mock-jwt-token",
			})),
		};

		const result = await executeKerberoSecAccountAction(
			{ action: "kerberosecAccount", operation: "fetchFeaturebaseToken" },
			service,
		);
		expect(service.fetchFeaturebaseToken).toHaveBeenCalledTimes(1);
		expect(result).toEqual({ featurebaseJwt: "mock-jwt-token" });
	});

	it("returns undefined when fetchFeaturebaseToken is not implemented", async () => {
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
		};

		const result = await executeKerberoSecAccountAction(
			{ action: "kerberosecAccount", operation: "fetchFeaturebaseToken" },
			service,
		);
		expect(result).toBeUndefined();
	});
});

describe("RpcKerberoSecAccountService.fetchFeaturebaseToken", () => {
	it("sends provider action payload and parses response", async () => {
		const runProviderAction = vi.fn(async (request: unknown) => {
			const parsed = request as {
				action: string;
				operation: string;
			};
			expect(parsed).toEqual({
				action: "kerberosecAccount",
				operation: "fetchFeaturebaseToken",
			});
			return {
				result: { featurebaseJwt: "rpc-jwt-token" },
			};
		});
		const service = new RpcKerberoSecAccountService({ runProviderAction });

		const result = await service.fetchFeaturebaseToken();
		expect(runProviderAction).toHaveBeenCalledTimes(1);
		expect(result).toEqual({ featurebaseJwt: "rpc-jwt-token" });
	});
});
