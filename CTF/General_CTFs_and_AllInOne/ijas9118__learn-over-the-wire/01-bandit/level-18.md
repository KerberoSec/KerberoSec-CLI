# Bandit Level 18 → Level 19

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-18-blue?style=flat-square)

The password for Level 19 is stored in a file named `readme` in the home directory. However, a modified `.bashrc` file automatically logs you out every time you attempt a standard interactive login.

### The Problem: Auto-Logout
When you attempt to log in normally, the server executes its initialization scripts. This specific level's `.bashrc` is programmed to `exit` immediately after login, making it impossible to stay in the shell.

```bash
# This will result in an immediate "Byebye! Connection closed"
sshpass -p $(cat passwords/bandit/lvl18) ssh bandit18@bandit.labs.overthewire.org -p 2220
```

### The Solution: Remote Command Execution

To bypass the interactive shell logout, you can tell SSH to execute a specific command and then disconnect. This often happens before the logout script can terminate the session.

#### 1. Listing the files
Instead of logging in, simply ask SSH to run `ls` for you.

```bash
sshpass -p $(cat passwords/bandit/lvl18) ssh bandit18@bandit.labs.overthewire.org -p 2220 ls
# Output: readme
```

#### 2. Reading the password
Execute the `cat` command directly through the SSH connection string.

```bash
sshpass -p $(cat passwords/bandit/lvl18) ssh bandit18@bandit.labs.overthewire.org -p 2220 cat readme
```

#### 3. Storing the Result
Copy the printed output and save your progress locally.

```bash
# Save the password for Level 19
echo "PASSWORD" > passwords/bandit/lvl19
```

### Understanding SSH Remote Commands

By appending a command to the end of your `ssh` call, you are instructing the remote server to start a **non-interactive session**. 

| Aspect | Interactive Login | Remote Command |
| :--- | :--- | :--- |
| **Shell** | Opens a full shell for you to type in. | Runs the command and exits. |
| **Environment** | Loads `.bashrc` / `.profile`. | Often bypasses interactive-only scripts. |
| **Usage** | `ssh user@host` | `ssh user@host [command]` |

### Command Reference

| Command | Usage | Description |
| :--- | :--- | :--- |
| `ssh` | `[user]@[host] [cmd]` | Executes a command on the remote machine and returns the output. |

> [!IMPORTANT]
> The remote command execution is a powerful way to troubleshoot servers that have broken shell configurations or restricted login environments.

> [!TIP]
> This technique is also used for automation (e.g., `ssh user@host "backup.sh"`) so you don't have to manually stay logged into the server.

> [!CAUTION]
> If a server is extremely restricted, it might be configured to only allow specific commands or disable remote command execution entirely via the `authorized_keys` file (using the `command=` prefix).
