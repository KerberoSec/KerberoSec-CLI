import type { EmptyRequest } from "@shared/proto/kerberosec/common"
import type { MarketplaceLocalInstalledEntries } from "@shared/proto/kerberosec/marketplace"
import type { Controller } from "../index"
import { listLocalMarketplaceInstalledEntries } from "./marketplace-helpers"

export async function listMarketplaceLocalInstalledEntries(
	controller: Controller,
	_request: EmptyRequest,
): Promise<MarketplaceLocalInstalledEntries> {
	return listLocalMarketplaceInstalledEntries(controller)
}
