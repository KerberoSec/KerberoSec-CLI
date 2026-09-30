# Bandit Level 10 → Level 11

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-10-blue?style=flat-square)

The password for Level 11 is stored in the `data.txt` file and is encoded in **Base64**.

### Accessing the Level

```bash
sshpass -p $(cat passwords/bandit/lvl10) ssh bandit10@bandit.labs.overthewire.org -p 2220
```

### Retrieving the Password

#### 1. Inspecting the source
Base64 data is easily recognizable by its character set (A-Z, a-z, 0-9, +, /, and often padding with `=`).

```bash
cat data.txt
```

#### 2. Decoding the data
Use the `base64` command with the `-d` switch to translate the encoded string back into plain readable text.

```bash
# Decode the file's contents
cat data.txt | base64 -d
```

> [!IMPORTANT]
> **Base64** is an encoding scheme that represents binary data as text. It is **not** a secure encryption method; anyone can decode it instantly with a simple command.

#### 4. Exiting and Storing
Read the output password, exit the session, and save your progress.

```bash
exit

# Save the password for the next level
echo "PASSWORD" > passwords/bandit/lvl11
```

### Command Reference

| Command | Switch | Description |
| :--- | :--- | :--- |
| `base64` | `-d` | **Decode**: Converts Base64 encoded input back into its original form. |
| `base64` | *none* | Encodes the provided input into Base64. |

> [!TIP]
> You can also decode directly from the file without piping: `base64 -d data.txt`.

> [!CAUTION]
> If your Base64 string is missing characters or has excessive padding, the `base64` command might throw an "invalid input" error. Ensure the entire line is copied correctly.
