# 📡 EntropyWire (Network: GRE Covert Channel Extraction)

## Challenge Info

| Field | Details |
|---|---|
| Platform | Cybersecurity Hackathon 2026 |
| Category | Network Forensics |
| Tools Used | Wireshark, CyberChef, Python 3 (scapy) |

---

## 🧩 Description

A `capture.pcap` file and a name that gives away the mechanism:
**EntropyWire**: a flag smuggled out over a GRE tunnel, hidden across
several fields instead of sitting in one obvious payload.

---

## 🔍 Reconnaissance

**Step 1: Filter to the transport that matters**

In Wireshark, filtered on:
```
ip.proto == 47
```
`47` is the IP protocol number for **GRE** (Generic Routing
Encapsulation): everything else in the capture was noise for this
challenge.

**Step 2: Narrow to the packets that actually respond**

Of the GRE packets, only the ones carrying an inner **HTTP `200 OK`**
response were relevant: those are the packets the "server" side used
to answer, and where the hidden data actually rides.

---

## ⚔️ Attack Process

**Step 1: Identify the two key sources per packet**

Each qualifying packet carries two numeric fields worth pulling:

- The **TCP sequence number**: take it in hex, keep only the **last
  byte** (last 2 hex chars) → `key1`
- The GRE header's **Key field**: same treatment, hex, last byte →
  `key2`

**Step 2: Derive the combined key**

```
combined_key = key1 XOR key2
```

**Step 3: Pull the data byte and decode**

Take a byte from the HTTP response body (CyberChef made this quick to
verify manually: XOR the body byte against `combined_key`):

```
flag_char = combined_key XOR http_body_byte
```

One flag character comes out **per matching packet**: concatenated in
packet order, they spell the flag.

**Step 4: Automate it**

Wrote a small `scapy`-based script to do this across every packet in
the capture instead of doing it one-by-one in CyberChef:

```python
for pkt in packets:
    if pkt[IP].proto != 47 or not pkt.haslayer(GRE):
        continue
    if "200 OK" not in bytes(pkt[Raw].load):
        continue

    key1 = last_hex_byte(pkt[TCP].seq)
    key2 = last_hex_byte(pkt[GRE].key)
    combined = key1 ^ key2

    data_byte = get_body_byte(pkt[Raw].load)
    flag_chars.append(chr(combined ^ data_byte))
```

Run against the capture:

```
[+] seq=0x4c97035b key1=5b  gre_key=0x00010046 key2=46  combined=1d  -> '0'
[+] seq=0x4c970382 key1=82  gre_key=0x00010049 key2=49  combined=cb  -> 'v'
[+] seq=0x4c9703a9 key1=a9  gre_key=0x0001004c key2=4c  combined=e5  -> 'e'
...
[+] seq=0x4c970556 key1=56  gre_key=0x0001006d key2=6d  combined=3b  -> '}'

[FLAG] flag{e********r_**********_r********l}
```

---

## 🚩 Flag
```
flag{e********r_**********_r********l}
```

---

## 💡 Lessons Learned

- GRE (`ip.proto == 47`) is easy to overlook in a busy capture if you're
  only filtering by port: filtering by IP protocol number first cuts
  straight to the tunnel traffic that matters
- A two-key XOR scheme (TCP sequence number + a tunnel header field)
  is a neat way to make each packet's contribution unique without a
  shared secret baked into the payload itself: the "key" is derived
  from transport metadata that changes packet-to-packet
- Once the per-packet logic is confirmed manually in CyberChef (a
  handful of packets, by hand), automating the same steps in `scapy`
  is trivial and far less error-prone than doing 15+ packets one at a
  time

---

## 🛠️ Tools Used

- **Wireshark**: protocol filtering (`ip.proto == 47`, HTTP 200 OK)
- **CyberChef**: manual XOR verification on the first few packets
- **Python 3 (scapy)**: automating the extraction across the full capture

---

*Solved during Cybersecurity Hackathon 2026: legal, authorized CTF environment*
