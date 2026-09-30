# Bandit Level 08 → Level 09

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-08-blue?style=flat-square)

The password for Level 9 is stored in `data.txt` and is the only line of text that occurs exactly once.

### Accessing the Level

```bash
sshpass -p $(cat passwords/bandit/lvl08) ssh bandit8@bandit.labs.overthewire.org -p 2220
```

### Retrieving the Password

#### 1. Sorting and Counting Duplicates
The `uniq` command only detects duplicate lines that are adjacent. To find duplicates across the entire file, you must first alphabeticalize the content using `sort`.

```bash
# Sort content, then count unique occurrences
cat data.txt | sort | uniq -c
```

#### 2. Filtering for the Single Occurrence
After counting, use `grep -w 1` to find the entry that has a count of exactly "1".

```bash
cat data.txt | sort | uniq -c | grep -w "1"
```

> [!IMPORTANT]
> The **`-w`** (whole-word) switch is critical. It ensures that `grep` only matches the standalone digit "1" and ignores lines containing numbers like "10", "11", or "21."

### Deep Dive: `grep -w` (Whole Word Match)

The `-w` switch prevents partial matches. It treats the pattern as a complete word, surrounded by non-word characters (like whitespace or start/end of a line).

**Example Scenario:**
Imagine a file containing the following line counts:
```text
  10 apple
  11 banana
   1 orange
  21 grape
```

| Command | Matches | Why? |
| :--- | :--- | :--- |
| `grep "1"` | 10, 11, 1, 21 | All contain the character "1". |
| `grep -w "1"` | **1** | Only matches the exact digit "1" as a whole word. |

#### 3. Exiting and Storing
Read the output password, exit the session, and save your progress.

```bash
exit

# Save the password for the next level
echo "PASSWORD" > passwords/bandit/lvl09
```

### Command Reference

| Command | Usage | Description |
| :--- | :--- | :--- |
| `sort` |: | Alphabetizes lines of text (essential before using `uniq`). |
| `uniq` | `-c` | Removes duplicates. `-c` adds a prefix showing how many times each line occurred. |
| `grep` | `-w` | Matches only the **exact word** or number provided. |

> [!TIP]
> **Why `sort` first?** If you have two identical lines separated by a different line, `uniq` will think they are unique. Sorting brings all identical lines together so `uniq` can count them correctly.

> [!CAUTION]
> Without `-w`, filtering for "1" in a large frequency table will return hundreds of noisy results containing numbers like 10, 15, or 1000.
