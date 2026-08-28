import type { KerberoSecCore } from "@kerberosec/core";
import type { MessageWithMetadata } from "@kerberosec/shared";

export async function loadInteractiveResumeMessages(
	sessionManager: KerberoSecCore,
	resumeSessionId?: string,
): Promise<MessageWithMetadata[] | undefined> {
	const target = resumeSessionId?.trim();
	if (!target) {
		return undefined;
	}
	return await sessionManager.readMessages(target);
}
