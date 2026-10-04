# Bandit Level 02 → Level 03

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-02-blue?style=flat-square)

The password for Level 3 is stored in a file called `spaces in this filename` (or `--spaces in this filename--` in some environments) located in the home directory.

### Accessing the Level

```bash
sshpass -p $(cat passwords/bandit/lvl02) ssh bandit2@bandit.labs.overthewire.org -p 2220
```

### Retrieving the Password

#### 1. Listing the contents
Use `ls` to identify the correct filename.

```bash
ls
```

#### 2. Resolving the Hyphen and Space Conflicts
When a file starts with a hyphen (e.g., `--spaces...`) and has spaces, you must combine the relative path prefix `./` with quotes or escaping to read it correctly.

**Option A: Using the Relative Path and Quotes**
```bash
cat "./--spaces in this filename--"
```

**Option B: Using the Relative Path and Escaping**
```bash
cat ./--spaces\ in\ this\ filename--
```

**Option C: Using the Double Dash Switch**
```bash
cat -- "--spaces in this filename--"
```

> [!IMPORTANT]
> A leading hyphen `-` in a filename is a common hurdle. Always use `./` or the `--` delimiter to distinguish files from command options.

#### 3. Exiting the Session
Once the password is found, copy it and exit the remote server.

```bash
exit
```

#### 4. Storing the Result
Save the copied password to your local password manager directory.

```bash
# After exiting the SSH session
echo "PASSWORD" > passwords/bandit/lvl03
```

### Command Reference

| Command | Usage | Description |
| :--- | :--- | :--- |
| `ls` |: | Lists files. |
| `cat` | `./file` | Reads a file while explicitly specifying its path to avoid option parsing. |
| `cat` | `--` | Tells the command to stop looking for options and treat everything after as a filename. |
| `exit` |: | Terminates the current SSH session and returns to your local prompt. |

> [!NOTE]
> Even with quotes, a filename starting with `-` is seen as an option. The `./` prefix is the most reliable way to avoid this confusion.

> [!CAUTION]
> If you don't exit the SSH server, the `echo` command will attempt to create the `passwords/` directory on the Bandit server instead of your local machine.
