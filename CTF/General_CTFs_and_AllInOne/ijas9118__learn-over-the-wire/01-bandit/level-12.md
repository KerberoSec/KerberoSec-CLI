# Bandit Level 12 → Level 13

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-12-blue?style=flat-square)

The password for Level 13 is stored in `data.txt`, which is a **hexdump** of a file that has been **repeatedly compressed** using multiple formats.

### Accessing the Level

```bash
sshpass -p $(cat passwords/bandit/lvl12) ssh bandit12@bandit.labs.overthewire.org -p 2220
```

### Retrieving the Password

#### 1. Creating a Temporary Workspace
Since you cannot write directly to the home directory, create a unique temporary folder in `/tmp/`.

```bash
# Generate a random temporary directory
mktemp -d
cd /tmp/tmp.huzx1ldfwX  # Replace with your generated name
cp ~/data.txt .
```

#### 2. Reverting the Hexdump
The initial `data.txt` is just a text representation of binary data. Use `xxd` to convert it back.

```bash
# -r reverts the hexdump into a binary file
xxd -r data.txt > data
```

#### 3. The Iterative Decompression Cycle
This level requires a repetitive cycle: identify the file type, rename it to the correct extension, and decompress it.

| Identification | Extension Fix | Decompression Command |
| :--- | :--- | :--- |
| `file data` | `mv data data.gz` | `gzip -d data.gz` |
| `file data` | `mv data data.bz2` | `bzip2 -d data.bz2` |
| `file data` | `mv data data.tar` | `tar -xvf data.tar` |

**Execution Log Fragment:**
```bash
file data              # Output: gzip compressed data
mv data data.gz
gzip -d data.gz

file data              # Output: bzip2 compressed data
mv data data.bz2
bzip2 -d data.bz2

file data              # Output: tar archive
mv data data.tar
tar -xvf data.tar
```

#### 4. Final Result
Continue the process until the `file` command reports **ASCII text**.

```bash
file data8.bin
cat data8.bin         # "The password is FO5dwFsc..."
```

#### 5. Exiting and Storing
Copy the password, stop the session, and save it locally.

```bash
exit

# Save the password for Level 13
echo "PASSWORD" > passwords/bandit/lvl13
```

### Command Reference

| Command | Usage | Description |
| :--- | :--- | :--- |
| `mktemp` | `-d` | Creates a secure, uniquely named directory for temporary work. |
| `xxd` | `-r` | **Reverse**: Reverts a hexdump file back to binary data. |
| `gzip` | `-d` | **Decompress**: Unpacks `.gz` (Gzip) files. |
| `bzip2` | `-d` | **Decompress**: Unpacks `.bz2` (Bzip2) files. |
| `tar` | `-xvf` | **Extract**: Unpacks `.tar` archives. (`x` extract, `v` verbose, `f` file). |

### 🔍 Deep Dive: Binary & Compression Tools

#### `xxd`: The Hex Toolbox
*   **What it is:** A tool to create a hex dump from a binary file, or do the reverse.
*   **Why use it:** Computers read binary (0s and 1s), but humans prefer Hexadecimal (0-F) for easier debugging. `xxd -r` is the standard way to rebuild a corrupted or shared binary from its text representation.

#### `gzip`: The Fast Standard
*   **What it is:** The GNU zip compression utility.
*   **Why use it:** Extremely fast and widely used for single-file compression. It produces `.gz` files and is the default for many Linux logs and source code distributions.

#### `bzip2`: The Heavy Lifter
*   **What it is:** A block-sorting file compressor.
*   **Why use it:** It generally provides **better compression ratios** than `gzip`, though it is slower to process. It is often used for large datasets or system backups where disk space saves are more important than speed.

#### `tar`: The Archivist
*   **What it is:** Short for "Tape Archive." 
*   **Why use it:** Unlike `gzip` or `bzip2`, `tar` does **not** compress data by itself (initially). Its job is to "bundle" many files and directories into one single archive. In modern Linux, it is almost always used with the `-z` (gzip) or `-j` (bzip2) flags to combine bundling and compression in one go.

> [!TIP]
> You can quickly remember the `tar` flags using the mnemonic **"eXtract Verbose File"** (`-xvf`).

> [!CAUTION]
> Decompressing unknown files in `/tmp` is common practice, but always check the file type with `file` first to avoid accidentally running a malicious binary.

> [!IMPORTANT]
> Some decompression tools are sensitive to file extensions. If `gzip` refuses to act on a file called `data`, use `mv data data.gz` to help it recognize the format.

> [!TIP]
> Use the **`file`** command after every single extraction. Never guess the compression type by the previous filename, as the internal structure often changes.
