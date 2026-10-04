# OverTheWire Bandit Automation Toolkit (PowerShell)

PowerShell helper functions used to automate repetitive tasks while working through the OverTheWire Bandit wargame.

This project was created as a learning exercise to improve:

* PowerShell scripting
* bash scripting
* SSH automation
* Secure credential handling
* Command-line workflow efficiency
* Linux administration skills
* Cybersecurity fundamentals

The toolkit wraps common SSH operations and provides simple commands for connecting to Bandit levels, executing remote commands, and managing credentials.

---

## Features

* Store level passwords locally
* Automatically generate usernames (`bandit0`, `bandit1`, etc.)
* Resolve Bandit server IP dynamically via DNS
* Launch SSH sessions with a single command
* Execute remote commands without opening an interactive session
* Support SSH private key authentication for key-based levels
* PowerShell parameter validation and error handling

---

## Requirements (Windows)

### PowerShell

Developed using PowerShell 5.1, but should also work in Windows PowerShell 7.

### PuTTY

This project relies on `plink.exe`, which is included with PuTTY.

Download PuTTY:

https://www.putty.org/

Verify installation:

```powershell
plink -V
```

If PowerShell cannot find `plink`, add the PuTTY installation directory to your system PATH.

### OpenSSH Client

Windows 10/11 typically includes OpenSSH.

Verify installation:

```powershell
ssh -V
```

## Requirements (Linux)

### sshpass

connect and exec use sshpass to supply the password non-interactively. 

installation:  

```bash
sudo apt install sshpass
```

---

## Installation

Clone the repository:

```powershell
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

Import the script:

```powershell
. .\bandit.ps1
```

The leading period is required to dot-source the script and make the functions available in the current session.

---

## Configuration

Modify the root path near the top of the script:

```powershell
$root_path = "D:\personal\code\bandit_solver"
```

This directory stores:

```text
bandit0-pw.txt
bandit1-pw.txt
bandit2-pw.txt
...
bandit14_sshkey_private.txt
```

These files are intentionally excluded from source control.

---

## Usage

### Store a Password

```powershell
record_pw 5 myPasswordHere
```

Creates:

```text
bandit5-pw.txt
```

---

### Select a Level

```powershell
setlevel 5
```

Output:

```text
bandit5 using D:\...\bandit5-pw.txt
```

---

### Display Current Level

```powershell
level
```

---

### Clear Session Variables

```powershell
varclear
```

---

### Test Connection Settings

Displays the resolved server IP and login information without connecting.

```powershell
test_connect
```

---

### Open Interactive SSH Session

```powershell
connect
```

Equivalent to:

```bash
ssh bandit5@bandit.labs.overthewire.org -p 2220
```

---

### Execute a Remote Command

```powershell
exec "ls -la"
```

Example:

```powershell
exec "cat readme"
```

Useful when scripting level solutions or performing quick verification checks.

---

### SSH Key Authentication

Some Bandit levels require SSH key authentication.

Connect using:

```powershell
ssh_connect 14
```

Supported levels:

```text
14
17
26
```

The script verifies that the private key file exists before attempting connection.

---

## Function Reference

### record_pw

Stores a password for a specific Bandit level.

Parameters:

| Parameter | Type   | Description  |
| --------- | ------ | ------------ |
| lvl       | String | Bandit level |
| pw        | String | Password     |

---

### setlevel

Configures the active level, username, and password file.

Parameters:

| Parameter | Type   |
| --------- | ------ |
| level     | String |

---

### level

Displays the current active level.

---

### varclear

Clears session variables.

---

### resolve_bandit_ip

Performs DNS resolution for:

```text
bandit.labs.overthewire.org
```

Returns the current IP address.

---

### test_connect

Displays connection information without opening a session.

---

### connect

Opens an interactive SSH session using `plink`.

---

### exec

Executes a command remotely through SSH.

Parameters:

| Parameter  | Type   |
| ---------- | ------ |
| cmd_string | String |

---

### ssh_connect

Connects using a private SSH key.

Parameters:

| Parameter | Type   |
| --------- | ------ |
| level     | String |

Valid values:

```text
14
17
26
```

---

## Security Notes

This repository intentionally excludes:

* Password files
* SSH private keys
* Personal configuration files

Credentials are stored locally and should never be committed to source control.

---

## Learning Objectives

This project was built while completing the OverTheWire Bandit wargame:

https://overthewire.org/wargames/bandit/

The goal was to reduce repetitive administrative tasks and focus on solving the challenges themselves while gaining experience with:

* PowerShell automation
* SSH workflows
* Linux command-line environments
* Cybersecurity fundamentals
* Infrastructure scripting

---

## Future Improvements

Potential enhancements:

* Secure credential storage using gpg encrypted file
* Improved exception handling

---

## License

MIT License
