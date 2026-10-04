# Scheme-Catcher

- **Challenge:** beacon.bin (First Stage)  
- **Category:** Binary Exploitation / Reverse Engineering  
- **Difficulty:** Insane
- **URL of  the room:** [Scheme Catcher](https://tryhackme.com/room/sq2-aoc2025-JxiOKUSD9R)

## Summary 

The actual functionality of the program is concealed by a custom encrypted `.easter` section found in the `beacon.bin` binary. We found a self-decrypting stub that XORs the encrypted code with key `0x0D` using dynamic analysis with GDB. The `payload_load()` function uncovered a hardcoded HTTP path `/7ln6Z1X9EF` built from hex immediates after decryption. This path resulted in a directory listing with the next stage binary and `foothold.txt` (Second flag).
### Finding the first binary.
**Scanning using nmap**
```
$ nmap -sV -p- 10.48.190.204

Starting Nmap 7.94 ( https://nmap.org ) at 2025-12-11 12:00 IST
Nmap scan report for 10.48.190.204
Host is up (0.045s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT     STATE SERVICE VERSION
80/tcp   open  http    Apache/2.4.58 (Ubuntu)
9004/tcp open  unknown
21337/tcp open  unknown

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 234.56 seconds
```
After the scan we used `gobuster` to list hidden directory on port 80
```
$ gobuster dir -u http://10.48.190.204 -w /usr/share/wordlists/dirb/common.txt 

===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.48.190.204
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirb/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Extensions:              zip,bin,txt
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/.htaccess            (Status: 403) [Size: 279]
/.htpasswd            (Status: 403) [Size: 279]
/.hta                 (Status: 403) [Size: 279]
/dev                  (Status: 301) [Size: 314] [--> http://10.48.190.204/dev/]
/index.html           (Status: 200) [Size: 10918]
/server-status        (Status: 403) [Size: 279]
Progress: 18456 / 18460 (99.98%)
===============================================================
Finished
===============================================================
```
On this directory we found a zip file which is carying our first binary `beacon.bin`

## Initial Reconnaissance

### File Analysis

```bash
file beacon.bin
# beacon.bin: ELF 64-bit LSB executable, x86-64

checksec --file=beacon.bin
# Arch:     amd64-64-little
# RELRO:    Partial RELRO
# Stack:    No canary found
# NX:       NX enabled
# PIE:      No PIE (0x400000)
```

#### Key Observations

- 64-bit Linux executable
- No stack canary (vulnerable to buffer overflows)
- NX enabled (no shellcode on stack)
- No PIE (static addresses) 

### Static Analysis

#### String Enumeration

```bash
strings beacon.bin
```

**Found:**

- `THM{Welcom3_to_th3_eastmass_pwnland}` - First flag placeholder
- `localhost` - HTTP connection target
- `GET %s HTTP/1.1` - HTTP request format
- `/tmp/b68vC103RH` - Temporary file path

**Interesting Functions:**

- `setup()` - Initialization
- `payload_load()` - **Suspicious: loads something**
- `cmd()` - Command execution
- `delete_cmd()` - Cleanup
- `start_socket_server()` - Network functionality

#### XOR Encryption

> **Note:** The disassembly revealed a brief loop that iterated over a memory range from `0x401370` to `0x401bc4` when examining the early code in the `.easter` section. Each byte in this loop was read, XORed with the constant `0x0D`, and then written back to the original location. Execution was then redirected to that area. This pattern is typical of a self-decrypting XOR stub, which means that the actual program logic is encrypted and only decrypted during runtime, just prior to execution.

### GDB Investigation

```bash
gdb beacon.bin
(gdb) info functions
# All functions marked <encrypted>

(gdb) disas main
# Showed XOR decryption loop!
```

**Decryption Stub Found at 0x804000:**

```assembly
0x804000:  nop                          # NOP sled
0x804008:  movabs rsi,0x401370          # Source: encrypted code
0x804012:  movabs rdi,0x401bc4          # Destination: decrypted  
0x80401d:  cmpb   [rsi],0xd             # Compare with key 0x0D
0x804020:  inc    rsi                    # Next byte
0x804023:  cmp    rsi,rdi                # Check if done
0x804026:  jne    0x804020               # Loop
0x804028:  push   0x401370               # Jump to decrypted main
0x80402d:  ret
```

**The Algorithm:** XOR each byte from `0x401370` to `0x401bc4` with key `0x0D`

**Breaking After Decryption:**

```gdb
(gdb) break *0x804027      # Right after decryption
(gdb) run
(gdb) x/10i 0x401370       # Now readable!
```

Functions are now visible!

#### Analyzing payload_load() 

```bash
(gdb) disas payload_load
```

**Key Instructions Found:**

```assembly
# Creates socket connection to localhost:80
0x4015e2:  call   socket@plt
0x401619:  call   connect@plt

# Constructs HTTP GET request
0x401648:  movabs rax,0x58315a366e6c372f   # ← SUSPICIOUS HEX
0x401652:  mov    QWORD PTR [rbp-0x11c],rax
0x401659:  movl   DWORD PTR [rbp-0x114],0x464539

# Sends HTTP request  
0x401674:  lea    rdx,[rip+0xa75]        # "GET %s HTTP/1.1..."
0x40167b:  call   snprintf@plt
```

**Decoding the Suspicious hex:**

```python
#!/usr/bin/env python3
import struct

# First 8-byte immediate
val1 = 0x58315a366e6c372f
# Second 4-byte immediate (only 3 bytes used)
val2 = 0x464539

# Convert to little-endian bytes
part1 = struct.pack('<Q', val1)  # b'/7ln6Z1X'
part2 = struct.pack('<I', val2)[:3]  # b'9EF'

full_path = part1 + part2
print("Hidden path:", full_path.decode('ascii'))
```

Got the hidden path as `/7ln6Z1X9EF`

> **Analysis of Reverse Data Flow:**
> 
> The format `"GET %s HTTP/1.1"` is used by `snprintf()` at `0x401674`.
> 
> The source of the `%s` parameter is `rbp-0x11c`.
> 
> Looking for writes to `rbp-0x11c` in reverse, the `movabs` instruction was located at `0x401648`.

### Accessing the Hidden Directory

```bash
curl http://10.48.190.204/7ln6Z1X9EF/
```

**Directory Listing Revealed:**

```
Index of /7ln6Z1X9EF
- foothold.txt               37 bytes
- 4.2.0-R1-1337-server.zip   5.2M
```

#### Second Flag

```bash
curl http://10.48.190.204/7ln6Z1X9EF/foothold.txt
# THM{beacon_analysis_complete_on_to_stage2}
```

## Tools Used

- **file**: Binary identification
- **checksec**: Security feature enumeration
- **readelf**: ELF structure analysis
- **strings**: Static string extraction
- **GDB**: Dynamic debugging
- **objdump**: Disassembly
---

**Next:** [Scheme-Catcher-part-2.md](Scheme-Catcher-part-2.md)
