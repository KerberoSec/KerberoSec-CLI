---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-12
tags: [security-writeup, tryhackme, aoc2025, network-discovery]
source: TryHackMe: Advent of Cyber 2025 Day 7
platform: tryhackme
room: Advent of Cyber 2025 Day 07: Network Discovery: Scan-ta Clause
slug: aoc-2025-day-07-network-discovery-scan-ta-clause
path: TryHackMe/90-events/thm-aoc-2025/Day 07: Network Discovery: Scan-ta Clause.md
topic: 90-events
domain: [networking]
skills: [nmap, recon]
artifacts: [lab-notes]
sanitized: true
---

# Advent of Cyber 2025 Day 07: Network Discovery: Scan-ta Clause

> Discover how to scan network ports and uncover what is hidden behind them.

---

## Summary

* **Story**: HopSec took over TBFC’s QA server `tbfc-devqa01` and defaced the web app. Our job is to:

  * Discover exposed **network services** (TCP + UDP ports).
  * Interact with them to recover **three keys**.
  * Combine keys as `<key1>_<key2>_<key3>` to unlock the admin console.
  * From the console, enumerate local services and dump the final flag from the database.
* **Mindset**: classic **service discovery → enumeration → data exfiltration** chain.

---

## Key Concepts

### 1. Network Discovery Basics

#### 1.1 Ports & Services (端口 & 服务)

* A host can expose many **TCP / UDP ports** (0-65535).
* Well‑known examples:

  * **22/tcp: SSH** (remote shell)
  * **80/tcp: HTTP** (web server)
  * **21/tcp: FTP** (file transfer; but can run on any port)
  * **53/udp: DNS** (name resolution)
  * **3306/tcp: MySQL** (database)
* Security view: any open port = potential **attack surface** → we must

  * Discover it
  * Identify what runs on it
  * Decide whether it should be exposed

#### 1.2 Typical workflow

1. Identify target IP (受害主机 IP)。
2. **TCP scan** common ports → first view of reachable services.
3. **Full TCP range** scan + **banner grabbing** to find non‑standard ports.
4. **UDP scan** for DNS/other UDP services.
5. Connect with proper client (browser, ftp, nc, dig, etc.) to enumerate.
6. Once inside the box (e.g. via web console/SSH), use **on‑host tools** instead of remote scanning.

---

### 2. Nmap Scans (端口扫描)

#### 2.1 Quick TCP scan (top 1000)

```bash
nmap TARGET_IP
```

* Default: scans **top 1000 TCP ports**.
* In this room, results look like:

  * `22/tcp open  ssh`
  * `80/tcp open  http`
* Meaning:

  * We can try SSH (if credentials known).
  * We can browse `http://TARGET_IP` from the AttackBox.

#### 2.2 Full TCP range + banner grabbing

```bash
nmap -p- --script=banner TARGET_IP
```

* `-p-` → scan **all 65535 TCP ports**.
* `--script=banner` → try to grab **service banners** to identify software.
* Example findings:

  * `22/tcp open  ssh  (OpenSSH ... Ubuntu ...)`
  * `80/tcp open  http`
  * `21212/tcp open  trinket-agent  (vsFTPd 3.0.5)` → FTP moved to 21212
  * `25251/tcp open  unknown  (TBFC maintd v0.2)` → custom text protocol

Key idea: **services can run on any port**, not just defaults.

#### 2.3 UDP scan

```bash
nmap -sU TARGET_IP
```

* `-sU` → scan **UDP ports** (slower, often more limited by firewalls).
* Here we mainly care about:

  * `53/udp open  domain` → DNS server running on the target.

---

### 3. Service Enumeration Steps

#### 3.1 HTTP (port 80)

* Browse `http://TARGET_IP` from the AttackBox.
* Observations:

  * Page defaced by HopSec.
  * Top banner message: e.g. **"Pwned by HopSec"** or similar.
  * Page mentions 3 key fragments hidden across the server.
* Login box expects combined key: `<key1>_<key2>_<key3>`.

> At this point HTTP is only used as *information source* and entry point for the final unlock.

---

#### 3.2 FTP on non‑standard port (21212/tcp)

Anonymous FTP access to get Key 1.

```bash
ftp TARGET_IP 21212
# when asked for Name: type
anonymous

ftp> ls
ftp> get tbfc_qa_key1 -
ftp> !      # or `bye` to exit FTP
```

Notes:

* `get FILENAME -` prints the content to **stdout** instead of saving a file.
* Room output: `tbfc_qa_key1` contains **Key1**, e.g.

  * `KEY1:3aster`

Security takeaway:

* Even if FTP is moved off port 21, it’s still discoverable via scanning.
* **Anonymous login** + sensitive file = easy data leak.

---

#### 3.3 Custom TCP service (25251/tcp) via Netcat

Use `nc` as a raw TCP client to speak the protocol.

```bash
nc -v TARGET_IP 25251
# Server banner example:
# TBFC maintd v0.2
# Type HELP for commands.

HELP
# → Shows command list: HELP, STATUS, GET KEY, QUIT

GET KEY
# → returns KEY2
^C   # or type QUIT
```

* We don’t need to reverse‑engineer the whole protocol; the `HELP` output already tells us the important command.
* Output example:

  * `KEY2:15_th3`

Security takeaway:

* Custom internal services often have **debug / maintenance commands** that leak secrets when exposed.

---

#### 3.4 DNS TXT record (53/udp) via `dig`

Use DNS query to retrieve Key 3.

```bash
# Query TXT record on custom subdomain

dig @TARGET_IP TXT key3.tbfc.local +short
```

* `@TARGET_IP` → directly ask the target’s DNS server.
* `TXT` → generic free‑form text record.
* Example result:

  * `"KEY3:n3w_xm45"`

Security takeaway:

* DNS TXT records are sometimes abused to store **config / secrets / C2 data**.

---

### 4. Combining Keys & Unlocking Admin Console

#### 4.1 Keys collected in this run

From the exercises we get (example values):

* `KEY1: 3aster`
* `KEY2: 15_th3`
* `KEY3: n3w_xm45`

Combine as:

```text
3aster_15_th3_n3w_xm45
```

Paste this into the Unlock box on the webpage → access **Secret Admin Console**.

---

### 5. On‑Host Service Discovery (主机内部服务发现)

Once inside the web admin console, we can execute commands **on the QA server itself** (as user `tbfcapp` in the room).

#### 5.1 List listening sockets with `ss`

```bash
ss -tunlp
```

* `-t` TCP, `-u` UDP, `-n` numeric, `-l` listening, `-p` show process (if permitted).
* Example interesting lines:

  * `0.0.0.0:22` (SSH)
  * `0.0.0.0:80` (HTTP)
  * `0.0.0.0:21212` (FTP)
  * `0.0.0.0:25251` (custom TBFC maintd)
  * `0.0.0.0:53` (DNS)
  * `127.0.0.1:3306` (MySQL, **localhost only**)

Key point:

* Ports bound to `0.0.0.0` are reachable remotely.
* Ports bound to `127.0.0.1` are **local‑only** services (cannot reach with Nmap from outside), but once we have code execution on the host we can talk to them directly.

---

### 6. MySQL Enumeration for Final Flag

Since we are already local (`tbfcapp@tbfc-devqa01`), we can use `mysql` client without password (typical weak internal config).

#### 6.1 List tables

```bash
mysql -D tbfcqa01 -e "SHOW TABLES;"
```

* `-D tbfcqa01` → default database.
* `-e` → execute one SQL command and exit.
* Output shows one table:

  * `flags`

#### 6.2 Dump flags table

```bash
mysql -D tbfcqa01 -e "SELECT * FROM flags;"
```

* Returns a single row with the final **THM flag** for the room.
* Example: `THM{all_services_discovered}` (exact value depends on AOC2025 instance).

Security takeaways:

* Databases often **trust localhost** too much.
* Once an attacker lands on the box (webshell, admin console, etc.), they can directly read sensitive data without any network scanning.

---

### 7. Summary Cheat‑Sheet

1. **Initial discovery (外部)**

   * `nmap TARGET_IP` → quick TCP scan (top 1000).
   * `nmap -p- --script=banner TARGET_IP` → full TCP + banners.
   * `nmap -sU TARGET_IP` → UDP (find DNS on 53/udp).
2. **Service enumeration**

   * HTTP: read defaced page, find hints.
   * FTP (21212/tcp): `ftp TARGET_IP 21212`, anonymous login, `ls`, `get tbfc_qa_key1 -`.
   * Custom TCP (25251/tcp): `nc -v TARGET_IP 25251`, `HELP`, `GET KEY`.
   * DNS TXT: `dig @TARGET_IP TXT key3.tbfc.local +short`.
3. **Unlock admin console**

   * Combine keys as `<key1>_<key2>_<key3>` and submit.
4. **On‑host discovery & data access**

   * `ss -tunlp` → list listening ports (including localhost‑only services like MySQL on 3306).
   * `mysql -D tbfcqa01 -e "SHOW TABLES;"`
   * `mysql -D tbfcqa01 -e "SELECT * FROM flags;"` → final flag.

---

### 8. Concepts To Remember (术语速记)

* **Port scanning**: 系统性探测主机某些端口是否开放。
* **Banner grabbing**: 通过连接服务读取其欢迎信息/版本号。
* **Service enumeration**: 与服务交互以获取更多信息（用户、配置、密钥等）。
* **TCP vs UDP**: 面向连接 vs 无连接，可靠性 vs 速度。
* **Local‑only service**: 仅绑定 `127.0.0.1` 的服务，只能从本机访问。
* **Defense angle**: 最小暴露面（只开放必要端口）、禁用匿名访问、限制本地服务权限、在 DNS/数据库中避免明文存放敏感信息。

> End of notes: ready to be turned into a GitHub write‑up or checklist later.
