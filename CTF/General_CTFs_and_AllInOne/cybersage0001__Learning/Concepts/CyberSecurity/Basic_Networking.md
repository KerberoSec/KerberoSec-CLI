### Networking Concepts for Cybersecurity

## 1. OSI Model: Attack Mapping
LayerNameAttack Examples7ApplicationSQLi, XSS, phishing4TransportSYN flood, port scanning3NetworkIP spoofing, routing attacks2Data LinkARP spoofing, MAC flooding

## 2. IP Addressing
Private ranges (non-routable):
10.0.0.0/8
172.16.0.0/12
192.168.0.0/16
127.0.0.0/8  (loopback)

## 3. TCP Handshake
Client → SYN       → Server
Client ← SYN-ACK   ← Server
Client → ACK       → Server

SYN Flood: Send many SYNs without completing: exhausts server resources.

## 4. Key Protocols & Attacks
ProtocolAttackARPARP Spoofing → MITMDNSCache Poisoning, Tunneling, Amplification DDoSICMPPing flood, Smurf attackTCPSYN flood, session hijacking

## 5. TLS Versions
VersionStatusSSL 2/3, TLS 1.0/1.1❌ Broken/DeprecatedTLS 1.2⚠️ AcceptableTLS 1.3✅ Use this

## 6. Wi-Fi Security
ProtocolStatusWEP❌ BrokenWPA / WPA2-Personal⚠️ WeakWPA2-Enterprise✅ GoodWPA3✅ Best

## 7. Common Attacks

MITM: ARP spoof or rogue AP to intercept traffic
DDoS: SYN flood, UDP flood, DNS amplification
DNS Tunneling: Exfiltrate data via DNS queries (port 53)
SSL Stripping: Downgrade HTTPS → HTTP
Pass the Hash: Reuse NTLM hashes without cracking

## 8. Nmap Quick Reference
bashnmap -sS 192.168.1.1          # SYN scan (stealth)
nmap -sV 192.168.1.1          # Version detection
nmap -A -T4 192.168.1.1       # Aggressive scan
nmap -p- 192.168.1.1          # All ports
nmap --script vuln 192.168.1.1 # Vuln scan

## 9. Zero Trust Principles

Never trust, always verify
Least privilege: minimum necessary access
Assume breach: design as if already compromised
Continuous monitoring
