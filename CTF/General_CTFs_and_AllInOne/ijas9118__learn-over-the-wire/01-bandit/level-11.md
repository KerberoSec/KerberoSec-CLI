# Bandit Level 11 → Level 12

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-11-blue?style=flat-square)

The password for Level 12 is stored in the `data.txt` file, where all lowercase (a-z) and uppercase (A-Z) letters have been rotated by 13 positions (**ROT13**).

### Accessing the Level

```bash
sshpass -p $(cat passwords/bandit/lvl11) ssh bandit11@bandit.labs.overthewire.org -p 2220
```

### Understanding ROT13
**ROT13** (Rotate by 13) is a simple substitution cipher that replaces a letter with the one 13 positions after it in the alphabet. Because the Latin alphabet has exactly 26 letters, shifting by 13 twice (13 + 13 = 26) returns you to the original letter. 

This makes ROT13 its own inverse: you use the exact same formula to both encrypt and decrypt.

### Retrieving the Password

#### 1. Inspecting the scrambled data
The content of `data.txt` will look like gibberish because every letter is shifted.

```bash
cat data.txt
```

#### 2. Translating with `tr`
Use the `tr` command to perform a character-by-character translation.

```bash
cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

### Explaining the `tr` Mapping
The `tr` command takes two arguments: the **original set** and the **translated set**. 

| Set | Mapping Range | Meaning |
| :--- | :--- | :--- |
| **Original** | `A-Z` | Match every uppercase character from A to Z. |
| **Shifted** | `N-ZA-M` | Map A to N, B to O... and when you hit Z, wrap back to A through M. |

By listing the translation as `N-Z` followed by `A-M`, you are creating a full 26-character map where every letter is perfectly offset by 13 positions.

#### 3. Exiting and Storing
Read the decrypted output, exit the session, and save your progress locally.

```bash
exit

# Save the password for Level 12
echo "PASSWORD" > passwords/bandit/lvl12
```

### Command Reference

| Command | Usage | Description |
| :--- | :--- | :--- |
| `tr` | `'Set1' 'Set2'` | **Translate**: Replaces characters from Set1 with corresponding characters in Set2. |

> [!IMPORTANT]
> ROT13 does not rotate numbers or special characters. Symbols like `!`, `@`, or `123` remain unchanged during the translation process.

> [!TIP]
> You can quickly remember the mapping as **A-M ↔ N-Z**. Since 13 + 13 = 26, the alphabet is split down the middle.

> [!CAUTION]
> If you translate using `tr 'A-Z' 'N-Z'`, the command will fail because the sets don't match in length. You must provide the full 26-character mapping (`N-ZA-M`).
