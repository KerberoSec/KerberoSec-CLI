# 🏨 Hacker Holidays Day 14: Management Wants a Word

<p align="center">
  <img src="https://img.shields.io/badge/Platform-TryHackMe-red?style=for-the-badge&logo=tryhackme">
  <img src="https://img.shields.io/badge/Difficulty-Hard-critical?style=for-the-badge">
  <img src="https://img.shields.io/badge/Category-Forensics-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/Focus-Windows%20DFIR-purple?style=for-the-badge">
  <img src="https://img.shields.io/badge/Chrome%20DPAPI-Analysis-orange?style=for-the-badge">
</p>

---

## 🛎️ Concierge Briefing

Housekeeping discovered a guest's laptop left behind following an early checkout.

The machine belonged to **Vera**, and IT performed a full triage before the system was prepared for the next guest.

The objective is to reconstruct the trail left across Vera's system, identify the credentials hidden within browser artefacts, recover access to a protected container, and ultimately locate the flag.

> **Room:** `Hacker Holidays Day 14: Management Wants a Word`
> **Difficulty:** Hard
> **Category:** Forensics

🔗 **TryHackMe Room:**
https://tryhackme.com/room/hh-theguestbook-0130ffaf

---

# 📊 Challenge Information

| Attribute            | Details                                          |
| -------------------- | ------------------------------------------------ |
| 🏴 Platform          | TryHackMe                                        |
| 🎯 Challenge         | Hacker Holidays Day 14: Management Wants a Word |
| 🔥 Difficulty        | Hard                                             |
| 🧩 Category          | Forensics                                        |
| 🖥️ Target           | Windows workstation                              |
| 🔍 Primary Artefacts | Chrome, DPAPI, SAM, LSA Secrets                  |
| 🔐 Final Objective   | Recover the protected data and flag              |

---

# 🗺️ Investigation Objectives

The investigation can be divided into three major objectives:

1. 🔎 **Identify useful forensic artefacts**
2. 🔐 **Recover Vera's browser credentials**
3. 📦 **Use the recovered credential to access the protected container**

The investigation follows this chain:

```text
Windows User Profile
        │
        ▼
Chrome Artefacts
        │
        ├── Login Data
        └── Local State
                │
                ▼
        DPAPI-Protected AES Key
                │
                ▼
        Windows DPAPI Master Key
                │
                ▼
        SAM / SYSTEM / SECURITY
                │
                ▼
        DPAPI Decryption Material
                │
                ▼
        Chrome AES Key
                │
                ▼
        Encrypted Chrome Credential
                │
                ▼
        VeraSecretVault Credentials
                │
                ▼
        Protected Backup Container
                │
                ▼
        Read-Only Mount
                │
                ▼
        Financial Documents
                │
                ▼
             🚩 FLAG
```

---

# 🔎 Phase 1: Locate Browser Artefacts

The first step is to identify browser databases belonging to Vera.

Chrome stores several different types of information in separate files. Searching for these artefacts gives us a fast way of establishing what information may be recoverable.

```bash
find C/Users/vera -type f \
\( -iname 'Login Data' \
-o -iname 'Local State' \
-o -iname 'Web Data' \
-o -iname 'History' \) -print
```

### 🧠 Command Breakdown

| Component      | Purpose                                     |
| -------------- | ------------------------------------------- |
| `find`         | Recursively searches the filesystem         |
| `C/Users/vera` | Limits the search to Vera's profile         |
| `-type f`      | Restricts results to regular files          |
| `-iname`       | Performs case-insensitive filename matching |
| `-o`           | Logical OR between filename conditions      |
| `-print`       | Displays matching paths                     |

The search specifically targets four Chrome artefacts:

### `History`

Contains browser activity and searches.

### `Login Data`

Chrome's SQLite database containing saved login metadata and encrypted credentials.

### `Web Data`

Contains browser data such as autofill information.

### `Local State`

Contains Chrome configuration information, including the encrypted key material used to protect stored credentials.

These artefacts provide the initial path into the credential-recovery process.

---

# 🔐 Phase 2: Examine Chrome's Login Database

The `Login Data` file is a SQLite database.

We can inspect it directly using SQLite:

```bash
sqlite3 'C/Users/vera/AppData/Local/Google/Chrome For Testing/User Data/Default/Login Data'
```

Enable readable output:

```sql
.headers on
.mode column
```

Then query the `logins` table:

```sql
SELECT
    origin_url,
    action_url,
    username_value,
    hex(password_value) AS encrypted_password
FROM logins;
```

### 🧠 What Does This Query Extract?

The query retrieves:

* `origin_url`: website associated with the credential
* `action_url`: login endpoint
* `username_value`: stored username
* `password_value`: encrypted password blob

Converting `password_value` using `hex()` is particularly useful during forensic analysis because the encrypted binary data becomes visible as a hexadecimal representation.

The recovered entry is:

```text
URL:
http://bytelotus.thm:8080/

Username:
VeraSecretVault

Encrypted Password:
763130C88A72A64F35F63E883EA0A7F64A6870E46B0BBB469A756EDA88B7E324C3E1C51015AA6FD8D65AC48961E1EA324CE1707807FEB3D7
```

At this stage, the password itself is **not directly available**.

The important observation is that Chrome has stored an encrypted credential, meaning the next step is to recover the key material required to decrypt it.

---

# 🧬 Phase 3: Locate Vera's Windows DPAPI Master Key

Windows **Data Protection API (DPAPI)** is used to protect sensitive information associated with Windows users and systems.

Chrome's stored secrets ultimately depend on this Windows protection mechanism.

The next step is therefore to locate Vera's DPAPI master-key material:

```bash
find C/Users/vera/AppData/Roaming/Microsoft/Protect/ \
-type f -printf '%f %p\n'
```

The investigation identifies:

```text
SID:
S-1-5-21-2529683458-431225740-1723070931-1000
```

And the master-key GUID:

```text
c90719ef-5b98-474e-b934-136d606a702a
```

The relevant path is:

```text
C/Users/vera/AppData/Roaming/Microsoft/Protect/
└── S-1-5-21-2529683458-431225740-1723070931-1000/
    ├── c90719ef-5b98-474e-b934-136d606a702a
    └── Preferred
```

### 🔬 Why Is the SID Important?

The DPAPI master keys are stored underneath the Windows user's SID.

Therefore, identifying:

```text
S-1-5-21-2529683458-431225740-1723070931-1000
```

allows us to associate the DPAPI material with Vera's Windows account.

---

# 🧱 Phase 4: Extract Windows Registry Secrets

The investigation then moves to the Windows registry hives:

```text
SAM
SYSTEM
SECURITY
```

These hives contain information required to recover Windows authentication and secret material.

Using Impacket:

```bash
impacket-secretsdump \
-sam C/Windows/System32/config/SAM \
-system C/Windows/System32/config/SYSTEM \
-security C/Windows/System32/config/SECURITY \
LOCAL
```

### 🧠 Why These Three Hives?

| Hive       | Relevance                                                           |
| ---------- | ------------------------------------------------------------------- |
| `SAM`      | Local Windows account password hashes                               |
| `SYSTEM`   | Contains system-level information required during secret extraction |
| `SECURITY` | Contains LSA secrets and related security material                  |

The output provides the system boot key:

```text
Target system bootKey:
0x0f6f73ce89c8cda52d06fcc5131e040f
```

The local SAM accounts include Vera:

```text
vera:1000:aad3b435b51404eeaad3b435b51404eeaa...
```

More importantly, the extraction reveals LSA secret material:

```text
[*] Dumping LSA Secrets

[*] DefaultPassword
(Unknown User):minivera

[*] DPAPI_SYSTEM
dpapi_machinekey:0x875427f6426f5dc4e318d1e6cfed17291295e4f7
dpapi_userkey:0xb0536fa518944b2520b5a5b9f5b513e3892224a1
```

The relevant recovered value is:

```text
Default Password:
minivera
```

The DPAPI-related values are also exposed:

```text
dpapi_machinekey:
0x875427f6426f5dc4e318d1e6cfed17291295e4f7

dpapi_userkey:
0xb0536fa518944b2520b5a5b9f5b513e3892224a1
```

This provides the additional Windows security material required by the investigation.

---

# 🔑 Phase 5: Extract Chrome's DPAPI-Protected Key

Chrome's `Local State` file contains the encrypted key used to protect browser credentials.

Rather than manually specifying the complete path, the following shell logic locates it automatically:

```bash
LOCAL_STATE="$(find "$PWD/C/Users/vera/" \
-type f -iname 'Local State' -print -quit)"

printf '%s\n' "$LOCAL_STATE"
```

The resulting path is:

```text
/home/kali/Documents/tryhackme/management-wants-a-word-forensics-hh-day-14/KAPE/C/Users/vera/AppData/Local/Google/Chrome For Testing/User Data/Local State
```

We can then extract the `encrypted_key` value from the JSON structure:

```bash
jq -r '.os_crypt.encrypted_key' "$LOCAL_STATE" | base64 -d | xxd
```

The decoded data begins with:

```text
4450 4150 4901 0000 ...
```

This is significant because the encrypted key is wrapped using Windows DPAPI.

---

# ✂️ Phase 6: Remove the DPAPI Prefix

The Chrome key contains a five-byte prefix before the DPAPI blob.

The following command strips those bytes:

```bash
jq -r '.os_crypt.encrypted_key' "$LOCAL_STATE" \
| base64 -d \
| tail -c +6 > chrome-key.dpapi
```

The resulting file:

```text
chrome-key.dpapi
```

contains the DPAPI blob that can be passed to the decryption routine.

---

# 🐍 Phase 7: Decrypt the Chrome AES Key

The next stage uses Python and Impacket's DPAPI implementation.

```python
import sys
from impacket.dpapi import DPAPI_BLOB

masterkey = bytes.fromhex(sys.argv[1])
print(masterkey)

with open("chrome-key.dpapi", "rb") as f:
    blob = DPAPI_BLOB(f.read())

decrypted = blob.decrypt(masterkey)

print(decrypted)

if decrypted is None:
    raise SystemExit("DPAPI decryption failed")

with open("chrome-aes.key", "wb") as f:
    f.write(decrypted)

print(f"Wrote {len(decrypted)} bytes")
print(f"Chrome AES Key: {decrypted.hex()}")
```

### 🧠 Code Analysis

#### 1. Import the DPAPI implementation

```python
from impacket.dpapi import DPAPI_BLOB
```

`DPAPI_BLOB` provides functionality for parsing and decrypting a Windows DPAPI-protected blob.

#### 2. Convert the supplied master key

```python
masterkey = bytes.fromhex(sys.argv[1])
```

The master key is supplied as hexadecimal text and converted into raw bytes.

#### 3. Read the DPAPI blob

```python
with open("chrome-key.dpapi", "rb") as f:
    blob = DPAPI_BLOB(f.read())
```

The previously extracted Chrome DPAPI data is parsed into an Impacket DPAPI object.

#### 4. Decrypt the blob

```python
decrypted = blob.decrypt(masterkey)
```

The recovered master-key material is used to decrypt the Chrome key.

#### 5. Validate the result

```python
if decrypted is None:
    raise SystemExit("DPAPI decryption failed")
```

This prevents the script from silently continuing if DPAPI decryption fails.

#### 6. Save the recovered key

```python
with open("chrome-aes.key","wb") as f:
    f.write(decrypted)
```

The resulting key is written to:

```text
chrome-aes.key
```

The recovered Chrome AES key is:

```text
206a39a0971327ea9487e4aea9844f5d3670162456982276939a712646da0b02
```

---

# 📏 Phase 8: Validate the AES Key

The recovered key is expected to be 32 bytes.

Verify it:

```bash
wc -c chrome-aes.key
```

Output:

```text
32 chrome-aes.key
```

This confirms that the recovered key has the expected 32-byte length.

---

# 🔓 Phase 9: Decrypt Chrome's Saved Credential

The `Login Data` database is located dynamically:

```bash
LOGIN_DATA="$(find "$PWD/C/Users/vera/" \
-type f -iname 'Login Data' -print -quit)"

printf '%s\n' "$LOGIN_DATA"
```

Verify the database:

```bash
file "$LOGIN_DATA"
```

The file is identified as:

```text
SQLite 3.x database
```

This confirms that the browser credential store can be queried directly using SQLite-compatible tooling.

---

## 🐍 AES-GCM Decryption Script

The encrypted Chrome credential is decrypted using the recovered AES key.

```python
import sqlite3
import sys
from pathlib import Path
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

database = Path(sys.argv[1]).resolve()
keyfile = Path(sys.argv[2]).resolve()

if not database.is_file():
    raise SystemExit(f"Missing database : {database}")

key = keyfile.read_bytes()

if len(key) != 32:
    raise SystemExit(f"Unexpected AES Key length: {len(key)}")

db = sqlite3.connect(database.as_uri() + "?mode=ro", uri=True)

for url, username, encrypted in db.execute("""
    SELECT origin_url, username_value, password_value
    FROM logins
"""):
    blob = bytes(encrypted)

    if not blob.startswith((b"v10", b"v11")):
        print(f"Unsupported format: {blob[:10]!r}")
        continue

    nonce = blob[3:15]
    ciphertext_and_tag = blob[15:]

    password = AESGCM(key).decrypt(
        nonce,
        ciphertext_and_tag,
        None
    ).decode("utf-8", errors="replace")

    print(f"URL:      {url}")
    print(f"Username: {username}")
    print(f"Password: {password}")
```

---

# 🧠 Understanding the Decryption Logic

### 1. Open the SQLite database read-only

```python
db = sqlite3.connect(
    database.as_uri() + "?mode=ro",
    uri=True
)
```

The database is opened in **read-only mode**, which is appropriate for forensic analysis because it avoids modifying the evidence.

### 2. Retrieve stored credentials

```sql
SELECT origin_url, username_value, password_value
FROM logins
```

This extracts the website, username, and encrypted password blob.

### 3. Check the Chrome credential version

```python
if not blob.startswith((b"v10", b"v11")):
```

The script expects the encrypted credential to use Chrome's `v10` or `v11` format.

### 4. Extract the nonce

```python
nonce = blob[3:15]
```

The first three bytes identify the credential format.

The following 12 bytes are extracted as the AES-GCM nonce.

### 5. Extract ciphertext and authentication tag

```python
ciphertext_and_tag = blob[15:]
```

Everything after the version and nonce is supplied to AES-GCM for authenticated decryption.

### 6. Perform AES-GCM decryption

```python
password = AESGCM(key).decrypt(
    nonce,
    ciphertext_and_tag,
    None
)
```

The previously recovered 32-byte Chrome AES key is used to decrypt the credential.

---

# 🎯 Recovered Credential

The decryption succeeds:

```text
URL:      http://bytelotus.thm:8080/
Username: VeraSecretVault
Password: Wh4t1sV3raD0inG0nTh1sH0st
```

This is the critical pivot point in the investigation.

The browser artefact has now yielded a credential that can be used to access the next protected resource.

---

# 📦 Phase 10: Access the VeraCrypt Container

The next artefact is a VeraCrypt container:

```text
C/Users/vera/Documents/backup
```

The investigation notes that VeraCrypt itself is not required because Linux `cryptsetup` can handle the container.

Open it using:

```bash
sudo cryptsetup tcryptOpen \
--veracrypt \
'C/Users/vera/Documents/backup' \
vera_backup
```

The command prompts for the container passphrase.

The recovered credential from the Chrome database provides the required password.

---

# 👁️ Phase 11: Mount the Container Read-Only

Forensic analysis should avoid unnecessary modification of recovered evidence.

The decrypted volume is therefore mounted read-only:

```bash
sudo mkdir -p /mnt/vera
```

Then:

```bash
sudo mount -o ro /dev/mapper/vera_backup /mnt/vera
```

### 🔬 Why `-o ro`?

The `ro` mount option means **read-only**.

This is important from a forensic perspective because the investigator is examining the contents without intentionally writing changes back to the mounted filesystem.

---

# 📂 Phase 12: Enumerate the Recovered Files

List the mounted volume:

```bash
ls /mnt/vera
```

Output:

```text
$RECYCLE.BIN
secret_financial_documents
System Volume Information
```

The interesting directory is:

```text
secret_financial_documents
```

Inspecting it reveals:

```bash
ls /mnt/vera/secret_financial_documents
```

The recovered files are:

```text
important_invoice_byte_lotus.pdf
transactions_q3.csv
```

---

# 🚩 Final Artefact

The investigation identifies:

```text
important_invoice_byte_lotus.pdf
```

as the document containing the flag for the challenge.

```text
/mnt/vera/
└── secret_financial_documents/
    ├── important_invoice_byte_lotus.pdf   🚩
    └── transactions_q3.csv
```

The PDF is therefore the final artefact in the investigation chain.

---

# 🧩 Complete Attack / Investigation Flow

```text
┌─────────────────────────────┐
│ Windows Forensic Image      │
│ Vera's User Profile        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Locate Chrome Artefacts     │
│                             │
│ History                     │
│ Login Data                  │
│ Web Data                    │
│ Local State                 │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ SQLite Login Database       │
│                             │
│ Username recovered          │
│ Password remains encrypted  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Windows DPAPI               │
│                             │
│ Locate user's SID           │
│ Locate Master-Key GUID      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ SAM / SYSTEM / SECURITY     │
│                             │
│ secretsdump                 │
│                             │
│ DPAPI material recovered    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Chrome Local State          │
│                             │
│ encrypted_key               │
│       ↓                     │
│ Base64 decode               │
│       ↓                     │
│ Remove prefix               │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ DPAPI Decryption            │
│                             │
│ chrome-key.dpapi            │
│       +                     │
│ DPAPI Master Key            │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Chrome AES Key              │
│                             │
│ 32-byte key recovered       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Login Data                  │
│                             │
│ v10/v11 credential          │
│       ↓                     │
│ AES-GCM decryption          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ VeraSecretVault Credential  │
│                             │
│ bytelotus.thm:8080          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ VeraCrypt Backup Container  │
│                             │
│ cryptsetup tcryptOpen       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Read-Only Mount             │
│                             │
│ /mnt/vera                   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ secret_financial_documents  │
│                             │
│ invoice PDF                 │
│ transactions CSV            │
└──────────────┬──────────────┘
               │
               ▼
             🚩 FLAG
```

---

# 🧠 Key Technical Takeaways

### 🔹 1. Browser artefacts can expose authentication material

Chrome's `Login Data` database contains valuable forensic evidence, but modern Chrome does not simply store passwords as plaintext.

The investigation therefore requires understanding the relationship between:

```text
Login Data
      ↓
Local State
      ↓
DPAPI
      ↓
Chrome AES Key
      ↓
AES-GCM
      ↓
Stored Credential
```

### 🔹 2. Windows DPAPI is central to credential protection

The investigation demonstrates why Windows DPAPI artefacts are important during offline forensic analysis.

The DPAPI master-key material and Windows security hives become critical when attempting to recover protected application secrets.

### 🔹 3. SQLite is a valuable forensic source

Chrome's credential store can be queried directly:

```sql
SELECT origin_url,
       username_value,
       password_value
FROM logins;
```

This allows the investigator to separate credential metadata from the encrypted secret.

### 🔹 4. AES-GCM requires more than just the key

The Chrome credential is not simply:

```text
AES(key, password)
```

The script explicitly extracts:

```python
nonce = blob[3:15]
ciphertext_and_tag = blob[15:]
```

before passing those values to `AESGCM.decrypt()`.

This demonstrates that understanding the **storage format** is just as important as obtaining the encryption key.

### 🔹 5. Evidence handling matters

The recovered container was mounted using:

```bash
mount -o ro
```

rather than a normal read/write mount.

Forensic workflows should minimise unnecessary modification of recovered evidence.

---

# 🏁 Conclusion

This challenge demonstrates a complete forensic credential-recovery chain across multiple Windows and application-level artefacts.

The investigation begins with a seemingly ordinary Chrome profile and progressively moves through:

```text
Chrome Artefacts
      ↓
SQLite
      ↓
Windows DPAPI
      ↓
SAM / SYSTEM / SECURITY
      ↓
Chrome AES Key
      ↓
AES-GCM Credential
      ↓
Protected Container
      ↓
Financial Documents
      ↓
Flag
```

The key lesson is that individual artefacts rarely tell the entire story.

The real investigative value comes from **correlating multiple artefacts and understanding how one protection layer feeds into the next**.

In this case, the Chrome credential database provided the encrypted secret, `Local State` provided the DPAPI-protected key material, Windows security artefacts supplied the necessary decryption context, and the recovered credential ultimately unlocked the protected backup container containing the final flag-bearing document.

---

## 🛠️ Tools Used

| Tool                   | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `find`                 | Locate forensic artefacts                     |
| `sqlite3`              | Query Chrome's credential database            |
| `jq`                   | Extract JSON key material                     |
| `xxd`                  | Inspect binary data                           |
| `base64`               | Decode Chrome's encoded key                   |
| `impacket-secretsdump` | Extract Windows SAM/LSA/DPAPI-related secrets |
| Python                 | Automate DPAPI and credential decryption      |
| `Impacket DPAPI_BLOB`  | Parse/decrypt DPAPI data                      |
| `cryptography.AESGCM`  | Decrypt Chrome credentials                    |
| `file`                 | Identify database/file formats                |
| `cryptsetup`           | Open the VeraCrypt container                  |
| `mount`                | Mount the recovered filesystem read-only      |

---

## 🎓 Skills Demonstrated

* 🕵️ Windows Digital Forensics
* 🔎 Forensic Artefact Discovery
* 🌐 Browser Artefact Analysis
* 🗄️ SQLite Database Analysis
* 🔐 Windows DPAPI Analysis
* 🧬 Master-Key Identification
* 🧱 SAM / SYSTEM / SECURITY Hive Analysis
* 🔑 Credential Recovery
* 🐍 Python Security Automation
* 🔒 AES-GCM Decryption
* 📦 VeraCrypt Container Analysis
* 🧪 Read-Only Evidence Handling
* 🔗 Multi-stage Forensic Correlation
* 🚩 CTF Investigation Methodology

---

> **⚠️ Disclaimer:** This write-up is intended for authorised security research, digital forensics training, and CTF/educational environments such as TryHackMe. The techniques demonstrated should only be applied to systems and data for which you have explicit authorisation.
