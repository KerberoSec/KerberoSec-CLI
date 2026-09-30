---
tags: [ctf, writeup, template]
created: 2026-05-02
---

# 📝 Writeup Templates

> Template สำหรับเขียน writeup หลังแข่ง: ช่วยจำเทคนิค, แชร์ความรู้, สร้าง portfolio

การเขียน writeup สำคัญมาก:
- **ตัวเอง**: ทบทวน → จดจำดีขึ้น
- **ทีม**: แชร์เทคนิค → ทีมแข็งขึ้น
- **Portfolio**: แสดงทักษะให้ employer / community

---

## 📋 Template ทั่วไป (universal)

```markdown
---
tags: [ctf, writeup, <ctf-name>, <category>]
ctf: <CTF Name>
year: 2026
category: web | pwn | crypto | rev | forensics | osint | misc
points: 500
solves: 23
difficulty: easy | medium | hard | insane
created: 2026-XX-XX
---

# <Challenge Name>

## 📋 Challenge Description

> ของจริงจาก challenge ที่ให้มา: เขียนตรงๆ

**Files provided:**
- `binary` (ELF 64-bit)
- `libc.so.6`

**Endpoint**: `nc target.ctf 1337`

---

## 🎯 TL;DR

[1-2 ประโยค สรุปว่าทำยังไง]

ตัวอย่าง: "Buffer overflow ใน input function: ใช้ ROP chain leak libc แล้ว return-to-system สำหรับ shell"

---

## 🔍 Initial Analysis

[ขั้นตอนแรกที่ทำ: file, strings, etc.]

```bash
$ file binary
binary: ELF 64-bit LSB executable, x86-64...

$ checksec binary
[*] Arch: amd64
    RELRO: Partial
    Stack: No canary
    NX: enabled
    PIE: disabled
```

[Observations]:
- ไม่มี canary → BOF ตรงๆ
- NX enabled → ต้องใช้ ROP
- No PIE → addresses คงที่

---

## 🧠 Understanding the Vulnerability

[Reverse / source review: อธิบายว่ามีจุดอ่อนตรงไหน, ทำไม]

```c
void vuln() {
    char buf[64];
    gets(buf);          // ← unsafe!
}
```

[Diagram ถ้าจำเป็น]

```
[ buf 64 bytes ][ saved rbp 8 ][ return addr 8 ]
                              ↑ overflow target
```

---

## 💥 Exploitation

[เล่าทีละ step: code/payload + อธิบายว่าทำไม]

### Step 1: Find offset
```bash
$ python3 -c "from pwn import *; print(cyclic(100))"
aaaa...
```

ส่งให้ binary → crash → ดู rip
```
RIP: 0x6161616168616161
```

```bash
$ python3 -c "from pwn import *; print(cyclic_find(0x6161616168616161))"
72
```

→ offset = 72

### Step 2: Build ROP chain
[code]

### Step 3: Run exploit
[final code]

---

## 🚩 Final Exploit

```python
#!/usr/bin/env python3
from pwn import *

context.binary = elf = ELF('./binary')
libc = ELF('./libc.so.6')

io = remote('target.ctf', 1337)

# ... full exploit code ...

io.interactive()
```

---

## 📚 What I Learned

[3-5 key takeaways]

1. ROP technique X works when ...
2. Stack alignment matters because ...
3. New tool: ... 

---

## 🔗 References

- Related writeups: ...
- Background reading: ...
```

---

## 🎯 Template by Category

### 🌐 Web Writeup

```markdown
# <Challenge> [Web]

## Description
[as given]

## Recon
- Tech stack: [Nginx, PHP, MySQL]
- Endpoints found: `/login`, `/admin`, `/api/users`
- Source available?: yes/no

## Vulnerability
[SQL injection in login form / SSRF in URL fetcher / etc.]

## Exploitation Steps
1. ...
2. ...
3. → Got flag

## Payload
```http
POST /login HTTP/1.1
...

username=admin' OR '1'='1' --&password=x
```

## Patch (if I were the dev)
```php
// Use prepared statements
$stmt = $pdo->prepare('SELECT * FROM users WHERE username=? AND password=?');
$stmt->execute([$user, $pass]);
```

## References
[CWE links, related techniques]
```

### 🔐 Crypto Writeup

```markdown
# <Challenge> [Crypto]

## Given
- `n = 0x...`
- `e = 65537`
- `c = 0x...`
- (or whatever parameters)

## Analysis
[Identify vulnerability: small d? common factor? padding oracle?]

```python
# Check
from sympy import gcd
print(gcd(n1, n2))  # > 1 if shared factor
```

## Attack
[Mathematical reasoning]

## Solver
```python
# Full solver code
```

## Output
```
flag{example_flag}
```
```

### 🔬 Reverse Engineering Writeup

```markdown
# <Challenge> [Rev]

## Quick observations
- Architecture: x86_64
- Stripped: yes
- Packed: no
- Anti-debug: no

## Key Functions
[After Ghidra analysis]

### `check_password(char *input)` @ 0x401234
```c
// Renamed in Ghidra
int check_password(char *input) {
    for (int i = 0; i < 16; i++) {
        if ((input[i] ^ key[i]) != expected[i]) return 0;
    }
    return 1;
}
```

## Algorithm
- XOR input with `key` array (extracted: `\x42\x13...`)
- Compare with `expected` array

## Solver
```python
key = bytes.fromhex("4213...")
expected = bytes.fromhex("...")
flag = bytes(k ^ e for k, e in zip(key, expected))
print(flag)
```
```

### 💥 Pwn Writeup

```markdown
# <Challenge> [Pwn]

## Mitigations
| Type | Status |
|------|--------|
| RELRO | Partial |
| Canary | No |
| NX | Yes |
| PIE | No |

## Vulnerability
[Stack BOF / heap UAF / format string / etc.]

## Attack Plan
1. Leak libc address via ...
2. Calculate libc base
3. ROP to system("/bin/sh")

## Exploit
```python
# pwntools script
```

## Demo
```
$ python3 exploit.py
[+] Connecting...
[+] Leaked libc puts: 0x7f...
[+] libc base: 0x7f...
[+] Sending payload...
[*] Got shell!
$ cat flag.txt
flag{...}
```
```

### 🔍 Forensics Writeup

```markdown
# <Challenge> [Forensics]

## Evidence
- `memory.dmp` (1.2GB)
- `capture.pcap` (45MB)

## Analysis Workflow

### Step 1: Identify
```bash
$ vol -f memory.dmp windows.info
```

[Output]

### Step 2: Process listing
[Suspicious processes found]

### Step 3: Memory dump of suspect
[strings → flag found]

## Key Findings
- Malware injected into `notepad.exe`
- Flag in process memory at offset 0x...

## Tools Used
- Volatility 3
- strings
- Wireshark
```

### 🎭 Stego Writeup

```markdown
# <Challenge> [Stego]

## Initial
- File: `cat.png` (PNG image)
- Visible: cute cat

## Analysis
1. `exiftool`: nothing
2. `binwalk`: embedded ZIP at offset 12345
3. `zsteg cat.png`: found LSB data
4. Extract → base64
5. Decode → flag

## Payload
[show steps + decoded data]
```

### 🕵️ OSINT Writeup

```markdown
# <Challenge> [OSINT]

## Given
- Photo of person at unknown location

## Investigation Path
1. **Reverse image search** (Yandex) → no exact match
2. **Visual clues**:
   - License plate format → Vietnam
   - Vegetation tropical
   - Sun position SE → afternoon
3. **Sign on wall**: "Coffee Shop" + Vietnamese name
4. **Google Maps search**: name + Vietnam → Saigon
5. **Street View match** → exact corner
6. **GPS**: 10.7769° N, 106.7009° E

## Tools
- Yandex Reverse Image
- Google Maps / Street View
- SunCalc
```

---

## 📐 Writeup Best Practices

### DO
- ✅ Show your **thought process**: ไม่ใช่แค่ solution
- ✅ Include **dead ends**: เรียนได้เยอะกว่า
- ✅ **Code snippets** ที่ run จริง
- ✅ **Screenshots** สำหรับ visual stuff (Burp, Ghidra, Wireshark)
- ✅ Link to **CVEs**, papers, similar challenges
- ✅ ลง **reproducible**: ถ้าใครอยากตามได้ครบ

### DON'T
- ❌ "Just used tool X → got flag": อธิบายเพิ่มสิ
- ❌ Copy-paste challenge เป็น code block ใหญ่: ใส่แค่ที่จำเป็น
- ❌ ไม่ใส่ context: แต่ละ step ทำไมถึงทำ
- ❌ ไม่ตรวจ spelling/grammar
- ❌ ไม่ใส่ links → references

---

## 🎯 Where to Publish

### Personal blog
- **Hashnode** (free, dev-focused)
- **Medium** (large audience)
- **Dev.to**
- **Self-hosted** (Hugo, Jekyll, Astro)

### CTFtime
- ctftime.org → submit writeup link → counts toward team rating

### GitHub
- Create `ctf-writeups` repo
- Folder per CTF → md per challenge
- Many recruiters scan for this

### Twitter/X
- Quick highlights with screenshot
- Link to full writeup

---

## 🔗 ที่เกี่ยวข้อง

- [Methodology](../01-Fundamentals/Methodology.md)
- [Practice-Platforms](../15-Practice-Platforms/Practice-Platforms.md)
- [Tools-Cheatsheet](../14-Tools-Cheatsheets/Tools-Cheatsheet.md)

## 📚 Examples to Read

- ctftime.org/writeups
- github.com/sajjadium/ctf-archives
- github.com/VulnHub/ctf-writeups
- 0xdf.gitlab.io (HTB writeups, well-written)
- jasonyim.com (medium, well-explained)

---

#ctf #writeup #template
