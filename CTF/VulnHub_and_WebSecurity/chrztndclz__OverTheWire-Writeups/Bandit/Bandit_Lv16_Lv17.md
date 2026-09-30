
##  Level 16: Level 17

Tags:
#Bandit 

---

## Level Goal

The credentials for the next level can be retrieved by submitting the password of the current level to a port on localhost in the range 31000 to 32000. First find out which of these ports have a server listening on them. Then find out which of those speak SSL/TLS and which don’t. There is only 1 server that will give the next credentials, the others will simply send back to you whatever you send to it.

Helpful note: Getting “DONE”, “RENEGOTIATING” or “KEYUPDATE”? Read the “CONNECTED COMMANDS” section in the manpage.

---

## Commands

Commands you may need to solve this level

ssh, telnet, nc, ncat, socat, openssl, s_client, nmap, netstat, ss

---

## Tips

Helpful Reading Material

[Port scanner on Wikipedia](https://en.wikipedia.org/wiki/Port_scanner)

---

## Analysis

This level requires scanning a range of ports (31000-32000) on localhost to find which ones are open. Among the open ones, only one uses SSL/TLS and returns the actual credentials after you send the current password. All other services either echo input or reject the connection. Tools like `nmap` help quickly identify open ports, and `openssl s_client` allows checking which ports expect encrypted connections.

---

## Methodology
**Step 1:** **Scan ports 31000-32000 to find open ones**

`nmap -p31000-32000 localhost`

You will typically find only a few open ports (e.g., 31518, 31790, 31691, etc.).

<img width="668" height="237" alt="image" src="https://github.com/user-attachments/assets/14efa6ce-40e2-42b3-a3a7-2de7a16de971" />

**Step 2:** **Test each open port to see which one uses SSL/TLS**

Example:

`openssl s_client -connect localhost:31790 -ign_eof`

If you see TLS handshake info, it's SSL/TLS.  
If it errors out or hangs, it's plain text.

**Step 3:** **Send your Level 16 password to the SSL port**

Once connected using `openssl s_client`, paste your Level 16 password and press **Enter**.  
The server will respond with the **private SSH key** for bandit17.

Copy that key and save it as `bandit17.key` locally.

-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAvmOkuifmMg6HL2YPIOjon6iWfbp7c3jx34YkYWqUH57SUdyJ
imZzeyGC0gtZPGujUSxiJSWI/oTqexh+cAMTSMlOJf7+BrJObArnxd9Y7YT2bRPQ
Ja6Lzb558YW3FZl87ORiO+rW4LCDCNd2lUvLE/GL2GWyuKN0K5iCd5TbtJzEkQTu
DSt2mcNn4rhAL+JFr56o4T6z8WWAW18BR6yGrMq7Q/kALHYW3OekePQAzL0VUYbW
JGTi65CxbCnzc/w4+mqQyvmzpWtMAzJTzAzQxNbkR2MBGySxDLrjg0LWN6sK7wNX
x0YVztz/zbIkPjfkU1jHS+9EbVNj+D1XFOJuaQIDAQABAoIBABagpxpM1aoLWfvD
KHcj10nqcoBc4oE11aFYQwik7xfW+24pRNuDE6SFthOar69jp5RlLwD1NhPx3iBl
J9nOM8OJ0VToum43UOS8YxF8WwhXriYGnc1sskbwpXOUDc9uX4+UESzH22P29ovd
d8WErY0gPxun8pbJLmxkAtWNhpMvfe0050vk9TL5wqbu9AlbssgTcCXkMQnPw9nC
YNN6DDP2lbcBrvgT9YCNL6C+ZKufD52yOQ9qOkwFTEQpjtF4uNtJom+asvlpmS8A
vLY9r60wYSvmZhNqBUrj7lyCtXMIu1kkd4w7F77k+DjHoAXyxcUp1DGL51sOmama
+TOWWgECgYEA8JtPxP0GRJ+IQkX262jM3dEIkza8ky5moIwUqYdsx0NxHgRRhORT
8c8hAuRBb2G82so8vUHk/fur85OEfc9TncnCY2crpoqsghifKLxrLgtT+qDpfZnx
SatLdt8GfQ85yA7hnWWJ2MxF3NaeSDm75Lsm+tBbAiyc9P2jGRNtMSkCgYEAypHd
HCctNi/FwjulhttFx/rHYKhLidZDFYeiE/v45bN4yFm8x7R/b0iE7KaszX+Exdvt
SghaTdcG0Knyw1bpJVyusavPzpaJMjdJ6tcFhVAbAjm7enCIvGCSx+X3l5SiWg0A
R57hJglezIiVjv3aGwHwvlZvtszK6zV6oXFAu0ECgYAbjo46T4hyP5tJi93V5HDi
Ttiek7xRVxUl+iU7rWkGAXFpMLFteQEsRr7PJ/lemmEY5eTDAFMLy9FL2m9oQWCg
R8VdwSk8r9FGLS+9aKcV5PI/WEKlwgXinB3OhYimtiG2Cg5JCqIZFHxD6MjEGOiu
L8ktHMPvodBwNsSBULpG0QKBgBAplTfC1HOnWiMGOU3KPwYWt0O6CdTkmJOmL8Ni
blh9elyZ9FsGxsgtRBXRsqXuz7wtsQAgLHxbdLq/ZJQ7YfzOKU4ZxEnabvXnvWkU
YOdjHdSOoKvDQNWu6ucyLRAWFuISeXw9a/9p7ftpxm0TSgyvmfLF2MIAEwyzRqaM
77pBAoGAMmjmIJdjp+Ez8duyn3ieo36yrttF5NSsJLAbxFpdlc1gvtGCWW+9Cq0b
dxviW8+TFVEBl1O4f7HVm6EpTscdDxU+bCXWkfjuRb7Dy9GOtt9JPsX8MBTakzh3
vBgsyi/sN3RqRBcGU40fOoZyfAMT8s1m/uYv52O6IgeuZ/ujbjY=
-----END RSA PRIVATE KEY-----

<img width="667" height="669" alt="image" src="https://github.com/user-attachments/assets/1820cb28-5e0d-4c30-a37b-96d289471433" />

**Step 4: ** Copy the Private Key into a Local File

On your local machine, create a file:

nano bandit17.key

Paste everything from:

-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----

Save and exit.

<img width="656" height="685" alt="image" src="https://github.com/user-attachments/assets/61a8d3c6-8738-44b6-8a68-daa8535f8faf" />

**Step 5:** Fix Permissions

SSH will refuse to use a key that is world‑readable.

Run this locally:

chmod 600 bandit17.key

<img width="647" height="65" alt="image" src="https://github.com/user-attachments/assets/e74800fd-2586-4794-b713-034c40a2e5a8" />

**Step 6: ** Log In to Bandit Level 17

Use the private key with ssh -i:

ssh -i bandit17.key bandit17@bandit.labs.overthewire.org -p 2220

<img width="692" height="574" alt="image" src="https://github.com/user-attachments/assets/f4ee6526-0d2a-4ee1-b403-0179bb2f6133" />

---

## Password

bandit17.key

---

## Reflection

This level combined port scanning, protocol identification, and SSL/TLS testing: mimicking real security reconnaissance workflows. It reinforces using `nmap` for discovery and `openssl s_client` for encrypted service verification.

---

