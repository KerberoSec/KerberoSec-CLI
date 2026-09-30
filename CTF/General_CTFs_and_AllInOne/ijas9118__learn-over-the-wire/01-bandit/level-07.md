# Bandit Level 07 → Level 08

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-07-blue?style=flat-square)

The password for Level 8 is stored in the `data.txt` file, located on the line next to the word **millionth**.

### Accessing the Level

```bash
sshpass -p $(cat passwords/bandit/lvl07) ssh bandit7@bandit.labs.overthewire.org -p 2220
```

### Retrieving the Password

#### 1. Assessing the file size
`data.txt` is quite massive, containing nearly 100,000 lines. Attempting to manually read it with `cat` is impractical.

```bash
# Check line, word, and character counts
wc data.txt

# Inspect only the line count
wc -l data.txt
```

#### 2. Searching for patterns with `grep`
Instead of reading the entire file, use `grep` to filter for the keyword **millionth**. You can pipe (`|`) the output of `cat` into `grep` or use `grep` directly.

**Option A: Piping the result**
```bash
cat data.txt | grep "millionth"
```

**Option B: Direct search (Preferred)**
```bash
grep "millionth" data.txt
```

> [!IMPORTANT]
> The **pipe (`|`)** is a fundamental Linux concept. It takes the output from the command on the left and passes it as input to the command on the right.

#### 3. Exiting and Storing
Read the output password, exit the session, and save your progress.

```bash
exit

# Save the password for the next level
echo "PASSWORD" > passwords/bandit/lvl08
```

### Command Reference

| Command | Usage | Description |
| :--- | :--- | :--- |
| `wc` | `-l` | **Word Count**: Counts lines (`-l`), words, and bytes in a file. |
| `grep` | `"pattern"` | **Global Regular Expression Print**: Searches for matching text. |
| `\|` | Redirection | **Pipe**: Connects the output of one command to the input of another. |

> [!TIP]
> `grep` is case-sensitive by default. If your keyword search fails, try adding the `-i` flag (e.g., `grep -i "millionth"`) to perform a case-insensitive search.

> [!CAUTION]
> If you `cat` a file with 100,000 lines without a filter, your terminal might slow down or become unresponsive for several seconds while it processes the stream.
