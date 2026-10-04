# Bandit Level 04 → Level 05

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-04-blue?style=flat-square)

The password for Level 5 is stored in the only human-readable file in the `inhere` directory.

### Accessing the Level

```bash
sshpass -p $(cat passwords/bandit/lvl04) ssh bandit4@bandit.labs.overthewire.org -p 2220
```

### Retrieving the Password

#### 1. Navigating to the directory
Move into the `inhere` folder to see the list of potential files.

```bash
cd inhere/
ls
```

#### 2. Determining File Types
The directory contains multiple files starting with a hyphen (e.g., `-file01`). Instead of guess-and-checking with `cat`, use the `file` command to identify human-readable (ASCII text) content.

**Checking a Single File**
```bash
file ./-file07
```

**Batch Checking with a Loop**
```bash
for i in $(ls); do file ./$i; done
```

#### 3. Analyzing the Output
Look for the file identified as `ASCII text`. In this case, it's `-file07`.

```bash
cat ./-file07
```

> [!IMPORTANT]
> The `file` command analyzes the magic bytes at the beginning of a file to determine its type. This is the most efficient way to find "human-readable" data (ASCII or UTF-8 text).

#### 4. Exiting and Storing
Copy the password and shut down your session.

```bash
exit

# Save the password for the next level
echo "PASSWORD" > passwords/bandit/lvl05
```

### Command Reference

| Command | Usage | Description |
| :--- | :--- | :--- |
| `file` | `./-fileXX` | Determines the type of data within a file. |
| `for` | `for i in...` | A shell loop used to iterate over a list of items (like files). |
| `reset` |: | Clears the terminal and restores standard settings if binary data "messes up" the display. |

> [!TIP]
> **Why `reset`?** Reading binary data (like `data` or `OpenPGP` files) can sometimes break your terminal's character encoding, causing strange symbols to appear. Running `reset` fixes this instantly.

> [!CAUTION]
> As established in earlier levels, using `cat` on files starting with a hyphen requires the `./` prefix.
