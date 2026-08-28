import type {
	KerberoSecAccountActionRequest,
	ProviderActionRequest,
} from "@kerberosec/shared";
import type {
	FeaturebaseTokenResponse,
	KerberoSecAccountBalance,
	KerberoSecAccountOrganization,
	KerberoSecAccountOrganizationBalance,
	KerberoSecAccountOrganizationUsageTransaction,
	KerberoSecAccountPaymentTransaction,
	KerberoSecAccountUsageTransaction,
	KerberoSecAccountUser,
} from "./types";

export interface KerberoSecAccountOperations {
	fetchMe(): Promise<KerberoSecAccountUser>;
	fetchBalance(userId?: string): Promise<KerberoSecAccountBalance>;
	fetchUsageTransactions(
		userId?: string,
	): Promise<KerberoSecAccountUsageTransaction[]>;
	fetchPaymentTransactions(
		userId?: string,
	): Promise<KerberoSecAccountPaymentTransaction[]>;
	fetchUserOrganizations(): Promise<KerberoSecAccountOrganization[]>;
	fetchOrganizationBalance(
		organizationId: string,
	): Promise<KerberoSecAccountOrganizationBalance>;
	fetchOrganizationUsageTransactions(input: {
		organizationId: string;
		memberId?: string;
	}): Promise<KerberoSecAccountOrganizationUsageTransaction[]>;
	switchAccount(organizationId?: string | null): Promise<void>;
	fetchFeaturebaseToken?(): Promise<FeaturebaseTokenResponse | undefined>;
}

export function isKerberoSecAccountActionRequest(
	request: ProviderActionRequest,
): request is KerberoSecAccountActionRequest {
	return request.action === "kerberosecAccount";
}

export async function executeKerberoSecAccountAction(
	request: KerberoSecAccountActionRequest,
	service: KerberoSecAccountOperations,
): Promise<unknown> {
	switch (request.operation) {
		case "fetchMe":
			return service.fetchMe();
		case "fetchBalance":
			return service.fetchBalance(request.userId);
		case "fetchUsageTransactions":
			return service.fetchUsageTransactions(request.userId);
		case "fetchPaymentTransactions":
			return service.fetchPaymentTransactions(request.userId);
		case "fetchUserOrganizations":
			return service.fetchUserOrganizations();
		case "fetchOrganizationBalance":
			return service.fetchOrganizationBalance(request.organizationId);
		case "fetchOrganizationUsageTransactions":
			return service.fetchOrganizationUsageTransactions({
				organizationId: request.organizationId,
				memberId: request.memberId,
			});
		case "switchAccount":
			await service.switchAccount(request.organizationId);
			return { updated: true };
		case "fetchFeaturebaseToken":
			return service.fetchFeaturebaseToken?.();
		default: {
			const exhaustive: never = request;
			throw new Error(
				`Unsupported KerberoSec account operation: ${String(exhaustive)}`,
			);
		}
	}
}

export interface ProviderActionExecutor {
	runProviderAction(request: ProviderActionRequest): Promise<{
		result: unknown;
	}>;
}

export class RpcKerberoSecAccountService
	implements KerberoSecAccountOperations
{
	private readonly executor: ProviderActionExecutor;

	constructor(executor: ProviderActionExecutor) {
		this.executor = executor;
	}

	public async fetchMe(): Promise<KerberoSecAccountUser> {
		return this.request<KerberoSecAccountUser>({
			action: "kerberosecAccount",
			operation: "fetchMe",
		});
	}

	public async fetchBalance(
		userId?: string,
	): Promise<KerberoSecAccountBalance> {
		return this.request<KerberoSecAccountBalance>({
			action: "kerberosecAccount",
			operation: "fetchBalance",
			...(userId?.trim() ? { userId: userId.trim() } : {}),
		});
	}

	public async fetchUsageTransactions(
		userId?: string,
	): Promise<KerberoSecAccountUsageTransaction[]> {
		return this.request<KerberoSecAccountUsageTransaction[]>({
			action: "kerberosecAccount",
			operation: "fetchUsageTransactions",
			...(userId?.trim() ? { userId: userId.trim() } : {}),
		});
	}

	public async fetchPaymentTransactions(
		userId?: string,
	): Promise<KerberoSecAccountPaymentTransaction[]> {
		return this.request<KerberoSecAccountPaymentTransaction[]>({
			action: "kerberosecAccount",
			operation: "fetchPaymentTransactions",
			...(userId?.trim() ? { userId: userId.trim() } : {}),
		});
	}

	public async fetchUserOrganizations(): Promise<
		KerberoSecAccountOrganization[]
	> {
		return this.request<KerberoSecAccountOrganization[]>({
			action: "kerberosecAccount",
			operation: "fetchUserOrganizations",
		});
	}

	public async fetchOrganizationBalance(
		organizationId: string,
	): Promise<KerberoSecAccountOrganizationBalance> {
		const orgId = organizationId.trim();
		if (!orgId) {
			throw new Error("organizationId is required");
		}
		return this.request<KerberoSecAccountOrganizationBalance>({
			action: "kerberosecAccount",
			operation: "fetchOrganizationBalance",
			organizationId: orgId,
		});
	}

	public async fetchOrganizationUsageTransactions(input: {
		organizationId: string;
		memberId?: string;
	}): Promise<KerberoSecAccountOrganizationUsageTransaction[]> {
		const orgId = input.organizationId.trim();
		if (!orgId) {
			throw new Error("organizationId is required");
		}
		return this.request<KerberoSecAccountOrganizationUsageTransaction[]>({
			action: "kerberosecAccount",
			operation: "fetchOrganizationUsageTransactions",
			organizationId: orgId,
			...(input.memberId?.trim() ? { memberId: input.memberId.trim() } : {}),
		});
	}

	public async switchAccount(organizationId?: string | null): Promise<void> {
		await this.request<{ updated: boolean }>({
			action: "kerberosecAccount",
			operation: "switchAccount",
			organizationId: organizationId?.trim() || null,
		});
	}

	public async fetchFeaturebaseToken(): Promise<
		FeaturebaseTokenResponse | undefined
	> {
		return this.request<FeaturebaseTokenResponse | undefined>({
			action: "kerberosecAccount",
			operation: "fetchFeaturebaseToken",
		});
	}

	private async request<T>(
		request: KerberoSecAccountActionRequest,
	): Promise<T> {
		const response = await this.executor.runProviderAction(request);
		return response.result as T;
	}
}
