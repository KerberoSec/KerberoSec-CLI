# 🕵️ Silent Whispers III: Writeup (ECOWAS CTF)

![CTF](https://img.shields.io/badge/Event-ECOWAS%20CTF-blue)
![Category](https://img.shields.io/badge/Category-Steganography%20%2B%20Network%20Analysis-green)
![Difficulty](https://img.shields.io/badge/Difficulty-Medium-orange)

---

## 📌 Challenge Overview

**Silent Whispers III** is a multi-layered challenge combining:

* Steganography (whitespace covert channel)
* Base64 encoding
* OpenSSL encryption
* Network traffic analysis (PCAP)

The goal is to recover the hidden flag by correlating data from a text file and network capture.

---

## 📂 Provided Files

* `information_III.txt`
* `traffic.pcapng`

---

## 🔍 Step 1: Inspecting the Text File

At first glance, the file looks normal:

```
Hey,

Traffic logs look normal. Nothing suspicious detected.
Let's proceed as planned.

Regards,
Admin
```

However, displaying hidden characters reveals something suspicious:

```bash
cat -A information_III.txt
```

We notice:

* Numerous **tabs (`^I`)**
* **Trailing spaces**

👉 This strongly suggests a **whitespace-based steganographic channel**

---

## 🧩 Step 2: Extract Hidden Data

We use `stegsnow` to extract the hidden message:

```bash
stegsnow -C information_III.txt
```

Output:

```
U2FsdGVkX19RtlsoTBDs5pXFLJnfWK6+XRQis1plG/aJpuRH6stxdWNxL9EF5j2w
```

---

## 🔐 Step 3: Base64 Decoding

```bash
echo 'U2FsdGVkX19RtlsoTBDs5pXFLJnfWK6+XRQis1plG/aJpuRH6stxdWNxL9EF5j2w' | base64 -d
```

Output:

```
Salted__...
```

👉 The `Salted__` prefix is a known signature of **OpenSSL encrypted data**

---

## 📦 Step 4: Save Encrypted Payload

```bash
echo 'U2FsdGVkX19RtlsoTBDs5pXFLJnfWK6+XRQis1plG/aJpuRH6stxdWNxL9EF5j2w' | base64 -d > enc.bin
```

---

## 🌐 Step 5: Analyze Network Traffic

We extract HTTP requests from the PCAP:

```bash
tshark -r traffic.pcapng -Y "http.request" -T fields -e http.request.uri
```

Relevant output:

```
/information_IiI.txt
/information_I9I.txt
/information_IxI.txt
/information_xxI.txt
/sec_xxI.txt
/sec_rxxI.txt
/secds_rxxI.txt
...
/api?debug=ghostkey
```

Most entries correspond to **directory brute-forcing noise**.

However, one stands out:

```
/api?debug=ghostkey
```

👉 This likely reveals the **encryption password**

---

## 🔓 Step 6: Decrypt the Payload

```bash
openssl enc -d -aes-256-cbc -in enc.bin -k ghostkey
```

Output:

```
flag{c0v3rt_chAnn3l_m@st3r}
```

---

## 🏁 Flag

```
flag{c0v3rt_chAnn3l_m@st3r}
```

---

## 🧠 Key Takeaways

* Whitespace (spaces/tabs) can hide data → **covert channel**
* `stegsnow` is effective for whitespace steganography
* `Salted__` indicates **OpenSSL encryption**
* PCAP analysis can reveal **critical secrets (passwords)**
* Always separate **signal from noise** in network data

---

## ⚡ Tools Used

* `cat -A`
* `stegsnow`
* `base64`
* `openssl`
* `tshark`

---

## 🔥 Conclusion

This challenge perfectly demonstrates how multiple techniques can be chained:

> **Steganography → Encoding → Encryption → Network Analysis**

Success required correlating subtle clues across different layers.

---
