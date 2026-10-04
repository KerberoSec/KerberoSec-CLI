# Password Cracking & Hash Analysis: Hands-On Practice

## Overview

As part of my cybersecurity learning journey, I recently completed a hands-on practice lab focused on **password hashing, hash identification, password cracking, and recovering passwords from protected files and keys**.

The goal of this practice was not simply to run cracking tools, but to understand how different password-hashing formats behave, how to identify an unknown hash, how wordlist-based attacks work, and how tools such as **John the Ripper** and **Hashcat** can be used in an authorized security-testing environment.

This exercise helped me connect theoretical concepts such as hashing, password storage, wordlists, and offline attacks with practical command-line techniques.

> **Important:** All activities documented here were performed in an authorized practice/CTF/lab environment for educational purposes.

---

## What I Learned

During this practice, I worked with:

* SHA-1
* SHA-256
* MD5
* SHA-512 crypt
* ZIP password protection
* RAR password protection
* SSH private-key passphrases
* John the Ripper
* Hashcat
* RockYou wordlist
* Hash identification
* `zip2john`
* `rar2john`
* `ssh2john`

---

# 1. Understanding Password Hashing

A password hash is a one-way representation of a password.

For example:

```text
Password
   |
   v
Hash Function
   |
   v
Hash
```

Instead of storing:

```text
password = biscuit
```

a system may store something similar to:

```text
<hash value>
```

When a user logs in, the system hashes the supplied password and compares the resulting value with the stored hash.

The important point is that hashing is designed to be **one-way**.

However, if an attacker obtains password hashes, they can perform an **offline password-cracking attack** by repeatedly hashing candidate passwords and comparing the results.

---

# 2. Hash Identification

Before attempting to crack an unknown hash, one of the first steps is determining what type of hash it could be.

For example, a SHA-256 hash normally contains:

* 64 hexadecimal characters
* Characters from `0-9` and `a-f`

One of the hashes from the lab was identified as:

```text
SHA-256
Bit length: 256
Character length: 64
Character type: hexadecimal
```

A hash-identification tool can help determine possible algorithms.

Example:

```bash
hashid <hash>
```

or:

```bash
hash-identifier
```
<img width="507" height="212" alt="5" src="https://github.com/user-attachments/assets/20aba472-a7cc-493b-924c-27fbca4f7fef" />

or:

```
hash-analyzer
```
<img width="604" height="564" alt="2" src="https://github.com/user-attachments/assets/adef0ecb-6d68-4905-847e-6a15cf39abc3" />

Another option is using an online hash analyzer in a controlled learning environment.

### Why identification matters

John the Ripper and Hashcat need to know how the target hash should be interpreted.

For example:

```text
MD5      → Raw-MD5
SHA-1    → Raw-SHA1
SHA-256  → Raw-SHA256
```

Using the wrong format can result in errors or unsuccessful cracking attempts.

---

# 3. Using Hashcat

Hashcat is a high-performance password recovery tool that supports many hashing algorithms and attack modes.

The general structure of a dictionary attack is:

```bash
hashcat -m <hash-mode> -a 0 <hash-file> <wordlist>
```

Where:

* `-m` specifies the hash mode
* `-a 0` specifies a dictionary attack
* `<hash-file>` contains the target hash
* `<wordlist>` contains password candidates

For the practice environment, I used:

```text
/usr/share/wordlists/rockyou.txt
```

The RockYou wordlist is commonly used in cybersecurity labs because it contains a large collection of real-world password candidates.

---

# 4. SHA-1 Cracking with Hashcat

One of the exercises involved a SHA-1 hash.

The hash was placed inside:

```text
hash2.txt
```

I used Hashcat with the SHA-1 mode and the RockYou wordlist.

```bash
hashcat -m 100 -a 0 hash2.txt /usr/share/wordlists/rockyou.txt
```

Here:

```text
-m 100
```

means SHA-1.

And:

```text
-a 0
```

means dictionary attack.

The password recovered during the lab was:

```text
kangeroo
```
<img width="516" height="523" alt="4" src="https://github.com/user-attachments/assets/84c5ee4b-ac9a-4322-b3e1-d22dbb88abd0" />

### What this demonstrated

A weak password combined with a fast hashing algorithm can be vulnerable to offline dictionary attacks.

Even though SHA-1 is a cryptographic hash function, it should **not be used for storing passwords**.

---

# 5. Cracking MD5 with John the Ripper

Another exercise involved an MD5 password hash.

The hash was stored in:

```text
hash1.txt
```

I used John the Ripper with the RockYou wordlist:

```bash
john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt hash1.txt
```

John identified the target as:

```text
Raw-MD5
```

The password recovered during the lab was:

```text
biscuit
```
<img width="726" height="210" alt="6" src="https://github.com/user-attachments/assets/f8591af8-f360-49e9-a1ab-56149a3a3403" />

To display the recovered password again:

```bash
john --show --format=Raw-MD5 hash1.txt
```

### Important lesson

MD5 is extremely fast and is not suitable for password storage.

Modern password storage should use dedicated password hashing algorithms such as:

* Argon2
* bcrypt
* scrypt
* PBKDF2

with appropriate salts and configuration.

---

# 6. Cracking a Linux SHA-512 Crypt Password

The next exercise was more realistic because the target represented a Linux password hash.

The relevant file contained a SHA-512 crypt password hash.

I copied the required hash into:

```text
linux.txt
```

and ran:

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt linux.txt
```

John identified the format as:

```text
sha512crypt
```

The password recovered during the lab was:

```text
1234
```
<img width="1284" height="514" alt="7" src="https://github.com/user-attachments/assets/f0e58b5d-732e-44a9-8b4b-950f81a5d129" />

### Why this exercise was useful

This showed the difference between a simple raw hash and a password-hashing scheme used by operating systems.

Linux password hashes commonly contain information about the hashing scheme and salt.

For example, a SHA-512 crypt hash typically begins with:

```text
$6$
```

The `$6$` identifier indicates SHA-512 crypt.

---

# 7. Recovering a ZIP Password

Password cracking is not limited to standalone hashes.

The next exercise involved a password-protected ZIP archive:

```text
secure.zip
```

Initially, attempting to extract the archive requested a password.

Instead of attacking the ZIP file directly with John, I first converted the ZIP password information into a format John could process.

The tool used was:

```bash
zip2john
```

Example:

```bash
zip2john secure.zip > secure.txt
```

This produced a John-compatible hash file.

I then used:

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt secure.txt
```

The password recovered during the exercise was:

```text
pass123
```
<img width="1215" height="393" alt="9" src="https://github.com/user-attachments/assets/414914f1-5e65-49c7-ab17-935de7d06b45" />

The archive could then be extracted using the recovered password.

### Important concept

`zip2john` does not crack the password.

It extracts the relevant password-verification data from the ZIP archive and converts it into a format that John the Ripper can attack.

The process is:

```text
ZIP file
   |
   v
zip2john
   |
   v
John-compatible hash
   |
   v
John the Ripper
   |
   v
Password
```

---

# 8. Recovering a RAR Password

A similar exercise involved a password-protected RAR archive:

```text
secure.rar
```

At first, I attempted to use:

```bash
/usr/bin/rar2john
```

but the command was not available at that location.

The correct approach was to locate the installed tool:

```bash
which rar2john
```

or:

```bash
find /usr -name rar2john 2>/dev/null
```

After locating the utility, I generated the John-compatible hash:

```bash
rar2john secure.rar > secure.txt
```

Then I ran:

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt secure.txt
```

The password recovered was:

```text
password
```
<img width="1024" height="434" alt="10" src="https://github.com/user-attachments/assets/0c815a0c-f0de-47c0-9079-a3dbdee14add" />

### Lesson learned

Different file formats require different extraction utilities before John can process them.

Examples:

```text
ZIP → zip2john
RAR → rar2john
SSH → ssh2john
```

---

# 9. Cracking an SSH Private-Key Passphrase

The final exercise involved an SSH private key:

```text
id_rsa
```

An encrypted SSH private key may require a passphrase before it can be used.

John the Ripper includes a utility called:

```bash
ssh2john.py
```

I converted the private key into a John-compatible format:

```bash
/usr/share/john/ssh2john.py id_rsa > ssh_key.txt
```

Then I used:

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt ssh_key.txt
```

The passphrase recovered during the lab was:

```text
mango
```
<img width="857" height="393" alt="11" src="https://github.com/user-attachments/assets/c0eee66c-e4c2-47f4-b01a-a2e5f0370ff0" />

### Understanding the process

The workflow was:

```text
Encrypted SSH private key
          |
          v
     ssh2john.py
          |
          v
 John-compatible hash
          |
          v
    John + wordlist
          |
          v
     Passphrase
```

This is useful in authorized penetration-testing and forensic scenarios where a protected private key has been legitimately obtained for analysis.

---

# 10. CrackStation and Hash Analysis

I also experimented with hash-analysis resources to understand how a known hash can sometimes be matched against previously computed password databases.

For example, a SHA-256 hash in the lab was identified and successfully matched to:

```text
passwd123
```
<img width="1346" height="598" alt="1" src="https://github.com/user-attachments/assets/2762e564-6611-4b0f-a445-5818cc1757a5" />

This demonstrates an important security concept:

## Hashing does not automatically make a password secure.

If a password is weak and an attacker already has access to a large database of precomputed hashes, the original password may be recovered very quickly.

This is one reason why modern password storage uses:

* Unique salts
* Slow password-hashing functions
* High computational cost
* Memory-hard algorithms where appropriate

---

# 11. Dictionary Attacks

Most of the exercises used a dictionary attack.

A simplified dictionary attack works like this:

```text
             Wordlist
                |
      +---------+---------+
      |         |         |
   password   123456   admin
      |         |         |
      v         v         v
   Hash      Hash       Hash
      |         |         |
      +---------+---------+
                |
                v
        Compare with target
                |
                v
             Match?
```

If one candidate produces the same hash as the target, the candidate is considered the recovered password.

---

# 12. Why RockYou?

The RockYou wordlist is commonly available on Kali Linux at:

```text
/usr/share/wordlists/rockyou.txt
```

If the compressed file exists, it can usually be extracted with:

```bash
sudo gzip -d /usr/share/wordlists/rockyou.txt.gz
```

Then:

```bash
ls -lh /usr/share/wordlists/rockyou.txt
```

The wordlist contains millions of password candidates.

However, dictionary attacks are only effective when the actual password or a useful variation exists within the candidate set.

---

# 13. John the Ripper vs Hashcat

Both tools are extremely useful, but they are commonly used in slightly different situations.

| Feature                   | John the Ripper | Hashcat                        |
| ------------------------- | --------------- | ------------------------------ |
| Password recovery         | Yes             | Yes                            |
| Dictionary attacks        | Yes             | Yes                            |
| Rule attacks              | Yes             | Yes                            |
| Brute-force attacks       | Yes             | Yes                            |
| Many hash formats         | Yes             | Yes                            |
| GPU acceleration          | Supported       | Excellent                      |
| File/key conversion tools | Excellent       | Often used with external tools |
| Beginner friendly         | Yes             | Yes                            |

### My practical takeaway

I found John particularly convenient when working with:

* Linux password hashes
* ZIP files
* RAR files
* SSH private keys

Hashcat was especially useful for directly attacking known hash formats.

---

# 14. Commands Used in the Lab

### Identify a hash

```bash
hashid <hash>
```

### SHA-1 with Hashcat

```bash
hashcat -m 100 -a 0 hash2.txt /usr/share/wordlists/rockyou.txt
```

### MD5 with John

```bash
john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt hash1.txt
```

### SHA-512 crypt with John

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt linux.txt
```

### Show John results

```bash
john --show <hash-file>
```

### Convert ZIP for John

```bash
zip2john secure.zip > secure.txt
```

### Convert RAR for John

```bash
rar2john secure.rar > secure.txt
```

### Convert SSH key for John

```bash
/usr/share/john/ssh2john.py id_rsa > ssh_key.txt
```

### Crack the converted file

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt secure.txt
```

---

# 15. Results Summary

| Target          | Technique / Tool  | Result      |
| --------------- | ----------------- | ----------- |
| SHA-256         | Hash analysis     | `passwd123` |
| SHA-1           | Hashcat           | `kangeroo`  |
| MD5             | John the Ripper   | `biscuit`   |
| SHA-512 crypt   | John the Ripper   | `1234`      |
| ZIP             | `zip2john` + John | `pass123`   |
| RAR             | `rar2john` + John | `butterfly` |
| SSH private key | `ssh2john` + John | `mango`     |

These passwords were recovered **only within the authorized practice environment**.

---

# 16. Key Takeaways

This exercise taught me several important lessons.

### 1. Hash identification comes first

Before attacking a hash, understanding its format is important because different algorithms require different modes and tools.

### 2. Weak passwords remain the biggest problem

Passwords such as:

```text
1234
password
admin
```

can be extremely easy to guess with common wordlists.

### 3. Fast hashing is not appropriate for password storage

Algorithms such as:

```text
MD5
SHA-1
SHA-256
```

are designed to be computationally efficient, which is useful for many cryptographic applications but undesirable for password hashing.

### 4. Salting matters

A unique salt makes precomputed rainbow-table attacks much less useful and ensures that identical passwords do not produce identical stored hashes.

### 5. Password cracking is not only about hashes

The same concept can apply to:

* Encrypted archives
* SSH private keys
* Linux password databases
* Other password-protected artifacts

### 6. Tool selection matters

Understanding when to use:

```text
Hashcat
John the Ripper
zip2john
rar2john
ssh2john
```

is an important practical skill.

---

# 17. What I Would Do Differently in a Real Environment

In a real organization, the goal should not be to crack passwords unnecessarily.

A security professional should instead focus on identifying weaknesses and improving defenses.

Recommended controls include:

* Use strong, unique passwords
* Deploy MFA
* Use password managers
* Store passwords using Argon2, bcrypt, scrypt, or PBKDF2
* Use unique salts
* Implement account lockout/rate limiting where appropriate
* Monitor authentication attempts
* Protect password databases
* Protect private keys with strong passphrases
* Rotate compromised credentials
* Avoid legacy hashing algorithms

---

# Conclusion

This practice helped me move from understanding password hashing theoretically to actually working with hashes and password-protected artifacts from the command line.

The biggest lesson for me was that **password security depends on more than simply hashing a password**.

The hashing algorithm, password strength, salt, computational cost, key protection, and authentication controls all contribute to overall security.

Working through these exercises also gave me more confidence with Kali Linux, John the Ripper, Hashcat, wordlists, and command-line troubleshooting.

This is another step in my cybersecurity learning journey, particularly toward my interests in **penetration testing, vulnerability assessment, and offensive security**.

> **Practice responsibly. Only perform password recovery or cracking against systems, credentials, and files that you own or have explicit authorization to test.**

## Skills Practiced

`Kali Linux` `Password Hashing` `Hash Analysis` `John the Ripper` `Hashcat` `Dictionary Attacks` `SHA-1` `SHA-256` `MD5` `SHA-512` `ZIP` `RAR` `SSH` `Cybersecurity` `Ethical Hacking` `Penetration Testing`

