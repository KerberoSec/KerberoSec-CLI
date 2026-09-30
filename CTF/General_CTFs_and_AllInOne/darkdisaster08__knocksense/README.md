# KnockSense v1.0 🔐

**Smart Port Knock Analyzer & Executor**  
By Manjeet Thakur (darkdisaster08)  
GitHub: [github.com/darkdisaster08/knocksense](https://github.com/darkdisaster08/knocksense)

---

## What is Port Knocking?

Port knocking is a security technique where a firewall opens a specific port only after receiving connection attempts to a predefined sequence of closed ports. KnockSense automates the entire process of discovering and executing these sequences.

---

## What KnockSense Does

One command. Any target. Fully automatic.

```bash
sudo python3 knocksense.py -t <target-ip> --auto
```

KnockSense handles the entire attack chain:

1. **Recon**: Full TCP/UDP scan, service detection
2. **Extract**: TFTP, FTP, HTTP crawl, PCAP download, NC extract from hint ports
3. **Decode**: 15+ encoding methods (Base64, Brainfuck, Morse, Hex, ROT13...)
4. **Knock**: Sequential, simultaneous, mixed TCP/UDP protocols, all permutations
5. **Chain**: Multi-stage knocking with timing precision
6. **Report**: Clear findings with banners and suggested next steps

---

## Supported CTF Scenarios

| Scenario | How KnockSense handles it |
|---|---|
| Sequence hidden in PCAP file | Downloads PCAP, extracts sequence, builds chain |
| Sequence encoded in Base64/Brainfuck/Morse | Auto-decodes, extracts ports, knocks |
| Dynamic sequence from hint port (like 1337) | Connects, reads `[x,y,z]`, knocks all permutations immediately |
| Multi-stage chained knocking | Executes all stages with timing precision |
| Mixed TCP/UDP protocols | Auto-detects and applies correct protocol per port |
| Unknown sequence | Smart bruteforce (68 sequences × TCP/UDP × 2 modes) |

---

## Tested CTF Machines

| Machine | Type | Result |
|---|---|---|
| **FartKnocker** (VulnHub) | 4-stage PCAP chain, mixed TCP/UDP | ✅ SSH opened automatically |
| **Knock Knock** (VulnHub) | Dynamic random sequences from port 1337 | ✅ SSH + HTTP opened automatically |

---

## Installation

```bash
git clone https://github.com/darkdisaster08/knocksense
cd knocksense
chmod +x install.sh
./install.sh
```

**Dependencies:**
```bash
pip install scapy dpkt --break-system-packages
```

---

## Usage

### Full Auto Mode (recommended)
```bash
sudo python3 knocksense.py -t 10.0.0.5 --auto
```

### Speed Options
```bash
# Fast mode (quicker scan)
sudo python3 knocksense.py -t 10.0.0.5 --auto --fast

# Quiet output (key findings only)
sudo python3 knocksense.py -t 10.0.0.5 --auto --quiet
```

### Manual Modes
```bash
# Known sequence: sequential
sudo python3 knocksense.py -t 10.0.0.5 --sequence 7000,8000,9000

# Known sequence: simultaneous
sudo python3 knocksense.py -t 10.0.0.5 --sequence 7000,8000,9000 --simultaneous

# Analyze a PCAP file
sudo python3 knocksense.py -t 10.0.0.5 --pcap capture.pcap

# Decode an encoded string
python3 knocksense.py -t 10.0.0.5 --decode "T3BlbiB1cA=="

# Decode a file
python3 knocksense.py -t 10.0.0.5 --file config.txt

# Bruteforce only
sudo python3 knocksense.py -t 10.0.0.5 --bruteforce

# Discover hosts then attack
sudo python3 knocksense.py --discover

# Live sniff mode
sudo python3 knocksense.py -t 10.0.0.5 --sniff

# Recon only
sudo python3 knocksense.py -t 10.0.0.5 --recon
```

---

## Auto Mode: How It Works

```
Phase 1: Recon
  └─ Full TCP scan (all 65535 ports) + UDP scan

Phase 2: Extract
  └─ TFTP files, HTTP crawl, PCAP download, NC extract from unknown ports

Phase 3: Decode
  └─ Try 15+ decoders on extracted content

Phase 4: Knock
  ├─ Strategy 1: Dynamic hint port (e.g. port 1337 gives [x,y,z])
  │   └─ Get fresh sequence → try all permutations → UDP + TCP knock → detect open ports
  ├─ Strategy 2: PCAP chain (e.g. FartKnocker 4-stage chain)
  │   └─ Sort PCAPs → extract sequences → execute full chain with re-knock
  ├─ Strategy 3: Decoded sequences from text/files
  └─ Strategy 4: Smart bruteforce (68 sequences × protocols × modes)

Phase 5: Follow Chain
  └─ Connect to opened ports → get banners → follow hints → repeat

Phase 6: Report
  └─ Opened ports, banners, sequences used, suggested next steps
```

---

## Decode Support

KnockSense automatically tries 15+ decoding methods:

- Base64, Base32, Base85
- Hex, Binary, Octal
- ROT13, ROT47, Caesar (all 25 shifts)
- Brainfuck, Ook!
- Morse code
- Atbash cipher
- URL encoding, HTML entities
- XOR brute force
- Reverse string
- Multi-layer chained combinations

---

## Project Structure

```
knocksense/
├── knocksense.py        # Main entry point
├── chain_engine.py      # Multi-stage chain executor with timing precision
├── install.sh           # Dependency installer
├── README.md
├── LICENSE
└── modules/
    ├── colors.py        # Banner, colors, logging
    ├── recon.py         # TCP/UDP scanning, PCAP analysis
    ├── extractor.py     # HTTP, TFTP, FTP, NC extraction
    ├── decoder.py       # All decode methods
    ├── knocker.py       # Knock engine + bruteforce
    └── verifier.py      # Post-knock verification + report
```

---

## Requirements

- Python 3.x
- `scapy`: for sniff mode and PCAP analysis
- `dpkt`: for PCAP sequence extraction
- Root/sudo: required for sniff mode and accurate UDP scanning

---

## Disclaimer

KnockSense is intended for **authorized security testing, CTF challenges, and educational purposes only**.

Always obtain explicit permission before testing on any system you do not own. Unauthorized use against systems without permission is illegal and unethical.

---

*Built with ❤️ by Manjeet Thakur: github.com/darkdisaster08/knocksense*
