enum KERBEROSEC_API_AUTH_ENDPOINTS {
	AUTH = "/api/v1/auth/authorize",
	REFRESH_TOKEN = "/api/v1/auth/refresh",
}

enum KERBEROSEC_API_ENDPOINT_V1 {
	TOKEN_EXCHANGE = "/api/v1/auth/token",
	USER_INFO = "/api/v1/users/me",
	FEATUREBASE_TOKEN = "/api/v1/users/me/featurebase-token",
	ACTIVE_ACCOUNT = "/api/v1/users/active-account",
	USER_REMOTE_CONFIG = "/api/v1/users/me/remote-config",
	REMOTE_CONFIG = "/api/v1/organizations/{id}/remote-config",
	API_KEYS = "/api/v1/organizations/{id}/api-keys",
}

export const KERBEROSEC_API_ENDPOINT = {
	...KERBEROSEC_API_AUTH_ENDPOINTS,
	...KERBEROSEC_API_ENDPOINT_V1,
}
