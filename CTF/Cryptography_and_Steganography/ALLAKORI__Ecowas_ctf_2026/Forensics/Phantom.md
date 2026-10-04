
# 🕵️ Phantom: Forensics Writeup

## 📌 Challenge Info
- **Category:** Forensics  
- **Difficulty:** Medium  

---

## 📖 Description

> *The packets are visible and simple to understand, but can you really understand what's hidden within them?*

---

## 🧠 Initial Analysis

We are given a `traffic.pcap` file.  
First step is to inspect the traffic:

```bash
tshark -r traffic.pcap
````

We observe multiple HTTP POST requests:

```
POST /v1/batch?c=2
POST /v2/ingest?c=0
POST /cdn/ping?c=3
POST /v2/ingest?c=1
```

👉 The `c=` parameter strongly suggests **chunked data exfiltration**.

---

## 🔍 Extracting Data

We extract HTTP payloads:

```bash
tshark -r traffic.pcap -Y "http.request" -T fields \
-e http.request.uri \
-e http.file_data
```

Output:

```
/v1/batch?c=2   242f25393f5e3b20
/v2/ingest?c=0  152b2e3935430e0b16293f3c2e313f4e3d17
/cdn/ping?c=3   182e333430460b08192c35383a373d4a343d2f2c2e543b3d253e253f383d24533fc8
/v2/ingest?c=1  243d3228365e
```

We reconstruct the chunks in correct order:

```python
chunks = {
    0: bytes.fromhex("152b2e3935430e0b16293f3c2e313f4e3d17"),
    1: bytes.fromhex("243d3228365e"),
    2: bytes.fromhex("242f25393f5e3b20"),
    3: bytes.fromhex("182e333430460b08192c35383a373d4a343d2f2c2e543b3d253e253f383d24533fc8"),
}
```

---

## 🔑 Recovering the XOR Key

We assume the flag starts with:

```
EcowasCTF{
```

Using a known-plaintext attack:

```
keystream = ciphertext XOR plaintext
```

We obtain:

```
PHANT0M_PR
```

This strongly suggests the key:

```
PHANT0M_PROTO_K!
```

---

## ⚙️ Decryption Logic

Each chunk is decrypted using:

```python
dec = (byte ^ key[j % len(key)]) - chunk_index
```

---

## 🧪 Results

| Chunk | Decrypted Output                     |
| ----- | ------------------------------------ |
| 0     | EcowasCTF{phantom_                   |
| 1     | stream                               |
| 2     | rebuilt}                             |
| 3     | EcowasCTF{wireshark_was_right_lol} ❌ |

---

## ⚠️ Fake Flag Detection

Chunk 3 produces a valid-looking flag:

```
EcowasCTF{wireshark_was_right_lol}
```

However, it is a **decoy**:

* Does not follow the reconstruction logic
* Inconsistent with previous chunks
* Too obvious compared to the rest

---

## 🏁 Final Flag

Reconstructing valid parts:

```
EcowasCTF{phantom_ + stream + rebuilt}
```

👉

```
EcowasCTF{phantom_stream_rebuilt}
```

---

## 🎯 Key Takeaways

* Network traffic can hide data in plain sight
* Chunked exfiltration is a common technique
* XOR + small shifts are used to obfuscate data
* Always verify flags: fake ones are common in CTFs

---

## 🧠 Skills Used

* Traffic analysis (Wireshark / tshark)
* XOR decryption
* Known-plaintext attack
* Pattern recognition
* Logical reasoning

---

🏴‍☠️ *“Not everything that looks like a flag is the flag.”*

