# 🔴 CLASSIFIED: Operation Shadow Byte

## Case File #2026-NP-0042

| Field | Detail |
|:--|:--|
| **Classification** | CONFIDENTIAL |
| **Division** | Threat Intelligence |
| **Lead Analyst** | Dr. Layla Mansour |
| **Date Filed** | March 15, 2026 |

---

## Executive Summary

Neptune Security, a cybersecurity firm based in the Middle East with a second branch in Jordan, has been tracking a sophisticated threat group designated **"Crimson Veil"** for the past several months. The firm, which has expanded its operations into Europe over the last two years, identified the group conducting targeted attacks against financial institutions using custom C2 infrastructure.

Senior Analyst Dr. Layla Mansour intercepted an encoded payload from the group's C2 server. She began writing a Python decryption tool but her workstation crashed before she could complete it. The IR team recovered her incomplete script (`decoder.py`) and a handwritten note.

---

## Dr. Mansour's Note

> *"The payload is hex-encoded and XOR-encrypted. The key is the operation name: no spaces, all lowercase.*
>
> *The decrypted output is NOT plaintext: there are multiple encoding layers to peel back. One of them is locked with a key that bears our name."*

---

## Threat Actor Profile: Crimson Veil

| Field | Intelligence |
|:--|:--|
| **Designation** | Crimson Veil |
| **First Observed** | Early 2026 |
| **Region** | Middle East, expanding into Europe |
| **TTPs** | Spear-phishing, custom C2, credential harvesting |

### Credential Intelligence

**Crimson Veil** passwords use **three components** in a consistent structure. The decoded payload reveals the exact format.

> ⚠️ The hash uses a salt called **CYSTECH**.

---

## Hints

> 💡 **Mask characters:** `?u` = uppercase, `?l` = lowercase, `?d` = digit. Known letters and digits are written **as-is** in the mask.

---

## Mission

1. **Complete** `decoder.py`
2. **Run** it: extract the output
3. **Analyze** the script output
4. **Investigate** further using your cybersecurity skills
5. **Submit** flag as `HTU{credential}`

---

*Neptune Security | Middle East*
