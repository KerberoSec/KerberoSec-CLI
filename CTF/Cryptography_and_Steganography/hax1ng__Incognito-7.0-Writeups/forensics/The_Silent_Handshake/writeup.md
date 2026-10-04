# The Silent Handshake

**Category:** Forensics | **Difficulty:** 500 pts | **Flag:** `IIITL{f0r3n51c5_4nd_n37w0rk1n6_4r3_fun}`

## TL;DR

A 1.3 GB pcap hides a covert channel inside a fake SYN flood: 39 "real" TCP SYN packets (disguised among 10,000 junk flood packets) encode one flag byte each in the low 24 bits of the TCP sequence number, scaled by a secret multiplier recovered from an XOR'd DNS TXT record. The critical gotcha: tshark's default relative sequence number mode silently zeroed out the payload, making it completely invisible until we passed `-o tcp.relative_sequence_numbers:false`.

## What We're Given

A single file: `packet_capture.pcap`: 1.3 GB of network traffic. The challenge description tells us an IDS flagged a mass data exfiltration from internal workstation `10.0.5.23` to external server `198.51.100.45`, involving over a million connection attempts. The hint is: *"The server IP address might be the key to everything."*

That hint is not metaphorical. The server IP is literally the XOR key.

## Initial Recon

First thing: figure out what we're actually dealing with.

```bash
capinfos packet_capture.pcap
```

The output reveals this is a merged capture from two interfaces. Interface 0 is the attack channel (the suspicious traffic), interface 1 is background noise: probably synthetic filler to pad the file and make it look like a real enterprise capture.

Let's focus on interface 0. We use tshark (the command-line version of Wireshark) to break down what's in there:

```bash
tshark -r packet_capture.pcap -Y "frame.interface_id==0" -q -z io,phs
```

Interface 0 has 10,041 packets:
- 2 DNS packets
- 10,039 TCP SYNs all headed for `198.51.100.45:443`

10,039 SYN packets with no corresponding SYN-ACK. Classic SYN flood. But is it *actually* a flood, or is the flood just cover?

Filtering by frame length reveals two distinct populations:

```bash
tshark -r packet_capture.pcap -Y "frame.len==54 and tcp.flags.syn==1" -q | wc -l
# 10000

tshark -r packet_capture.pcap -Y "frame.len==66 and tcp.flags.syn==1" -q | wc -l
# 39
```

54-byte packets: 10,000 of them. These are raw-socket crafted packets: window size 8192, no TCP options, sequence number 0. The signature of a scripted flood tool blasting packets as fast as possible.

66-byte packets: only 39. These have window size 64240, proper TCP options (MSS, SACK, timestamps: the full OS-stack handshake fingerprint), and non-zero sequence numbers. These look like real connection attempts from an actual operating system stack.

Also, those 2 DNS packets are interesting. The client queries `telemetry.update-check.local` for a TXT record, and `8.8.8.8` responds. Querying a "telemetry" domain over Google's public DNS, right before a flood: that's the config retrieval step.

## The Vulnerability / Trick

There are two nested layers here:

**Layer 1: The DNS TXT covert config.** The DNS TXT response contains a hex-encoded blob that, when XOR'd with the server IP address as an ASCII string (`"198.51.100.45"`), decodes to a JSON config:

```json
{"mask": "0x00FFFFFF", "multiplier": 80211, "chk": "0xAA"}
```

XOR with a repeating key is one of the simplest ciphers around, but it works for obfuscation against automated detection, and the hint in the challenge description was pointing straight at it.

**Layer 2: TCP sequence number steganography.** The 39 real SYN packets each encode one byte of the stolen flag in their TCP sequence number. Specifically, the attacker set:

```
tcp_seq = (data_byte * 80211) & 0x00FFFFFF
```

The low 24 bits of the sequence number are `data_byte * 80211 mod 2^24`. The upper 8 bits are random padding to make it look less suspicious.

To recover the original byte, we compute the modular inverse: think of it like dividing in modular arithmetic. Since `gcd(80211, 2^24) = 1`, the inverse exists, and:

```
data_byte = ((tcp_seq & 0x00FFFFFF) * modinv(80211, 2^24)) & 0xFF
```

The 10,000 flood packets are pure camouflage. They have seq=0, no options, and a different window size: they carry no data at all. Their only job is to make this look like a volumetric DDoS rather than a quiet exfiltration.

## Building the Exploit

### Step 1: Decode the DNS TXT config

```python
txt_hex = "4a1b554f465a0c0b10121e4c05017f7e68737768131c100c59405d4d515e59584b43120a0e0c050308090215134d595b121414170141796f174c"
key = b"198.51.100.45"
cfg = bytes(b ^ key[i % len(key)] for i, b in enumerate(bytes.fromhex(txt_hex)))
print(cfg.decode())
# {"mask": "0x00FFFFFF", "multiplier": 80211, "chk": "0xAA"}
```

We iterate through each byte of the hex blob and XOR it against the corresponding byte of the key, cycling through the key with `i % len(key)`. Standard Vigenere-style XOR.

### Step 2: Extract real SYN sequence numbers: with the critical fix

Here's where we burned about 45 minutes. When we first ran tshark to pull sequence numbers from the 66-byte packets, every single one came back as `0`. We thought the seq field was unused. We went on a wild chase through source ports, timing deltas, packet ordering: none of it produced anything readable.

Eventually, staring at a hex dump of one of the 66-byte packets:

```bash
tshark -r packet_capture.pcap -Y "frame.len==66 and tcp.flags.syn==1" -x | head -40
```

The raw bytes at the TCP sequence number offset were clearly non-zero: things like `e3 59 58 ab`. But tshark was reporting `0`. Why?

tshark, by default, displays *relative* sequence numbers: it takes the first seq number it sees in a connection and subtracts it from all subsequent ones. For a SYN packet (first in a connection), the relative seq is always `0`. It was eating our entire payload.

The fix is one flag:

```bash
tshark -r packet_capture.pcap \
  -o tcp.relative_sequence_numbers:false \
  -Y "ip.dst==198.51.100.45 and tcp.flags.syn==1 and frame.len==66" \
  -T fields -e tcp.seq
```

Now we get 39 real, distinct 32-bit sequence numbers.

### Step 3: Decode each sequence number to a flag byte

```python
MULT = 80211
MASK = 0x00FFFFFF

inv = pow(MULT, -1, 1 << 24)  # Python 3.8+ modular inverse
flag = bytes(((s & MASK) * inv) & 0xFF for s in seqs)
print(flag.decode())
```

`pow(MULT, -1, mod)` is Python 3.8's built-in modular inverse: cleaner than importing `sympy` or `gmpy2` for this. We mask off the upper 8 bits (random noise), multiply by the inverse, mask to 8 bits, and we have our byte. Do that for all 39 packets and concatenate.

The full solve script is in `solve.py`.

## Running It

```
$ python3 solve.py
[+] DNS TXT config: {"mask": "0x00FFFFFF", "multiplier": 80211, "chk": "0xAA"}
[+] 39 real SYN packets
[+] Flag: IIITL{f0r3n51c5_4nd_n37w0rk1n6_4r3_fun}
```

39 packets, 39 characters, one flag. Clean.

## Dead Ends Worth Knowing About

**Source port rabbit hole (~45 min).** The 39 real SYNs all have different source ports. Our first instinct was that the port numbers carried the data: maybe XOR'd with the IP bytes, or generated by an LCG (linear congruential generator: a type of simple pseudo-random number generator sometimes used to encode data in a predictable-but-obfuscated sequence). We tried XOR with individual IP octets, XOR with the full IP string, LCG inverse recovery, timing-based grouping. None of it produced readable output. The ports are genuinely random ephemeral ports: the attacker randomized them to make the traffic look more realistic. Classic red herring.

**The `chk: 0xAA` field.** The DNS config includes a `chk` field. Checksum? Filter byte? We spent time wondering if we needed to validate or use it. Turns out it's unused: probably intended as a complexity hint that doesn't lead anywhere, or a remnant of an earlier challenge design.

## Key Takeaways

**The big one: always disable relative sequence numbers in tshark when hunting covert channels.** This is the lesson the challenge was built around. Relative sequence numbers are great for analyzing normal TCP sessions: they make seq/ack fields human-readable. But they destroy any stego channel that encodes data in the raw sequence number values. The fix is always:

```bash
tshark -o tcp.relative_sequence_numbers:false ...
```

Or equivalently in Wireshark: Edit > Preferences > Protocols > TCP > uncheck "Relative sequence numbers". Burn this into muscle memory.

**Two-layer covert channels.** This challenge combines a config-retrieval layer (DNS TXT) with a data-exfiltration layer (TCP seq). The config tells you how to decode the data. Neither layer makes sense without the other. When you see suspicious DNS traffic right before suspicious TCP traffic, those two are almost certainly related.

**Packet population analysis pays off.** The 54-byte vs 66-byte split was visible the moment we ran `io,phs` stats. Learning to look at the shape of traffic (frame sizes, flag distributions, timing) before diving into individual packets is a fast way to spot what's anomalous.

**Modular inverse for steganography.** Scaling a byte value by a multiplier mod 2^24 is a cute way to make sequence numbers look random: as long as the multiplier is coprime with 2^24 (i.e., odd), the encoding is perfectly reversible. It's essentially a simple multiplicative cipher in modular arithmetic. Worth recognizing the pattern.
