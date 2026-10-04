# Bandit Level 09 → Level 10

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-09-blue?style=flat-square)

The password for Level 10 is stored in `data.txt` among human-readable strings, preceded by several `=` characters.

### Accessing the Level

```bash
sshpass -p $(cat passwords/bandit/lvl09) ssh bandit9@bandit.labs.overthewire.org -p 2220
```

### Retrieving the Password

#### 1. Identifying the file content
A standard `cat` or `file` command reveals that `data.txt` is binary-intensive (marked as "data"). Reading it directly will output many non-printable, garbled characters.

```bash
file data.txt
```

#### 2. Extracting Human-Readable Text
Use the `strings` command to skip over the binary data and only display sequences of printable characters.

```bash
# General search
strings data.txt
```

#### 3. Filtering by many "=" signs
The goal mentions the password is preceded by several `=` symbols. Use `grep` to narrow down the search to lines containing matching markers.

```bash
strings data.txt | grep "==="
```

> [!IMPORTANT]
> The **`strings`** command is essential when dealing with binary files. It automatically ignores non-printable "garbage" characters that would otherwise crash or mess up your terminal display.

### Alternative Techniques

| Method | Effect | Why use it? |
| :--- | :--- | :--- |
| `strings -n 12` | Only shows strings at least 12 chars long. | Filters out short noise or common system keywords. |
| `grep "=="` | Matches lines with double equals. | More specific than searching for a single `=`. |
| `less data.txt` | Opens the file in a viewer. | Allows manual scrolling through the partial garbage/strings. |

#### 4. Exiting and Storing
Read the output password, exit the session, and save your progress.

```bash
exit

# Save the password for the next level
echo "PASSWORD" > passwords/bandit/lvl10
```

### Command Reference

| Command | Usage | Description |
| :--- | :--- | :--- |
| `strings` | `data.txt` | Extracts and prints sequences of printable characters from a file. |
| `grep` | `"pattern"` | A regex search tool used to filter specific lines from a larger output. |

> [!TIP]
> If your terminal gets "messed up" from attempting to `cat` binary data, remember to use the **`reset`** command discussed in earlier levels.

> [!CAUTION]
> Using `grep` directly on binary files (e.g., `grep "=" data.txt`) may return no results or an "is a binary file" error. Use `strings` first.
