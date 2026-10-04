# 🔐 HTB Challenge: Simple Encryptor Write-up

- **Category:** Reversing  
- **Difficulty:** Easy  
- **Flag:** `HTB{vRy_s1MplE_F1LE3nCryp0r}`  
- **Tools Used:** `strings`, `file`, `nano`, `gcc`, custom `decrypt.c`  
- **Platform:** Hack The Box

---

## 📁 Files

```bash
Simple Encryptor.zip
├── encrypt       # ELF 64-bit binary
├── flag.enc      # Encrypted flag
````

---

## 🧵 Walkthrough

### 🔓 Unzipping the Archive

```bash
unzip Simple\ Encryptor.zip
```

The archive required a password, but it successfully extracted with default input or maybe no password (not specified).

Resulting structure:

```bash
rev_simpleencryptor/
├── encrypt
└── flag.enc
```

---

### 🔍 Binary Inspection

```bash
file encrypt
```

Output:

```
encrypt: ELF 64-bit LSB pie executable, x86-64, dynamically linked ...
```

Then:

```bash
strings encrypt
```

Notable strings:

```
flag
flag.enc
encrypt.c
fopen, fread, fwrite, malloc, srand, time
```

Looks like the program uses standard file operations and some randomness (`srand`, `time`). The source file was likely `encrypt.c`, hinting it’s custom-built with basic encryption.

---

### 🔓 Decryption Logic

After inspecting and deducing the likely logic (XOR/shift based on byte pattern), I wrote a decryption program manually.

```bash
nano decrypt.c
```

### 📄 `decrypt.c`

```c
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

int main() {
    // Open encrypted file
    FILE *fp = fopen("flag.enc", "rb");
    if (fp == NULL) {
        perror("Error opening file");
        return 1;
    }

    // Read seed value (first 4 bytes)
    uint32_t seed;
    fread(&seed, sizeof(seed), 1, fp);

    // Get file_size (subtract seed size, 4 bytes, to get encrypted data size)
    fseek(fp, 0, SEEK_END);
    long file_size = ftell(fp) - sizeof(seed);
    uint8_t *buffer = malloc(file_size);

    // Check if memory allocation is successful
    if (buffer == NULL) {
        perror("Memory allocation failed");
        fclose(fp);
        return 1;
    }

    // Read encrypted file content to buffer
    fseek(fp, sizeof(seed), SEEK_SET);
    fread(buffer, 1, file_size, fp);
    fclose(fp);

    // Set seed value for rand()
    srand(seed);
    
    for (int i = 0; i < file_size; i++) {
        // Generate random numbers for XOR and bit shift as done during encryption
        int rand_num_xor = rand();
        int rand_num_bitshift = rand();
        int shift_num = rand_num_bitshift & 7;

        // Reverse the bit shifting (shift in the opposite direction)
        buffer[i] = (buffer[i] >> shift_num) | (buffer[i] << (8 - shift_num));

        // Reverse the XOR operation
        buffer[i] = buffer[i] ^ rand_num_xor;
    }

    // Print result
    printf("%s\n", buffer);
    free(buffer);

    return 0;
}
```
---

### 🔧 Compilation & Execution

```bash
gcc -o decrypt decrypt.c
```

```bash
./decrypt
```

Output:

```
HTB{vRy_s1MplE_F1LE3nCryp0r}
```

### ✅ Flag

```text
HTB{vRy_s1MplE_F1LE3nCryp0r}
```

---

## 💡 Takeaways

- The binary used a custom encryption method: seeded `rand()`, XOR, and bit shifts.
- Reverse engineering was straightforward due to helpful `strings` output.
- Even without source, logic can be deduced from naming hints and usage patterns.

---

## 📎 Useful Commands

```bash
unzip Simple\ Encryptor.zip
file encrypt
strings encrypt
nano decrypt.c
gcc -o decrypt decrypt.c
./decrypt
```

---
## 🏷️ Tags

#ReverseEngineering #SimpleEncryptor #BinaryExploitation #HackTheBox #CTF 
 

[[Reverse Engineering]]