export function isKerberoSecManagedProvider(provider: string | undefined) {
	return provider === "kerberosec" || provider === "kerberosec-pass"
}
