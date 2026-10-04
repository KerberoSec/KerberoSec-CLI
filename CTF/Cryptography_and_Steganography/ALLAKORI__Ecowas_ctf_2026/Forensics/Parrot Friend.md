# CTF Writeup: Parrot Friend (Forensics)
**Event:** EcowasCTF 2026  
**Category:** Forensics  
**Difficulty:** Easy  
**Points:** 100

---

## 1. Challenge Overview
The challenge provided a zip file named `parrot_cage.zip`. The description gave a crucial hint: *"I'm a parrot, I might lie sometime. But trust me! Let me out!"* This suggested that the obvious contents of the archive might be a decoy.

## 2. Initial Investigation
Upon attempting to unzip the file in a Linux environment, a long hexadecimal string was displayed in the terminal output before the extraction prompt:

```bash
┌──(kali㉿kali)-[~/ecowas/forensic]
└─$ unzip parrot_cage.zip 
Archive:  parrot_cage.zip
45636f7761734354467b7034727230745f6c3133735f636833636b5f7468335f633467337d
```

### The Decoy
After extracting, the directory contained a file named `flag.txt`:
```bash
$ cat flag.txt
EcowasCTF{y0u_f0und_m3_g00d_j0b}
```
Given the hint about the "parrot lying," this flag was identified as a red herring.

## 3. Analysis & Solution
The hexadecimal string observed earlier is stored in the **ZIP Archive Comment**. Forensic analysis of zip files often reveals hidden data within these metadata fields.

### Decoding the Hex
To retrieve the authentic flag, the hex string was converted to ASCII:

**Hex String:** `45636f7761734354467b7034727230745f6c3133735f636833636b5f7468335f633467337d`

**Command:**
```bash
echo "45636f7761734354467b7034727230745f6c3133735f636833636b5f7468335f633467337d" | xxd -r -p
```

**Result:**
`EcowasCTF{p4rr0t_l13s_ch3ck_th3_c4g3}`

## 4. Conclusion
The real flag was hidden within the metadata (zip comment) of the archive, proving that in forensics, the environment and metadata are just as important as the file contents themselves.

**Flag:** `EcowasCTF{p4rr0t_l13s_ch3ck_th3_c4g3}`
