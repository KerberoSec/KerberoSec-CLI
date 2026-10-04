# Bandit Level 0 → Level 1

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-00-blue?style=flat-square)

The objective of this level is to log into the Bandit server using Secure Shell (SSH).

### Connection Details

| Field | Value |
| :--- | :--- |
| **Host** | `bandit.labs.overthewire.org` |
| **Port** | `2220` |
| **User** | `bandit0` |
| **Password** | `bandit0` |

### Implementation

#### 1. Managing Credentials
Store the level password in a gitignored directory for future reference.

```bash
# Create the local directory and save the password
mkdir -p passwords/bandit
echo "bandit0" > passwords/bandit/lvl00
```

> [!TIP]
> Keeping passwords in a `passwords/` folder protected by `.gitignore` ensures your credentials aren't accidentally pushed to public repositories.

#### 2. Connecting via SSH
Connect using `sshpass` to provide the password non-interactively.

```bash
sshpass -p $(cat passwords/bandit/lvl00) ssh bandit0@bandit.labs.overthewire.org -p 2220
```

> [!IMPORTANT]
> The server uses port **2220** instead of the standard SSH port (22). The `-p` switch is required to specify this.

#### 3. Reading the First Password
Once logged in, the password for the next level is stored in a file called `readme`.

```bash
cat readme
```

#### 4. Exiting and Storing
Once the password is found, exit the remote server and store it locally for the next level.

```bash
exit

# Save the password for Level 1
echo "PASSWORD" > passwords/bandit/lvl01
```

### Command Reference

| Command | Switch | Function |
| :--- | :--- | :--- |
| `echo` | `>` | Prints text or redirects output into a file. |
| `sshpass` | `-p` | Allows providing a password for SSH non-interactively. |
| `ssh` | `-p` | Securely connects to a remote host on a specific port. |
| `cat` |: | Reads and displays the content of a file. |

> [!NOTE]
> `sshpass` is useful for automation but can leak passwords in your local bash history.

> [!CAUTION]
> Using `>` on an existing file will overwrite its content entirely. Use `>>` to append instead.
