# Bandit Level 13 → Level 14

![OverTheWire](https://img.shields.io/badge/Platform-OverTheWire-000000?style=flat-square&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=flat-square)
![Level](https://img.shields.io/badge/Level-13-blue?style=flat-square)

The password for Level 14 is stored in `/etc/bandit_pass/bandit14` and can only be read by user **bandit14**. To access it, you must use the private SSH key (`sshkey.private`) found in the home directory of `bandit13`.

### Accessing the Level

```bash
sshpass -p $(cat passwords/bandit/lvl13) ssh bandit13@bandit.labs.overthewire.org -p 2220
```

### Retrieving the Private Key

#### 1. Locating the key
The private key is stored in the current home directory.

```bash
ls
# Output: sshkey.private
```

#### 2. Transferring the key locally
Since local connections on the Bandit server are restricted, download the key to your own machine using `scp`.

```bash
# Run this from your LOCAL terminal
scp -P 2220 bandit13@bandit.labs.overthewire.org:sshkey.private .
```

#### 3. Setting Secure Permissions
SSH is highly sensitive to private key security. If the key file is accessible by anyone other than the owner, SSH will refuse to use it.

```bash
# Grant Read/Write only to the current user
chmod 600 sshkey.private
```

> [!CAUTION]
> If you omit `chmod 600`, you will see an error: *"Permissions for 'sshkey.private' are too open. It is required that your private key files are NOT accessible by others."*

### Logging in as Bandit14

Use the `-i` (identify) switch to specify the downloaded private key.

```bash
ssh -i sshkey.private bandit14@bandit.labs.overthewire.org -p 2220
```

#### 4. Extracting the Password
Now that you are logged in as `bandit14`, you have permission to read the next level's password file.

```bash
cat /etc/bandit_pass/bandit14
```

#### 5. Exiting and Storing
Read the password, exit the session, and save your progress.

```bash
exit

# Save the password for Level 14
echo "PASSWORD" > passwords/bandit/lvl14
```

### Command Reference

| Command | Switch | Description |
| :--- | :--- | :--- |
| `scp` | `-P` | **Secure Copy**: Transfers files between hosts over SSH. (Note: use `-P` for capital P port). |
| `chmod` | `600` | **Change Mode**: Restricts file access to the owner only (Read/Write). |
| `ssh` | `-i` | **Identify**: Selects a file from which the identity (private key) is read. |

> [!IMPORTANT]
> A Private Key is like a physical key to a door. It replaces your password during the authentication process. Never share your private keys!

> [!TIP]
> You can organize your keys in the `passwords/bandit/` directory alongside your text-based passwords for easy management.
