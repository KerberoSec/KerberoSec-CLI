# 🕵️ Shift In Sands (DFIR: Supply-Chain Intrusion Reconstruction)

## Challenge Info

| Field | Details |
|---|---|
| Platform | Cybersecurity Hackathon 2026 (CydeaRange) |
| Category | Digital Forensics & Incident Response |
| Points | 120 |
| Tools Used | file, base64, Python 3 (XOR / rot13 / reverse) |

---

## 🧩 Description

A DFIR analyst investigating a suspected espionage intrusion at a
diplomatic mission (South Asia region). A senior officer had opened an
unexpected email attachment; endpoint telemetry then flagged unusual
process activity. Given a bundle of recovered artifacts (`artifacts.zip`)
and a forensic-image-style directory structure, the task: reconstruct
what happened on the host and recover the flag.

---

## 🔍 Reconnaissance

**Step 1: Inventory the artifact bundle**

```
artifacts/
├── bait/            MoU-Regional-Cooperation.pdf
├── phishing/        meeting_credentials.eml, pdfs/Inter-ministerial meeting Credentials.pdf
├── clickonce/       AdobeReaderInstaller.application
├── readerconfig/exe/ ReaderConfiguration.exe, DEVOBJ.dll
├── moduleinstaller/ module_installer.py
├── stealerbot/      stealerbot.py
└── exfil/           browser_history.db, keystrokes.log, screen_shot.b64
```

The folder names alone lay out the intrusion chain top to bottom:
**bait → phishing → clickonce delivery → side-loaded implant → stager →
final implant → exfiltrated data.**

**Step 2: Read the phishing email**

`meeting_credentials.eml` is a spoofed message from a fake
`mod.gov.bd.pk-mail.org` domain, carrying a decoy PDF
("Inter-ministerial meeting Credentials") that claims the victim's
Adobe Reader is out of date and links to an "update."

---

## ⚔️ Attack Process

**Step 1: Follow the lure to the delivery mechanism**

The decoy PDF's link points to `AdobeReaderInstaller.application`: a
**ClickOnce deployment manifest**, not a real Adobe installer. ClickOnce
manifests are a known technique: they auto-install trusted-looking
apps with a single click and no admin prompt on many configs. The
manifest bundles two files: `ReaderConfiguration.exe` and `DEVOBJ.dll`.

**Step 2: Identify the DLL side-load**

`ReaderConfiguration.exe` is a repackaged, validly-signed **MagTek Inc.**
utility (a real card-reader configuration tool): Windows trusts its
Authenticode signature. On launch it loads a companion `DEVOBJ.dll`
from the same folder. Since Windows only verifies the *EXE's* signature,
not every DLL it happens to load, the attacker's malicious DLL rides in
under the legitimate binary's trust: classic **DLL side-loading**.

**Step 3: Decrypt the DLL's payload**

`DEVOBJ.dll` carries an XOR-encrypted blob. The key isn't random: it's derived from the campaign's keying pattern tied to the abused
publisher string (`MagTek Inc.` → `MAGT3K2025`):

```python
import base64
ct_b64 = "PTMoIlo4W19cDyAuIyFfLm1ZXEY5ICs4VjkcQEsVbTIzNVQuCGABFW0tKDVXLkAKf1opNCsxeiVBRFNZISQ1dBM8U1tXDyg5IT1f"
key = "MAGT3K2025"
data = base64.b64decode(ct_b64)
kb = key.encode()
print(bytes(b ^ kb[i % len(kb)] for i, b in enumerate(data)))
# -> provision:module_installer.py  stage:P3  loader:ModuleInstaller  wake:exfil
```

This confirms the DLL's job: drop and run `module_installer.py` as
stage 3.

**Step 4: Follow ModuleInstaller to the final implant**

`module_installer.py` carries its own base64 blob:

```python
import base64
print(base64.b64decode("c3RlYWxlcmJvdC5weQ==").decode())
# -> stealerbot.py
```

Stage 4 is `stealerbot.py`: the actual data-stealing implant.

**Step 5: Reverse StealerBot's obfuscation routines**

`stealerbot.py`'s source comments explain exactly which weak obfuscation
routine was applied to each exfiltrated artifact, and explicitly says
to invert them:

| Artifact | Routine used at capture | Inverse applied |
|---|---|---|
| `browser_history.db` (URL field) | `base64encode` | `base64decode` |
| `keystrokes.log` (captured segment) | string reverse (`flip`) | reverse again |
| `screen_shot.b64` (OCR note) | `rot13` | `rot13` (self-inverse) |

```python
import base64, codecs

part1 = base64.b64decode("ZmxhZ3tTMWQzVzFuZA==").decode()       # -> flag{S********r
part2 = "gn1tf1hS_s4H_r3"[::-1]                                  # -> 3r_H4s_Sh1ft1ng
part3 = codecs.encode("_F4aqf_P1vpx0apr}", "rot_13")             # -> _S4nds_C1ick0nce}

print(part1 + part2 + part3)
```

**Step 6: Concatenate in exfil order**

Browser history → keylog → screenshot is the natural chronological
capture order inside `StealerBot.run()`, so the three decoded fragments
concatenate directly into the full flag.

---

## 🚩 Flag
```
flag{S********r_H*s_S*******g_S***s_C*********e}
```

---

## 💡 Lessons Learned

- Folder/file naming in a forensic bundle is itself intelligence: this
  challenge's directory structure mapped the entire kill chain before
  a single file was opened
- DLL side-loading abuses the fact that Windows Authenticode only
  verifies the signed EXE, not every library it dynamically loads: a
  legitimately-signed binary next to an attacker-supplied DLL is a
  well-known persistence/evasion pattern (seen in real SideWinder APT
  campaigns targeting South Asian government targets)
- When a challenge hands you the exact obfuscation routines in source
  form (as `stealerbot.py` did), don't reinvent detection: just apply
  each documented inverse to its corresponding artifact in order
- Multi-stage malware challenges reward patience: each stage's decoded
  output is deliberately a pointer to the next stage's filename, so the
  chain solves itself once you follow it methodically

---

## 🛠️ Tools Used

- **file**: quick artifact triage
- **Python 3 (base64 / XOR / rot13 / string reverse)**: decoding every
  obfuscation layer in the chain

---

*Solved during Cybersecurity Hackathon 2026: legal, authorized CTF environment*
