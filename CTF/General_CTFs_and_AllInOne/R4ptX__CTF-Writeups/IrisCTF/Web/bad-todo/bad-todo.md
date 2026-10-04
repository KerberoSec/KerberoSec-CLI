## Challenge Description

This challenge involved exploiting a vulnerability in a custom-built To-Do list application that relies on OpenID Connect (OIDC) for authentication. After the admin's tasks were deleted during a hack, an older backup of their account remained. The objective was to recover this backup and obtain the flag.

---

## Steps Overview

1. Create a basic OIDC provider.
2. Verify the application's login functionality.
3. Exploit the insecure handling of the `sub` field.
4. Access the admin's database to retrieve the flag.
5. Alternatively, configure Keycloak for exploitation.

---

## About Safe-Fetch

The application uses a custom wrapper called `safe_fetch` to enforce strict URL validation:
- Ensures domains are valid.
- Blocks private IP ranges.
- Requires HTTPS.

This setup reduces the likelihood of SSRF attacks and reflects a more secure implementation.

---

## Simplified OIDC in the Challenge

The OIDC implementation in this challenge is minimal, requiring only these endpoints:
- `issuer`
- `authorization_endpoint`
- `token_endpoint`
- `userinfo_endpoint`

### OIDC Flow
1. The app redirects to the `authorization_endpoint` with the following parameters:
   - `client_id`: OIDC client ID
   - `redirect_uri`: Challenge base URL with `/auth_redirect`
   - `scope=openid`: Requests basic permissions
   - `response_type=code`
   - `state`: A unique session-specific value for CSRF protection

2. Upon user redirection to `/auth_redirect`, the app receives a `code` and `state`.
3. The `code` is exchanged at the `token_endpoint` for an `access_token`.
4. The `userinfo_endpoint` uses the `access_token` to retrieve user data, including the `sub` field.
5. The app identifies the user based on the `sub` value and grants access.

---

## The Vulnerability

The challenge revealed flaws in path validation and file handling, which could be exploited for local file disclosure (LFD). By setting up a custom OIDC provider, it was possible to manipulate authentication responses and craft a `sub` parameter (`..flag`) to access sensitive files via the `/todos` endpoint.

### Key Issues:

1. **Path Validation Weakness**:
   - The `sanitizePath` function restricts paths to the `STORAGE_LOCATION` directory but does not enforce user-specific subdirectory access.

2. **Improper File Naming**:
   - The `getStoragePath` function uses `encodeURIComponent` for sanitization but allows crafted `sub` values to perform directory traversal.

These issues allowed the `sub` value `..flag` to bypass restrictions and access the admin's backup database.

---

## Exploitation Methods

### Approach 1: Custom OIDC Provider

1. **Set Up a Basic OIDC Provider**:
   - Create a lightweight HTTP server hosting the required endpoints in the `/.well-known/openid-configuration`:
     ```json
     {
         "issuer": "https://your-oidc-provider.com",
         "authorization_endpoint": "https://your-oidc-provider.com/auth",
         "token_endpoint": "https://your-oidc-provider.com/token",
         "userinfo_endpoint": "https://your-oidc-provider.com/userinfo"
     }
     ```

2. **Verify Login**:
   - Log in to the To-Do app using the custom provider.
   - Ensure the session cookie is set after successful authentication.

3. **Exploit the Vulnerability**:
   - Modify the `sub` field in the `userinfo_endpoint` response to `..flag`:
     ```json
     {
         "sub": "..flag"
     }
     ```
   - This grants access to the admin's database.

4. **Retrieve the Flag**:
   - Log in as the admin.
   - Navigate to the To-Do list to view the flag.

### Approach 2: Keycloak Configuration

1. **Deploy Keycloak**:
   - Install and run Keycloak on a local machine or server.
   - Set up a new realm and client for this challenge.

2. **Adjust Client Settings**:
   - In the Keycloak admin panel, set the redirect URI to `http://challenge-url/auth_redirect`.
   - Configure endpoints to mimic those expected by the application.

3. **Manipulate the `sub` Field**:
   - Log in via Keycloak, intercept the `userinfo_endpoint` response, and set `sub` to `..flag`.

4. **Access the Backup Database**:
   - Use the modified `sub` to authenticate as the admin.
   - Retrieve the flag by accessing the `/todos` endpoint.

---

## The Flag

The admin's To-Do list contained the flag:
```
irisctf{per_tenant_databases_are_a_cool_concept_indeed}
```
