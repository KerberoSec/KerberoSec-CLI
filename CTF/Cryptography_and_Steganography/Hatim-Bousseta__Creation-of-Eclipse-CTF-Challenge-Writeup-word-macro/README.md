# Creation-of-Eclipse-CTF-Challenge-Writeup-word-macro
# 🌑 Eclipse  CTF Challenge Writeup

<div align="center">

![Category](https://img.shields.io/badge/Category-Forensics-blue?style=for-the-badge)
![Difficulty](https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge)
![Type](https://img.shields.io/badge/Type-Macro%20Analysis-purple?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Solved-success?style=for-the-badge)

*"Eclipse is not just a CTF. Eclipse is a codename."*

</div>

---

## 📁 Challenge File

```
eclipse.docm
```

A single Microsoft Word macro-enabled document recovered from a decommissioned data center.
No hints. No instructions. Just a file and a flag format `ECL{...}`.

---

## 🧠 Prerequisites

Before attempting this challenge you should be comfortable with:

| Skill | Why you need it |
|-------|----------------|
| VBA macro analysis | The entire challenge lives inside a macro |
| oletools (olevba, oleid) | Primary static analysis tools |
| Base64 encoding/decoding | Core decoding step |
| XOR operations | Core decryption step |
| Python 3 | Writing the solver script |
| String obfuscation patterns | Chr(), split strings, junk math |

**Tools used:** `file`, `md5sum`, `sha256sum`, `oleid`, `olevba`, `exiftool`, `python3`

---

## 🔍 Challenge Lore

Opening the document reveals the following text:

```
Eclipse is not just a CTF.

Eclipse is a codename.

In 2019, a threat intelligence firm intercepted an encrypted
communication between two unknown actors. The message contained
a single word: ECLIPSE.

Three months later, a series of coordinated attacks hit financial
institutions across 14 countries. No group claimed responsibility.
No traces were left: except one.

A single Microsoft Word document, found on an air-gapped machine
in a decommissioned data center in Eastern Europe.

This is that document.

The operators believed it was clean.
They were wrong.

Your mission is to find what they left behind.
The answer is hidden in plain sight.

Good luck. You will need it.: Unit 7
```

---

## 🛠️ How the Challenge Was Built

### The Flag Encryption

The flag was encrypted using the following Python script before being embedded in the macro:

```python
import base64

flag = "ECL{your_flag_here}"

# Step 1: XOR each character with 42
xor_result = ''
for char in flag:
    xor_result += chr(ord(char) ^ 42)

# Step 2: Base64 encode the result
encoded = base64.b64encode(xor_result.encode()).decode()
print(encoded)
# Output: aX5sUU1NT1B1R0tJWEV1Q1l1TF9EVw==
```

The encoded payload is then **split into 4 parts** and embedded inside the macro:

```vba
p1 = "aX5s"
p2 = "UU1N"
p3 = "T1B1R0tJ"
p4 = "WEV1Q1l1TF9EVw=="
encoded_payload = p1 & p2 & p3 & p4
```

### The Macro Structure

The macro was designed with multiple layers of obfuscation to simulate a real-world malicious document:

```
encoded_payload (split base64 string)
        ↓
  data1/2      ← DECOY: reverse twice = no-op
        ↓
  data3/4      ← DECOY: +10 then -10 = no-op
        ↓
  data5        ← REAL: Base64 decode
        ↓
  data6        ← REAL: XOR 42 = 🚩 FLAG
        ↓
 final_data    ← DECOY: XOR 42 again = scrambles flag
        ↓
reversed1/2    ← DECOY: reverse twice = no-op
```

### Obfuscation Techniques Used

| Technique | Purpose |
|-----------|---------|
| Split base64 string (p1/p2/p3/p4) | Prevents direct copy-paste of base64 string |
| Chr() for object names | Hides `WScript.Shell`, `ECLIPSE` from static string search |
| Split COM object names (s1/s2/s3) | Hides `MSXML2.ServerXMLHTTP` and `MSXML2.DOMDocument` |
| Double reverse (data1/2) | No-op decoy |
| Add/subtract 10 (data3/4) | No-op decoy |
| Fake `VerifyIntegrity` function | SHA256-looking hash check that always returns True |
| Fake `DecryptAES` function | Looks like AES decryption, does nothing |
| Junk math (junk1/2/3) | Pure noise variables never used |
| `(A Or B)-(A And B)` = XOR | Disguised XOR operation after the flag |
| Empty stubs (InjectShellcode, BypassUAC, etc.) | Alarming function names pointing nowhere |

---

## 🔬 Solving the Challenge: Step by Step

### Step 1: Identify the File

```bash
file eclipse.docm
# eclipse.docm: Microsoft Word 2007+

md5sum eclipse.docm
sha256sum eclipse.docm
```

Document the hashes first: good forensics practice. The `.docm` extension already signals a macro-enabled Word document.

---

### Step 2: Check for Macros with oleid

```bash
oleid eclipse.docm
```

Expected output:

```
File format    : MS Word 2007+ Macro-Enabled Document (.docm)
Container      : OpenXML
Encrypted      : False
VBA Macros     : Yes, suspicious   [HIGH]
```

The `HIGH` risk flag on VBA macros confirms there is suspicious code worth investigating.

---

### Step 3: Extract the Full Macro with olevba

```bash
olevba eclipse.docm
```

This dumps the complete VBA source code. olevba will flag the following suspicious keywords:

```
AutoExec    : AutoOpen       → Runs when the Word document is opened
AutoExec    : Document_Open  → Runs when the Word document is opened
Suspicious  : Environ        → May read system environment variables
Suspicious  : Open           → May open a file
Suspicious  : CreateTextFile → May create a text file
Suspicious  : Shell          → May run a system command
Suspicious  : Run            → May run a system command
Suspicious  : CreateObject   → May create an OLE object
Suspicious  : Chr            → May attempt to obfuscate specific strings
Suspicious  : Xor            → May attempt to obfuscate specific strings
Suspicious  : Base64 Strings → Base64-encoded strings were detected
IOC         : https://update.microsoft.com/security/check  → URL
IOC         : payload.exe    → Executable file name
```

---

### Step 4: Decode Chr() Obfuscation with --reveal

```bash
olevba --reveal eclipse.docm
```

This automatically decodes Chr() expressions and reveals hidden strings:

```vba
obj_name = "WScript" & ".Shell"   ← WScript.Shell revealed
fake_key = "ECLIPSE"              ← fake AES key revealed
```

The `ECLIPSE` key looks significant: it is a **rabbit hole**. It is passed to `DecryptAES` which does absolutely nothing.

---

### Step 5: Find the Encoded Payload

```bash
olevba eclipse.docm | grep -A5 "encoded_payload\|p1\|p2\|p3\|p4"
```

Output:

```vba
Dim p1, p2, p3, p4
Dim encoded_payload As String
p1 = "aX5s"
p2 = "UU1N"
p3 = "T1B1R0tJ"
p4 = "WEV1Q1l1TF9EVw=="
encoded_payload = p1 & p2 & p3 & p4
```

Reconstruct the full base64 string:

```
aX5sUU1NT1B1R0tJWEV1Q1l1TF9EVw==
```

---

### Step 6: Identify the Decoys

At this point, carefully trace the data flow:

**data1 and data2: Double Reverse**
```vba
' Reverses encoded_payload → data1
' Reverses data1 → data2
' Result: data2 == encoded_payload   ← NO-OP
```

**data3 and data4: Add/Subtract 10**
```vba
temp_val = temp_val + 10   ' data3
temp_val = temp_val - 10   ' data4
' Result: data4 == data2   ← NO-OP
```

**VerifyIntegrity: Fake Hash Check**
```vba
expected = "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
VerifyIntegrity = True   ' ← always returns True, does nothing
```

**DecryptAES: Fake AES Decryption**
```vba
result = data
DecryptAES = result   ' ← literally returns input unchanged
```

---

### Step 7: Identify the Real Operations

```bash
olevba eclipse.docm | grep -A3 "data5\|data6\|Xor\|Base64"
```

Two real operations are found:

```vba
' REAL Step 1: Base64 decode
data5 = DecodeBase64(data4)

' REAL Step 2: XOR 42 = FLAG
temp_val = temp_val Xor 42
data6 = data6 & Chr(temp_val)
```

This directly mirrors the Python encryption in reverse:
- Python encrypted: XOR 42 first → then Base64 encode
- Macro decrypts: Base64 decode first → then XOR 42

---

### Step 8: Recognize the Post-Flag Decoy

After `data6` (the flag), the macro continues:

```vba
' (A Or B) - (A And B) is mathematically equivalent to A Xor B
result_byte = (temp_val Or xor_key) - (temp_val And xor_key)
```

This XORs the already-decoded flag with 42 again: **re-encrypting it**. The final output written to disk/registry is the scrambled version. The flag lives at `data6`, not at `reversed2`.

**Verify this math:**
```python
# Confirm (A Or B) - (A And B) == A XOR B
for i in range(256):
    assert ((i | 42) - (i & 42)) == (i ^ 42)
print("confirmed: (Or)-(And) == XOR 42")
```

---

### Step 9: Check IOCs

```bash
olevba --ioc eclipse.docm
```

Expected IOCs:

```
URL   : https://update.microsoft.com/security/check
KEY   : HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System\DisableTaskMgr
KEY   : HKCU\Software\Microsoft\Windows\CurrentVersion\RunOnce\Temp
FILE  : %TEMP%\windows\fonts\winload.ini
FILE  : %TEMP%\~debug.log
```

These are all part of the challenge's realism: they simulate what a real malicious macro would do.

---

### Step 10: Extract Document Metadata

```bash
exiftool eclipse.docm
```

Notable metadata:

```
Author          : svc_backup
Last Modified By: DESKTOP-7K2MNX
Create Date     : 2019:03:14
Application     : Microsoft Office Word
```

The fake author and 2019 date match the document's lore: a planted breadcrumb for thorough forensics analysts.

---

### Step 11: Write the Solver Script

```python
import base64

# Step 1: Reconstruct the split payload
p1 = "aX5s"
p2 = "UU1N"
p3 = "T1B1R0tJ"
p4 = "WEV1Q1l1TF9EVw=="
encoded_payload = p1 + p2 + p3 + p4

# Step 2: Base64 decode
decoded = base64.b64decode(encoded_payload).decode()

# Step 3: XOR each character with 42
flag = ''.join(chr(ord(c) ^ 42) for c in decoded)

print(f"FLAG: {flag}")
```

```
FLAG: ECL{your_flag_here}
```

---

## 📊 Full Macro Code Explained

### Entry Points

```vba
Sub Document_Open()
Sub AutoOpen()
```

Both are **auto-execution triggers**. The macro runs automatically when the document opens: no user interaction needed. This is the first red flag olevba flags as `AutoExec`.

---

### EnvironmentCheck: Anti-Analysis

```vba
fso.FileExists("C:\Program Files\Notepad++\notepad++.exe")  → analyst tool check
fso.FileExists("C:\Windows\System32\drivers\vm3dmp.sys")    → VMware VM check
```

If a VM is detected, calls `VMLogic` to disable Task Manager via registry: a classic anti-analysis technique.

---

### VMLogic: Anti-Analysis

```vba
obj_name = Chr(87) & Chr(83) & Chr(99) & ...   ← "WScript.Shell" obfuscated
reg.RegWrite "HKCU\...\DisableTaskMgr", 1, "REG_DWORD"
```

`WScript.Shell` is hidden using Chr() obfuscation to avoid static string detection.

---

### BeaconHome: C2 Simulation

```vba
url = "https://update.microsoft.com/security/check" & Chr(63) & "id=" & random_id
s1 = "MSXML" : s2 = "2.Server" : s3 = "XMLHTTP"
Set xmlhttp = CreateObject(s1 & s2 & s3)
```

- `Chr(63)` = `?`: hides the URL query separator from string scanners
- `MSXML2.ServerXMLHTTP` is split across 3 variables
- Disguised as a Microsoft update check: simulates C2 beaconing

---

### Decoy Functions

| Function | Looks Like | Does |
|----------|-----------|------|
| `VerifyIntegrity` | SHA256 hash verification | Always returns True |
| `DecryptAES` | AES decryption with key | Returns input unchanged |
| `InjectShellcode` | Shellcode injection | Empty: does nothing |
| `BypassUAC` | UAC bypass | Empty: does nothing |
| `DownloadPayload` | Payload downloader | Generates a fake random URL |
| `Persistence` | Persistence mechanism | Empty: does nothing |

---

### ExecuteStage: Full Data Flow

| Variable | Operation | Real or Decoy |
|----------|-----------|--------------|
| data1/2 | Double reverse | ❌ Decoy (no-op) |
| data3/4 | +10 then -10 | ❌ Decoy (no-op) |
| data5 | Base64 decode | ✅ Real |
| data6 | XOR with 42 | ✅ Real = 🚩 FLAG |
| final_data | `(Or)-(And)` = XOR 42 again | ❌ Decoy (re-encrypts) |
| reversed1/2 | Double reverse | ❌ Decoy (no-op) |

---

### Output Functions: Where the Scrambled Data Goes

```vba
WriteToEventLog  → %TEMP%\~debug.log               ← disguised as debug log
WriteToRegistry  → HKCU\...\RunOnce\Temp           ← persistence key
WriteToDisk      → %TEMP%\windows\fonts\winload.ini ← disguised as system cache
```

All three use `WScript.Shell` obfuscated with Chr() values. The content written is `reversed2`: the **re-encrypted scrambled version** of the flag, not the flag itself.

---

## 🚩 Flag

```
ECL{your_flag_here}
```

---

## 📋 Full Checklist: Verify Challenge is Ready

| Test | Command | Expected Result |
|------|---------|----------------|
| File recognized | `file eclipse.docm` | Microsoft Word 2007+ |
| Hashes documented | `md5sum` / `sha256sum` | Consistent hashes |
| Macro detected | `oleid eclipse.docm` | VBA Macros: HIGH |
| Full VBA dumped | `olevba eclipse.docm` | Complete source visible |
| Chr() decoded | `olevba --reveal eclipse.docm` | WScript.Shell, ECLIPSE visible |
| IOCs extracted | `olevba --ioc eclipse.docm` | URL, registry keys, file paths |
| Payload parts found | grep for p1/p2/p3/p4 | All 4 parts visible |
| Xor 42 visible | grep for `data5\|data6\|Xor` | `temp_val Xor 42` found |
| Flag decoded | `python3 solve.py` | Flag prints correctly |
| Metadata clean | `exiftool eclipse.docm` | svc_backup / 2019 date |

All 10 pass ✅: Challenge is ready.

---

## 💡 Key Takeaways

What makes this challenge work:

1. **Realistic macro structure**: real techniques used by actual malware (Chr obfuscation, split strings, fake update beacon)
2. **Every layer has a purpose**: decoys are designed to look more complex than the real operations
3. **The flag is hidden mid-execution**: `data6` holds the flag but the code continues past it, making solvers doubt themselves
4. **The ECLIPSE key is a rabbit hole**: passed to a fake AES function that does nothing, but looks critical
5. **Empty dangerous-sounding stubs**: `InjectShellcode`, `BypassUAC` send analysts down dead ends

The solve path is logical and clean once the obfuscation is stripped away, but getting there requires patience and careful static analysis.

---

<div align="center">

*Challenge created for Eclipse CTF: static analysis only, no execution required*

*Writeup by HATIM BOUSSETA*

</div>
