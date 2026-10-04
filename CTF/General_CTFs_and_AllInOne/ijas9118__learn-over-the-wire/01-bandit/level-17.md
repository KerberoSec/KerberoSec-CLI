# Bandit Level 17 → Level 18

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-17-blue?style=flat-square)

The password for Level 18 is located in `passwords.new` and is the only line that has been changed between `passwords.old` and `passwords.new`.

### Accessing the Level

Login using the RSA Private Key retrieved from Level 16.

```bash
ssh -i passwords/bandit/private_key bandit17@bandit.labs.overthewire.org -p 2220
```

### Retrieving the Password

#### 1. Comparing the files
Since the files likely contain dozens of lines, manually scanning would be time-consuming. Use the `diff` command to highlight the exact difference.

```bash
diff passwords.old passwords.new
```

#### 2. Analyzing the Output
The output indicates exactly which line was changed and shows both the old and new versions.

```text
42c42
< KxOU4IzbX... (old version)
---
> x2gLTTjFwM... (new version)
```

The password for Level 18 is the line marked with **`>`**.

### Understanding `diff` Output

`diff` compares files line by line and outputs the differences using a shorthand notation.

| Symbol | Meaning | Role in this Level |
| :--- | :--- | :--- |
| **`<`** | **Left Side** | Refers to the first file provided (`passwords.old`). |
| **`>`** | **Right Side** | Refers to the second file provided (`passwords.new`). |
| **`---`** | **Divider** | Separates the old content from the new content. |
| **`42c42`** | **Change Descriptor** | Line 42 in file one must be **Changed** (`c`) to match line 42 in file two. |

#### 3. Exiting and Storing
Copy the new password, exit the session, and save your progress locally.

```bash
exit

# Save the password for Level 18
echo "PASSWORD" > passwords/bandit/lvl18
```

### Command Reference

| Command | Usage | Description |
| :--- | :--- | :--- |
| `diff` | `file1 file2` | **Difference**: Compares two files and displays the lines that do not match. |

> [!IMPORTANT]
> The order of files matters in `diff`. Swapping `passwords.new` and `passwords.old` would swap the `<` and `>` symbols in your output.

> [!TIP]
> If you prefer a more visual layout, use `diff -y` (side-by-side) to see the differences in two adjacent columns.

> [!CAUTION]
> If the command returns no output, it means the files are identical.
