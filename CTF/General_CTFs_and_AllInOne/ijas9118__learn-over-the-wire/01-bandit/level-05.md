# Bandit Level 05 → Level 06

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-05-blue?style=flat-square)

The password for Level 6 is stored in a file somewhere under the `inhere` directory that is **human-readable**, **1033 bytes in size**, and **not executable**.

### Accessing the Level

Login with the credentials gathered from Level 4.

```bash
sshpass -p $(cat passwords/bandit/lvl05) ssh bandit5@bandit.labs.overthewire.org -p 2220
```

### Retrieving the Password

#### 1. Navigating the directory
The home directory contains multiple subdirectories (`maybehere00` to `maybehere19`). Navigating each manually is inefficient.

```bash
cd inhere/
```

#### 2. Advanced Search with `find`
Instead of browsing, use the `find` command with specific filters to narrow down the target file instantly.

```bash
find . -type f -size 1033c ! -executable
```

#### 3. Analyzing the Command Switches
- `.` : Search in the current directory and all subdirectories.
- `-type f` : Search only for regular files (ignores directories).
- `-size 1033c` : Search for files with a size of exactly 1033 bytes (`c` stands for characters/bytes).
- `! -executable` : The `!` operator negates the following condition, searching for files that are **not** executable.

#### 4. Exiting and Storing
Read the resulting file path, exit the session, and save your progress.

```bash
cat ./maybehere07/.file2
exit

# Save the password for the next level
echo "PASSWORD" > passwords/bandit/lvl06
```

### Command Reference

| Command | Switch | Description |
| :--- | :--- | :--- |
| `find` | `-type f` | Filters results to files only. |
| `find` | `-size 1033c` | Search for a specific byte size (`c` suffix is required). |
| `find` | `!` | Negates the following condition (read as "NOT"). |
| `ls` | `-alR` | Lists files recursively with detail (useful but slower for large structures). |

> [!IMPORTANT]
> The `find` command is powerful because it allows you to combine multiple file attributes (owner, size, type, permissions) to locate files in complex directory trees.

> [!TIP]
> **Why `1033c`?** In Linux, file sizes can be queried in blocks (`b`), kilobytes (`k`), or characters (`c`). For exact byte matches, always use `c`.
