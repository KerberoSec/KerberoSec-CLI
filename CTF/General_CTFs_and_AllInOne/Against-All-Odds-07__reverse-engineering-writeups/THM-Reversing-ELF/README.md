# THM-Reversing-ELF

This repository contains writeups for several beginner reverse engineering challenges. The objective was to recover hidden passwords and flags through static analysis using Linux tools and Ghidra.

---

# Crackme1

## Overview

The first challenge was a simple ELF binary. Before performing any reverse engineering, the binary was executed to observe its behavior.

<img width="260" height="59" alt="flag1" src="https://github.com/user-attachments/assets/21e45744-a475-4ccf-b04b-8a2984867235" />

---

## Analysis

Upon execution, the binary immediately printed a flag without requiring any user input.

No password validation or hidden logic was present.

---

## Solution

Running the binary revealed the flag directly.

### Flag

```text
flag{not_that_kind_of_elf}
```

---

# Crackme2

## Overview

The objective of this challenge was to recover the correct password required by the binary.

The analysis began with basic static reconnaissance techniques.

---

## Initial Reconnaissance

The first step was extracting strings from the binary.

```bash
strings crackme2
```

Among the extracted strings, a suspicious value immediately stood out:

```text
super_secret_password
```

<img width="385" height="464" alt="crackme2_str" src="https://github.com/user-attachments/assets/7fab4d0c-5f52-4395-a51c-1ee67c962f13" />

---

## Static Analysis

The binary was loaded into Ghidra for further analysis.

Examining the decompiled `main()` function revealed a direct password comparison:

```c
strcmp(argv[1], "super_secret_password");
```

If the comparison succeeded, the binary executed the `giveFlag()` function.

<img width="955" height="505" alt="decompiled" src="https://github.com/user-attachments/assets/d07f2b12-7fce-47af-b8ad-2d9167aa51a3" />

---

The password was stored directly inside the binary.

Recovered password:

```text
super_secret_password
```

---

The recovered password was supplied to the program.

<img width="371" height="77" alt="flag2" src="https://github.com/user-attachments/assets/efeca461-70ef-48f2-af21-f75a83db9a5b" />

---

## Flag

```text
flag{if_i_submit_this_flag_then_i_will_get_points}
```

---

# Crackme3

## Overview

Unlike the previous challenge, the password was not stored directly in plain text.

The binary transformed user input before comparing it against an embedded value.

---

## Static Analysis

The password validation routine was examined using Ghidra.

The binary processed user input and compared the transformed result against the following string:

```text
ZjByX3kwdXJfNWVjMG5kX2xlNTVvbl91bmJhc2U2NF80bGxfN2gzXzdoMW5nNQ==
```

<img width="958" height="506" alt="crackme3_main" src="https://github.com/user-attachments/assets/1db3854f-80ea-4db8-aac5-a8af54dafc14" />

---

## Identifying the Encoding

The string strongly resembled Base64 encoded data.

The value was decoded using:

```bash
echo "ZjByX3kwdXJfNWVjMG5kX2xlNTVvbl91bmJhc2U2NF80bGxfN2gzXzdoMW5nNQ==" | base64 -d
```

Output:

```text
f0r_y0ur_5ec0nd_le55on_unbase64_4ll_7h3_7h1ng5
```

This revealed the correct password.

---

## Validation

The recovered password was supplied to the binary.

<img width="638" height="93" alt="crackme3_flag decode" src="https://github.com/user-attachments/assets/1ef2e614-4ce6-4d67-8299-34664e920adc" />

---

## Password

```text
f0r_y0ur_5ec0nd_le55on_unbase64_4ll_7h3_7h1ng5
```

---

# Crackme4

## Overview

This challenge used a simple obfuscation mechanism to hide the password.

Instead of storing the password directly, the binary stored an encoded string and decoded it at runtime.

---

## Main Function Analysis

The entry point of the program passes user input to the password comparison routine.

```c
compare_pwd(argv[1]);
```

<img width="959" height="503" alt="crackme4_get_pwd" src="https://github.com/user-attachments/assets/a369cdcb-cf10-4a49-85bf-696c29977a3d" />

---

## Password Verification Routine

The `compare_pwd()` function copies an encoded string into a local buffer.

```c
builtin_strncpy(
    local_28,
    "I]{I\x14V\x17{WAGQV\x17{TS@",
    0x13
);
```

The encoded data is then passed to `get_pwd()` before being compared with user input.

```c
get_pwd(local_28);
strcmp(local_28, param_1);
```

This indicates the string is decoded at runtime before validation.

<img width="958" height="504" alt="crackme4_cmp" src="https://github.com/user-attachments/assets/d1c87115-b35b-4094-b50e-ef483d7eb4f8" />

---

## Reversing the Decoding Function

Analysis of `get_pwd()` revealed a simple XOR operation:

```c
buffer[i] ^= 0x24;
```

Since XOR is reversible, applying the same operation again reveals the original password.

<img width="959" height="503" alt="crackme4_get_pwd" src="https://github.com/user-attachments/assets/dedbc4cc-1cd0-45ef-b984-220a81db1dbf" />

---

## Recovering the Password

A small Python script was created to reverse the XOR transformation.

```python
s = b"I]{I\x14V\x17{WAGQV\x17{TS@"
print(''.join(chr(c ^ 0x24) for c in s))
```

Output:

```text
my_m0r3_secur3_pwd
```
<img width="265" height="52" alt="decode py" src="https://github.com/user-attachments/assets/0b633614-1486-46f6-a576-2dc71f62d372" />

---

## Validation

The recovered password was supplied to the binary.

<img width="263" height="62" alt="flag4" src="https://github.com/user-attachments/assets/7a4eed90-7508-417c-97b2-7ce7ec92f0d3" />

---

## Password

```text
my_m0r3_secur3_pwd
```

---

