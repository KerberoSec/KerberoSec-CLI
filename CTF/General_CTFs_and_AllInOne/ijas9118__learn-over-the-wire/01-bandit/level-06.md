# Bandit Level 06 → Level 07

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-06-blue?style=flat-square)

The password for Level 7 is stored on the server, marked by its owner (**bandit7**), its group (**bandit6**), and its exact size (**33 bytes**).

### Accessing the Level

```bash
sshpass -p $(cat passwords/bandit/lvl06) ssh bandit6@bandit.labs.overthewire.org -p 2220
```

### Retrieving the Password

#### 1. System-wide Search with `find`
Since the goal says "somewhere on the server," search from the root (`/`) directory.

```bash
# Attempt to find the file from the root
find / -type f -user bandit7 -group bandit6 -size 33c
```

#### 2. Filtering Noise (Permissions Denied)
Searching the entire system as a non-root user triggers hundreds of "Permission denied" errors. To isolate the solution, redirect the errors to the "void."

```bash
# Silence error output and find your target
find / -type f -user bandit7 -group bandit6 -size 33c 2>/dev/null
```

> [!IMPORTANT]
> `/dev/null` is a special file in Unix-like OSes that discards all data written to it. It is often called the "black hole" or "void."

#### 3. Output Redirection Explained
Every command in Linux operates with three standard communication channels (file descriptors):

| ID | Channel | Description |
| :--- | :--- | :--- |
| **0** | `stdin` | **Standard Input**: The keyboard or input from another command. |
| **1** | `stdout` | **Standard Output**: The regular result of the command (your target file). |
| **2** | `stderr` | **Standard Error**: Error messages like "Permission denied." |

Using **`2>/dev/null`** tells the shell to take **channel 2 (Errors)** and redirect them away from the screen.

#### 4. Exiting and Storing
Read the resulting file path, exit the session, and save your progress.

```bash
cat /var/lib/dpkg/info/bandit7.password
exit

# Save the password for the next level
echo "PASSWORD" > passwords/bandit/lvl07
```

### Command Reference

| Command | Usage | Description |
| :--- | :--- | :--- |
| `find` | `/` | Searches from the root (entire system). |
| `find` | `-user` | Filters by file owner. |
| `find` | `-group` | Filters by group owner. |
| `>` | Redirection | Forwards output from a command to a file or device. |

> [!TIP]
> This pattern is invaluable when auditing large systems: `command 2>/dev/null` lets you see only the results that matter by silencing the noise from inaccessible directories.

> [!CAUTION]
> Be careful when searching from `/`. It's a resource-intensive operation that scans every mounted drive and directory on the server.
