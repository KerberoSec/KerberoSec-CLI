---
title: "TryHackMe: Linux Fundamentals Part 3"
date: 2026-02-02
tags: [cyber-security-101, tryhackme, walkthrough,]
difficulty: Easy
description: "Power-up your Linux skills and get hands-on with some common utilities that you are likely to use day-to-day!"
---

## Answers

Edit "task3" located in "tryhackme"'s home directory using Nano. What is the flag?

**THM{TEXT_EDITORS}**

Download the file http://MACHINE_IP:8000/.flag.txt onto the TryHackMe AttackBox. Remember, you will need to do this in a new terminal.
What are the contents?

**THM{WGET_WEBSERVER}**

If we were to launch a process where the previous ID was "300", what would the ID of this new process be?

**301**

If we wanted to cleanly kill a process, what signal would we send it?

**SIGTERM**

Locate the process that is running on the deployed instance (MACHINE_IP). What flag is given?

**THM{PROCESSES}**

What command would we use to stop the service "myservice"?

**systemctl stop myservice**

What command would we use to start the same service on the boot-up of the system?

**systemctl enable myservice**

What command would we use to bring a previously backgrounded process back to the foreground?

**fg**

When will the crontab on the deployed instance (MACHINE_IP) run?

**@reboot**

What is the IP address of the user who visited the site?

**10.9.232.111**

What file did they access?

**catsanddogs.jpg**

## Things You Should Know

### **1. Terminal Text Editors**

#### **Nano**

* Beginner‑friendly command‑line text editor.
* Create or edit files:

  ```bash
  nano filename
  ```
* Important shortcuts:

  * **Ctrl + X** → Exit
  * **Ctrl + O** → Save
  * **Ctrl + W** → Search
  * **Ctrl + K / Ctrl + U** → Cut / Paste
  * **Ctrl + _** → Go to line
* Best for quick edits and configuration files.

#### **VIM**

* Advanced and powerful editor with a steeper learning curve.
* Features:

  * Custom keyboard shortcuts
  * Syntax highlighting (great for coding)
  * Available on most Linux systems
* Preferred by developers and advanced users.

---

### **2. General / Useful Utilities (File Transfer & Sharing)**

#### **wget: Download Files**

* Downloads files from the web using HTTP/HTTPS.

```bash
wget https://example.com/file.txt
```

* Common in servers and labs where no browser is available.

#### **scp: Secure Copy (SSH)**

* Transfers files securely between two machines.
* **Local → Remote**

```bash
scp file.txt user@ip:/path/file.txt
```

* **Remote → Local**

```bash
scp user@ip:/path/file.txt local.txt
```

#### **Python HTTP Server: Share Files**

* Quickly turn your machine into a simple web server:

```bash
python3 -m http.server
```

* Files are served from the current directory on **port 8000**.
* Other machines can download using `wget`.
* Stops with **Ctrl + C**.
* Limitation: no automatic directory indexing.

---

### **3. Processes 101**

#### **Understanding Processes**

* A **process** = running program.
* Each has a **PID (Process ID)** assigned sequentially.
* Managed by the kernel.

#### **Viewing Processes**

* `ps` → current session processes.
* `ps aux` → all processes on system.
* `top` → real‑time CPU and memory usage.

#### **Managing Processes**

* Stop processes with signals:

  * **SIGTERM** → clean shutdown.
  * **SIGKILL** → immediate kill.
  * **SIGSTOP** → pause.

```bash
kill PID
```

#### **systemd & Namespaces**

* `systemd` is one of the first processes started at boot.
* Controls services and child processes.
* Namespaces isolate resources for security and stability.

#### **Services with systemctl**

```bash
systemctl start service
systemctl stop service
systemctl enable service
systemctl disable service
systemctl status service
```

#### **Foreground vs Background**

* Run in background with `&`.
* Pause with **Ctrl + Z**.
* Bring back with:

```bash
fg
```

---

### **4. Automation: Cron Jobs**

#### **Cron & Crontabs**

* Used to **schedule automatic tasks**.
* Edited with:

```bash
crontab -e
```

* Format (6 fields):

```
MIN HOUR DOM MON DOW CMD
```

Example: backup every 12 hours:

```
0 */12 * * * cp -R /home/user/Documents /var/backups/
```

* `*` acts as a wildcard.
* Special keyword: `@reboot` runs tasks when the system starts.

---

### **5. Package Management (APT)**

#### **Repositories**

* Software comes from **APT repositories**.
* You can add third‑party or community repos.

#### **Key Commands**

```bash
apt update
apt install package
apt remove package
```

#### **Adding Repositories**

* Use `add-apt-repository` or manually add files in:

```
/etc/apt/sources.list.d/
```

* **GPG Keys** verify software authenticity and security.

---

### **6. System Logs**

#### **Log Location**

* Stored in:

```
/var/log
```

#### **Purpose**

* Monitor system health.
* Troubleshoot errors.
* Detect intrusions or suspicious activity.

#### **Common Logs**

* **Apache2** → web requests.
* **Fail2ban** → brute‑force protection.
* **UFW** → firewall activity.
* **Access logs** → who accessed what.
* **Error logs** → service/application issues.
* **Authentication logs** → login attempts.

Logs are automatically managed through **log rotation**, preventing them from growing too large.

---

### **Overall Key Takeaways**

Linux Fundamentals Part 3 teaches how to:

* Edit files efficiently (**Nano & VIM**)
* Transfer and share files (**wget, scp, HTTP server**)
* View and control running programs (**ps, top, kill, systemctl**)
* Run tasks automatically (**cron jobs**)
* Install and manage software securely (**APT & repositories**)
* Monitor and investigate system activity (**logs**)
