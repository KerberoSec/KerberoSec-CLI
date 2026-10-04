
# Bandit Labs Solution (OverTheWire)

**Date Solved:** August 5, 2026

## 🚀 About This Repository

Welcome to my comprehensive, step-by-step learning log and writeup repository for the **OverTheWire: Bandit** wargame!

**🚨 Important Note for Users:** This repository contains **freshly solved Bandit problems as of August 5, 2026.** Most of the writeup repositories you will find on the internet are old, out-of-date, and reference previous versions of the game that have since been changed. If you are stuck, the solutions here reflect the current, live environment.

This repository documents my methodology, technical analysis, tool usage (`grep`, `find`, `tar`, `awk`, `sed`, `strings`, `xxd`), and core Linux/cybersecurity concepts learned while conquering all 33 levels of Bandit. If this helps you on your cybersecurity journey, please consider giving the repository a Star! ⭐

## 🔗 Links

[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/harivishnu-s-624265370/)
[![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/harivishnu9345-creator/)
[![LeetCode](https://img.shields.io/badge/LeetCode-%23FFA116.svg?style=for-the-badge&logo=LeetCode&logoColor=black)](https://leetcode.com/u/harivishnu_7)
[![CyLab Academy](https://img.shields.io/badge/CyLab_Academy-000000?style=for-the-badge&logo=terminal&logoColor=white)](https://learn.cylabacademy.org/users/Haio)

<br>

## 🚩 Master Flag List (Levels 0: 33)

For quick reference, here are the flags (passwords) extracted from each level:

* **0 -> 1:** `6y2kwnwK6grgvwvpvLaa2T1cpFEKOhNR`
* **1 -> 2:** `PK8fYLZg2hnHSz83plBL1iEPKdD3QToB`
* **2 -> 3:** `7ZZ2LFrykP2zEyvBl4m3clcL7tGYJPME`
* **3 -> 4:** `xzTXq1rDJQVVAzdv5cHq1TQytTWufAMq`
* **4 -> 5:** `6C7h9GD8M6ai5nr7wo1RonrzFjj9yIrG`
* **5 -> 6:** `pXa26xhMWaC2SvDotA4r9EgZkulOeSBW`
* **6 -> 7:** `Bmnnvf82KzQlfxgAI2d1zYbr1u9pr3E3`
* **7 -> 8:** `VR1ljMayciFxbnUokuQmJFw6QC9VKtub`
* **8 -> 9:** `EjmOSvuAu7sGAHqHVcBDPirRe9T03kxl`
* **9 -> 10:** `pYfOY6HwUsDj5rL9UvyhU7MCmv8vN5Ro`
* **10 -> 11:** `GROozWPO8QyN0mGrjUkID0WCYkZiQxrN`
* **11 -> 12:** `qQYQiHOBPR8zR61qxYqX45quvihF2uzk`
* **12 -> 13:** `aaWecNkG4FhxJQxz07uiwzVP6bJiYS65` *(Note: Level 12 provides a hex dump. Unpacking it outputs this password).*
* **13 -> 14:** `aaWecNkG4FhxJQxz07uiwzVP6bJiYS65` *(Note: Same flag as previous. We use an SSH Key from 13 to log into 14, where we find this same password).*
* **14 -> 15:** `pbLYuZtTg4MgaqfJx8jbA9gKKGqM68A7`
* **15 -> 16:** `kS0Hf0u5HiXFwKMKFqXvPdOTNGGa0X8V`
* **16 -> 17:** `pWXMAZoxGC8JmDMfmT5MGEsobMM3vnj2`
* **17 -> 18:** `OQxXZjELndr90zuhOTDYBEomI0SZITXI` *(Note: `uniq -u` reveals two unique strings. `qOg5pVOjPx9x9VccyYBADiT4xxyoUB8D` is the old one. The one listed here is the new, functional password).*
* **18 -> 19:** `KpsOfPkcP7i1FlIExk2QEjyt6dw8dxZI`
* **19 -> 20:** `4pIjcunZ0fK2vmp3IwfG8Vf7VhxD6pOA`
* **20 -> 21:** `bW9kBv5WC3P4yoDyf12LSdGuNz5ka6hY`
* **21 -> 22:** `RYVux2rHEm9tiXHmLFzuR7Vhx6AZQMEz`
* **22 -> 23:** `gKXDTAXnIz3OBxiPjRZ2uqutUlPZrBsw`
* **23 -> 24:** `hVQMk3lJNsmQ7VF3ubyrNNBom7BOgVXv`
* **24 -> 25:** `SoHfqMOEqIX2IYKVciZxvgpR9a2Djx4P`
* **25 -> 26:** `jHdv2ELQhT22BkprMNDjybZDAkw1zeBJ`
* **26 -> 27:** `STJLJBRRphMxKB392CT4iOr5CbzPU9ER`
* **27 -> 28:** `y8Yd2ssKcpHpud7UvOSOxwamRMzIGIeQ`
* **28 -> 29:** `Em7eGtqaMySwNFjCpwzzHhLhospOcdt0`
* **29 -> 30:** `jq9Dfg2rXsfYsWMgFuKlXhphjdH7USgX`
* **30 -> 31:** `82NkymblpGBYmIXG6ZQ8YldBYstHpfUf`
* **31 -> 32:** `pWuj5jBQ6IgV0NXwiH6g1pXRF8S1YvbT`
* **32 -> 33:** `u4P2CyPOwPGLe94RdD9Uo2FxFwvnFswM`

***

## Level 0 -> Level 1

<img width="767" height="67" alt="bandit0" src="https://github.com/user-attachments/assets/36b5e5b8-0af4-4fff-9051-218f4e8c9f7c" />
**Workflow & Objective:** Access the game. Bandit is played entirely through Secure Shell (SSH). You can find the rules and host information at `https://overthewire.org/wargames/bandit/bandit0.html`. Once logged in, read the password for the next level from a file named `readme`.

<img width="1002" height="245" alt="bandit0(1)" src="https://github.com/user-attachments/assets/ecdd8ffc-7019-46aa-989b-56cd4e5a7553" />

**Commands:**
```bash
ssh bandit.labs.overthewire.org -p 2220 -l bandit0
ls
cat readme

```

**Command Explanation:**

* `ssh`: Secure Shell, used to securely log into remote machines.
* `-p 2220`: Specifies the remote port (Bandit uses port 2220 instead of the standard 22).
* `-l bandit0`: Specifies the login username.
* `cat`: Concatenates and displays file contents.

---

## Level 1 -> Level 2

**Workflow & Objective:** The password is saved in a file named `-`. If you just type `cat -`, the `cat` command gets confused because a standalone dash represents "standard input" in Linux. We must force `cat` to see it as a file path.

<img width="430" height="151" alt="bandit1" src="https://github.com/user-attachments/assets/0b419550-e9a9-42ab-8fd1-0d046d7141db" />

**Commands:**

```bash
ls
cat ./-

```

**Command Explanation:**

* `./-`: The `./` tells the system to look explicitly in the "current directory". By giving it a literal path (`./-`), `cat` successfully reads the file.

---

## Level 2 -> Level 3

**Workflow & Objective:** The file containing the password has spaces in its name (`--spaces in this filename--`). Linux commands use spaces to separate different arguments.

<img width="665" height="132" alt="bandit2" src="https://github.com/user-attachments/assets/77aa83ed-9e0a-438f-8347-863b9c5160a6" />

**Commands:**

```bash
ls
cat -- "--spaces in this filename--"

```

**Command Explanation:**

* `--` (Double dash): Tells the terminal "stop looking for command-line flags after this point."
* `"..."` (Quotes): Wrapping the string in double quotes forces the shell to treat the entire string (spaces included) as a **single argument**. Without quotes, `cat` would try to open four separate files!

---

## Level 3 -> Level 4

**Workflow & Objective:** The password is in a hidden file inside the `inhere` directory. In Linux, any file name that starts with a dot (like `.hidden`) is automatically invisible to a standard `ls`.

<img width="802" height="281" alt="bandit3" src="https://github.com/user-attachments/assets/15bd61b8-dea2-4a8e-87f2-de0f2faf4844" />

**Commands:**

```bash
cd inhere
ls -la
cat ...Hiding-From-You

```

**Command Explanation:**

* `ls -la`: The `-l` flag lists files in a "long" format. The `-a` flag (all) forces `ls` to display hidden files.

---

## Level 4 -> Level 5
<img width="1057" height="206" alt="bandit4" src="https://github.com/user-attachments/assets/ea6f0502-a89d-41c2-b329-e8147ff3c61b" />

**Commands:**

```bash
cd inhere
grep -rEo '\b[a-zA-Z0-9]{32}\b' .

```

**Deep Dive Explanation (Regex):**

* `grep`: A utility used to search plain-text data for patterns.
* `-rEo`: Recursive (`-r`), Extended Regex (`-E`), and Only matching (`-o`).
* `\b`: Word boundary. This ensures we don't accidentally match 32 characters hidden inside a 50-character string. It forces an exact 32-character match.
* `[a-zA-Z0-9]`: A character class. Tells `grep` to look for *any* lowercase letter (a-z), uppercase letter (A-Z), or number (0-9).
* `{32}`: Quantifier ensuring we want exactly 32 of those characters in a row.

---

## Level 5 -> Level 6

**Workflow & Objective:** The password is hidden deep in multiple nested directories under `inhere` and has specific properties (1033 bytes, not executable). However, we can reuse our powerful `grep` regex from the previous level to completely bypass searching by file size!

<img width="680" height="196" alt="bandit5" src="https://github.com/user-attachments/assets/e3371f3d-f923-4989-9a79-128e1e93c92e" />

**Commands:**

```bash
cd inhere
grep -rEo '\b[a-zA-Z0-9]{32}\b'

```

---

## Level 6 -> Level 7

**Workflow & Objective:** Locate a specific file across the *entire server* owned by user `bandit7`, group `bandit6`, and exactly 33 bytes in size.

<img width="942" height="151" alt="bandit6" src="https://github.com/user-attachments/assets/a92ed96c-59a2-4f08-b43b-f1dfd287eeaa" />

**Commands:**

```bash
find / -type f -size 33c -user bandit7 -group bandit6 2>/dev/null
cat /var/lib/dpkg/info/bandit7.password

```

**Command Explanation:**

* `find /`: Searches the entire filesystem.
* `-type f`: Restricts results strictly to "files" (ignoring directories).
* `-size 33c`: Looks for files exactly 33 bytes in size.
* `-user bandit7` / `-group bandit6`: Filters results by user and group ownership.
* `2>/dev/null`: Redirects standard error (permission denied errors) to the void, keeping your terminal clean.

---

## Level 7 -> Level 8

**Workflow & Objective:** Search a massive `data.txt` file for the password located next to the word `millionth`.

<img width="582" height="157" alt="bandit7" src="https://github.com/user-attachments/assets/7f736462-5e2e-4247-ab1d-3163b636b348" />

**Commands:**

```bash
grep "millionth" data.txt

```

---

## Level 8 -> Level 9

**Workflow & Objective:** Find the *only* line in `data.txt` that occurs exactly once.

<img width="512" height="137" alt="bandit8" src="https://github.com/user-attachments/assets/ffb8a890-d080-4abf-baed-7a6f45613dbe" />

**Commands:**

```bash
sort data.txt | uniq -u

```

**Command Explanation:**

* `sort`: Groups identical lines together alphabetically.
* `uniq -u`: Outputs *only* the lines that are completely unique.

---

## Level 9 -> Level 10

**Workflow & Objective:** `data.txt` is mostly binary gibberish. We extract the human-readable strings preceded by `=` characters.

<img width="567" height="441" alt="bandit9" src="https://github.com/user-attachments/assets/8e8ae520-1c8c-4921-8a3e-d63a840c8c28" />

**Commands:**

```bash
strings data.txt | grep "="

```

**Command Explanation:**

* `strings`: Scans a file and dumps any continuous sequence of printable ASCII characters, ignoring the raw binary.

---

## Level 10 -> Level 11

**Workflow & Objective:** The text in `data.txt` is encoded in Base64. We must decode it.
<img width="610" height="166" alt="bandit10" src="https://github.com/user-attachments/assets/0bc1a283-b9dc-4e9b-8424-c6d614d87c3a" />

**Commands:**

```bash
base64 data.txt -d

```

---

## Level 11 -> Level 12

**Workflow & Objective:** Decode text encrypted using the ROT13 substitution cipher (every letter is shifted 13 places).

<img width="1255" height="222" alt="bandit11" src="https://github.com/user-attachments/assets/d3dfb871-cf81-422e-8b81-d37506d37f59" />

**Commands:**

```bash
cat data.txt
echo "Gur cnffjbeq vf TEBbmJCB8DLa0zTewHxVQ0JPLxMvDkeA" | tr 'a-zA-Z' 'n-za-mN-ZA-M'

```

**Deep Dive Explanation:**

* `echo`: Prints our scrambled string so we can pipe (`|`) it. The pipe transfers the output of `echo` directly into the `tr` command.
* `tr`: Translate characters.
* `'a-zA-Z'`: The normal alphabet set.
* `'n-za-mN-ZA-M'`: The alphabet shifted by 13 places. `tr` maps the first set to the second set, breaking the cipher!

---

## Level 12 -> Level 13

**Workflow & Objective:** This is a complex Russian Doll of compression. We start with a hex dump, reverse it to binary, and systematically extract the file layer by layer (`gzip`, `bzip2`, `tar`). *Why do we use `mv` so much?* Decompression tools look at file extensions. If the file doesn't end in `.gz` or `.bz2`, the tool refuses to extract it. We use `file` to see what it is, `mv` to rename it, and extract.
<img width="657" height="196" alt="bandit12(1)" src="https://github.com/user-attachments/assets/4470ddaf-317c-4f7d-b3fb-391b2c7044cd" />
<img width="827" height="237" alt="bandit12(1 5)" src="https://github.com/user-attachments/assets/af187009-da0c-4194-aa23-768c0d8c79fc" />

<img width="1801" height="1037" alt="bandit12(2)" src="https://github.com/user-attachments/assets/08460dd7-1d27-4369-af85-5f83c05ca6e6" />
**Step-by-Step Extraction Loop:**

**1. Setup & Hex Reversal:**

```bash
mktemp -d
cp data.txt /tmp/tmp.OWG0i2JJmp
cd /tmp/tmp.OWG0i2JJmp
xxd -r data.txt data

```

*Users must create a temporary workspace (`mktemp -d`) because the home directory is read-only. `xxd -r` takes the text-based hex dump and compiles it back into raw, executable binary (`data`).*

**2. Layer 1 (gzip):**

```bash
file data
mv data data.gz
gzip -d data.gz

```

*`file` identifies it as gzip. We rename it to `.gz`, and decompress with `-d`.*

**3. Layer 2 (bzip2):**

```bash
file data
mv data data.bz2
bzip2 -d data.bz2

```

*Identified as bzip2. Rename to `.bz2`, decompress.*

**4. Layer 3 (gzip):**

```bash
file data
mv data data.gz
gzip -d data.gz

```

**5. Layer 4 (tar):**

```bash
file data
mv data data.tar
tar -xf data.tar

```

*Identified as a tar archive. `tar -xf` extracts (`-x`) the file (`-f`). This outputs `data5.bin`.*

**6. Layer 5 (tar):**

```bash
file data5.bin
mv data5.bin data5.tar
tar -xf data5.tar

```

*Outputs `data6.bin`.*

**7. Layer 6 (bzip2):**

```bash
file data6.bin
mv data6.bin data6.bz2
bzip2 -d data6.bz2

```

*Outputs `data6`.*

**8. Layer 7 (tar):**

```bash
file data6
mv data6 data6.tar
tar -xf data6.tar

```

*Outputs `data8.bin`.*

**9. Layer 8 (gzip) & Read:**

```bash
file data8.bin
mv data8.bin data8.gz
gzip -d data8.gz
cat data8

```

---

## Level 13 -> Level 14

<img width="877" height="977" alt="bandit13(1)" src="https://github.com/user-attachments/assets/64224602-5b34-4042-a467-db8ca598ff45" />

**Workflow & Objective:** We are given an SSH Private Key (`sshkey.private`) instead of a password.

**🚨 Strict Instruction:** You must do this locally (outside the Bandit server). Log out of Bandit first!
<img width="882" height="270" alt="BANDIT13(2)" src="https://github.com/user-attachments/assets/234f98dc-7875-4834-a056-b90b154b0388" />
<img width="642" height="142" alt="bandit13(3)" src="https://github.com/user-attachments/assets/3db4c6b3-fa48-4f79-b95d-81a86b830b23" />

<img width="1906" height="1036" alt="bandit13(4)" src="https://github.com/user-attachments/assets/e763d1af-74d6-420b-b9d1-4a111b59a659" />

**Commands (Local Machine):**

```bash
nano sshkey.private

```

*(Right-click and Paste the RSA key text. Press **Ctrl+O** to Write Out, **Enter** to confirm, and **Ctrl+X** to Exit).*
<img width="917" height="547" alt="bandit13(5)" src="https://github.com/user-attachments/assets/7400afe7-4593-4f80-9b90-4bbbfbe9f3eb" />
```bash
chmod 700 sshkey.private
ssh bandit.labs.overthewire.org -p 2220 -l bandit14 -i sshkey.private

```

**Deep Dive Explanation:**

* `chmod 700`: If an SSH key has open permissions like `777` (read/write/execute for everyone), SSH assumes it is compromised and outright refuses the connection! `700` restricts it perfectly.
* `-i`: Tells SSH to use our specific key file to authenticate locally.
<img width="785" height="101" alt="bandit13(6)" src="https://github.com/user-attachments/assets/11ef7947-e4af-4355-b937-c98bcbfee551" />

**Commands (Inside Bandit14 Server):**

```bash
cat /etc/bandit_pass/bandit14

```

---

## Level 14 -> Level 15

**Workflow & Objective:** Submit the current password to local port 30000.
<img width="460" height="97" alt="bandit14" src="https://github.com/user-attachments/assets/3e154fed-b1b1-4761-af0e-9577c7207fe8" />
**Commands:**

```bash
nc localhost 30000

```

*(Paste current password)*

**Command Explanation:**

* `nc` (Netcat): Connects to port 30000 on the local loopback interface (`localhost`).

---

## Level 15 -> Level 16

**Workflow & Objective:** Submit the current password to local port 30001 over an encrypted SSL connection. Standard Netcat fails here.

<img width="550" height="140" alt="bandit15" src="https://github.com/user-attachments/assets/0d3420ec-0717-4c78-a220-f1edf6259966" />

**Commands:**

```bash
ncat --ssl localhost 30001

```

*(Paste current password)*

---

## Level 16 -> Level 17

**Workflow & Objective:** Scan ports 31000-32000 to find listening services, determine which speaks SSL, and retrieve an SSH private key.
<img width="882" height="1016" alt="bandit16" src="https://github.com/user-attachments/assets/2e248d71-b9e0-4fdc-b549-008f8258358f" />

<img width="436" height="315" alt="bandit16-17" src="https://github.com/user-attachments/assets/36ae41d6-6a83-40aa-89ad-26e570376e7c" />

<img width="902" height="112" alt="bandit16(3)" src="https://github.com/user-attachments/assets/e4259088-88f0-42be-8d3a-391002057ffb" />

<img width="622" height="60" alt="bandit16(4)" src="https://github.com/user-attachments/assets/d45827cf-3f32-4713-98e3-36553c81c6da" />

**Commands:**

```bash
nmap localhost -p 31000-32000
ncat --ssl localhost 31790

```

*(Save outputted key locally via nano, set `chmod 700`, and connect to bandit17).*

---

## Level 17 -> Level 18

**Workflow & Objective:** We have `passwords.old` and `passwords.new`. The new password is the only unique line.
<img width="765" height="152" alt="bandit17(1)" src="https://github.com/user-attachments/assets/45712ae0-5d07-45e8-99fd-d4b27660b131" />

**Commands:**

```bash
sort passwords.new passwords.old | uniq -u

```

**Command Explanation:**

* **Two Flags?** `uniq -u` prints two flags. Why? Because the *old* unique password from the old file is listed, alongside the *new* unique password from the new file. Based on typical file appending, the second flag (`OQxXZjEL...`) is the functional one you need to progress.

---

## Level 18 -> Level 19
<img width="980" height="467" alt="bandit18" src="https://github.com/user-attachments/assets/60ce11bd-ddd4-42cf-9be8-6f17a587bff1" />

**Workflow & Objective:** Logging into `bandit18` fails instantly because an exit command is inside the `.bashrc` file. We must execute a command over SSH *without* triggering the interactive `.bashrc`.

**Commands:**

```bash
ssh bandit.labs.overthewire.org -p 2220 -l bandit18 /bin/sh
ls
cat readme

```

**Deep Dive Explanation:**

* **What is `.bashrc`?** It's a hidden script that automatically runs every time you open an interactive Bash shell.
* By forcing SSH to execute `/bin/sh` (the older Bourne Shell) non-interactively at the end of our connection string, we run our requested shell program *instead* of launching the default interactive bash shell, bypassing the rigged `.bashrc` entirely!

---

## Level 19 -> Level 20
<img width="831" height="147" alt="bandit19" src="https://github.com/user-attachments/assets/62971413-f578-4c73-9d41-2daf849d57cc" />

**Workflow & Objective:** Use a provided binary (`bandit20-do`) to read a file you normally don't have access to.

**Commands:**

```bash
ls
./bandit20-do cat /etc/bandit_pass/bandit20

```

**Deep Dive into `setuid` (SUID):**

* In Linux, programs usually execute with *your* user permissions.
* If a file has the special **SUID** bit enabled, it executes with the privileges of the file's *owner*, regardless of who runs it. Because `bandit20-do` is owned by `bandit20`, running it temporarily elevates our privileges so we can `cat` the restricted password file!

---

## Level 20 -> Level 21

**Workflow & Objective:** A setuid binary (`suconnect`) will connect to a local port. If you send it the current password, it sends back the next password. **Users must have two terminals logged into the Bandit server simultaneously.**
<img width="1105" height="111" alt="bandit20(1)" src="https://github.com/user-attachments/assets/dd6a6155-09a6-4c31-bd13-459e129e8bb1" />

**Terminal 1 (The Listener):**

```bash
mktemp -d
cd /tmp/tmp.j7ExU3kaMa
echo "4pIjcunZ0fK2vmp3IwfG8Vf7VhxD6pOA" | nc -lvp 12355

```
<img width="640" height="210" alt="bandit20(2)" src="https://github.com/user-attachments/assets/0abb5d34-7e3e-498d-aef3-331c4fe9cc57" />

**Terminal 2 (The Connector):**

```bash
./suconnect 12355

```
<img width="1132" height="262" alt="bandit20(3)" src="https://github.com/user-attachments/assets/33f1fe94-8f5d-41e2-b06d-bd67e970912d" />

---

## Level 21 -> Level 22

**Workflow & Objective:** Inspect system cron jobs to track down where an automated script writes the next password.
<img width="846" height="351" alt="bandit21" src="https://github.com/user-attachments/assets/72c1b7fa-ec9d-4fa7-bd0b-82d37d459995" />

**Commands:**

```bash
cd /etc/cron.d/
cat cronjob_bandit22
cat /usr/bin/cronjob_bandit22.sh
cat /tmp/t706lds9S0RqQh9aMcz6ShpAoZKF7fgv

```

**Command Explanation:**

* **How did we find the `/tmp/` file?** By reading the bash script using `cat /usr/bin/cronjob_bandit22.sh`. The script literally contained the command showing exactly where the password was copied to!

---

## Level 22 -> Level 23

**Workflow & Objective:** Analyze another cron script that dynamically generates its target file path using an MD5 hash.
<img width="892" height="541" alt="bandit22" src="https://github.com/user-attachments/assets/e10c3373-60fc-4ac9-8e38-fade38d642fb" />

**Commands:**

```bash
cat /etc/cron.d/cronjob_bandit23
cat /usr/bin/cronjob_bandit23.sh
echo "I am user bandit23" | md5sum
cat /tmp/8ca319486bfbbc3663ea0fbe81326349

```

**Command Explanation:**

* We read the script and see it computes an `md5sum` of the phrase `"I am user $myname"`. Because this job runs as `bandit23`, we replicate the command in our own terminal, hashing `"I am user bandit23"` to reveal the secret file name.

---

## Level 23 -> Level 24

**Workflow & Objective:** A cron job monitors `/var/spool/bandit24/foo`. Every minute, it executes any script placed inside it as the user `bandit24`, and then deletes it. We must write a script to steal the password.

**Step 1: Setup Workspace & Target File**

```bash
cd /tmp/
mkdir hari && cd hari
touch password && chmod 777 password

```
<img width="832" height="712" alt="bandit23(1)" src="https://github.com/user-attachments/assets/ee6d46df-e299-46dd-b2f7-7587415f09bf" />
**Step 2: Create the Payload Script**

```bash
nano script.sh

```
<img width="591" height="192" alt="bandit23(2)" src="https://github.com/user-attachments/assets/69e07c81-6fd5-4d73-8bdf-22e4ce28d357" />

*(Inside `script.sh`, write the following to copy the restricted password into our world-writable dummy file):*

```bash
#!/bin/bash
cat /etc/bandit_pass/bandit24 > /tmp/hari/password

```
<img width="940" height="96" alt="bandit23(3)" src="https://github.com/user-attachments/assets/64d73f43-17d5-4bdc-b968-7db21472929e" />

**Step 3: Arm and Execute**

```bash
chmod 777 script.sh
cp script.sh /var/spool/bandit24/foo

```

*(Wait 60 seconds for the cron job to run)*

```bash
cat password

```
<img width="892" height="657" alt="bandit23(4)" src="https://github.com/user-attachments/assets/48fdc39a-c09a-49ff-b7ba-1004b3c332a9" />
**Deep Dive Explanation:**

* When we place `script.sh` in the spool directory, the cron job executes it using the elevated privileges of `bandit24`. It legally grabs the password and writes it to our `/tmp/hari/password` file!

---

## Level 24 -> Level 25

**Workflow & Objective:** A daemon requires the current password followed by a 4-digit PIN (e.g., `PASSWORD 1234`). We must script a brute-force attack.
<img width="917" height="232" alt="bandit24(1)" src="https://github.com/user-attachments/assets/b12eded2-a9cd-4b94-8b90-a0cc69f6d74b" />
**Commands:**

```bash
cd /tmp/ && mkdir cracking && cd cracking
touch possibilities.txt && chmod 777 possibilities.txt
nano cracker.sh

```
<img width="947" height="302" alt="bandit24(2)" src="https://github.com/user-attachments/assets/7d5e01ef-bdfc-46bd-bbb4-3617f80a0ffe" />

*(Inside `cracker.sh`:)*

```bash
#!/bin/bash
for i in {0000..9999}
do
    echo "hVQMk3lJNsmQ7VF3ubyrNNBom7BOgVXv $i" >> possibilities.txt
done

cat possibilities.txt | nc localhost 30002 > result.txt

```

*(Execute and extract):*
<img width="1020" height="297" alt="bandit24(3)" src="https://github.com/user-attachments/assets/2d76f1f0-ec2b-42ab-9a8d-77fa92474007" />

```bash
chmod 777 cracker.sh
./cracker.sh
cat result.txt

```
<img width="797" height="55" alt="bandit24(4)" src="https://github.com/user-attachments/assets/341eca2c-5bbf-481f-8122-f6b55a3c306a" />

---

## Level 25 -> Level 26

**Workflow & Objective:** When you connect via SSH, you are forced into `more`, a text pagination program (a "restricted shell"). We must exploit `more`'s embedded features to spawn a real shell.

**🚨 CRITICAL WARNING:** Avoid using standard Windows CMD or PowerShell for this level! They struggle to handle Linux terminal resizing. Switch to a Mac terminal, Kali Linux, or WSL for the best experience.

**Image-by-Image Walkthrough:**
<img width="867" height="1007" alt="bandit25(1)" src="https://github.com/user-attachments/assets/39cad313-eb9b-4ffa-8fa5-a31b6d99a6ad" />

<img width="745" height="182" alt="bandit25(2)" src="https://github.com/user-attachments/assets/527d256f-dacc-4324-8089-cf30d6e0740c" />

<img width="1106" height="982" alt="bandit25(3)" src="https://github.com/user-attachments/assets/70945bbf-7881-4285-9b34-8fc1687d722c" />

**Step 1:** Log in using the private SSH key obtained in the previous level.

<img width="1917" height="515" alt="bandit25(4)" src="https://github.com/user-attachments/assets/4199d4b7-e273-4e0e-9959-856d70fb6601" />

**Step 2:** *Crucial Step:* Before pressing enter, manually shrink your terminal window so it is very tiny.

<img width="1918" height="938" alt="bandit25(5)" src="https://github.com/user-attachments/assets/98e8ec11-08ad-401f-915b-af0f9a323b2d" />

**Step 3:** Because your window is small, the text won't fit, forcing the `more` program to pause (`--More--(31%)`). While in `more`, press the **`v`** key to invoke `vim`.

<img width="535" height="353" alt="bandit25(6)" src="https://github.com/user-attachments/assets/4bece800-8343-4c6f-ba8c-81df0a9d1c1d" />

**Step 4:** Inside vim, press `:` to enter command mode.

<img width="519" height="322" alt="bandit25(7)" src="https://github.com/user-attachments/assets/b56db78f-0407-4012-b483-ea406b09b40a" />
**Step 5:** Type **`:set shell=/bin/bash`** and press Enter. This changes vim's internal shell to a real bash shell.

<img width="814" height="298" alt="bandit25(8)" src="https://github.com/user-attachments/assets/9b687753-c9b2-41f4-8030-2226cf2b6d29" />
<img width="838" height="298" alt="bandit25(9)" src="https://github.com/user-attachments/assets/6631cb88-86ca-4ef0-ac86-7966bee02083" />

**Step 6:** Type **`:shell`** and press Enter.
<img width="877" height="298" alt="bandit25(10" src="https://github.com/user-attachments/assets/530ad7c7-a36d-4514-894e-e059376663fa" />

**Step 7:** You have successfully escaped the restricted environment! You can now expand your terminal and `cat` the password.

<img width="827" height="298" alt="bandit25(11" src="https://github.com/user-attachments/assets/89e7167d-29cd-45a3-9539-8972dfa20832" />

<img width="814" height="298" alt="bandit25(12)" src="https://github.com/user-attachments/assets/03684f42-50b9-4b48-b183-493f250e83e1" />

---

## Level 26 -> Level 27

**Workflow & Objective:** Read the password using a SUID binary. **Do not log out of the shell you escaped into in Level 25!** Stay in the same terminal.

<img width="440" height="298" alt="bandit26(1)" src="https://github.com/user-attachments/assets/7a8436ba-bda5-47c6-b435-c9ac67230b91" />

<img width="1905" height="383" alt="bandit26(2)" src="https://github.com/user-attachments/assets/345bc1e7-ddc6-40b1-987d-0622eedaa375" />
**Commands:**

```bash
ls
./bandit27-do cat /etc/bandit_pass/bandit27

```

---

## Welcome to the Git Empire (Levels 27: 31)

*The next several levels test your understanding of Git. Before proceeding, here are the core commands users need to know:*

* `git clone <url>`: Downloads a remote repository.
* `git log`: Shows the history of all "commits" (saves).
* `git show <hash>`: Inspects the exact code changes made during a commit.
* `git branch -a`: Lists all branches (parallel versions of the project).
* `git switch <branch>`: Moves your workspace into a different branch.
* `git config`: Sets user parameters required to push code.

---

## Level 27 -> Level 28

**Workflow & Objective:** Clone a remote Git repository to your local workspace to find the password in the README.
<img width="1251" height="857" alt="bandit27" src="https://github.com/user-attachments/assets/1a5ec66a-f8c8-48ab-86cd-d9927cd90460" />
**Commands:**

```bash
git clone ssh://bandit27-git@bandit.labs.overthewire.org:2220/home/bandit27-git/repo
cd repo
cat README

```

---

## Level 28 -> Level 29

**Workflow & Objective:** A secret was accidentally committed to Git, and then deleted in a later "fix" commit. Search the commit history to uncover the leaked data.

<img width="886" height="938" alt="bandit28(1)" src="https://github.com/user-attachments/assets/db9beb3f-064a-46bd-b0fc-8ef8fb6b31de" />

<img width="893" height="925" alt="bandit28(2)" src="https://github.com/user-attachments/assets/0fc58ff2-7796-4361-ac5a-34baa13b2c12" />
**Commands:**

```bash
git clone ssh://bandit28-git@bandit.labs.overthewire.org:2220/home/bandit28-git/repo
cd repo
git log
git show e2e1de5396037bafb23e9bb37c12ebea9b911cfd

```

**Command Explanation:**

* `git log` reveals a suspicious commit message: "fix info leak".
* `git show <commit_hash>` allows us to view the exact differential. The output shows the password being removed in red (`-`), allowing us to steal it!

---

## Level 29 -> Level 30

**Workflow & Objective:** The password isn't in the main project. We must explore alternative Git branches.

<img width="838" height="938" alt="bandit 29(1)" src="https://github.com/user-attachments/assets/d7a1de63-162b-494f-9110-431c5b990e06" />
<img width="403" height="680" alt="bandit 29(2)" src="https://github.com/user-attachments/assets/67f5a1f8-e15b-44ef-a9a0-c7fa498d82ed" />
**Commands:**

```bash
git clone ssh://bandit29-git@bandit.labs.overthewire.org:2220/home/bandit29-git/repo
cd repo
git branch -a
git switch dev
cat README.md

```

---

## Level 30 -> Level 31

**Workflow & Objective:** Repositories can have "tags" (bookmarks for releases). The password is hidden inside a tagged object.
<img width="378" height="401" alt="bandit 30" src="https://github.com/user-attachments/assets/93614239-7c41-411f-9530-0d8e537edbb9" />

**Commands:**

```bash
git clone ssh://bandit30-git@bandit.labs.overthewire.org:2220/home/bandit30-git/repo
cd repo
git tag
git show secret

```

---

## Level 31 -> Level 32

**Workflow & Objective:** Write a file (`key.txt`) and push it back to the remote server. A "pre-receive hook" will validate our push and grant the password.
<img width="836" height="801" alt="bandit 31(1)" src="https://github.com/user-attachments/assets/789692f7-8884-4aee-a584-2d7384ba52cf" />

<img width="956" height="938" alt="bandit31(3)" src="https://github.com/user-attachments/assets/99aa81b6-857d-4a4c-b02f-52f48de462ab" />
**Commands:**

```bash
git clone ssh://bandit31-git@bandit.labs.overthewire.org:2220/home/bandit31-git/repo
cd repo
nano key.txt

```

*(Write "May I come in?" and save)*

```bash
git add -f key.txt

```

**Configure Git Identity**

```bash
git config --global user.email "you@example.com"
git config --global user.name "Your Name"

git commit -m "Submit key"
git push origin master

```

**Command Explanation:**

* `git config`: Git requires every commit to have an author. The system throws a fatal error if you try to `commit` without setting an email and name first.

---

## Level 32 -> Level 33

**Workflow & Objective:** We are trapped in an uppercase shell wrapper that translates everything we type into UPPERCASE, preventing us from running standard commands.
<img width="452" height="195" alt="bandit32" src="https://github.com/user-attachments/assets/82cea80d-7ff1-4edb-98c8-60c0b1d26c81" />

**Commands:**

```bash
$0
whoami
cat /etc/bandit_pass/bandit33

```

**Deep Dive Explanation:**

* **Why `$0`?** In shell scripting, `$0` is a special variable holding the name of the program currently executing. Typing `$0` expands to the name of the shell process itself (usually `/bin/sh`). Executing it spawns a completely new, standard sub-shell that bypasses the uppercase translation wrapper!

---

## Level 33 -> Complete! 🎉

**Workflow & Objective:** You've reached the final level of Bandit!
<img width="1210" height="335" alt="bandit33" src="https://github.com/user-attachments/assets/bd3000e2-e70f-4b60-b636-6baa6aa155eb" />

**Commands:**

```bash
ls
cat README.txt

```

**Password / Flag:** *(Wargame Completed!)*

```eof
 ha ha stayhard
```

Make sure you copy this directly from the **Copy button** on the block so you grab all the raw formatting!
