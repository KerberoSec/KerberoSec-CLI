# Reverse Engineering Writeup: Unpacking a Hidden LZMA Payload

## Overview

This challenge involved reverse engineering a packed 64-bit Windows PE executable. Rather than containing the challenge logic directly, the executable acted as a custom loader that searched for a hidden section, unpacked its contents, and executed a second-stage payload.

The objective was to understand the loader, recover the hidden executable, and extract the final flag.

---

# Initial Analysis

I began by loading the executable into **Ghidra** to inspect its overall structure.

While reviewing the PE sections, I noticed an unusual custom section named **`.ATOM`**. Unlike standard PE sections such as `.text`, `.rdata`, or `.data`, this section immediately stood out as suspicious because custom sections are commonly used to hide encrypted or compressed payloads.

<img width="958" height="506" alt="01-sections" src="https://github.com/user-attachments/assets/9eae402e-1155-4e53-9ffa-90e7c25d438a" />

To confirm the section layout, I inspected the binary using `rabin2`.

```bash
rabin2 -S bin-ins.exe
```

The output confirmed that `.ATOM` occupied approximately **448 KB**, making it significantly larger than the other sections.

<img width="526" height="182" alt="02_section_table" src="https://github.com/user-attachments/assets/d4421963-91e4-48d8-918c-187ef021a42a" />

At this point, it was clear that `.ATOM` was likely storing the actual payload.

---

# Understanding the Loader

Next, I analyzed the program entry point.

The loader manually parsed its own PE headers and iterated through every section instead of relying on Windows loader APIs.

Each section name was passed into a small hashing routine before being compared against a hardcoded value.

The hashing routine performs a **7-bit rotate-right** followed by an addition of the current character.

```c
hash = ROR32(hash, 7);
hash += current_character;
```

<img width="959" height="505" alt="03_hash_function" src="https://github.com/user-attachments/assets/cb924a6d-a986-4883-b338-3144aa2c35d7" />

The loader compared the resulting hash against:

```
0x9F520B2D
```

To identify which section produced this value, I recreated the algorithm in Python.

The results showed:

```
.ATOM -> 0x9f520b2d
ATOM  -> 0x9f52084d
```

<img width="228" height="74" alt="04_hash_verification" src="https://github.com/user-attachments/assets/58da1163-3a9d-4e4f-8c6f-eae3e437bb77" />

This confirmed that the loader specifically searched for the **`.ATOM`** section before continuing execution.

---

# Extracting the Hidden Payload

Since the payload was stored inside `.ATOM`, I extracted the section directly from the executable.

```bash
dd if=bin-ins.exe of=atom.bin bs=1 skip=$((0x6000)) count=$((0x6FE00))
```

After extraction, I analyzed the file with **Binwalk**.

```bash
binwalk atom.bin
```

Binwalk immediately detected the contents as an **LZMA compressed stream**.

<img width="938" height="204" alt="05_lzma_detection" src="https://github.com/user-attachments/assets/5b632a4f-46f5-482c-b94a-b9e691949d42" />

Recognizing the compression format meant there was no need to reverse the decompression algorithm manually.

---

# Recovering the Second-Stage Executable

I used Python's built-in `lzma` module to decompress the extracted payload.

After decompression, I verified the recovered file.

```bash
file payload.bin
```

The output identified it as another **64-bit Windows PE executable**.

<img width="596" height="222" alt="06_payload_recovered" src="https://github.com/user-attachments/assets/237593af-6d95-406b-be85-7f8b3e7dc359" />

This confirmed that the original executable served only as a loader, while the actual challenge logic resided inside the unpacked binary.

---

# Analyzing the Second Stage

The recovered executable was loaded into Ghidra for further analysis.

Browsing the string table revealed an interesting string:

```
Congratulations! Here's your flag:
```

<img width="959" height="505" alt="07_strings" src="https://github.com/user-attachments/assets/d8b763df-f9bf-40aa-ae82-b730aa146eaa" />

Following the cross-reference to this string led directly to the routine responsible for constructing the final flag.

Instead of storing the flag as a single string, the program initialized several Base64 fragments during static initialization.

---

# Recovering the Flag

The global constructor populated an array named `flagParts` with multiple Base64 fragments.

<img width="959" height="505" alt="flag-part-1" src="https://github.com/user-attachments/assets/f2cc8ebe-d257-451c-8de5-d39426ce122d" />

<img width="959" height="503" alt="flag-part-2" src="https://github.com/user-attachments/assets/3650df24-0c33-4b6e-ada2-663e8713f72e" />

<img width="959" height="505" alt="flag-part-3" src="https://github.com/user-attachments/assets/0faf01c9-3d75-46bd-8aa7-ba9b7cc1133a" />

The fragments were:

```
cGljb0NURnt
uM3R3MHJrXz
FzXzRQMXNfN
FNfVzMxMV82
ODU1NTY2NH0K
```

After concatenating the fragments, I decoded the resulting Base64 string.

<img width="356" height="97" alt="09_flag_decode" src="https://github.com/user-attachments/assets/62c4b031-d233-4122-91b7-dc6ffd87ae47" />

The decoded output revealed the final flag.

```
picoCTF{n3tw0rk_1s_4P1s_4S_W311_68555664}
```

---

# Tools Used

- Ghidra
- Rabin2
- Binwalk
- Python
- LZMA
- Base64
- Linux Command Line Utilities

