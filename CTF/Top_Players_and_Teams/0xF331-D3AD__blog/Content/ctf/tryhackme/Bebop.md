
# Bebop

## *Takeoff*

- What is your codename?

> pilot

---

## *Manoeuvre*

We'll start with nmap scan:

```bash
$ sudo nmap 10.10.89.44 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

Select running services with

```bash
$ cat nmap-scan | grep -e '[0-9]\+/tcp[[:space:]].*' -o
```

[x] 22/tcp open  ssh     syn-ack ttl 63 OpenSSH 7.5 (FreeBSD 20170903; protocol 2.0)

[x] 23/tcp open  telnet  syn-ack ttl 63 BSD-derived telnetd

### User flag

Connect to the machiine via telnet:

```bash
$ telnet 10.10.89.44
```

And supply ***pilot*** as username. That's it, there's your user flag.

### Root flag

Run

```bash
$ sudo -l
```

```
User pilot may run the following commands on freebsd:
    (root) NOPASSWD: /usr/local/bin/busybox
```

At [GTFOBins](https://gtfobins.github.io/gtfobins/busybox/#sudo) You can find how to 
escalate your privileges to root with only 1 command.

The root flag located at /root/root.txt

---

## *Quiz!*

- What is the low privilleged user?

> pilot

- What binary was used to escalate privillages?

> busybox

- What service was used to gain an initial shell?

> telnet

- What Operating System does the drone run?

> FreeBSD

