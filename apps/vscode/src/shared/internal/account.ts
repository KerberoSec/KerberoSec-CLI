/**
 * List of email domains that are considered trusted testers for KerberoSec.
 */
const KERBEROSEC_TRUSTED_TESTER_DOMAINS = ["fibilabs.tech"]

/**
 * Checks if the given email belongs to a Cline bot user.
 * E.g. Emails ending with @cline.bot
 */
function isKerberoSecBotUser(email: string): boolean {
	return email.endsWith("@cline.bot")
}

export function isKerberoSecInternalTester(email: string): boolean {
	return isKerberoSecBotUser(email) || KERBEROSEC_TRUSTED_TESTER_DOMAINS.some((d) => email.endsWith(`@${d}`))
}
