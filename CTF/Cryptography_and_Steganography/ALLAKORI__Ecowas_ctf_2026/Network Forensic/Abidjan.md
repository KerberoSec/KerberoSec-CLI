
# 🧠 ARP Poisoning Detection: Threat Hunting Writeup

**Category:** Network Forensics  
**Difficulty:** Easy  
**Scenario:** APT Intrusion Investigation  
**Tools Used:** Wireshark / TShark  

---

## 📜 Description

During a threat hunting operation in a regional telecommunications network, multiple suspicious activities were detected. One of the earliest indicators pointed toward a possible **ARP poisoning attack**, where a malicious device impersonates the default gateway (`192.168.1.1`) to intercept traffic.

---

## 🎯 Objective

Identify the **MAC address of the attacking device** sending fraudulent ARP replies.

---

## 📂 Initial Analysis

We are provided with a packet capture file:

```bash
ls
````

```
Abidjan.pcap
```

Instead of inspecting the entire capture manually, we apply a targeted forensic approach using TShark.

---

## 🔍 Step 1: Filter ARP Traffic

We begin by isolating ARP packets:

```bash
tshark -r Abidjan.pcap -Y "arp"
```

This displays both:

* ARP Requests (`Who has X?`)
* ARP Replies (`X is at MAC`)

---

## 🔥 Step 2: Focus on ARP Replies

ARP poisoning relies on **unsolicited ARP replies**, so we filter only replies:

```bash
tshark -r Abidjan.pcap -Y "arp.opcode == 2"
```

👉 `arp.opcode == 2` corresponds to ARP Reply packets.

---

## 🧠 Step 3: Detect Gateway Impersonation

We now filter devices claiming to be the default gateway:

```bash
tshark -r Abidjan.pcap -Y "arp.opcode == 2 && arp.src.proto_ipv4 == 192.168.1.1"
```

---

## 📊 Step 4: Extract Source MAC Addresses

To clearly identify the MAC addresses involved:

```bash
tshark -r Abidjan.pcap -Y "arp.opcode == 2 && arp.src.proto_ipv4 == 192.168.1.1" -T fields -e eth.src
```

---

## 📈 Step 5: Identify Suspicious Behavior

To determine which MAC address is malicious, we count occurrences:

```bash
tshark -r Abidjan.pcap -Y "arp.opcode == 2 && arp.src.proto_ipv4 == 192.168.1.1" -T fields -e eth.src | sort | uniq -c
```

---

## 🚨 Observations

The analysis reveals multiple MAC addresses claiming to be the gateway:

* `de:ad:be:ef:00:01`
* `00:11:22:33:44:55`

However:

* `de:ad:be:ef:00:01` appears only once
* `00:11:22:33:44:55` appears **repeatedly and continuously**

Example from the capture:

```
192.168.1.1 is at 00:11:22:33:44:55
(repeated multiple times)
```

---

## ⚠️ Interpretation

This behavior clearly indicates:

* Repeated unsolicited ARP replies
* Attempts to overwrite ARP cache entries
* A classic **ARP poisoning / Man-in-the-Middle (MITM)** attack

The attacker floods the network with forged ARP responses to associate the gateway IP with its own MAC address.

---

## 🏁 Final Answer

**Attacker MAC Address:**

```
00:11:22:33:44:55
```

---

## 🧠 Key Takeaways

* ARP poisoning is identified by:

  * Multiple MAC addresses for the same IP
  * High frequency of ARP replies
* Key detection filter:

  ```bash
  arp.opcode == 2
  ```
* Always correlate:

  * IP ↔ MAC inconsistencies
  * Frequency anomalies

---

## ⚔️ Pro Tip

Efficient workflow for ARP-based attacks:

1. Filter protocol (`arp`)
2. Focus on replies (`opcode == 2`)
3. Target sensitive IPs (gateway)
4. Identify repeated MAC addresses

---

## 🔥 Conclusion

By leveraging precise filtering instead of manual inspection, we quickly identified the malicious device performing ARP poisoning.

This highlights the importance of:

* Efficient packet filtering
* Behavioral analysis
* Protocol-level understanding in network forensics
