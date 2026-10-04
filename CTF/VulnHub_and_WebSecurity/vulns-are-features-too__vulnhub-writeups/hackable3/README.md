# [Hackable 3](https://www.vulnhub.com/entry/hackable-iii,720/)

First as always, `nmap`

```
# Nmap 7.92 scan initiated Wed Sep  8 16:46:51 2021 as: nmap -vvv -p 80 -sCV -oA init 192.168.1.17
Nmap scan report for 192.168.1.17
Host is up, received syn-ack (0.00026s latency).
Scanned at 2021-09-08 16:46:58 +07 for 6s

PORT   STATE SERVICE REASON  VERSION
80/tcp open  http    syn-ack Apache httpd 2.4.46 ((Ubuntu))
|_http-server-header: Apache/2.4.46 (Ubuntu)
| http-methods:
|_  Supported Methods: OPTIONS HEAD GET POST
| http-robots.txt: 1 disallowed entry
|_/config
|_http-title: Kryptos - LAN Home

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Sep  8 16:47:04 2021 -- 1 IP address (1 host up) scanned in 12.92 seconds
```

We only have a web server on port 80. Looking at `robots.txt`

```
User-Agente: *
Disallow: /config
```

We see `/config`. Inside that folder is `1.txt` with the following content.

```
MTAwMDA=
```

Looks like a base64-encoded string, so we decode it to get "10000". Looking back at the landing page, we have a comment in the source code.

> Please, jubiscleudo, don't forget to activate the port knocking when exiting your section, and tell the boss not to forget to approve the .jpg file: dev_suport@hackable3.com

We have a hostname, "hackable3.com", which we add to our `/etc/passwd`, as well as a couple of potential usernames, "jubiscleudo" and "dev_suport". Additionally, there seems to be port knocking on the machine. We'll need more than 1 port for port knocking so let's note this down and move on.

Looking back at the source code, we have page `login_page/login.html` to which we navigate. Trying to log in, we're brought to the page `/login.php` with the following contents.

```php
<?php
include('config.php');

$usuario = $_POST['user'];
$senha = $_POST['pass'];

$query = " SELECT * FROM usuarios WHERE user = '{$usuario}' and pass = '{$senha}'";

$result = mysqli_query($conexao, $query);

$row = mysqli_num_rows($result);

#validaÃ§Ã£o conta
if($row == 1) {
	$_SESSION['usuario'] = $usuario;
	header('Location: 3.jpg');
	exit();
} else {
	$_SESSION['nao_autenticado'] = true;
	header('Location: login_page/login.html');
	exit();
}

?>
```

The code gives us a file `3.jpg` so we download the file at `/3.jpg`. Trying a few steganograpy tools, we find that we can extract data using `steghide` with a blank password.

```sh
$ steghide extract -sf 3.jpg
Enter passphrase:
wrote extracted data to "steganopayload148505.txt".

$ cat steganopayload148505.txt
porta:65535
```

We've had `1.txt` and `3.jpg` so we can guest there's a `2.something` file somewhere.

Running `gobuster` on the site gives us the following.

```
/css                  (Status: 200) [Size: 1117]
/js                   (Status: 200) [Size: 932]
/config               (Status: 200) [Size: 929]
/backup               (Status: 200) [Size: 943]
/imagens              (Status: 200) [Size: 2363]
/login_page           (Status: 200) [Size: 1521]
/server-status        (Status: 403) [Size: 277]
```

Inside `/css` is the file `2.txt` with the following contents.

```
++++++++++[>+>+++>+++++++>++++++++++<<<<-]>>>------------------....
```

This looks like brain fuck, an esoteric programming language, which we can run in [tio.run](https://tio.run/#brainfuck) to get the number `4444`. Looking at `/backup`, we have the file `wordlist.txt` which looks like a password list. We'll probably need this later so let's download it.

Since we have 3 numbered files, let's retry port knocking with the 3 ports and rerun `nmap`. I'm using [this script](https://github.com/grongor/knock).

```sh
$ ./knock 192.168.1.17 10000 4444 65535
```

With this, we should find port 22. Using the previously found usernames, "jubiscleudo" and "dev_suport" and "wordlist.txt", we can brute-force credentials to SSH with `hydra`.

```sh
$ hydra -L users -P wordlist.txt 192.168.1.17 ssh
```

With this, we should have credentials to log into SSH.

Looking at `/var/www/html`, we have a couple of config files: "config.php" and ".backup_config.php", each with a set of MySQL credentials. The credentials in `.backup_config.php` can be used to `su` to the user "hackable_3".

```sh
hackable_3@ubuntu20:~$ id
uid=1000(hackable_3) gid=1000(hackable_3) groups=1000(hackable_3),4(adm),24(cdrom),30(dip),46(plugdev),116(lxd)
```

We see that we're in the `lxd` group. We can exploit this to mount `/` on a container and read everything on the machine. You can follow [this hacktricks article](https://book.hacktricks.xyz/linux-unix/privilege-escalation/interesting-groups-linux-pe/lxd-privilege-escalation) on it. After mounting, we can just read the root flag or add our SSH key to root and get root access to the box.
