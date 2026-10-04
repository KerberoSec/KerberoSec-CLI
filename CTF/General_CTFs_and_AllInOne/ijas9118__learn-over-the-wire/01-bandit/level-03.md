# Bandit Level 03 → Level 04

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-03-blue?style=flat-square)

The password for Level 4 is stored in a hidden file inside the `inhere` directory.

### Accessing the Level

Login using the credentials from Level 2.

```bash
sshpass -p $(cat passwords/bandit/lvl03) ssh bandit3@bandit.labs.overthewire.org -p 2220
```

### Retrieving the Password

#### 1. Navigating to the directory
Move into the `inhere` directory where the password is kept.

```bash
cd inhere/
```

#### 2. Revealing Hidden Files
A standard `ls` command will not show files starting with a dot (.). You must use the `-a` switch to see everything.

```bash
# Standard list (empty output)
ls

# List all files (including hidden)
ls -a

# Detailed long listing
ls -al
```

#### 3. Reading the Hidden File
Identify the hidden file (in this case, `...Hiding-From-You`) and read its content.

```bash
cat ./...Hiding-From-You
```

> [!IMPORTANT]
> In Linux, files starting with one or more dots are "hidden" by default to keep the workspace clean. Use `ls -a` to expose them.

#### 4. Exiting and Storing
Copy the password, end your session, and store it locally.

```bash
# Terminate the remote connection
exit

# Save the password for the next level
echo "PASSWORD" > passwords/bandit/lvl04
```

### Command Reference

| Command | Switch | Description |
| :--- | :--- | :--- |
| `cd` |: | Changes the current working directory. |
| `ls` | `-a` | Lists all files, including hidden ones (those starting with a `.`). |
| `ls` | `-l` | Provides a long-listing format with file permissions and details. |
| `cat` |: | Displays the file content. |

> [!TIP]
> You can combine switches: `ls -la` is a very common command to see hidden files with full details (permissions, owner, size) in one view.

> [!NOTE]
> The single dot `.` refers to the current directory, and the double dot `..` refers to the parent directory.
