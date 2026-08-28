export function isKerberoSecProvider(providerId: string): boolean {
	return providerId === "kerberosec" || providerId === "kerberosec-pass";
}
