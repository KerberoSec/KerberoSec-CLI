/**
 * List of email domains that are considered trusted testers for KerberoSec.
 */
const KERBEROSEC_TRUSTED_TESTER_DOMAINS = ["fibilabs.tech"]

/**
 * Checks if the given email belongs to a KerberoSec bot user.
 * E.g. Emails ending with @kerberosec.bot
 */
function isKerberoSecBotUser(email: string): boolean {
	return email.endsWith("@kerberosec.bot")
}

export function isKerberoSecInternalTester(email: string): boolean {
	return isKerberoSecBotUser(email) || KERBEROSEC_TRUSTED_TESTER_DOMAINS.some((d) => email.endsWith(`@${d}`))
}
